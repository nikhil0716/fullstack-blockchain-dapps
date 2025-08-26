const { expect } = require("chai");
const { ethers } = require("hardhat");

// Sports-themed IDs
const BALL   = 1n;
const JERSEY = 2n;
const TICKET = 3n;

describe("My1155", () => {
  let owner, buyer, other, c;

  before(async () => {
    [owner, buyer, other] = await ethers.getSigners();
    const F = await ethers.getContractFactory("My1155");
    // baseURI can be ipfs://<FOLDER>/ ; uri(id) => ipfs://<FOLDER>/<id>.json unless per-ID set
    c = await F.deploy("ipfs://SPORTS_ASSETS/");
    await c.waitForDeployment();

    // Configure stock & price
    await c.connect(owner).setStock(BALL,   100n);
    await c.connect(owner).setStock(JERSEY, 50n);
    await c.connect(owner).setStock(TICKET, 5n);

    await c.connect(owner).setPrice(BALL,   ethers.parseEther("0.01"));
    await c.connect(owner).setPrice(JERSEY, ethers.parseEther("0.02"));
    await c.connect(owner).setPrice(TICKET, ethers.parseEther("0.05"));

    // Optional explicit URI (prove override works)
    await c.connect(owner).setTokenURI(JERSEY, "ipfs://SPECIAL/jersey.json");
  });

  it("mints stock with URI and tracks supply", async () => {
    const cost = ethers.parseEther("0.02"); // 2 * 0.01
    await expect(c.connect(buyer).mint(BALL, 2n, { value: cost })).to.not.be.reverted;

    const uriBall = await c.uri(BALL);
    expect(uriBall).to.equal("ipfs://SPORTS_ASSETS/1.json"); // base + id

    const minted = await c.totalMinted(BALL);
    expect(minted).to.equal(2n);
    const avail = await c.available(BALL);
    expect(avail).to.equal(100n - 2n);
  });

  it("set price and enforce exact ETH and stock availability", async () => {
    await expect(c.connect(buyer).mint(JERSEY, 1n, { value: ethers.parseEther("0.005") }))
      .to.be.revertedWith("wrong ETH");
    await expect(c.connect(buyer).mint(TICKET, 6n, { value: ethers.parseEther("0.30") }))
      .to.be.revertedWith("out of stock");
  });

  it("owner can withdraw proceeds", async () => {
    // buy 1 jersey at 0.02
    await c.connect(buyer).mint(JERSEY, 1n, { value: ethers.parseEther("0.02") });
    const balBefore = await ethers.provider.getBalance(await c.getAddress());
    expect(balBefore).to.be.gt(0n); // there may already be funds from previous tests
    await expect(c.connect(owner).withdraw()).to.not.be.reverted;
    const balAfter = await ethers.provider.getBalance(await c.getAddress());
    expect(balAfter).to.equal(0n);
  });

  it("setApprovalForAll + safeTransferFrom works", async () => {
    // buyer gives approval to other for ALL ERC1155 tokens
    await c.connect(buyer).setApprovalForAll(other.address, true);
    expect(await c.isApprovedForAll(buyer.address, other.address)).to.equal(true);

    // transfer 1 BALL to other
    await c.connect(other).safeTransferFrom(buyer.address, other.address, BALL, 1n, "0x");
    expect(await c.balanceOf(buyer.address, BALL)).to.equal(1n); // had 2, sent 1
    expect(await c.balanceOf(other.address, BALL)).to.equal(1n);
  });

  it("mint batch + balanceOfBatch", async () => {
    const ids = [BALL, JERSEY];
    const amts = [3n, 2n];
    const total = ethers.parseEther("0.01") * 3n + ethers.parseEther("0.02") * 2n;
    await c.connect(buyer).mintBatch(ids, amts, { value: total });

    const addrs = [buyer.address, buyer.address];
    const res = await c.balanceOfBatch(addrs, ids);
    // After previous tests:
    // - BALL: buyer had 2, transferred 1 → 1; batch adds 3 → 4
    // - JERSEY: buyer minted 1 earlier; batch adds 2 → 3
    expect(res[0]).to.equal(4n);
    expect(res[1]).to.equal(3n);
  });
});
