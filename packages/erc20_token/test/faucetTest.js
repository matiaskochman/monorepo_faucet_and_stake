const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Faucet", function () {
  let myToken;
  let faucet;
  let owner;
  let addr1;
  let addr2;
  const CLAIM_AMOUNT = ethers.parseUnits("200", 6); // 200 tokens con 6 decimales

  async function deployContracts() {
    const MyToken = await ethers.getContractFactory("MyToken");
    const Faucet = await ethers.getContractFactory("Faucet");

    myToken = await MyToken.deploy();
    await myToken.waitForDeployment();
    const myTokenAddress = await myToken.getAddress();

    faucet = await Faucet.deploy(myTokenAddress);
    await faucet.waitForDeployment();
    const faucetAddress = await faucet.getAddress();

    // Transferir propiedad de MyToken al Faucet
    await myToken.transferOwnership(faucetAddress);

    // Otorgar MINTER_ROLE al Faucet
    const MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));
    await myToken.grantRole(MINTER_ROLE, faucetAddress);
  }

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    await deployContracts();
  });

  describe("Deployment", function () {
    it("Should set the correct token address", async function () {
      expect(await faucet.token()).to.equal(await myToken.getAddress());
    });

    it("Should set the correct claim amount", async function () {
      expect(await faucet.claimAmount()).to.equal(CLAIM_AMOUNT);
    });

    it("Should transfer token ownership to faucet", async function () {
      expect(await myToken.owner()).to.equal(await faucet.getAddress());
    });
  });

  describe("Token Claims", function () {
    it("Should allow a user to claim tokens and emit correct events", async function () {
      const claimTx = faucet.connect(addr1).claimTokens();

      await expect(claimTx)
        .to.emit(faucet, "ClaimRequested")
        .withArgs(addr1.address)
        .and.to.emit(faucet, "TokensClaimed")
        .withArgs(addr1.address, CLAIM_AMOUNT)
        .and.to.emit(myToken, "BeforeMint")
        .withArgs(addr1.address, CLAIM_AMOUNT)
        .and.to.emit(myToken, "Mint")
        .withArgs(addr1.address, CLAIM_AMOUNT);

      expect(await myToken.balanceOf(addr1.address)).to.equal(CLAIM_AMOUNT);
    });

    it("Should prevent double claims", async function () {
      await faucet.connect(addr1).claimTokens();
      await expect(faucet.connect(addr1).claimTokens()).to.be.revertedWith(
        "Ya reclamaste tus tokens"
      );
    });

    it("Should track claims correctly in mapping", async function () {
      expect(await faucet.hasClaimed(addr1.address)).to.be.false;
      await faucet.connect(addr1).claimTokens();
      expect(await faucet.hasClaimed(addr1.address)).to.be.true;
    });
  });
});
