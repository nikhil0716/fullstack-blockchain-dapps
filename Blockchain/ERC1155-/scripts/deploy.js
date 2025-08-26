const hre = require("hardhat");

async function main() {
  const [owner] = await hre.ethers.getSigners();

  // TODO: replace with your real IPFS base folder if you have it
  const baseURI = "ipfs://SPORTS_ASSETS/";

  const F = await hre.ethers.getContractFactory("My1155");
  const c = await F.deploy(baseURI);
  await c.waitForDeployment();
  console.log("My1155 deployed to:", await c.getAddress());
  console.log("Owner:", owner.address);

  // Example initial setup (sports domain)
  const BALL = 1n, JERSEY = 2n, TICKET = 3n;
  await (await c.setStock(BALL, 100n)).wait();
  await (await c.setStock(JERSEY, 50n)).wait();
  await (await c.setStock(TICKET, 5n)).wait();

  await (await c.setPrice(BALL,   hre.ethers.parseEther("0.01"))).wait();
  await (await c.setPrice(JERSEY, hre.ethers.parseEther("0.02"))).wait();
  await (await c.setPrice(TICKET, hre.ethers.parseEther("0.05"))).wait();

  console.log("Configured stock & prices.");
}

main().catch((e) => { console.error(e); process.exit(1); });
