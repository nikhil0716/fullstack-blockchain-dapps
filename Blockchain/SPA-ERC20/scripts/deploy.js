const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  const name = "CourseworkToken";
  const symbol = "CWT";
  const decimals = 18;
  const initialSupply = hre.ethers.parseUnits("1000000", decimals);

  const Token = await hre.ethers.getContractFactory("MyToken");
  const token = await Token.deploy(name, symbol, decimals, initialSupply);
  await token.waitForDeployment();

  console.log("Deployed MyToken to:", await token.getAddress());
  console.log("Deployer:", deployer.address);
}

main().catch((e) => { console.error(e); process.exit(1); });
