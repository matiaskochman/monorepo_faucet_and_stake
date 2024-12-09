// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// import "hardhat/console.sol";
import "./MyToken.sol";

contract Faucet {
    MyToken public token;
    uint256 public claimAmount = 200 * 10 ** 6; // 200 MTK con 18 decimales

    mapping(address => bool) public hasClaimed;

    // Eventos para seguir el flujo del contrato
    event TokensClaimed(address indexed user, uint256 amount);
    event ClaimRequested(address indexed user);

    constructor(address tokenAddress) {
        token = MyToken(tokenAddress);
    }

    function claimTokens() external {
        // Emitir evento al iniciar el proceso de claim
        emit ClaimRequested(msg.sender);
        require(!hasClaimed[msg.sender], "Ya reclamaste tus tokens");
        hasClaimed[msg.sender] = true;
        // Llamada a la función mint del token
        token.mint(msg.sender, claimAmount);
        // Emitir eventos después de que los tokens han sido reclamados y minteados
        emit TokensClaimed(msg.sender, claimAmount);
    }
}
