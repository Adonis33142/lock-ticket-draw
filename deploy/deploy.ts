import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const deployedPrivateBet = await deploy("PrivateBet", {
    from: deployer,
    log: true,
  });

  console.log(`PrivateBet contract: `, deployedPrivateBet.address);
};
export default func;
func.id = "deploy_private_bet"; // id required to prevent reexecution
func.tags = ["PrivateBet"];
