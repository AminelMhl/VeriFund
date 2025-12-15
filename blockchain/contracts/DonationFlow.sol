// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./DonationStorage.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * Donation flow / escrow logic.
 *
 * Currently the concrete implementation of donate() lives in DonationRegistry.
 * This abstract contract defines a clean separation point for that logic.
 */
abstract contract DonationFlow is DonationStorage, ReentrancyGuard, Pausable {
    /**
     * Internal donation handler; designed to correspond to DonationRegistry.donate.
     */
    function _donate(uint256 campaignId) internal virtual {
        revert("DonationFlow: not wired yet");
    }
}

