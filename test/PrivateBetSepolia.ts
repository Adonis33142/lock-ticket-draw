import { expect } from "chai";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { deployments, ethers, fhevm } from "hardhat";
import { FhevmType } from "@fhevm/hardhat-plugin";
import { PrivateBet } from "../types";

type Signers = {
  bettor: HardhatEthersSigner;
};

describe("PrivateBetSepolia", function () {
  let contract: PrivateBet;
  let contractAddress: string;
  let signers: Signers;
  let step: number;
  let steps: number;

  function progress(message: string) {
    console.log(`${++step}/${steps} ${message}`);
  }

  before(async function () {
    if (fhevm.isMock) {
      console.warn(`This hardhat test suite can only run on Sepolia Testnet`);
      this.skip();
    }

    const deployment = await deployments.get("PrivateBet");
    contractAddress = deployment.address;
    contract = (await ethers.getContractAt("PrivateBet", deployment.address)) as PrivateBet;

    const availableSigners = await ethers.getSigners();
    signers = { bettor: availableSigners[0] };
  });

  beforeEach(async function () {
    step = 0;
    steps = 0;
  });

  it("places a bet and decrypts the result on Sepolia", async function () {
    steps = 11;
    this.timeout(5 * 40000);

    const wager = 42n;
    const guess = 0;

    progress(`Encrypting wager '${wager}'...`);
    const encryptedWager = await fhevm
      .createEncryptedInput(contractAddress, signers.bettor.address)
      .add64(wager)
      .encrypt();

    progress(`Encrypting guess '${guess}'...`);
    const encryptedGuess = await fhevm
      .createEncryptedInput(contractAddress, signers.bettor.address)
      .add8(guess)
      .encrypt();

    progress(`Calling placeBet(...) on ${contractAddress}...`);
    const tx = await contract
      .connect(signers.bettor)
      .placeBet(
        encryptedWager.handles[0],
        encryptedWager.inputProof,
        encryptedGuess.handles[0],
        encryptedGuess.inputProof,
      );
    await tx.wait();

    progress(`Fetching betCount...`);
    const betId = await contract.betCount();
    expect(betId).to.be.greaterThan(0);

    progress(`Calling getEncryptedBetDetails(${betId})...`);
    const [encWager, encGuess, encOutcome, encPayout] = await contract
      .connect(signers.bettor)
      .getEncryptedBetDetails(betId);

    progress(`Decrypting wager handle...`);
    const decryptedWager = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      encWager,
      contractAddress,
      signers.bettor,
    );
    progress(`Decrypted wager: ${decryptedWager}`);

    progress(`Decrypting guess handle...`);
    const decryptedGuess = await fhevm.userDecryptEuint(
      FhevmType.euint8,
      encGuess,
      contractAddress,
      signers.bettor,
    );
    progress(`Decrypted guess: ${decryptedGuess}`);

    progress(`Decrypting outcome handle...`);
    const outcome = await fhevm.userDecryptEuint(FhevmType.euint8, encOutcome, contractAddress, signers.bettor);
    progress(`Decrypted outcome: ${outcome}`);

    progress(`Decrypting payout handle...`);
    const payout = await fhevm.userDecryptEuint(FhevmType.euint64, encPayout, contractAddress, signers.bettor);
    progress(`Decrypted payout: ${payout}`);

    expect(decryptedWager).to.equal(wager);
    expect(Number(decryptedGuess)).to.equal(guess);
    expect([0, 1]).to.include(Number(outcome));
    const expectedPayout = Number(outcome) === guess ? wager * 2n : 0n;
    expect(payout).to.equal(expectedPayout);
  });
});

