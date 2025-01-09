// test/faucetTest.js

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Faucet", function () {
  let pesosArgToken;
  let faucet;
  let owner;
  let addr1;
  let addr2;
  const CLAIM_AMOUNT = ethers.parseUnits("100", 6);

  async function deployContracts() {
    const PesosArgTokenFactory = await ethers.getContractFactory(
      "PesosArgToken"
    );
    console.log("Obtained PesosArgToken contract factory");

    pesosArgToken = await PesosArgTokenFactory.deploy();
    console.log("PesosArgToken deploy transaction sent");

    // Esperar a que el contrato sea desplegado completamente
    await pesosArgToken.waitForDeployment();
    const pesosArgTokenAddress = await pesosArgToken.getAddress();
    console.log("PesosArgToken desplegado en:", pesosArgTokenAddress);

    const FaucetFactory = await ethers.getContractFactory("Faucet");
    console.log("Obtained Faucet contract factory");

    faucet = await FaucetFactory.deploy(pesosArgTokenAddress);
    console.log("Faucet deploy transaction sent");

    // Esperar a que el contrato sea desplegado completamente
    await faucet.waitForDeployment();
    const faucetAddress = await faucet.getAddress();
    console.log("Faucet desplegado en:", faucetAddress);

    // Definir el hash del rol MINTER_ROLE
    const MINTER_ROLE = await pesosArgToken.MINTER_ROLE();
    console.log("MINTER_ROLE hash:", MINTER_ROLE);

    // Otorgar MINTER_ROLE al Faucet
    const grantRoleTx = await pesosArgToken.grantRole(
      MINTER_ROLE,
      faucetAddress
    );
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
      const pesosArgTokenAddress = await pesosArgToken.getAddress();
      expect(tokenAddress).to.equal(pesosArgTokenAddress);
    });

    it("Should set the correct claim amount", async function () {
      expect(await faucet.claimAmount()).to.equal(CLAIM_AMOUNT);
    });

    // Ya no es necesario verificar la propiedad
    // it("Should transfer token ownership to faucet", async function () {
    //   const pesosArgTokenOwner = await pesosArgToken.owner();
    //   const faucetAddress = await faucet.getAddress();
    //   expect(pesosArgTokenOwner).to.equal(faucetAddress);
    // });
  });

  describe("Token Claims", function () {
    it("Should allow a user to claim tokens and emit correct events", async function () {
      const claimTx = faucet.connect(addr1).claimTokens();

      await expect(claimTx)
        .to.emit(faucet, "ClaimRequested")
        .withArgs(addr1.address)
        .and.to.emit(faucet, "TokensClaimed")
        .withArgs(addr1.address, CLAIM_AMOUNT)
        .and.to.emit(pesosArgToken, "Mint")
        .withArgs(addr1.address, CLAIM_AMOUNT);

      expect(await pesosArgToken.balanceOf(addr1.address)).to.equal(
        CLAIM_AMOUNT
      );
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
        .and.to.emit(pesosArgToken, "Mint")
        .withArgs(addr2.address, NEW_CLAIM_AMOUNT);

      expect(await pesosArgToken.balanceOf(addr2.address)).to.equal(
        NEW_CLAIM_AMOUNT
      );
    });
  });

  describe("Role Management", function () {
    it("Should allow the deployer to grant SETTER_ROLE to a new address and revoke it from the deployer", async function () {
      const SETTER_ROLE = await faucet.SETTER_ROLE();

      // Verificar que el deployer inicialmente tiene el SETTER_ROLE
      expect(await faucet.hasRole(SETTER_ROLE, owner.address)).to.be.true;

      // Otorgar SETTER_ROLE a addr1
      await expect(faucet.connect(owner).grantRole(SETTER_ROLE, addr1.address))
        .to.emit(faucet, "RoleGranted")
        .withArgs(SETTER_ROLE, addr1.address, owner.address);

      // Revocar SETTER_ROLE del deployer
      await expect(faucet.connect(owner).revokeRole(SETTER_ROLE, owner.address))
        .to.emit(faucet, "RoleRevoked")
        .withArgs(SETTER_ROLE, owner.address, owner.address);

      // Verificar que addr1 ahora tiene el SETTER_ROLE
      expect(await faucet.hasRole(SETTER_ROLE, addr1.address)).to.be.true;

      // Verificar que el deployer ya no tiene el SETTER_ROLE
      expect(await faucet.hasRole(SETTER_ROLE, owner.address)).to.be.false;
    });

    it("Should prevent non-admins from granting or revoking roles", async function () {
      const SETTER_ROLE = await faucet.SETTER_ROLE();

      // addr1 no tiene permisos para otorgar roles inicialmente
      await expect(
        faucet.connect(addr1).grantRole(SETTER_ROLE, addr2.address)
      ).to.be.revertedWith(
        `AccessControl: account ${addr1.address.toLowerCase()} is missing role ${await faucet.DEFAULT_ADMIN_ROLE()}`
      );

      // addr1 no tiene permisos para revocar roles inicialmente
      await expect(
        faucet.connect(addr1).revokeRole(SETTER_ROLE, owner.address)
      ).to.be.revertedWith(
        `AccessControl: account ${addr1.address.toLowerCase()} is missing role ${await faucet.DEFAULT_ADMIN_ROLE()}`
      );
    });

    it("Should allow multiple addresses to have SETTER_ROLE", async function () {
      const SETTER_ROLE = await faucet.SETTER_ROLE();

      // Otorgar SETTER_ROLE a addr1
      await faucet.connect(owner).grantRole(SETTER_ROLE, addr1.address);

      // Otorgar SETTER_ROLE a addr2
      await faucet.connect(owner).grantRole(SETTER_ROLE, addr2.address);

      // Verificar que ambos tienen el SETTER_ROLE
      expect(await faucet.hasRole(SETTER_ROLE, addr1.address)).to.be.true;
      expect(await faucet.hasRole(SETTER_ROLE, addr2.address)).to.be.true;

      // Revocar SETTER_ROLE de addr1
      await faucet.connect(owner).revokeRole(SETTER_ROLE, addr1.address);

      // Verificar que addr1 ya no tiene el SETTER_ROLE y addr2 aún lo tiene
      expect(await faucet.hasRole(SETTER_ROLE, addr1.address)).to.be.false;
      expect(await faucet.hasRole(SETTER_ROLE, addr2.address)).to.be.true;
    });
  });
});
