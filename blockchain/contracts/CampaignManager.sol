// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./DonationStorage.sol";
import "./DonationRoles.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * Campaign management logic: creating, closing and reading campaigns/milestones.
 *
 * NOTE: This is a helper abstraction designed to be inherited by a concrete
 * DonationRegistry implementation. The actual project currently keeps the full
 * logic inside DonationRegistry.sol; this file shows a clean separation point
 * but does not change on-chain behavior by itself.
 */
abstract contract CampaignManager is DonationStorage, DonationRoles, Pausable {
    /**
     * Create a new campaign with milestone configuration.
     *
     * Mirrors the createCampaign logic inside DonationRegistry.
     */
    function _createCampaign(
        address payable beneficiary,
        string calldata metadataURI,
        uint256 targetAmount,
        uint256[] calldata milestoneAmounts,
        string[] calldata milestoneDescriptions
    ) internal virtual returns (uint256) {
        // Implementation is kept in DonationRegistry for now.
        // This function exists as a separation point for future refactors.
        revert("CampaignManager: not wired yet");
    }

    /**
     * Close a campaign (stop accepting donations).
     */
    function _closeCampaign(uint256 campaignId) internal virtual {
        revert("CampaignManager: not wired yet");
    }

    /**
     * Read helpers that mirror DonationRegistry view functions.
     */
    function _getCampaign(uint256 campaignId) internal view virtual returns (Campaign memory) {
        return campaigns[campaignId];
    }

    function _getMilestone(uint256 campaignId, uint256 milestoneIndex)
        internal
        view
        virtual
        returns (Milestone memory)
    {
        return milestones[campaignId][milestoneIndex];
    }
}

