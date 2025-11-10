import { FhevmType } from "@fhevm/hardhat-plugin";
import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

task("task:bet-address", "Prints the PrivateBet contract address").setAction(async function (
  _taskArguments: TaskArguments,
  hre,
) {
  const deployment = await hre.deployments.get("PrivateBet");
  console.log("PrivateBet address is " + deployment.address);
});

task("task:place-bet", "Places a new encrypted bet on the PrivateBet contract")
  .addOptionalParam("address", "Optionally provide the PrivateBet contract address")
  .addParam("wager", "Plaintext wager amount that will be encrypted (e.g. 25)")
  .addParam("guess", "Plaintext guess: 0 for even, 1 for odd")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;

    const wager = BigInt(taskArguments.wager);
    if (wager <= 0n) {
      throw new Error("Argument --wager must be greater than zero");
    }

    const guess = Number(taskArguments.guess);
    if (!Number.isInteger(guess) || (guess !== 0 && guess !== 1)) {
      throw new Error("Argument --guess must be either 0 (even) or 1 (odd)");
    }

    await fhevm.initializeCLIApi();

    const deployment = taskArguments.address
      ? { address: taskArguments.address as string }
      : await deployments.get("PrivateBet");
    console.log(`PrivateBet: ${deployment.address}`);

    const [signer] = await ethers.getSigners();
    const contract = await ethers.getContractAt("PrivateBet", deployment.address);

    const encryptedWager = await fhevm
      .createEncryptedInput(deployment.address, signer.address)
      .add64(wager)
      .encrypt();

    const encryptedGuess = await fhevm
      .createEncryptedInput(deployment.address, signer.address)
      .add8(guess)
      .encrypt();

    const tx = await contract
      .connect(signer)
      .placeBet(
        encryptedWager.handles[0],
        encryptedWager.inputProof,
        encryptedGuess.handles[0],
        encryptedGuess.inputProof,
      );
    console.log(`Wait for tx:${tx.hash}...`);

    const receipt = await tx.wait();
    console.log(`tx:${tx.hash} status=${receipt?.status}`);

    const betId = await contract.betCount();
    console.log(`Bet settled successfully with id=${betId.toString()}`);
  });

task("task:decrypt-bet", "Decrypts the wager, guess, outcome, and payout for a given bet id")
  .addOptionalParam("address", "Optionally provide the PrivateBet contract address")
  .addParam("betid", "Bet identifier returned by task:place-bet")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;

    await fhevm.initializeCLIApi();

    const deployment = taskArguments.address
      ? { address: taskArguments.address as string }
      : await deployments.get("PrivateBet");

    const [signer] = await ethers.getSigners();
    const contract = await ethers.getContractAt("PrivateBet", deployment.address);

    const betId = BigInt(taskArguments.betid);
    const [encWager, encGuess, encOutcome, encPayout] = await contract
      .connect(signer)
      .getEncryptedBetDetails(betId);

    const wager = await fhevm.userDecryptEuint(FhevmType.euint64, encWager, deployment.address, signer);
    const guess = await fhevm.userDecryptEuint(FhevmType.euint8, encGuess, deployment.address, signer);
    const outcome = await fhevm.userDecryptEuint(FhevmType.euint8, encOutcome, deployment.address, signer);
    const payout = await fhevm.userDecryptEuint(FhevmType.euint64, encPayout, deployment.address, signer);

    console.log(`Bet ${betId} decrypted results:`);
    console.log(`- wager  : ${wager}`);
    console.log(`- guess  : ${guess === 0 ? "even (0)" : "odd (1)"}`);
    console.log(`- outcome: ${outcome === 0 ? "even (0)" : "odd (1)"}`);
    console.log(`- payout : ${payout}`);
  });
