import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { PrivateBet } from "../types";
import { expect } from "chai";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
};

async function deployFixture() {
  const factory = await ethers.getContractFactory("PrivateBet");
  const contract = (await factory.deploy()) as PrivateBet;
  const contractAddress = await contract.getAddress();

  return { contract, contractAddress };
}

describe("PrivateBet - Batch Operations", function () {
  let signers: Signers;
  let contract: PrivateBet;
  let contractAddress: string;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { deployer: ethSigners[0], alice: ethSigners[1], bob: ethSigners[2] };
  });

  beforeEach(async function () {
    if (!fhevm.isMock) {
      console.warn("This test suite cannot run on Sepolia Testnet");
      this.skip();
    }

    ({ contract, contractAddress } = await deployFixture());
  });

  it("should successfully place multiple bets in batch", async function () {
    const wagers = [100, 200, 300];
    const guesses = [0, 1, 0]; // even, odd, even

    // Create encrypted inputs
    const encryptedWagers = await Promise.all(
      wagers.map(wager => fhevm.createEncryptedNumber(wager, contractAddress))
    );
    const encryptedGuesses = await Promise.all(
      guesses.map(guess => fhevm.createEncryptedNumber(guess, contractAddress))
    );

    // Execute batch operation
    const betIds = await contract.connect(signers.alice).batchPlaceBets(
      encryptedWagers.map(e => e.handles[0]),
      encryptedGuesses.map(e => e.handles[0]),
      encryptedWagers.map(e => e.inputProof),
      encryptedGuesses.map(e => e.inputProof)
    );

    // Verify results
    expect(betIds.length).to.equal(3);
    expect(await contract.getEntryCount()).to.equal(3);

    for (let i = 0; i < betIds.length; i++) {
      const summary = await contract.getBetSummary(betIds[i]);
      expect(summary.player).to.equal(signers.alice.address);
      expect(summary.state).to.equal(1); // Settled
    }
  });

  it("should reject batch operations with mismatched array lengths", async function () {
    const wagers = [100, 200];
    const guesses = [0, 1, 0]; // Different length

    const encryptedWagers = await Promise.all(
      wagers.map(wager => fhevm.createEncryptedNumber(wager, contractAddress))
    );
    const encryptedGuesses = await Promise.all(
      guesses.map(guess => fhevm.createEncryptedNumber(guess, contractAddress))
    );

    await expect(
      contract.connect(signers.alice).batchPlaceBets(
        encryptedWagers.map(e => e.handles[0]),
        encryptedGuesses.map(e => e.handles[0]),
        encryptedWagers.map(e => e.inputProof),
        encryptedGuesses.map(e => e.inputProof)
      )
    ).to.be.revertedWith("Array length mismatch");
  });

  it("should enforce batch size limits", async function () {
    const batchSize = 6; // Exceeds limit of 5
    const wagers = Array(batchSize).fill(100);
    const guesses = Array(batchSize).fill(0);

    const encryptedWagers = await Promise.all(
      wagers.map(wager => fhevm.createEncryptedNumber(wager, contractAddress))
    );
    const encryptedGuesses = await Promise.all(
      guesses.map(guess => fhevm.createEncryptedNumber(guess, contractAddress))
    );

    await expect(
      contract.connect(signers.alice).batchPlaceBets(
        encryptedWagers.map(e => e.handles[0]),
        encryptedGuesses.map(e => e.handles[0]),
        encryptedWagers.map(e => e.inputProof),
        encryptedGuesses.map(e => e.inputProof)
      )
    ).to.be.revertedWith("Batch size limited to 5 bets for gas efficiency");
  });

  it("should validate input data in batch operations", async function () {
    const wagers = [0, 200]; // First wager is zero
    const guesses = [0, 1];

    const encryptedWagers = await Promise.all(
      wagers.map(wager => fhevm.createEncryptedNumber(wager, contractAddress))
    );
    const encryptedGuesses = await Promise.all(
      guesses.map(guess => fhevm.createEncryptedNumber(guess, contractAddress))
    );

    await expect(
      contract.connect(signers.alice).batchPlaceBets(
        encryptedWagers.map(e => e.handles[0]),
        encryptedGuesses.map(e => e.handles[0]),
        encryptedWagers.map(e => e.inputProof),
        encryptedGuesses.map(e => e.inputProof)
      )
    ).to.be.revertedWith("Wager amount cannot be zero");
  });
});
