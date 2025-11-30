// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/*
  DonationRegistry
  - Create campaigns (charities)
  - Admin approves (verifies) campaigns
  - Donors send ETH to verified campaigns
  - Campaign owners withdraw funds (pull pattern)
  - Events emitted for indexing & receipts
  - Security: Ownable, ReentrancyGuard, Pausable
*/

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract DonationRegistry is Ownable, ReentrancyGuard, Pausable {
    struct Campaign {
        uint256 id;
        address payable owner;    // charity/beneficiary
        string metadataURI;       // IPFS or JSON metadata pointer
        uint256 goal;             // fundraising goal (in wei)
        uint256 raised;           // total raised (in wei)
        bool verified;            // approved by admin
        bool active;              // active or closed
        uint256 createdAt;        // timestamp
    }

    uint256 public nextCampaignId;
    mapping(uint256 => Campaign) public campaigns;

    // donor => (campaignId => amount)
    mapping(address => mapping(uint256 => uint256)) public donationsByAddress;

    // events (indexable fields first for efficient subgraph / logs)
    event CampaignCreated(uint256 indexed id, address indexed owner, string metadataURI, uint256 goal, uint256 createdAt);
    event CampaignApproved(uint256 indexed id, address indexed approver);
    event DonationReceived(uint256 indexed campaignId, address indexed donor, uint256 amount);
    event Withdrawn(uint256 indexed campaignId, address indexed to, uint256 amount);
    event CampaignClosed(uint256 indexed id);

    error NotCampaignOwner();
    error CampaignNotFound();
    error CampaignNotVerified();
    error CampaignNotActive();
    error InsufficientFunds();

    constructor() Ownable(msg.sender) {
        nextCampaignId = 1; // start IDs at 1 for readability
    }

    // -------- Campaign lifecycle --------

    /// @notice Create a new campaign. Created as unverified; admin must approve.
    /// @param metadataURI A pointer to campaign metadata (IPFS / JSON)
    /// @param goal fundraising goal in wei
    function createCampaign(string calldata metadataURI, uint256 goal) external whenNotPaused returns (uint256) {
        require(bytes(metadataURI).length > 0, "metadata required");
        require(goal > 0, "goal > 0");

        uint256 id = nextCampaignId++;
        campaigns[id] = Campaign({
            id: id,
            owner: payable(msg.sender),
            metadataURI: metadataURI,
            goal: goal,
            raised: 0,
            verified: false,
            active: true,
            createdAt: block.timestamp
        });

        emit CampaignCreated(id, msg.sender, metadataURI, goal, block.timestamp);
        return id;
    }

    /// @notice Approve (verify) a campaign. Only owner (admin) can call.
    function approveCampaign(uint256 id) external onlyOwner whenNotPaused {
        Campaign storage c = campaigns[id];
        if (c.owner == address(0)) revert CampaignNotFound();
        c.verified = true;
        emit CampaignApproved(id, msg.sender);
    }

    /// @notice Close a campaign (stop accepting donations). Only campaign owner.
    function closeCampaign(uint256 id) external whenNotPaused {
        Campaign storage c = campaigns[id];
        if (c.owner == address(0)) revert CampaignNotFound();
        if (msg.sender != c.owner) revert NotCampaignOwner();
        c.active = false;
        emit CampaignClosed(id);
    }

    // -------- Donation flow --------

    /// @notice Donate ETH to a verified campaign. Funds stay in contract until withdrawn.
    function donateToCampaign(uint256 id) external payable nonReentrant whenNotPaused {
        Campaign storage c = campaigns[id];
        if (c.owner == address(0)) revert CampaignNotFound();
        if (!c.verified) revert CampaignNotVerified();
        if (!c.active) revert CampaignNotActive();
        if (msg.value == 0) revert("zero donation");

        c.raised += msg.value;
        donationsByAddress[msg.sender][id] += msg.value;

        emit DonationReceived(id, msg.sender, msg.value);
    }

    /// @notice Withdraw funds for a campaign owner. Pull pattern to avoid reentrancy risks.
    /// @param id campaign id
    /// @param amount wei amount to withdraw (<= raised)
    function withdraw(uint256 id, uint256 amount) external nonReentrant whenNotPaused {
        Campaign storage c = campaigns[id];
        if (c.owner == address(0)) revert CampaignNotFound();
        if (msg.sender != c.owner) revert NotCampaignOwner();
        if (amount == 0) revert("zero withdraw");
        if (amount > c.raised) revert InsufficientFunds();

        c.raised -= amount;
        (bool ok, ) = c.owner.call{value: amount}("");
        require(ok, "transfer failed");

        emit Withdrawn(id, c.owner, amount);
    }

    // -------- View helpers --------

    function getCampaign(uint256 id) external view returns (Campaign memory) {
        Campaign storage c = campaigns[id];
        if (c.owner == address(0)) revert CampaignNotFound();
        return c;
    }

    function getDonationOf(address donor, uint256 id) external view returns (uint256) {
        return donationsByAddress[donor][id];
    }

    // -------- Admin emergency functions --------

    /// @notice Pause contract in emergencies
    function pause() external onlyOwner {
        _pause();
    }

    /// @notice Unpause contract
    function unpause() external onlyOwner {
        _unpause();
    }

    /// @notice Emergency withdraw: admin can rescue ETH mistakenly sent to contract (use sparingly)
    function emergencyWithdraw(address payable to, uint256 amount) external onlyOwner nonReentrant {
        require(to != address(0), "invalid to");
        (bool ok, ) = to.call{value: amount}("");
        require(ok, "transfer failed");
    }

    // Fallback / receive to prevent accidental ETH being locked without campaign
    receive() external payable {
        revert("use donateToCampaign");
    }

    fallback() external payable {
        revert("use donateToCampaign");
    }
}
