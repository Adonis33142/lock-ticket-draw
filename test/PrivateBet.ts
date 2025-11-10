import { expect } from "chai";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { FhevmType } from "@fhevm/hardhat-plugin";
import { PrivateBet, PrivateBet__factory } from "../types";

type Signers = {
  house: HardhatEthersSigner;
  player: HardhatEthersSigner;
  auditor: HardhatEthersSigner;
};

async function deployFixture() {
  const factory = (await ethers.getContractFactory("PrivateBet")) as PrivateBet__factory;
  const contract = (await factory.deploy()) as PrivateBet;
  const address = await contract.getAddress();

  return { contract, address };
}

describe("PrivateBet", function () {
  let signers: Signers;
  let privateBet: PrivateBet;
  let contractAddress: string;

  before(async function () {
    const availableSigners = await ethers.getSigners();
    const [house, player, auditor] = availableSigners;
    signers = {
      house,
      player,
      auditor,
    } as Signers;
  });

  beforeEach(async function () {
    if (!fhevm.isMock) {
      console.warn(`This hardhat test suite cannot run on Sepolia Testnet`);
      this.skip();
    }

    ({ contract: privateBet, address: contractAddress } = await deployFixture());
  });

  it("allows a player to place a bet and decrypt their outcome", async function () {
    const wager = 37n;
    const guess = 1;

    const encryptedWager = await fhevm
      .createEncryptedInput(contractAddress, signers.player.address)
      .add64(wager)
      .encrypt();

    const encryptedGuess = await fhevm
      .createEncryptedInput(contractAddress, signers.player.address)
      .add8(guess)
      .encrypt();

    await expect(
      privateBet
        .connect(signers.player)
        .placeBet(
          encryptedWager.handles[0],
          encryptedWager.inputProof,
          encryptedGuess.handles[0],
          encryptedGuess.inputProof,
        ),
    )
      .to.emit(privateBet, "BetSettled")
      .withArgs(1, signers.player.address);

    const betId = await privateBet.betCount();
    expect(betId).to.equal(1n);

    const summary = await privateBet.getBetSummary(betId);
    expect(summary.player).to.equal(signers.player.address);
    expect(Number(summary.state)).to.equal(1); // BetState.Settled

    const [encWager, encGuess, encOutcome, encPayout] = await privateBet
      .connect(signers.player)
      .getEncryptedBetDetails(betId);

    const decryptedWager = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      encWager,
      contractAddress,
      signers.player,
    );
    const decryptedGuess = await fhevm.userDecryptEuint(
      FhevmType.euint8,
      encGuess,
      contractAddress,
      signers.player,
    );
    const decryptedOutcome = await fhevm.userDecryptEuint(
      FhevmType.euint8,
      encOutcome,
      contractAddress,
      signers.player,
    );
    const decryptedPayout = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      encPayout,
      contractAddress,
      signers.player,
    );

    expect(decryptedWager).to.equal(wager);
    const guessResult = Number(decryptedGuess);
    const outcomeResult = Number(decryptedOutcome);
    expect(guessResult).to.equal(guess);
    expect([0, 1]).to.include(outcomeResult);
    const expectedPayout = guessResult === outcomeResult ? wager * 2n : 0n;
    expect(decryptedPayout).to.equal(expectedPayout);
  });

  it("only allows authorized viewers to access encrypted bet data", async function () {
    const wager = 50n;
    const guess = 0;

    const encryptedWager = await fhevm
      .createEncryptedInput(contractAddress, signers.player.address)
      .add64(wager)
      .encrypt();

    const encryptedGuess = await fhevm
      .createEncryptedInput(contractAddress, signers.player.address)
      .add8(guess)
      .encrypt();

    await privateBet
      .connect(signers.player)
      .placeBet(
        encryptedWager.handles[0],
        encryptedWager.inputProof,
        encryptedGuess.handles[0],
        encryptedGuess.inputProof,
      );

    const betId = await privateBet.betCount();

    await expect(privateBet.connect(signers.auditor).getEncryptedBetDetails(betId))
      .to.be.revertedWithCustomError(privateBet, "NotAuthorized")
      .withArgs(signers.auditor.address);

    await privateBet.connect(signers.player).allowAudit(betId, signers.auditor.address);

    const [encWager, encGuess, encOutcome, encPayout] = await privateBet
      .connect(signers.auditor)
      .getEncryptedBetDetails(betId);

    const auditorOutcome = await fhevm.userDecryptEuint(
      FhevmType.euint8,
      encOutcome,
      contractAddress,
      signers.auditor,
    );
    expect([0, 1]).to.include(Number(auditorOutcome));

    const payout = await fhevm.userDecryptEuint(FhevmType.euint64, encPayout, contractAddress, signers.auditor);
    expect([0n, wager * 2n]).to.include(payout);
  });
});

