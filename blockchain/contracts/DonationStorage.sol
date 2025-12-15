// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * Shared storage, types, events, and custom errors
 * for the DonationRegistry system.
 */
abstract contract DonationStorage {
    struct Milestone {
        uint256 amount;         // Wei amount for this milestone
        string description;     // Human-readable milestone description
        string ipfsProofHash;   // IPFS CID for proof of work (images/docs)
        bool isApproved;        // Validator has approved this milestone
        bool isReleased;        // Funds have been released to beneficiary
        bool receiptConfirmed;  // Beneficiary confirmed receipt of funds
    }

    struct Campaign {
        uint256 id;
        address charity;             // Campaign creator (must have CHARITY_ROLE)
        address payable beneficiary; // Receives funds after approval
        string metadataURI;          // IPFS hash for campaign details
        uint256 targetAmount;        // Fundraising goal (wei)
        uint256 currentAmount;       // Amount raised so far (wei)
        uint256 releasedAmount;      // Amount already released to beneficiary
        uint256 milestoneCount;      // Number of milestones
        bool isActive;               // Accepting donations?
        uint256 createdAt;           // Creation timestamp
    }

    // Counter for generating unique campaign IDs
    uint256 public nextCampaignId;

    // Main storage for all campaigns
    mapping(uint256 => Campaign) public campaigns;

    // Storage for milestones within each campaign: campaignId => milestoneIndex => Milestone
    mapping(uint256 => mapping(uint256 => Milestone)) public milestones;

    // Track individual donor contributions: donor => campaignId => amount
    mapping(address => mapping(uint256 => uint256)) public donationsByAddress;

    // Events
    event CampaignCreated(
        uint256 indexed campaignId,
        address indexed charity,
        address indexed beneficiary,
        string metadataURI,
        uint256 targetAmount,
        uint256 milestoneCount,
        uint256 createdAt
    );

    event MilestoneAdded(
        uint256 indexed campaignId,
        uint256 indexed milestoneIndex,
        uint256 amount,
        string description
    );

    event DonationReceived(
        uint256 indexed campaignId,
        address indexed donor,
        uint256 amount,
        uint256 newTotal
    );

    event ProofSubmitted(
        uint256 indexed campaignId,
        uint256 indexed milestoneIndex,
        string ipfsProofHash
    );

    event MilestoneApproved(
        uint256 indexed campaignId,
        uint256 indexed milestoneIndex,
        address indexed validator
    );

    event FundsReleased(
        uint256 indexed campaignId,
        uint256 indexed milestoneIndex,
        address indexed beneficiary,
        uint256 amount
    );

    event ReceiptConfirmed(
        uint256 indexed campaignId,
        uint256 indexed milestoneIndex,
        address indexed beneficiary,
        uint256 amount,
        uint256 timestamp
    );

    event CampaignClosed(uint256 indexed campaignId);

    // Custom errors
    error CampaignNotFound();
    error CampaignNotActive();
    error MilestoneNotFound();
    error MilestoneAlreadyApproved();
    error MilestoneAlreadyReleased();
    error ProofNotSubmitted();
    error InsufficientFunds();
    error InvalidBeneficiary();
    error InvalidAmount();
    error MilestoneAmountMismatch();
    error NotCampaignCharity();
    error NotBeneficiary();
    error ReceiptAlreadyConfirmed();
    error FundsNotYetReleased();
    error ZeroDonation();
    error TransferFailed();
}

