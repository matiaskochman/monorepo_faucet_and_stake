// contracts/PesosArgToken.sol

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PesosArgToken is ERC20, AccessControl, Ownable {
    // Definir un rol para los minters
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    // Eventos
    event BeforeMint(address indexed to, uint256 amount);
    event Mint(address indexed to, uint256 amount);

    constructor() ERC20("Pesos Argentinos Divisa Mundial", "ARS") {
        // Otorgar el rol de admin al deployer del contrato
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    // Sobrescribir la función decimals para que el token tenga 6 decimales
    function decimals() public view virtual override returns (uint8) {
        return 6;
    }

    // Función para mintear tokens, solo callable por cuentas con el rol MINTER_ROLE
    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) {
        emit BeforeMint(to, amount);
        _mint(to, amount);
        emit Mint(to, amount);
    }
}
