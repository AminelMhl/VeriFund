// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * ============================================================================
 *                    VERIFUND - TRANSPARENT CHARITY DONATION SYSTEM
 * ============================================================================
 * 
 * @title DonationRegistry
 * @author VeriFund Team
 * @notice A production-ready smart contract for transparent charity fundraising
 *         with milestone-based fund release and third-party validation.
 * 
 * ============================================================================
 *                              SYSTEM OVERVIEW
 * ============================================================================
 * 
 * This contract implements a transparent donation tracking system where:
 * 
 * 1. ESCROW MODEL: Donated funds are held in the contract (not sent immediately)
 * 2. MILESTONE-BASED: Campaigns are split into milestones with specific targets
 * 3. PROOF OF WORK: Charities submit IPFS hashes as proof of milestone completion
 * 4. VALIDATOR APPROVAL: Independent validators must approve before fund release
 * 
 * ============================================================================
 *                              ROLE DEFINITIONS
 * ============================================================================
 * 
 * ADMIN (DEFAULT_ADMIN_ROLE):
 *   - The deployer (University/Platform)
 *   - Can grant/revoke all roles
 *   - Can pause/unpause the contract
 *   - Can perform emergency withdrawals
 * 
 * CHARITY (CHARITY_ROLE):
 *   - Authorized organizations that can create campaigns
 *   - Submit proof of work (IPFS hashes) for milestones
 *   - Cannot release funds without validator approval
 * 
 * VALIDATOR (VALIDATOR_ROLE):
 *   - Trusted third party (Auditor/NGO/University)
 *   - Reviews proof submissions
 *   - Approves milestones to trigger fund release
 *   - Acts as an independent verification layer
 * 
 * DONOR (No role required):
 *   - Any public address can donate
 *   - No registration needed
 *   - Can track their donations on-chain
 * 
 * BENEFICIARY:
 *   - The address receiving the funds
 *   - Set per campaign by the Charity
 *   - Receives funds only after milestone approval
 * 
 * ============================================================================
 *                              WORKFLOW DIAGRAM
 * ============================================================================
 * 
 *   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
 *   │   CHARITY   │     │   DONORS    │     │  VALIDATOR  │     │ BENEFICIARY │
 *   └──────┬──────┘     └──────┬──────┘     └──────┬──────┘     └──────┬──────┘
 *          │                   │                   │                   │
 *          │ 1. createCampaign │                   │                   │
 *          │ (with milestones) │                   │                   │
 *          ├───────────────────►                   │                   │
 *          │                   │                   │                   │
 *          │                   │ 2. donate(id)     │                   │
 *          │                   ├──────────────────►│                   │
 *          │                   │   (ETH held in    │                   │
 *          │                   │    escrow)        │                   │
 *          │                   │                   │                   │
 *          │ 3. submitProof    │                   │                   │
 *          │ (IPFS hash)       │                   │                   │
 *          ├───────────────────────────────────────►                   │
 *          │                   │                   │                   │
 *          │                   │   4. approveMilestone                 │
 *          │                   │   (triggers auto-release)             │
 *          │                   │                   ├───────────────────►
 *          │                   │                   │   Funds sent to   │
 *          │                   │                   │   Beneficiary     │
 *          ▼                   ▼                   ▼                   ▼
 * 
 * ============================================================================
 *                              SECURITY FEATURES
 * ============================================================================
 * 
 * 1. ReentrancyGuard: Prevents reentrancy attacks on all transfer functions
 * 2. AccessControl: Role-based permissions (Admin, Charity, Validator)
 * 3. Pausable: Emergency pause functionality
 * 4. Escrow Pattern: Funds held until validator approval
 * 5. IPFS Storage: Sensitive data stored off-chain as hashes
 * 6. Pull Pattern: Beneficiaries receive funds via contract push after approval
 * 
 * ============================================================================
 */

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract DonationRegistry is AccessControl, ReentrancyGuard, Pausable {
    
    // =========================================================================
    //                              ROLE DEFINITIONS
    // =========================================================================
    
    /**
     * @dev CHARITY_ROLE: Granted to verified charity organizations
     * @notice Only addresses with this role can create campaigns
     * 
     * How roles work in AccessControl:
     * - Roles are identified by bytes32 hashes (not strings for gas efficiency)
     * - keccak256 creates a unique hash from the string "CHARITY_ROLE"
     * - Admin can grant/revoke this role using grantRole() / revokeRole()
     */
    bytes32 public constant CHARITY_ROLE = keccak256("CHARITY_ROLE");
    
    /**
     * @dev VALIDATOR_ROLE: Granted to trusted third-party auditors
     * @notice Only addresses with this role can approve milestones
     * 
     * Why separate validators?
     * - Prevents charities from releasing their own funds
     * - Adds accountability layer (auditors can be NGOs, universities, etc.)
     * - Creates transparent verification trail on-chain
     */
    bytes32 public constant VALIDATOR_ROLE = keccak256("VALIDATOR_ROLE");

    // =========================================================================
    //                              DATA STRUCTURES
    // =========================================================================
    
    /**
     * @dev Milestone struct - Represents a single milestone within a campaign
     * 
     * @param amount The amount of ETH (in wei) allocated to this milestone
     *               When approved, this exact amount is sent to the beneficiary
     * 
     * @param description A brief description of what this milestone represents
     *                    Example: "Phase 1: Purchase medical supplies"
     * 
     * @param ipfsProofHash IPFS Content Identifier (CID) for proof documents
     *                      Example: "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco"
     *                      Stores: images, receipts, reports (off-chain)
     *                      Why IPFS? Decentralized, immutable, cost-effective
     * 
     * @param isApproved Boolean flag set to true when validator approves
     *                   Once true, funds are automatically released
     * 
     * @param isReleased Boolean flag to prevent double-spending
     *                   Set to true after funds are transferred
     */
    struct Milestone {
        uint256 amount;         // Wei amount for this milestone
        string description;     // Human-readable milestone description
        string ipfsProofHash;   // IPFS CID for proof of work (images/docs)
        bool isApproved;        // Validator has approved this milestone
        bool isReleased;        // Funds have been released to beneficiary
    }
    
    /**
     * @dev Campaign struct - Represents a fundraising campaign
     * 
     * @param id Unique identifier for the campaign (starts at 1)
     * 
     * @param charity Address of the charity that created this campaign
     *                Must have CHARITY_ROLE to create campaigns
     * 
     * @param beneficiary Address that will receive the funds
     *                    Can be different from charity (e.g., hospital, school)
     *                    Funds are ONLY sent here after milestone approval
     * 
     * @param metadataURI IPFS hash pointing to campaign metadata JSON
     *                    Contains: title, description, images, documents
     *                    Example: "ipfs://QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG"
     * 
     * @param targetAmount Total fundraising goal in wei
     *                     Should equal sum of all milestone amounts
     * 
     * @param currentAmount Total ETH donated so far (held in escrow)
     * 
     * @param milestoneCount Number of milestones in this campaign
     *                       Used for iteration and validation
     * 
     * @param isActive Campaign is accepting donations
     *                 Set to false when closed or fully funded
     * 
     * @param createdAt Unix timestamp when campaign was created
     */
    struct Campaign {
        uint256 id;
        address charity;            // Campaign creator (must have CHARITY_ROLE)
        address payable beneficiary; // Receives funds after approval
        string metadataURI;         // IPFS hash for campaign details
        uint256 targetAmount;       // Fundraising goal (wei)
        uint256 currentAmount;      // Amount raised so far (wei)
        uint256 releasedAmount;     // Amount already released to beneficiary
        uint256 milestoneCount;     // Number of milestones
        bool isActive;              // Accepting donations?
        uint256 createdAt;          // Creation timestamp
    }

    // =========================================================================
    //                              STATE VARIABLES
    // =========================================================================
    
    /**
     * @dev Counter for generating unique campaign IDs
     * @notice Starts at 1 (not 0) for better UX and to distinguish from default
     */
    uint256 public nextCampaignId;
    
    /**
     * @dev Main storage for all campaigns
     * @notice Mapping from campaign ID to Campaign struct
     * 
     * Why mapping instead of array?
     * - O(1) lookup by ID (arrays would be O(n))
     * - No need to iterate all campaigns on-chain
     * - Off-chain indexing (The Graph) handles listing
     */
    mapping(uint256 => Campaign) public campaigns;
    
    /**
     * @dev Storage for milestones within each campaign
     * @notice campaigns[campaignId][milestoneIndex] => Milestone
     * 
     * Structure: campaignId => (milestoneIndex => Milestone)
     * Example: milestones[1][0] = First milestone of Campaign #1
     */
    mapping(uint256 => mapping(uint256 => Milestone)) public milestones;
    
    /**
     * @dev Track individual donor contributions
     * @notice donationsByAddress[donorAddress][campaignId] => amount
     * 
     * Why track this?
     * - Donors can verify their contributions
     * - Enables refund functionality (future feature)
     * - Provides transparency for auditing
     */
    mapping(address => mapping(uint256 => uint256)) public donationsByAddress;

    // =========================================================================
    //                              EVENTS
    // =========================================================================
    
    /**
     * @dev Events are crucial for:
     * 1. Off-chain indexing (The Graph, Etherscan)
     * 2. Frontend real-time updates (ethers.js listeners)
     * 3. Creating an immutable audit trail
     * 
     * @notice 'indexed' parameters are searchable in logs (max 3 per event)
     */
    
    /// @notice Emitted when a new campaign is created
    event CampaignCreated(
        uint256 indexed campaignId,
        address indexed charity,
        address indexed beneficiary,
        string metadataURI,
        uint256 targetAmount,
        uint256 milestoneCount,
        uint256 createdAt
    );
    
    /// @notice Emitted when a milestone is added to a campaign
    event MilestoneAdded(
        uint256 indexed campaignId,
        uint256 indexed milestoneIndex,
        uint256 amount,
        string description
    );
    
    /// @notice Emitted when a donation is received
    event DonationReceived(
        uint256 indexed campaignId,
        address indexed donor,
        uint256 amount,
        uint256 newTotal
    );
    
    /// @notice Emitted when charity submits proof for a milestone
    event ProofSubmitted(
        uint256 indexed campaignId,
        uint256 indexed milestoneIndex,
        string ipfsProofHash
    );
    
    /// @notice Emitted when validator approves a milestone
    event MilestoneApproved(
        uint256 indexed campaignId,
        uint256 indexed milestoneIndex,
        address indexed validator
    );
    
    /// @notice Emitted when funds are released to beneficiary
    event FundsReleased(
        uint256 indexed campaignId,
        uint256 indexed milestoneIndex,
        address indexed beneficiary,
        uint256 amount
    );
    
    /// @notice Emitted when a campaign is closed
    event CampaignClosed(uint256 indexed campaignId);
    
    /// @notice Emitted when a role is granted to an address
    event RoleGrantedEvent(bytes32 indexed role, address indexed account, address indexed grantor);

    // =========================================================================
    //                              CUSTOM ERRORS
    // =========================================================================
    
    /**
     * @dev Custom errors are more gas-efficient than require strings
     * @notice Introduced in Solidity 0.8.4
     * 
     * Gas comparison:
     * - require("Campaign not found") ≈ 2000+ gas
     * - revert CampaignNotFound() ≈ 100 gas
     */
    
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
    error ZeroDonation();
    error TransferFailed();

    // =========================================================================
    //                              CONSTRUCTOR
    // =========================================================================
    
    /**
     * @dev Constructor - Initializes the contract
     * @notice The deployer becomes the DEFAULT_ADMIN_ROLE holder
     * 
     * What happens on deployment:
     * 1. Deployer gets DEFAULT_ADMIN_ROLE (can manage all roles)
     * 2. Campaign counter starts at 1
     * 3. Contract is in active (unpaused) state
     * 
     * AccessControl hierarchy:
     * - DEFAULT_ADMIN_ROLE can grant/revoke CHARITY_ROLE
     * - DEFAULT_ADMIN_ROLE can grant/revoke VALIDATOR_ROLE
     * - DEFAULT_ADMIN_ROLE can grant/revoke DEFAULT_ADMIN_ROLE
     */
    constructor() {
        // Grant the deployer the admin role
        // _grantRole is an internal function from AccessControl
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        
        // Start campaign IDs at 1 for better UX
        // ID 0 is often used to check "does not exist"
        nextCampaignId = 1;
    }

    // =========================================================================
    //                         ROLE MANAGEMENT FUNCTIONS
    // =========================================================================
    
    /**
     * @dev Register a charity organization
     * @param charityAddress The address to grant CHARITY_ROLE
     * 
     * @notice Only callable by admin (DEFAULT_ADMIN_ROLE)
     * 
     * Use case: University admin registers verified charity organizations
     * 
     * Example:
     *   registerCharity(0x1234...); // Now this address can create campaigns
     */
    function registerCharity(address charityAddress) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(charityAddress != address(0), "Invalid address");
        _grantRole(CHARITY_ROLE, charityAddress);
        emit RoleGrantedEvent(CHARITY_ROLE, charityAddress, msg.sender);
    }
    
    /**
     * @dev Remove charity role from an address
     * @param charityAddress The address to revoke CHARITY_ROLE from
     * 
     * @notice Use if a charity is found to be fraudulent or inactive
     */
    function removeCharity(address charityAddress) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(CHARITY_ROLE, charityAddress);
    }
    
    /**
     * @dev Register a validator (auditor/NGO)
     * @param validatorAddress The address to grant VALIDATOR_ROLE
     * 
     * @notice Validators are trusted third parties who verify milestone completion
     * 
     * Example validators:
     * - University audit department
     * - NGO oversight committee
     * - Independent auditing firm
     */
    function registerValidator(address validatorAddress) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(validatorAddress != address(0), "Invalid address");
        _grantRole(VALIDATOR_ROLE, validatorAddress);
        emit RoleGrantedEvent(VALIDATOR_ROLE, validatorAddress, msg.sender);
    }
    
    /**
     * @dev Remove validator role from an address
     * @param validatorAddress The address to revoke VALIDATOR_ROLE from
     */
    function removeValidator(address validatorAddress) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(VALIDATOR_ROLE, validatorAddress);
    }

    // =========================================================================
    //                         CAMPAIGN CREATION
    // =========================================================================
    
    /**
     * @dev Create a new fundraising campaign with milestones
     * 
     * @param beneficiary Address that will receive funds (hospital, school, etc.)
     * @param metadataURI IPFS hash containing campaign details (title, description, images)
     * @param targetAmount Total fundraising goal in wei
     * @param milestoneAmounts Array of amounts for each milestone (must sum to targetAmount)
     * @param milestoneDescriptions Array of descriptions for each milestone
     * 
     * @return campaignId The unique ID of the created campaign
     * 
     * @notice Only addresses with CHARITY_ROLE can call this
     * @notice Milestones allow phased fund release based on verified progress
     * 
     * Example:
     *   createCampaign(
     *     0xBeneficiary...,
     *     "ipfs://QmCampaignMetadata...",
     *     10 ether,
     *     [3 ether, 3 ether, 4 ether],
     *     ["Phase 1: Supplies", "Phase 2: Distribution", "Phase 3: Completion"]
     *   );
     * 
     * Security checks:
     * 1. Caller must have CHARITY_ROLE
     * 2. Contract must not be paused
     * 3. Beneficiary cannot be zero address
     * 4. Target amount must be > 0
     * 5. Must have at least 1 milestone
     * 6. Milestone amounts must sum to target
     * 7. Arrays must have matching lengths
     */
    function createCampaign(
        address payable beneficiary,
        string calldata metadataURI,
        uint256 targetAmount,
        uint256[] calldata milestoneAmounts,
        string[] calldata milestoneDescriptions
    ) external onlyRole(CHARITY_ROLE) whenNotPaused returns (uint256) {
        // ===== INPUT VALIDATION =====
        
        // Check beneficiary is valid (not zero address)
        if (beneficiary == address(0)) revert InvalidBeneficiary();
        
        // Check target amount is positive
        if (targetAmount == 0) revert InvalidAmount();
        
        // Check milestone arrays are valid
        require(milestoneAmounts.length > 0, "Need at least 1 milestone");
        require(
            milestoneAmounts.length == milestoneDescriptions.length,
            "Array length mismatch"
        );
        
        // Verify milestone amounts sum to target
        uint256 totalMilestoneAmount = 0;
        for (uint256 i = 0; i < milestoneAmounts.length; i++) {
            require(milestoneAmounts[i] > 0, "Milestone amount must be > 0");
            totalMilestoneAmount += milestoneAmounts[i];
        }
        if (totalMilestoneAmount != targetAmount) revert MilestoneAmountMismatch();
        
        // ===== CREATE CAMPAIGN =====
        
        // Get unique ID and increment counter
        uint256 campaignId = nextCampaignId++;
        
        // Store campaign data
        campaigns[campaignId] = Campaign({
            id: campaignId,
            charity: msg.sender,
            beneficiary: beneficiary,
            metadataURI: metadataURI,
            targetAmount: targetAmount,
            currentAmount: 0,
            releasedAmount: 0,
            milestoneCount: milestoneAmounts.length,
            isActive: true,
            createdAt: block.timestamp
        });
        
        // ===== CREATE MILESTONES =====
        
        for (uint256 i = 0; i < milestoneAmounts.length; i++) {
            milestones[campaignId][i] = Milestone({
                amount: milestoneAmounts[i],
                description: milestoneDescriptions[i],
                ipfsProofHash: "",      // Empty until proof submitted
                isApproved: false,
                isReleased: false
            });
            
            emit MilestoneAdded(campaignId, i, milestoneAmounts[i], milestoneDescriptions[i]);
        }
        
        // ===== EMIT EVENT =====
        
        emit CampaignCreated(
            campaignId,
            msg.sender,
            beneficiary,
            metadataURI,
            targetAmount,
            milestoneAmounts.length,
            block.timestamp
        );
        
        return campaignId;
    }

    // =========================================================================
    //                         DONATION FUNCTIONS
    // =========================================================================
    
    /**
     * @dev Donate ETH to a specific campaign
     * 
     * @param campaignId The ID of the campaign to donate to
     * 
     * @notice Anyone can donate (no role required)
     * @notice Funds are held in escrow (this contract) until milestone approval
     * @notice Donations are tracked per donor for transparency
     * 
     * Example:
     *   donate(1); // Called with msg.value = 0.5 ether
     * 
     * Security:
     * - nonReentrant: Prevents reentrancy attacks
     * - whenNotPaused: Blocks donations if contract is paused
     * - Validates campaign exists and is active
     * - Validates donation amount > 0
     * 
     * What happens:
     * 1. ETH is transferred to this contract (escrow)
     * 2. Campaign's currentAmount is updated
     * 3. Donor's contribution is recorded
     * 4. Event is emitted for indexing
     */
    function donate(uint256 campaignId) external payable nonReentrant whenNotPaused {
        // Get campaign from storage
        Campaign storage campaign = campaigns[campaignId];
        
        // Validate campaign exists (charity address != 0 means it exists)
        if (campaign.charity == address(0)) revert CampaignNotFound();
        
        // Validate campaign is still accepting donations
        if (!campaign.isActive) revert CampaignNotActive();
        
        // Validate donation amount is positive
        if (msg.value == 0) revert ZeroDonation();
        
        // Update campaign total (funds held in contract)
        campaign.currentAmount += msg.value;
        
        // Track this donor's contribution
        donationsByAddress[msg.sender][campaignId] += msg.value;
        
        // Emit event for frontend/indexer
        emit DonationReceived(
            campaignId,
            msg.sender,
            msg.value,
            campaign.currentAmount
        );
    }

    // =========================================================================
    //                         PROOF SUBMISSION
    // =========================================================================
    
    /**
     * @dev Submit proof of work for a milestone
     * 
     * @param campaignId The campaign ID
     * @param milestoneIndex The index of the milestone (0-based)
     * @param ipfsHash IPFS Content Identifier (CID) for proof documents
     * 
     * @notice Only the charity that created the campaign can submit proof
     * @notice IPFS hash should point to images, receipts, reports, etc.
     * 
     * Example:
     *   submitProof(1, 0, "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG");
     * 
     * Workflow:
     * 1. Charity completes milestone work (e.g., buys supplies)
     * 2. Charity uploads evidence to IPFS (photos, receipts)
     * 3. Charity calls this function with the IPFS hash
     * 4. Validator reviews the IPFS content off-chain
     * 5. If satisfied, validator calls approveMilestone()
     * 
     * Why IPFS?
     * - Decentralized storage (no single point of failure)
     * - Content-addressed (hash = content fingerprint)
     * - Immutable (can't change content without changing hash)
     * - Cost-effective (storing hash on-chain is cheap)
     */
    function submitProof(
        uint256 campaignId,
        uint256 milestoneIndex,
        string calldata ipfsHash
    ) external whenNotPaused {
        // Get campaign
        Campaign storage campaign = campaigns[campaignId];
        
        // Validate campaign exists
        if (campaign.charity == address(0)) revert CampaignNotFound();
        
        // Only the charity that created this campaign can submit proof
        if (msg.sender != campaign.charity) revert NotCampaignCharity();
        
        // Validate milestone exists
        if (milestoneIndex >= campaign.milestoneCount) revert MilestoneNotFound();
        
        // Get milestone
        Milestone storage milestone = milestones[campaignId][milestoneIndex];
        
        // Cannot submit proof for already approved milestone
        if (milestone.isApproved) revert MilestoneAlreadyApproved();
        
        // Validate IPFS hash is not empty
        require(bytes(ipfsHash).length > 0, "IPFS hash required");
        
        // Store the proof hash
        milestone.ipfsProofHash = ipfsHash;
        
        // Emit event for validator notification
        emit ProofSubmitted(campaignId, milestoneIndex, ipfsHash);
    }

    // =========================================================================
    //                         MILESTONE APPROVAL & FUND RELEASE
    // =========================================================================
    
    /**
     * @dev Approve a milestone and automatically release funds to beneficiary
     * 
     * @param campaignId The campaign ID
     * @param milestoneIndex The index of the milestone to approve
     * 
     * @notice Only addresses with VALIDATOR_ROLE can call this
     * @notice Triggers automatic fund transfer to beneficiary
     * @notice This is the ONLY way funds can leave the contract (except emergency)
     * 
     * Example:
     *   approveMilestone(1, 0); // Approve first milestone of campaign 1
     * 
     * Security:
     * - onlyRole(VALIDATOR_ROLE): Only trusted validators can approve
     * - nonReentrant: Prevents reentrancy during ETH transfer
     * - Checks proof was submitted
     * - Checks sufficient funds in escrow
     * - Marks milestone as released to prevent double-spending
     * 
     * Fund flow:
     *   Contract (Escrow) ---> Beneficiary Address
     * 
     * This function implements the core security model:
     * - Charities CANNOT release their own funds
     * - Funds ONLY move after independent validation
     * - Creates verifiable on-chain approval trail
     */
    function approveMilestone(
        uint256 campaignId,
        uint256 milestoneIndex
    ) external onlyRole(VALIDATOR_ROLE) nonReentrant whenNotPaused {
        // Get campaign
        Campaign storage campaign = campaigns[campaignId];
        
        // Validate campaign exists
        if (campaign.charity == address(0)) revert CampaignNotFound();
        
        // Validate milestone exists
        if (milestoneIndex >= campaign.milestoneCount) revert MilestoneNotFound();
        
        // Get milestone
        Milestone storage milestone = milestones[campaignId][milestoneIndex];
        
        // Check proof was submitted
        if (bytes(milestone.ipfsProofHash).length == 0) revert ProofNotSubmitted();
        
        // Check milestone not already approved
        if (milestone.isApproved) revert MilestoneAlreadyApproved();
        
        // Check milestone not already released (double-spend protection)
        if (milestone.isReleased) revert MilestoneAlreadyReleased();
        
        // Calculate available funds (donated - already released)
        uint256 availableFunds = campaign.currentAmount - campaign.releasedAmount;
        
        // Check sufficient funds in escrow for this milestone
        if (availableFunds < milestone.amount) revert InsufficientFunds();
        
        // ===== UPDATE STATE BEFORE TRANSFER (Checks-Effects-Interactions) =====
        
        // Mark milestone as approved and released
        milestone.isApproved = true;
        milestone.isReleased = true;
        
        // Update released amount tracker
        campaign.releasedAmount += milestone.amount;
        
        // Emit approval event
        emit MilestoneApproved(campaignId, milestoneIndex, msg.sender);
        
        // ===== TRANSFER FUNDS TO BENEFICIARY =====
        
        // Use call instead of transfer for gas flexibility
        // transfer() and send() have 2300 gas limit which can fail
        (bool success, ) = campaign.beneficiary.call{value: milestone.amount}("");
        if (!success) revert TransferFailed();
        
        // Emit release event
        emit FundsReleased(
            campaignId,
            milestoneIndex,
            campaign.beneficiary,
            milestone.amount
        );
    }

    // =========================================================================
    //                         CAMPAIGN MANAGEMENT
    // =========================================================================
    
    /**
     * @dev Close a campaign (stop accepting donations)
     * 
     * @param campaignId The campaign to close
     * 
     * @notice Only the charity that created the campaign can close it
     * @notice Closing does NOT affect pending milestones or escrowed funds
     * 
     * Use cases:
     * - Campaign reached its goal
     * - Campaign is no longer active
     * - Charity wants to stop accepting more donations
     */
    function closeCampaign(uint256 campaignId) external whenNotPaused {
        Campaign storage campaign = campaigns[campaignId];
        
        if (campaign.charity == address(0)) revert CampaignNotFound();
        if (msg.sender != campaign.charity) revert NotCampaignCharity();
        
        campaign.isActive = false;
        
        emit CampaignClosed(campaignId);
    }

    // =========================================================================
    //                         VIEW FUNCTIONS
    // =========================================================================
    
    /**
     * @dev Get full campaign details
     * @param campaignId The campaign ID
     * @return Campaign struct with all fields
     */
    function getCampaign(uint256 campaignId) external view returns (Campaign memory) {
        Campaign storage campaign = campaigns[campaignId];
        if (campaign.charity == address(0)) revert CampaignNotFound();
        return campaign;
    }
    
    /**
     * @dev Get milestone details
     * @param campaignId The campaign ID
     * @param milestoneIndex The milestone index (0-based)
     * @return Milestone struct with all fields
     */
    function getMilestone(
        uint256 campaignId,
        uint256 milestoneIndex
    ) external view returns (Milestone memory) {
        if (campaigns[campaignId].charity == address(0)) revert CampaignNotFound();
        if (milestoneIndex >= campaigns[campaignId].milestoneCount) revert MilestoneNotFound();
        return milestones[campaignId][milestoneIndex];
    }
    
    /**
     * @dev Get all milestones for a campaign
     * @param campaignId The campaign ID
     * @return Array of Milestone structs
     */
    function getAllMilestones(uint256 campaignId) external view returns (Milestone[] memory) {
        Campaign storage campaign = campaigns[campaignId];
        if (campaign.charity == address(0)) revert CampaignNotFound();
        
        Milestone[] memory result = new Milestone[](campaign.milestoneCount);
        for (uint256 i = 0; i < campaign.milestoneCount; i++) {
            result[i] = milestones[campaignId][i];
        }
        return result;
    }
    
    /**
     * @dev Get a donor's total contribution to a campaign
     * @param donor The donor's address
     * @param campaignId The campaign ID
     * @return Total amount donated in wei
     */
    function getDonation(address donor, uint256 campaignId) external view returns (uint256) {
        return donationsByAddress[donor][campaignId];
    }
    
    /**
     * @dev Check if an address has a specific role
     * @param role The role to check (CHARITY_ROLE, VALIDATOR_ROLE, etc.)
     * @param account The address to check
     * @return bool True if the address has the role
     */
    function checkRole(bytes32 role, address account) external view returns (bool) {
        return hasRole(role, account);
    }

    // =========================================================================
    //                         ADMIN FUNCTIONS
    // =========================================================================
    
    /**
     * @dev Pause the contract in emergencies
     * @notice Blocks: donations, proof submissions, approvals, campaign creation
     * @notice Only DEFAULT_ADMIN_ROLE can call
     */
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }
    
    /**
     * @dev Unpause the contract
     * @notice Resumes normal operations
     * @notice Only DEFAULT_ADMIN_ROLE can call
     */
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
    
    /**
     * @dev Emergency withdraw - Admin can rescue stuck/misallocated funds
     * 
     * @param to Address to send funds to
     * @param amount Amount to withdraw in wei
     * 
     * @notice Use with extreme caution - bypasses normal approval flow
     * @notice Should only be used for stuck funds or critical emergencies
     * @notice All calls are recorded on-chain for accountability
     * 
     * Security: 
     * - Only DEFAULT_ADMIN_ROLE can call
     * - Protected by nonReentrant
     * - Validates recipient address
     */
    function emergencyWithdraw(
        address payable to,
        uint256 amount
    ) external onlyRole(DEFAULT_ADMIN_ROLE) nonReentrant {
        require(to != address(0), "Invalid recipient");
        require(amount <= address(this).balance, "Insufficient balance");
        
        (bool success, ) = to.call{value: amount}("");
        if (!success) revert TransferFailed();
    }

    // =========================================================================
    //                         FALLBACK FUNCTIONS
    // =========================================================================
    
    /**
     * @dev Reject direct ETH transfers
     * @notice Forces users to use donate() function for proper tracking
     * 
     * Why reject direct transfers?
     * - Donations must be associated with a campaign
     * - Ensures proper event emission and tracking
     * - Prevents accidental "lost" ETH
     */
    receive() external payable {
        revert("Use donate(campaignId) function");
    }
    
    /**
     * @dev Reject calls to non-existent functions
     */
    fallback() external payable {
        revert("Function does not exist");
    }
}

