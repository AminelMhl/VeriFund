const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DonationRegistry", function () {
  let donationRegistry;
  let owner;
  let campaignOwner;
  let donor;
  let other;

  const METADATA_URI = "ipfs://QmTest123";
  const GOAL = ethers.parseEther("10"); // 10 ETH goal

  beforeEach(async function () {
    [owner, campaignOwner, donor, other] = await ethers.getSigners();

    const DonationRegistry = await ethers.getContractFactory("DonationRegistry");
    donationRegistry = await DonationRegistry.deploy();
    await donationRegistry.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await donationRegistry.owner()).to.equal(owner.address);
    });

    it("Should start with nextCampaignId = 1", async function () {
      expect(await donationRegistry.nextCampaignId()).to.equal(1);
    });
  });

  describe("Campaign Creation", function () {
    it("Should create a campaign successfully", async function () {
      const tx = await donationRegistry.connect(campaignOwner).createCampaign(METADATA_URI, GOAL);
      const receipt = await tx.wait();

      const campaign = await donationRegistry.getCampaign(1);
      expect(campaign.id).to.equal(1);
      expect(campaign.owner).to.equal(campaignOwner.address);
      expect(campaign.metadataURI).to.equal(METADATA_URI);
      expect(campaign.goal).to.equal(GOAL);
      expect(campaign.raised).to.equal(0);
      expect(campaign.verified).to.equal(false);
      expect(campaign.active).to.equal(true);
    });

    it("Should emit CampaignCreated event", async function () {
      const tx = await donationRegistry.connect(campaignOwner).createCampaign(METADATA_URI, GOAL);
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt.blockNumber);
      
      await expect(tx)
        .to.emit(donationRegistry, "CampaignCreated")
        .withArgs(1, campaignOwner.address, METADATA_URI, GOAL, block.timestamp);
    });

    it("Should increment nextCampaignId", async function () {
      await donationRegistry.connect(campaignOwner).createCampaign(METADATA_URI, GOAL);
      expect(await donationRegistry.nextCampaignId()).to.equal(2);
    });

    it("Should revert if metadata is empty", async function () {
      await expect(
        donationRegistry.connect(campaignOwner).createCampaign("", GOAL)
      ).to.be.revertedWith("metadata required");
    });

    it("Should revert if goal is zero", async function () {
      await expect(
        donationRegistry.connect(campaignOwner).createCampaign(METADATA_URI, 0)
      ).to.be.revertedWith("goal > 0");
    });
  });

  describe("Campaign Approval", function () {
    beforeEach(async function () {
      await donationRegistry.connect(campaignOwner).createCampaign(METADATA_URI, GOAL);
    });

    it("Should allow owner to approve a campaign", async function () {
      await donationRegistry.connect(owner).approveCampaign(1);
      const campaign = await donationRegistry.getCampaign(1);
      expect(campaign.verified).to.equal(true);
    });

    it("Should emit CampaignApproved event", async function () {
      await expect(donationRegistry.connect(owner).approveCampaign(1))
        .to.emit(donationRegistry, "CampaignApproved")
        .withArgs(1, owner.address);
    });

    it("Should revert if non-owner tries to approve", async function () {
      await expect(
        donationRegistry.connect(other).approveCampaign(1)
      ).to.be.revertedWithCustomError(donationRegistry, "OwnableUnauthorizedAccount");
    });

    it("Should revert if campaign does not exist", async function () {
      await expect(
        donationRegistry.connect(owner).approveCampaign(999)
      ).to.be.revertedWithCustomError(donationRegistry, "CampaignNotFound");
    });
  });

  describe("Campaign Closing", function () {
    beforeEach(async function () {
      await donationRegistry.connect(campaignOwner).createCampaign(METADATA_URI, GOAL);
    });

    it("Should allow campaign owner to close campaign", async function () {
      await donationRegistry.connect(campaignOwner).closeCampaign(1);
      const campaign = await donationRegistry.getCampaign(1);
      expect(campaign.active).to.equal(false);
    });

    it("Should emit CampaignClosed event", async function () {
      await expect(donationRegistry.connect(campaignOwner).closeCampaign(1))
        .to.emit(donationRegistry, "CampaignClosed")
        .withArgs(1);
    });

    it("Should revert if non-owner tries to close", async function () {
      await expect(
        donationRegistry.connect(other).closeCampaign(1)
      ).to.be.revertedWithCustomError(donationRegistry, "NotCampaignOwner");
    });

    it("Should revert if campaign does not exist", async function () {
      await expect(
        donationRegistry.connect(campaignOwner).closeCampaign(999)
      ).to.be.revertedWithCustomError(donationRegistry, "CampaignNotFound");
    });
  });

  describe("Donations", function () {
    beforeEach(async function () {
      await donationRegistry.connect(campaignOwner).createCampaign(METADATA_URI, GOAL);
      await donationRegistry.connect(owner).approveCampaign(1);
    });

    it("Should accept donations to verified campaigns", async function () {
      const donationAmount = ethers.parseEther("1");
      await donationRegistry.connect(donor).donateToCampaign(1, { value: donationAmount });

      const campaign = await donationRegistry.getCampaign(1);
      expect(campaign.raised).to.equal(donationAmount);
    });

    it("Should track donations by address", async function () {
      const donationAmount = ethers.parseEther("1");
      await donationRegistry.connect(donor).donateToCampaign(1, { value: donationAmount });

      const donated = await donationRegistry.getDonationOf(donor.address, 1);
      expect(donated).to.equal(donationAmount);
    });

    it("Should emit DonationReceived event", async function () {
      const donationAmount = ethers.parseEther("1");
      await expect(donationRegistry.connect(donor).donateToCampaign(1, { value: donationAmount }))
        .to.emit(donationRegistry, "DonationReceived")
        .withArgs(1, donor.address, donationAmount);
    });

    it("Should accumulate multiple donations", async function () {
      const donation1 = ethers.parseEther("1");
      const donation2 = ethers.parseEther("2");

      await donationRegistry.connect(donor).donateToCampaign(1, { value: donation1 });
      await donationRegistry.connect(donor).donateToCampaign(1, { value: donation2 });

      const campaign = await donationRegistry.getCampaign(1);
      expect(campaign.raised).to.equal(donation1 + donation2);

      const donated = await donationRegistry.getDonationOf(donor.address, 1);
      expect(donated).to.equal(donation1 + donation2);
    });

    it("Should revert if campaign is not verified", async function () {
      await donationRegistry.connect(campaignOwner).createCampaign(METADATA_URI, GOAL);
      // Campaign 2 is not approved

      await expect(
        donationRegistry.connect(donor).donateToCampaign(2, { value: ethers.parseEther("1") })
      ).to.be.revertedWithCustomError(donationRegistry, "CampaignNotVerified");
    });

    it("Should revert if campaign is not active", async function () {
      await donationRegistry.connect(campaignOwner).closeCampaign(1);

      await expect(
        donationRegistry.connect(donor).donateToCampaign(1, { value: ethers.parseEther("1") })
      ).to.be.revertedWithCustomError(donationRegistry, "CampaignNotActive");
    });

    it("Should revert if donation is zero", async function () {
      await expect(
        donationRegistry.connect(donor).donateToCampaign(1, { value: 0 })
      ).to.be.revertedWith("zero donation");
    });

    it("Should revert if campaign does not exist", async function () {
      await expect(
        donationRegistry.connect(donor).donateToCampaign(999, { value: ethers.parseEther("1") })
      ).to.be.revertedWithCustomError(donationRegistry, "CampaignNotFound");
    });
  });

  describe("Withdrawals", function () {
    const donationAmount = ethers.parseEther("5");

    beforeEach(async function () {
      await donationRegistry.connect(campaignOwner).createCampaign(METADATA_URI, GOAL);
      await donationRegistry.connect(owner).approveCampaign(1);
      await donationRegistry.connect(donor).donateToCampaign(1, { value: donationAmount });
    });

    it("Should allow campaign owner to withdraw funds", async function () {
      const withdrawAmount = ethers.parseEther("2");
      const balanceBefore = await ethers.provider.getBalance(campaignOwner.address);

      const tx = await donationRegistry.connect(campaignOwner).withdraw(1, withdrawAmount);
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const balanceAfter = await ethers.provider.getBalance(campaignOwner.address);
      expect(balanceAfter).to.equal(balanceBefore + withdrawAmount - gasUsed);

      const campaign = await donationRegistry.getCampaign(1);
      expect(campaign.raised).to.equal(donationAmount - withdrawAmount);
    });

    it("Should emit Withdrawn event", async function () {
      const withdrawAmount = ethers.parseEther("2");
      await expect(donationRegistry.connect(campaignOwner).withdraw(1, withdrawAmount))
        .to.emit(donationRegistry, "Withdrawn")
        .withArgs(1, campaignOwner.address, withdrawAmount);
    });

    it("Should revert if non-owner tries to withdraw", async function () {
      await expect(
        donationRegistry.connect(other).withdraw(1, ethers.parseEther("1"))
      ).to.be.revertedWithCustomError(donationRegistry, "NotCampaignOwner");
    });

    it("Should revert if withdraw amount exceeds raised", async function () {
      await expect(
        donationRegistry.connect(campaignOwner).withdraw(1, ethers.parseEther("10"))
      ).to.be.revertedWithCustomError(donationRegistry, "InsufficientFunds");
    });

    it("Should revert if withdraw amount is zero", async function () {
      await expect(
        donationRegistry.connect(campaignOwner).withdraw(1, 0)
      ).to.be.revertedWith("zero withdraw");
    });

    it("Should revert if campaign does not exist", async function () {
      await expect(
        donationRegistry.connect(campaignOwner).withdraw(999, ethers.parseEther("1"))
      ).to.be.revertedWithCustomError(donationRegistry, "CampaignNotFound");
    });
  });

  describe("Pause/Unpause", function () {
    beforeEach(async function () {
      await donationRegistry.connect(campaignOwner).createCampaign(METADATA_URI, GOAL);
      await donationRegistry.connect(owner).approveCampaign(1);
    });

    it("Should allow owner to pause", async function () {
      await donationRegistry.connect(owner).pause();
      expect(await donationRegistry.paused()).to.equal(true);
    });

    it("Should allow owner to unpause", async function () {
      await donationRegistry.connect(owner).pause();
      await donationRegistry.connect(owner).unpause();
      expect(await donationRegistry.paused()).to.equal(false);
    });

    it("Should revert if non-owner tries to pause", async function () {
      await expect(
        donationRegistry.connect(other).pause()
      ).to.be.revertedWithCustomError(donationRegistry, "OwnableUnauthorizedAccount");
    });

    it("Should block createCampaign when paused", async function () {
      await donationRegistry.connect(owner).pause();
      await expect(
        donationRegistry.connect(campaignOwner).createCampaign(METADATA_URI, GOAL)
      ).to.be.revertedWithCustomError(donationRegistry, "EnforcedPause");
    });

    it("Should block donations when paused", async function () {
      await donationRegistry.connect(owner).pause();
      await expect(
        donationRegistry.connect(donor).donateToCampaign(1, { value: ethers.parseEther("1") })
      ).to.be.revertedWithCustomError(donationRegistry, "EnforcedPause");
    });

    it("Should block withdrawals when paused", async function () {
      await donationRegistry.connect(donor).donateToCampaign(1, { value: ethers.parseEther("1") });
      await donationRegistry.connect(owner).pause();
      await expect(
        donationRegistry.connect(campaignOwner).withdraw(1, ethers.parseEther("1"))
      ).to.be.revertedWithCustomError(donationRegistry, "EnforcedPause");
    });
  });

  describe("Emergency Withdraw", function () {
    it("Should allow owner to emergency withdraw", async function () {
      // Send ETH directly to contract (this will revert via receive, so we use a workaround)
      // Instead, we'll donate and then emergency withdraw
      await donationRegistry.connect(campaignOwner).createCampaign(METADATA_URI, GOAL);
      await donationRegistry.connect(owner).approveCampaign(1);
      await donationRegistry.connect(donor).donateToCampaign(1, { value: ethers.parseEther("5") });

      const balanceBefore = await ethers.provider.getBalance(other.address);
      await donationRegistry.connect(owner).emergencyWithdraw(other.address, ethers.parseEther("2"));
      const balanceAfter = await ethers.provider.getBalance(other.address);

      expect(balanceAfter).to.equal(balanceBefore + ethers.parseEther("2"));
    });

    it("Should revert if non-owner tries to emergency withdraw", async function () {
      await expect(
        donationRegistry.connect(other).emergencyWithdraw(other.address, ethers.parseEther("1"))
      ).to.be.revertedWithCustomError(donationRegistry, "OwnableUnauthorizedAccount");
    });

    it("Should revert if to address is zero", async function () {
      await expect(
        donationRegistry.connect(owner).emergencyWithdraw(ethers.ZeroAddress, ethers.parseEther("1"))
      ).to.be.revertedWith("invalid to");
    });
  });

  describe("Fallback Functions", function () {
    it("Should revert direct ETH transfers via receive", async function () {
      await expect(
        owner.sendTransaction({ to: await donationRegistry.getAddress(), value: ethers.parseEther("1") })
      ).to.be.revertedWith("use donateToCampaign");
    });

    it("Should revert invalid function calls via fallback", async function () {
      await expect(
        owner.sendTransaction({
          to: await donationRegistry.getAddress(),
          value: ethers.parseEther("1"),
          data: "0x12345678" // Random function selector
        })
      ).to.be.revertedWith("use donateToCampaign");
    });
  });

  describe("View Functions", function () {
    it("Should return campaign via getCampaign", async function () {
      await donationRegistry.connect(campaignOwner).createCampaign(METADATA_URI, GOAL);
      const campaign = await donationRegistry.getCampaign(1);

      expect(campaign.id).to.equal(1);
      expect(campaign.owner).to.equal(campaignOwner.address);
      expect(campaign.metadataURI).to.equal(METADATA_URI);
      expect(campaign.goal).to.equal(GOAL);
    });

    it("Should revert getCampaign for non-existent campaign", async function () {
      await expect(
        donationRegistry.getCampaign(999)
      ).to.be.revertedWithCustomError(donationRegistry, "CampaignNotFound");
    });

    it("Should return donation amount via getDonationOf", async function () {
      await donationRegistry.connect(campaignOwner).createCampaign(METADATA_URI, GOAL);
      await donationRegistry.connect(owner).approveCampaign(1);
      await donationRegistry.connect(donor).donateToCampaign(1, { value: ethers.parseEther("3") });

      const donated = await donationRegistry.getDonationOf(donor.address, 1);
      expect(donated).to.equal(ethers.parseEther("3"));
    });

    it("Should return 0 for address with no donations", async function () {
      await donationRegistry.connect(campaignOwner).createCampaign(METADATA_URI, GOAL);
      const donated = await donationRegistry.getDonationOf(other.address, 1);
      expect(donated).to.equal(0);
    });
  });
});

// Helper function to get block timestamp
async function getBlockTimestamp() {
  const block = await ethers.provider.getBlock("latest");
  return block.timestamp;
}
