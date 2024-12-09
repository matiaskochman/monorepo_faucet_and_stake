// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./MyToken.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Staking is ReentrancyGuard {
    struct StakeInfo {
        uint256 amount;
        uint256 since;
    }

    MyToken public token;
    mapping(address => StakeInfo) public stakes;
    uint256 public constant REWARD_RATE = 1; // 0.1% per minute (for testing purposes)

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount, uint256 reward);

    constructor(address _token) {
        require(_token != address(0), "Token address cannot be zero");
        token = MyToken(_token);
    }

    function stake(uint256 _amount) external nonReentrant {
        require(_amount > 0, "Cannot stake 0 tokens");
        require(
            token.balanceOf(msg.sender) >= _amount,
            "Insufficient token balance"
        );
        require(
            token.allowance(msg.sender, address(this)) >= _amount,
            "Insufficient allowance"
        );

        // Transferir tokens al contrato de staking
        require(
            token.transferFrom(msg.sender, address(this), _amount),
            "Transfer failed"
        );

        uint256 reward = 0;

        if (stakes[msg.sender].amount > 0) {
            // Calcular recompensas acumuladas
            reward = calculateReward(msg.sender);
            if (reward > 0) {
                // Mint de las recompensas al usuario
                token.mint(msg.sender, reward);
            }
        }

        // Actualizar el registro del stake del usuario
        stakes[msg.sender].amount += _amount;
        stakes[msg.sender].since = block.timestamp;

        emit Staked(msg.sender, _amount);
    }

    function unstake(uint256 _amount) external nonReentrant {
        StakeInfo storage userStake = stakes[msg.sender];
        require(userStake.amount >= _amount, "Insufficient staked amount");

        uint256 reward = calculateReward(msg.sender);
        uint256 partialReward = (reward * _amount) / userStake.amount;

        // Reducir el monto apostado y actualizar el tiempo
        userStake.amount -= _amount;
        if (userStake.amount > 0) {
            userStake.since = block.timestamp;
        } else {
            delete stakes[msg.sender];
        }

        // Transferir el monto desapostado al usuario
        require(token.transfer(msg.sender, _amount), "Transfer failed");

        // Mint de las recompensas al usuario
        if (partialReward > 0) {
            token.mint(msg.sender, partialReward);
        }

        emit Unstaked(msg.sender, _amount, partialReward);
    }

    function calculateReward(address _user) public view returns (uint256) {
        StakeInfo memory userStake = stakes[_user];
        if (userStake.amount == 0) return 0;

        uint256 timeStaked = block.timestamp - userStake.since;
        return (userStake.amount * timeStaked * REWARD_RATE) / (1000 * 60); // Reward per minute
    }

    function getStakeInfo(
        address _user
    ) external view returns (uint256 amount, uint256 since) {
        StakeInfo memory userStake = stakes[_user];
        return (userStake.amount, userStake.since);
    }

    function getStakedAmount(address _user) external view returns (uint256) {
        return stakes[_user].amount;
    }
}
