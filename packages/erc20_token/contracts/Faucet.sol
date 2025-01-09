// contracts/Faucet.sol

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./PesosArgToken.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract Faucet is AccessControl, ReentrancyGuard, Pausable {
    PesosArgToken public token;
    uint256 public claimAmount = 100 * 10 ** 6;

    mapping(address => bool) public hasClaimed;

    // Definir roles
    bytes32 public constant SETTER_ROLE = keccak256("SETTER_ROLE");

    // Eventos para seguir el flujo del contrato
    event TokensClaimed(address indexed user, uint256 amount);
    event ClaimRequested(address indexed user);
    event ClaimAmountUpdated(uint256 newAmount);

    constructor(address tokenAddress) {
        require(tokenAddress != address(0), "Token address cannot be zero");
        token = PesosArgToken(tokenAddress);
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(SETTER_ROLE, msg.sender);
    }

    function claimTokens() external nonReentrant whenNotPaused {
        // Emitir evento al iniciar el proceso de claim
        emit ClaimRequested(msg.sender);
        require(!hasClaimed[msg.sender], "Ya reclamaste tus tokens");
        hasClaimed[msg.sender] = true;
        // Llamada a la función mint del token
        token.mint(msg.sender, claimAmount);
        // Emitir eventos después de que los tokens han sido reclamados y minteados
        emit TokensClaimed(msg.sender, claimAmount);
    }

    /**
     * @dev Permite actualizar el monto de reclamación.
     * Solo puede ser llamada por una cuenta con el rol SETTER_ROLE.
     * @param newAmount El nuevo monto de reclamación en unidades de token (considerando decimales).
     */

    function setClaimAmount(uint256 newAmount) external onlyRole(SETTER_ROLE) {
        claimAmount = newAmount;
        emit ClaimAmountUpdated(newAmount);
    }
    
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }    
}
