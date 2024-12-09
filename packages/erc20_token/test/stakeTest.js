const { expect } = require("chai");
const { ethers } = require("hardhat");
const { parseUnits } = ethers;

describe("Staking", function () {
  let myToken;
  let stakingContract;
  let stakingAddress;
  let owner;
  let user;
  let stakeAmount;

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();
    stakeAmount = parseUnits("10", 6); // 10 tokens con 6 decimales

    // Deploy MyToken contract
    const MyToken = await ethers.getContractFactory("MyToken");
    myToken = await MyToken.deploy();
    await myToken.waitForDeployment();
    const myTokenAddress = await myToken.getAddress();

    // Otorgar MINTER_ROLE al owner
    const MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));
    await myToken.grantRole(MINTER_ROLE, owner.address);

    // Deploy Staking contract
    const Staking = await ethers.getContractFactory("Staking");
    stakingContract = await Staking.deploy(myTokenAddress);
    await stakingContract.waitForDeployment();
    stakingAddress = await stakingContract.getAddress();

    // Grant MINTER_ROLE to Staking contract
    await myToken.grantRole(MINTER_ROLE, stakingAddress);

    // Mint tokens for testing - mint extra for rewards
    const initialMint = parseUnits("2000", 6);
    await myToken.mint(owner.address, initialMint);

    // Transfer tokens to user for testing
    await myToken.transfer(user.address, stakeAmount);
  });

  it("Should allow user to stake tokens", async function () {
    // Verify user has enough tokens
    const userBalance = await myToken.balanceOf(user.address);
    expect(userBalance).to.be.gte(stakeAmount);

    // Approve tokens for staking contract
    await myToken.connect(user).approve(stakingAddress, stakeAmount);

    // Store initial stake balance
    const initialStakeBalance = await stakingContract.getStakeInfo(
      user.address
    );

    // Perform staking
    await stakingContract.connect(user).stake(stakeAmount);

    // Verify user's stake balance has increased
    const updatedStakeBalance = await stakingContract.getStakeInfo(
      user.address
    );
    expect(updatedStakeBalance.amount).to.equal(
      initialStakeBalance.amount + stakeAmount
    );
  });

  it("Should allow user to unstake tokens fully", async function () {
    // Approve and stake tokens
    await myToken.connect(user).approve(stakingAddress, stakeAmount);
    await stakingContract.connect(user).stake(stakeAmount);

    // Advance time by 10 minutes
    await ethers.provider.send("evm_increaseTime", [600]);
    await ethers.provider.send("evm_mine", []);

    // Calculate reward for the full unstake
    const fullReward = await stakingContract.calculateReward(user.address);

    // Store initial balance
    const initialBalance = await myToken.balanceOf(user.address);

    // Unstake the full amount
    await stakingContract.connect(user).unstake(stakeAmount);

    // Get final balance and calculate expected final balance
    const finalBalance = await myToken.balanceOf(user.address);
    const expectedFinalBalance = initialBalance + stakeAmount + fullReward;

    // Verify final balance with tolerance
    const tolerance = parseUnits("0.001", 6); // 0.001 tokens tolerance
    expect(finalBalance).to.be.closeTo(expectedFinalBalance, tolerance);

    // Verify that stake balance is now zero
    const remainingStake = await stakingContract.getStakeInfo(user.address);
    expect(remainingStake.amount).to.equal(0);
  });

  it("Should allow partial unstaking with proportional rewards", async function () {
    // Approve and stake tokens
    await myToken.connect(user).approve(stakingAddress, stakeAmount);
    await stakingContract.connect(user).stake(stakeAmount);

    // Advance time by 10 minutes to accumulate rewards
    await ethers.provider.send("evm_increaseTime", [600]);
    await ethers.provider.send("evm_mine", []);

    const partialUnstakeAmount = parseUnits("5", 6); // Unstake 5 tokens

    // Calculate expected reward before unstaking
    const totalReward = await stakingContract.calculateReward(user.address);
    const partialReward = (totalReward * partialUnstakeAmount) / stakeAmount;

    // Store initial balance
    const initialBalance = await myToken.balanceOf(user.address);

    // Perform partial unstaking
    await stakingContract.connect(user).unstake(partialUnstakeAmount);

    // Get final balance after partial unstake
    const finalBalance = await myToken.balanceOf(user.address);

    // Calculate expected final balance
    const expectedFinalBalance =
      initialBalance + partialUnstakeAmount + partialReward;

    // Verify final balance with tolerance
    const tolerance = parseUnits("0.001", 6); // 0.001 tokens tolerance
    expect(finalBalance).to.be.closeTo(expectedFinalBalance, tolerance);

    // Verify remaining stake balance
    const remainingStake = await stakingContract.getStakeInfo(user.address);
    expect(remainingStake.amount).to.equal(stakeAmount - partialUnstakeAmount);
  });
});
