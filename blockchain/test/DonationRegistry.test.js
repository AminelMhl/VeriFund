const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DonationRegistry", function () {
  let donationRegistry;
  let admin;
  let charity;
  let validator;
  let donor;
  let beneficiary;
  let other;

  // Role hashes (must match contract)
  let CHARITY_ROLE;
  let VALIDATOR_ROLE;
  let DEFAULT_ADMIN_ROLE;

  const METADATA_URI = "ipfs://QmTestCampaignMetadata123";
  const TARGET_AMOUNT = ethers.parseEther("10"); // 10 ETH
  const MILESTONE_AMOUNTS = [
    ethers.parseEther("3"),
    ethers.parseEther("3"),
    ethers.parseEther("4"),
  ];
  const MILESTONE_DESCRIPTIONS = [
    "Phase 1: Purchase medical supplies",
    "Phase 2: Distribution to hospitals",
    "Phase 3: Final delivery and reporting",
  ];
  const IPFS_PROOF_HASH = "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG";

  beforeEach(async function () {
    [admin, charity, validator, donor, beneficiary, other] = await ethers.getSigners();

    const DonationRegistry = await ethers.getContractFactory("DonationRegistry");
    donationRegistry = await DonationRegistry.deploy();
    await donationRegistry.waitForDeployment();

    // Get role hashes from contract
    CHARITY_ROLE = await donationRegistry.CHARITY_ROLE();
    VALIDATOR_ROLE = await donationRegistry.VALIDATOR_ROLE();
    DEFAULT_ADMIN_ROLE = await donationRegistry.DEFAULT_ADMIN_ROLE();

    // Setup: Register charity and validator
    await donationRegistry.connect(admin).registerCharity(charity.address);
    await donationRegistry.connect(admin).registerValidator(validator.address);
  });

  describe("Deployment", function () {
    it("Should set the deployer as admin", async function () {
      expect(await donationRegistry.hasRole(DEFAULT_ADMIN_ROLE, admin.address)).to.be.true;
    });

    it("Should start with nextCampaignId = 1", async function () {
      expect(await donationRegistry.nextCampaignId()).to.equal(1);
    });
  });

  describe("Role Management", function () {
    it("Should allow admin to register a charity", async function () {
      expect(await donationRegistry.hasRole(CHARITY_ROLE, charity.address)).to.be.true;
    });

    it("Should allow admin to register a validator", async function () {
      expect(await donationRegistry.hasRole(VALIDATOR_ROLE, validator.address)).to.be.true;
    });

    it("Should allow admin to remove a charity", async function () {
      await donationRegistry.connect(admin).removeCharity(charity.address);
      expect(await donationRegistry.hasRole(CHARITY_ROLE, charity.address)).to.be.false;
    });

    it("Should allow admin to remove a validator", async function () {
      await donationRegistry.connect(admin).removeValidator(validator.address);
      expect(await donationRegistry.hasRole(VALIDATOR_ROLE, validator.address)).to.be.false;
    });

    it("Should revert if non-admin tries to register charity", async function () {
      await expect(
        donationRegistry.connect(other).registerCharity(other.address)
      ).to.be.revertedWithCustomError(donationRegistry, "AccessControlUnauthorizedAccount");
    });

    it("Should revert if non-admin tries to register validator", async function () {
      await expect(
        donationRegistry.connect(other).registerValidator(other.address)
      ).to.be.revertedWithCustomError(donationRegistry, "AccessControlUnauthorizedAccount");
    });

    it("Should emit RoleGrantedEvent when registering charity", async function () {
      await expect(donationRegistry.connect(admin).registerCharity(other.address))
        .to.emit(donationRegistry, "RoleGrantedEvent")
        .withArgs(CHARITY_ROLE, other.address, admin.address);
    });
  });

  describe("Campaign Creation", function () {
    it("Should allow charity to create a campaign", async function () {
      const tx = await donationRegistry.connect(charity).createCampaign(
        beneficiary.address,
        METADATA_URI,
        TARGET_AMOUNT,
        MILESTONE_AMOUNTS,
        MILESTONE_DESCRIPTIONS
      );

      const campaign = await donationRegistry.getCampaign(1);
      expect(campaign.id).to.equal(1);
      expect(campaign.charity).to.equal(charity.address);
      expect(campaign.beneficiary).to.equal(beneficiary.address);
      expect(campaign.metadataURI).to.equal(METADATA_URI);
      expect(campaign.targetAmount).to.equal(TARGET_AMOUNT);
      expect(campaign.currentAmount).to.equal(0);
      expect(campaign.milestoneCount).to.equal(3);
      expect(campaign.isActive).to.be.true;
    });

    it("Should emit CampaignCreated and MilestoneAdded events", async function () {
      await expect(
        donationRegistry.connect(charity).createCampaign(
          beneficiary.address,
          METADATA_URI,
          TARGET_AMOUNT,
          MILESTONE_AMOUNTS,
          MILESTONE_DESCRIPTIONS
        )
      ).to.emit(donationRegistry, "CampaignCreated");
    });

    it("Should increment nextCampaignId", async function () {
      await donationRegistry.connect(charity).createCampaign(
        beneficiary.address,
        METADATA_URI,
        TARGET_AMOUNT,
        MILESTONE_AMOUNTS,
        MILESTONE_DESCRIPTIONS
      );
      expect(await donationRegistry.nextCampaignId()).to.equal(2);
    });

    it("Should revert if non-charity tries to create campaign", async function () {
      await expect(
        donationRegistry.connect(other).createCampaign(
          beneficiary.address,
          METADATA_URI,
          TARGET_AMOUNT,
          MILESTONE_AMOUNTS,
          MILESTONE_DESCRIPTIONS
        )
      ).to.be.revertedWithCustomError(donationRegistry, "AccessControlUnauthorizedAccount");
    });

    it("Should revert if beneficiary is zero address", async function () {
      await expect(
        donationRegistry.connect(charity).createCampaign(
          ethers.ZeroAddress,
          METADATA_URI,
          TARGET_AMOUNT,
          MILESTONE_AMOUNTS,
          MILESTONE_DESCRIPTIONS
        )
      ).to.be.revertedWithCustomError(donationRegistry, "InvalidBeneficiary");
    });

    it("Should revert if target amount is zero", async function () {
      await expect(
        donationRegistry.connect(charity).createCampaign(
          beneficiary.address,
          METADATA_URI,
          0,
          [0],
          ["Milestone"]
        )
      ).to.be.revertedWithCustomError(donationRegistry, "InvalidAmount");
    });

    it("Should revert if milestone amounts don't match target", async function () {
      await expect(
        donationRegistry.connect(charity).createCampaign(
          beneficiary.address,
          METADATA_URI,
          TARGET_AMOUNT,
          [ethers.parseEther("5")], // Only 5 ETH, target is 10
          ["Milestone 1"]
        )
      ).to.be.revertedWithCustomError(donationRegistry, "MilestoneAmountMismatch");
    });

    it("Should revert if no milestones provided", async function () {
      await expect(
        donationRegistry.connect(charity).createCampaign(
          beneficiary.address,
          METADATA_URI,
          TARGET_AMOUNT,
          [],
          []
        )
      ).to.be.revertedWith("Need at least 1 milestone");
    });
  });

  describe("Donations", function () {
    beforeEach(async function () {
      await donationRegistry.connect(charity).createCampaign(
        beneficiary.address,
        METADATA_URI,
        TARGET_AMOUNT,
        MILESTONE_AMOUNTS,
        MILESTONE_DESCRIPTIONS
      );
    });

    it("Should accept donations from anyone", async function () {
      const donationAmount = ethers.parseEther("2");
      await donationRegistry.connect(donor).donate(1, { value: donationAmount });

      const campaign = await donationRegistry.getCampaign(1);
      expect(campaign.currentAmount).to.equal(donationAmount);
    });

    it("Should track donations by address", async function () {
      const donationAmount = ethers.parseEther("2");
      await donationRegistry.connect(donor).donate(1, { value: donationAmount });

      const donated = await donationRegistry.getDonation(donor.address, 1);
      expect(donated).to.equal(donationAmount);
    });

    it("Should emit DonationReceived event", async function () {
      const donationAmount = ethers.parseEther("2");
      await expect(donationRegistry.connect(donor).donate(1, { value: donationAmount }))
        .to.emit(donationRegistry, "DonationReceived")
        .withArgs(1, donor.address, donationAmount, donationAmount);
    });

    it("Should accumulate multiple donations", async function () {
      const donation1 = ethers.parseEther("2");
      const donation2 = ethers.parseEther("3");

      await donationRegistry.connect(donor).donate(1, { value: donation1 });
      await donationRegistry.connect(other).donate(1, { value: donation2 });

      const campaign = await donationRegistry.getCampaign(1);
      expect(campaign.currentAmount).to.equal(donation1 + donation2);
    });

    it("Should revert if campaign does not exist", async function () {
      await expect(
        donationRegistry.connect(donor).donate(999, { value: ethers.parseEther("1") })
      ).to.be.revertedWithCustomError(donationRegistry, "CampaignNotFound");
    });

    it("Should revert if campaign is not active", async function () {
      await donationRegistry.connect(charity).closeCampaign(1);

      await expect(
        donationRegistry.connect(donor).donate(1, { value: ethers.parseEther("1") })
      ).to.be.revertedWithCustomError(donationRegistry, "CampaignNotActive");
    });

    it("Should revert if donation is zero", async function () {
      await expect(
        donationRegistry.connect(donor).donate(1, { value: 0 })
      ).to.be.revertedWithCustomError(donationRegistry, "ZeroDonation");
    });
  });

  describe("Proof Submission", function () {
    beforeEach(async function () {
      await donationRegistry.connect(charity).createCampaign(
        beneficiary.address,
        METADATA_URI,
        TARGET_AMOUNT,
        MILESTONE_AMOUNTS,
        MILESTONE_DESCRIPTIONS
      );
    });

    it("Should allow charity to submit proof for a milestone", async function () {
      await donationRegistry.connect(charity).submitProof(1, 0, IPFS_PROOF_HASH);

      const milestone = await donationRegistry.getMilestone(1, 0);
      expect(milestone.ipfsProofHash).to.equal(IPFS_PROOF_HASH);
    });

    it("Should emit ProofSubmitted event", async function () {
      await expect(donationRegistry.connect(charity).submitProof(1, 0, IPFS_PROOF_HASH))
        .to.emit(donationRegistry, "ProofSubmitted")
        .withArgs(1, 0, IPFS_PROOF_HASH);
    });

    it("Should revert if non-charity tries to submit proof", async function () {
      await expect(
        donationRegistry.connect(other).submitProof(1, 0, IPFS_PROOF_HASH)
      ).to.be.revertedWithCustomError(donationRegistry, "NotCampaignCharity");
    });

    it("Should revert if milestone does not exist", async function () {
      await expect(
        donationRegistry.connect(charity).submitProof(1, 99, IPFS_PROOF_HASH)
      ).to.be.revertedWithCustomError(donationRegistry, "MilestoneNotFound");
    });

    it("Should revert if IPFS hash is empty", async function () {
      await expect(
        donationRegistry.connect(charity).submitProof(1, 0, "")
      ).to.be.revertedWith("IPFS hash required");
    });
  });

  describe("Milestone Approval & Fund Release", function () {
    beforeEach(async function () {
      // Create campaign
      await donationRegistry.connect(charity).createCampaign(
        beneficiary.address,
        METADATA_URI,
        TARGET_AMOUNT,
        MILESTONE_AMOUNTS,
        MILESTONE_DESCRIPTIONS
      );

      // Donate enough for first milestone
      await donationRegistry.connect(donor).donate(1, { value: ethers.parseEther("5") });

      // Submit proof for first milestone
      await donationRegistry.connect(charity).submitProof(1, 0, IPFS_PROOF_HASH);
    });

    it("Should allow validator to approve milestone and release funds", async function () {
      const beneficiaryBalanceBefore = await ethers.provider.getBalance(beneficiary.address);

      await donationRegistry.connect(validator).approveMilestone(1, 0);

      const beneficiaryBalanceAfter = await ethers.provider.getBalance(beneficiary.address);
      expect(beneficiaryBalanceAfter).to.equal(beneficiaryBalanceBefore + MILESTONE_AMOUNTS[0]);

      const milestone = await donationRegistry.getMilestone(1, 0);
      expect(milestone.isApproved).to.be.true;
      expect(milestone.isReleased).to.be.true;
    });

    it("Should emit MilestoneApproved and FundsReleased events", async function () {
      await expect(donationRegistry.connect(validator).approveMilestone(1, 0))
        .to.emit(donationRegistry, "MilestoneApproved")
        .withArgs(1, 0, validator.address)
        .and.to.emit(donationRegistry, "FundsReleased")
        .withArgs(1, 0, beneficiary.address, MILESTONE_AMOUNTS[0]);
    });

    it("Should update campaign releasedAmount", async function () {
      await donationRegistry.connect(validator).approveMilestone(1, 0);

      const campaign = await donationRegistry.getCampaign(1);
      expect(campaign.releasedAmount).to.equal(MILESTONE_AMOUNTS[0]);
    });

    it("Should revert if non-validator tries to approve", async function () {
      await expect(
        donationRegistry.connect(other).approveMilestone(1, 0)
      ).to.be.revertedWithCustomError(donationRegistry, "AccessControlUnauthorizedAccount");
    });

    it("Should revert if proof not submitted", async function () {
      await expect(
        donationRegistry.connect(validator).approveMilestone(1, 1) // Milestone 1 has no proof
      ).to.be.revertedWithCustomError(donationRegistry, "ProofNotSubmitted");
    });

    it("Should revert if milestone already approved", async function () {
      await donationRegistry.connect(validator).approveMilestone(1, 0);

      await expect(
        donationRegistry.connect(validator).approveMilestone(1, 0)
      ).to.be.revertedWithCustomError(donationRegistry, "MilestoneAlreadyApproved");
    });

    it("Should revert if insufficient funds for milestone", async function () {
      // Create a new campaign with higher milestone
      await donationRegistry.connect(charity).createCampaign(
        beneficiary.address,
        METADATA_URI,
        ethers.parseEther("100"),
        [ethers.parseEther("100")],
        ["Big milestone"]
      );

      // Donate only 1 ETH
      await donationRegistry.connect(donor).donate(2, { value: ethers.parseEther("1") });

      // Submit proof
      await donationRegistry.connect(charity).submitProof(2, 0, IPFS_PROOF_HASH);

      // Try to approve - should fail
      await expect(
        donationRegistry.connect(validator).approveMilestone(2, 0)
      ).to.be.revertedWithCustomError(donationRegistry, "InsufficientFunds");
    });
  });

  describe("Campaign Management", function () {
    beforeEach(async function () {
      await donationRegistry.connect(charity).createCampaign(
        beneficiary.address,
        METADATA_URI,
        TARGET_AMOUNT,
        MILESTONE_AMOUNTS,
        MILESTONE_DESCRIPTIONS
      );
    });

    it("Should allow charity to close campaign", async function () {
      await donationRegistry.connect(charity).closeCampaign(1);

      const campaign = await donationRegistry.getCampaign(1);
      expect(campaign.isActive).to.be.false;
    });

    it("Should emit CampaignClosed event", async function () {
      await expect(donationRegistry.connect(charity).closeCampaign(1))
        .to.emit(donationRegistry, "CampaignClosed")
        .withArgs(1);
    });

    it("Should revert if non-charity tries to close campaign", async function () {
      await expect(
        donationRegistry.connect(other).closeCampaign(1)
      ).to.be.revertedWithCustomError(donationRegistry, "NotCampaignCharity");
    });
  });

  describe("View Functions", function () {
    beforeEach(async function () {
      await donationRegistry.connect(charity).createCampaign(
        beneficiary.address,
        METADATA_URI,
        TARGET_AMOUNT,
        MILESTONE_AMOUNTS,
        MILESTONE_DESCRIPTIONS
      );
    });

    it("Should return campaign via getCampaign", async function () {
      const campaign = await donationRegistry.getCampaign(1);
      expect(campaign.id).to.equal(1);
      expect(campaign.charity).to.equal(charity.address);
    });

    it("Should return milestone via getMilestone", async function () {
      const milestone = await donationRegistry.getMilestone(1, 0);
      expect(milestone.amount).to.equal(MILESTONE_AMOUNTS[0]);
      expect(milestone.description).to.equal(MILESTONE_DESCRIPTIONS[0]);
    });

    it("Should return all milestones via getAllMilestones", async function () {
      const milestoneList = await donationRegistry.getAllMilestones(1);
      expect(milestoneList.length).to.equal(3);
      expect(milestoneList[0].amount).to.equal(MILESTONE_AMOUNTS[0]);
      expect(milestoneList[1].amount).to.equal(MILESTONE_AMOUNTS[1]);
      expect(milestoneList[2].amount).to.equal(MILESTONE_AMOUNTS[2]);
    });

    it("Should check role via checkRole", async function () {
      expect(await donationRegistry.checkRole(CHARITY_ROLE, charity.address)).to.be.true;
      expect(await donationRegistry.checkRole(CHARITY_ROLE, other.address)).to.be.false;
    });
  });

  describe("Pause/Unpause", function () {
    beforeEach(async function () {
      await donationRegistry.connect(charity).createCampaign(
        beneficiary.address,
        METADATA_URI,
        TARGET_AMOUNT,
        MILESTONE_AMOUNTS,
        MILESTONE_DESCRIPTIONS
      );
    });

    it("Should allow admin to pause", async function () {
      await donationRegistry.connect(admin).pause();
      expect(await donationRegistry.paused()).to.be.true;
    });

    it("Should allow admin to unpause", async function () {
      await donationRegistry.connect(admin).pause();
      await donationRegistry.connect(admin).unpause();
      expect(await donationRegistry.paused()).to.be.false;
    });

    it("Should revert if non-admin tries to pause", async function () {
      await expect(
        donationRegistry.connect(other).pause()
      ).to.be.revertedWithCustomError(donationRegistry, "AccessControlUnauthorizedAccount");
    });

    it("Should block donations when paused", async function () {
      await donationRegistry.connect(admin).pause();
      await expect(
        donationRegistry.connect(donor).donate(1, { value: ethers.parseEther("1") })
      ).to.be.revertedWithCustomError(donationRegistry, "EnforcedPause");
    });

    it("Should block campaign creation when paused", async function () {
      await donationRegistry.connect(admin).pause();
      await expect(
        donationRegistry.connect(charity).createCampaign(
          beneficiary.address,
          METADATA_URI,
          TARGET_AMOUNT,
          MILESTONE_AMOUNTS,
          MILESTONE_DESCRIPTIONS
        )
      ).to.be.revertedWithCustomError(donationRegistry, "EnforcedPause");
    });
  });

  describe("Emergency Withdraw", function () {
    beforeEach(async function () {
      await donationRegistry.connect(charity).createCampaign(
        beneficiary.address,
        METADATA_URI,
        TARGET_AMOUNT,
        MILESTONE_AMOUNTS,
        MILESTONE_DESCRIPTIONS
      );
      await donationRegistry.connect(donor).donate(1, { value: ethers.parseEther("5") });
    });

    it("Should allow admin to emergency withdraw", async function () {
      const otherBalanceBefore = await ethers.provider.getBalance(other.address);
      await donationRegistry.connect(admin).emergencyWithdraw(other.address, ethers.parseEther("2"));
      const otherBalanceAfter = await ethers.provider.getBalance(other.address);

      expect(otherBalanceAfter).to.equal(otherBalanceBefore + ethers.parseEther("2"));
    });

    it("Should revert if non-admin tries to emergency withdraw", async function () {
      await expect(
        donationRegistry.connect(other).emergencyWithdraw(other.address, ethers.parseEther("1"))
      ).to.be.revertedWithCustomError(donationRegistry, "AccessControlUnauthorizedAccount");
    });

    it("Should revert if recipient is zero address", async function () {
      await expect(
        donationRegistry.connect(admin).emergencyWithdraw(ethers.ZeroAddress, ethers.parseEther("1"))
      ).to.be.revertedWith("Invalid recipient");
    });
  });

  describe("Fallback Functions", function () {
    it("Should revert direct ETH transfers", async function () {
      await expect(
        admin.sendTransaction({
          to: await donationRegistry.getAddress(),
          value: ethers.parseEther("1"),
        })
      ).to.be.revertedWith("Use donate(campaignId) function");
    });

    it("Should revert invalid function calls", async function () {
      await expect(
        admin.sendTransaction({
          to: await donationRegistry.getAddress(),
          value: ethers.parseEther("1"),
          data: "0x12345678",
        })
      ).to.be.revertedWith("Function does not exist");
    });
  });

  describe("Full Workflow Integration Test", function () {
    it("Should complete full donation-to-release workflow", async function () {
      // 1. Create campaign with 3 milestones
      await donationRegistry.connect(charity).createCampaign(
        beneficiary.address,
        METADATA_URI,
        TARGET_AMOUNT,
        MILESTONE_AMOUNTS,
        MILESTONE_DESCRIPTIONS
      );

      // 2. Multiple donors contribute
      await donationRegistry.connect(donor).donate(1, { value: ethers.parseEther("6") });
      await donationRegistry.connect(other).donate(1, { value: ethers.parseEther("4") });

      // 3. Verify total raised
      let campaign = await donationRegistry.getCampaign(1);
      expect(campaign.currentAmount).to.equal(TARGET_AMOUNT);

      // 4. Charity submits proof for milestone 1
      await donationRegistry.connect(charity).submitProof(1, 0, "QmProof1");

      // 5. Validator approves milestone 1 - funds released to beneficiary
      const beneficiaryBalanceBefore = await ethers.provider.getBalance(beneficiary.address);
      await donationRegistry.connect(validator).approveMilestone(1, 0);
      const beneficiaryBalanceAfter = await ethers.provider.getBalance(beneficiary.address);

      expect(beneficiaryBalanceAfter - beneficiaryBalanceBefore).to.equal(MILESTONE_AMOUNTS[0]);

      // 6. Verify milestone 1 is approved and released
      const milestone1 = await donationRegistry.getMilestone(1, 0);
      expect(milestone1.isApproved).to.be.true;
      expect(milestone1.isReleased).to.be.true;

      // 7. Continue with milestone 2
      await donationRegistry.connect(charity).submitProof(1, 1, "QmProof2");
      await donationRegistry.connect(validator).approveMilestone(1, 1);

      // 8. And milestone 3
      await donationRegistry.connect(charity).submitProof(1, 2, "QmProof3");
      await donationRegistry.connect(validator).approveMilestone(1, 2);

      // 9. Verify all funds released
      campaign = await donationRegistry.getCampaign(1);
      expect(campaign.releasedAmount).to.equal(TARGET_AMOUNT);

      // 10. Verify beneficiary received all funds
      const finalBalance = await ethers.provider.getBalance(beneficiary.address);
      expect(finalBalance - beneficiaryBalanceBefore).to.equal(TARGET_AMOUNT);
    });
  });
});
