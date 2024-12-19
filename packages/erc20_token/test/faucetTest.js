// test/faucetTest.js

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
    const MyTokenFactory = await ethers.getContractFactory("MyToken");
    console.log("Obtained MyToken contract factory");

    myToken = await MyTokenFactory.deploy();
    console.log("MyToken deploy transaction sent");

    // Esperar a que el contrato sea desplegado completamente
    await myToken.waitForDeployment();
    const myTokenAddress = await myToken.getAddress(); // ← Uso de getAddress()
    console.log("MyToken desplegado en:", myTokenAddress);

    const FaucetFactory = await ethers.getContractFactory("Faucet");
    console.log("Obtained Faucet contract factory");

    faucet = await FaucetFactory.deploy(myTokenAddress); // ← Aquí usamos myTokenAddress
    console.log("Faucet deploy transaction sent");

    // Esperar a que el contrato sea desplegado completamente
    await faucet.waitForDeployment();
    const faucetAddress = await faucet.getAddress(); // ← Uso de getAddress()
    console.log("Faucet desplegado en:", faucetAddress);

    // Transferir propiedad de MyToken al Faucet
    const transferOwnershipTx = await myToken.transferOwnership(faucetAddress);
    console.log("TransferOwnership transaction sent");
    await transferOwnershipTx.wait();
    console.log("TransferOwnership transaction confirmed");

    // Definir el hash del rol MINTER_ROLE
    const MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));
    console.log("MINTER_ROLE hash:", MINTER_ROLE);

    // Otorgar MINTER_ROLE al Faucet
    const grantRoleTx = await myToken.grantRole(MINTER_ROLE, faucetAddress);
    console.log("grantRole transaction sent");
    await grantRoleTx.wait();
    console.log("grantRole transaction confirmed");
  }

  beforeEach(async function () {
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    await deployContracts();
  });

  describe("Deployment", function () {
    it("Should set the correct token address", async function () {
      const tokenAddress = await faucet.token();
      const myTokenAddress = await myToken.getAddress(); // Comparamos con el real address del contrato
      expect(tokenAddress).to.equal(myTokenAddress);
    });

    it("Should set the correct claim amount", async function () {
      expect(await faucet.claimAmount()).to.equal(CLAIM_AMOUNT);
    });

    it("Should transfer token ownership to faucet", async function () {
      const myTokenOwner = await myToken.owner();
      const faucetAddress = await faucet.getAddress();
      expect(myTokenOwner).to.equal(faucetAddress);
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

  describe("Set Claim Amount", function () {
    const NEW_CLAIM_AMOUNT = ethers.parseUnits("500", 6); // 500 tokens con 6 decimales

    it("Should allow SETTER_ROLE to update claimAmount", async function () {
      await expect(faucet.connect(owner).setClaimAmount(NEW_CLAIM_AMOUNT))
        .to.emit(faucet, "ClaimAmountUpdated")
        .withArgs(NEW_CLAIM_AMOUNT);

      expect(await faucet.claimAmount()).to.equal(NEW_CLAIM_AMOUNT);
    });

    it("Should emit event when claimAmount is updated", async function () {
      await expect(faucet.connect(owner).setClaimAmount(NEW_CLAIM_AMOUNT))
        .to.emit(faucet, "ClaimAmountUpdated")
        .withArgs(NEW_CLAIM_AMOUNT);
    });

    it("Should prevent non-SETTER_ROLE from updating claimAmount", async function () {
      await expect(
        faucet.connect(addr1).setClaimAmount(NEW_CLAIM_AMOUNT)
      ).to.be.revertedWith(
        `AccessControl: account ${addr1.address.toLowerCase()} is missing role ${await faucet.SETTER_ROLE()}`
      );
    });

    it("Should allow updated claimAmount to be used in claims", async function () {
      // Actualizar el claimAmount
      await faucet.connect(owner).setClaimAmount(NEW_CLAIM_AMOUNT);

      // addr2 reclama tokens con el nuevo claimAmount
      const claimTx = faucet.connect(addr2).claimTokens();

      await expect(claimTx)
        .to.emit(faucet, "TokensClaimed")
        .withArgs(addr2.address, NEW_CLAIM_AMOUNT)
        .and.to.emit(myToken, "BeforeMint")
        .withArgs(addr2.address, NEW_CLAIM_AMOUNT)
        .and.to.emit(myToken, "Mint")
        .withArgs(addr2.address, NEW_CLAIM_AMOUNT);

      expect(await myToken.balanceOf(addr2.address)).to.equal(NEW_CLAIM_AMOUNT);
    });
  });
});
