// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./DonationStorage.sol";
import "./DonationRoles.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * Milestone proof, approval and fund release logic.
 *
 * The full implementations of these flows are currently in DonationRegistry.
 * This abstract contract expresses their intended separation.
 */
abstract contract MilestoneManager is DonationStorage, DonationRoles, ReentrancyGuard, Pausable {
    function _submitProof(
        uint256 campaignId,
        uint256 milestoneIndex,
        string calldata ipfsHash
    ) internal virtual {
        revert("MilestoneManager: not wired yet");
    }

    function _approveMilestone(uint256 campaignId, uint256 milestoneIndex) internal virtual {
        revert("MilestoneManager: not wired yet");
    }

    function _confirmReceipt(uint256 campaignId, uint256 milestoneIndex) internal virtual {
        revert("MilestoneManager: not wired yet");
    }
}

