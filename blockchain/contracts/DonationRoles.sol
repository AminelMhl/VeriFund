// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * Role definitions and admin-managed role assignment
 * for charities and validators.
 */
abstract contract DonationRoles is AccessControl {
    bytes32 public constant CHARITY_ROLE   = keccak256("CHARITY_ROLE");
    bytes32 public constant VALIDATOR_ROLE = keccak256("VALIDATOR_ROLE");

    event RoleGrantedEvent(bytes32 indexed role, address indexed account, address indexed grantor);

    function _initRoles(address admin) internal {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
    }

    function registerCharity(address charityAddress) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(charityAddress != address(0), "Invalid address");
        _grantRole(CHARITY_ROLE, charityAddress);
        emit RoleGrantedEvent(CHARITY_ROLE, charityAddress, msg.sender);
    }

    function removeCharity(address charityAddress) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(CHARITY_ROLE, charityAddress);
    }

    function registerValidator(address validator) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(validator != address(0), "Invalid address");
        _grantRole(VALIDATOR_ROLE, validator);
        emit RoleGrantedEvent(VALIDATOR_ROLE, validator, msg.sender);
    }

    function removeValidator(address validator) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(VALIDATOR_ROLE, validator);
    }

    function checkRole(bytes32 role, address account) external view returns (bool) {
        return hasRole(role, account);
    }
}

