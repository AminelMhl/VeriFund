# VeriFund - Product Requirements Document (PRD)

## Scenario: Donor Makes a Donation to a Verified Campaign

**Version:** 1.0  
**Date:** December 5, 2025  
**Project Type:** Blockchain Class Semester Project

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Solution Overview](#3-solution-overview)
4. [Scope & Objectives](#4-scope--objectives)
5. [User Stories](#5-user-stories)
6. [System Architecture](#6-system-architecture)
7. [Participants & Roles](#7-participants--roles)
8. [Functional Requirements](#8-functional-requirements)
9. [Non-Functional Requirements](#9-non-functional-requirements)
10. [Smart Contract Specification](#10-smart-contract-specification)
11. [User Interface Requirements](#11-user-interface-requirements)
12. [Data Models](#12-data-models)
13. [User Flow Diagrams](#13-user-flow-diagrams)
14. [Security Considerations](#14-security-considerations)
15. [Testing Requirements](#15-testing-requirements)
16. [Technology Stack](#16-technology-stack)
17. [Glossary](#17-glossary)

---

## 1. Executive Summary

**VeriFund** is a blockchain-based charity donation platform that ensures full transparency, accountability, and trust in the donation process. This PRD focuses specifically on **Scenario 1: Donor Makes a Donation to a Verified Campaign**, which represents the core functionality of the platform.

### Key Value Propositions

- **Transparency:** Every donation is recorded on an immutable public ledger
- **Traceability:** Full provenance tracking from donor to campaign
- **Security:** Smart contracts securely hold and manage funds
- **Trust:** Verified campaigns ensure donor confidence

---

## 2. Problem Statement

### Current Challenges in Traditional Charity Systems

| Challenge | Description | Impact |
|-----------|-------------|--------|
| **Lack of Visibility** | Donors cannot track how their money is used | Reduced donor trust and engagement |
| **Accountability Gaps** | No verifiable proof of fund allocation | Potential for misuse or fraud |
| **Trust Deficit** | Charities struggle to prove credibility | Decreased donation rates |
| **Opaque Processes** | Donation lifecycle is hidden from stakeholders | Limited public confidence |

### Target Users Affected

- **Donors:** Cannot verify their contributions reach intended recipients
- **Charitable Organizations:** Unable to demonstrate transparency and build trust
- **Public:** No means to audit charity operations

---

## 3. Solution Overview

### How VeriFund Addresses These Challenges

VeriFund leverages blockchain technology to create a transparent donation ecosystem:

```
┌─────────────┐     ┌─────────────────┐     ┌─────────────────┐     ┌────────────────┐
│   DONOR     │────▶│  SMART CONTRACT │────▶│   BLOCKCHAIN    │────▶│   CAMPAIGN     │
│             │     │  (Holds Funds)  │     │   (Records Tx)  │     │  (Receives $)  │
└─────────────┘     └─────────────────┘     └─────────────────┘     └────────────────┘
       │                    │                        │                      │
       │                    │                        │                      │
       ▼                    ▼                        ▼                      ▼
   Connects via        Validates &              Immutable              Verified
   Wallet Provider     Secures Donation         Record                 Organization
```

### Core Blockchain Principles Applied

1. **Provenance:** Track every donation from source to destination
2. **Finality:** All transactions are permanent and irreversible once confirmed
3. **Immutability:** Records cannot be altered or deleted
4. **Decentralization:** No single point of failure or control

---

## 4. Scope & Objectives

### In Scope (Scenario 1)

| Feature | Description | Priority |
|---------|-------------|----------|
| Campaign Creation | Charitable organizations create verified campaigns | High |
| Campaign Listing | Display all active campaigns to donors | High |
| Wallet Connection | Donors connect via MetaMask or similar | High |
| Donation Submission | Donors send ETH to campaign smart contracts | High |
| Transaction Recording | All donations recorded on blockchain | High |
| Donation History | View all donations for a campaign | High |
| Public Explorer | Anyone can view and verify transactions | Medium |

### Out of Scope (Future Scenarios)

- Milestone-based fund release
- Validator verification system
- Beneficiary confirmation
- Multi-signature withdrawals
- Fiat currency integration

### Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Successful Donations | 100% transaction success rate | Smart contract logs |
| Transaction Visibility | All donations publicly viewable | Blockchain explorer |
| User Experience | < 3 clicks to complete donation | UI/UX testing |
| Gas Efficiency | Optimized contract operations | Gas usage analysis |

---

## 5. User Stories

### 5.1 Donor User Stories

| ID | User Story | Acceptance Criteria |
|----|------------|---------------------|
| D-01 | As a donor, I want to connect my wallet so that I can make donations | Wallet connects successfully, address displayed |
| D-02 | As a donor, I want to browse verified campaigns so that I can choose where to donate | Campaign list loads with details |
| D-03 | As a donor, I want to view campaign details so that I can make informed decisions | Campaign page shows goal, raised amount, description |
| D-04 | As a donor, I want to donate ETH to a campaign so that I can support the cause | Transaction completes, donation recorded |
| D-05 | As a donor, I want to see my donation history so that I can track my contributions | History page shows all my donations |
| D-06 | As a donor, I want to verify my donation on the blockchain so that I trust it was recorded | Transaction hash links to blockchain explorer |

### 5.2 Charitable Organization User Stories

| ID | User Story | Acceptance Criteria |
|----|------------|---------------------|
| C-01 | As an organization, I want to create a campaign so that I can receive donations | Campaign created with unique ID |
| C-02 | As an organization, I want to set a fundraising goal so that donors know the target | Goal amount displayed on campaign |
| C-03 | As an organization, I want to provide campaign details so that donors understand our cause | Title, description, image displayed |
| C-04 | As an organization, I want to see total donations received so that I can track progress | Real-time donation total shown |
| C-05 | As an organization, I want to withdraw funds so that I can use them for the cause | Withdrawal function available to owner |

### 5.3 Public Observer User Stories

| ID | User Story | Acceptance Criteria |
|----|------------|---------------------|
| P-01 | As an observer, I want to view all campaigns so that I can see charity activity | Public campaign list accessible |
| P-02 | As an observer, I want to see donation history so that I can verify transparency | Donation list publicly viewable |
| P-03 | As an observer, I want to verify transactions on-chain so that I trust the system | Links to blockchain explorer work |

---

## 6. System Architecture

### 6.1 High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                              PRESENTATION LAYER                               │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                         Next.js Web Application                          │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │ │
│  │  │  Home Page   │  │Campaign List │  │Campaign Detail│ │ Create Page │  │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  └─────────────┘  │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                            INTEGRATION LAYER                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                              Web3 / Ethers.js                            │ │
│  │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────┐   │ │
│  │  │ Wallet Connection │  │ Contract Calls   │  │ Event Listeners     │   │ │
│  │  │ (MetaMask)        │  │ (Read/Write)     │  │ (Real-time Updates) │   │ │
│  │  └──────────────────┘  └──────────────────┘  └──────────────────────┘   │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                            BLOCKCHAIN LAYER                                   │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                    Ethereum Network (Sepolia Testnet)                    │ │
│  │  ┌──────────────────────────────────────────────────────────────────┐   │ │
│  │  │                    DonationRegistry Smart Contract                │   │ │
│  │  │  ┌────────────────┐  ┌────────────────┐  ┌────────────────────┐  │   │ │
│  │  │  │ Campaign Mgmt  │  │ Donation Logic │  │ Fund Management    │  │   │ │
│  │  │  └────────────────┘  └────────────────┘  └────────────────────┘  │   │ │
│  │  └──────────────────────────────────────────────────────────────────┘   │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Component Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────┐   │
│  │   Pages/     │    │   Hooks/     │    │      Lib/        │   │
│  │              │    │              │    │                  │   │
│  │ • page.tsx   │◄──▶│ useDonation  │◄──▶│  contract.ts     │   │
│  │ • create/    │    │ Contract.ts  │    │  (Web3 Config)   │   │
│  │ • campaign/  │    │              │    │                  │   │
│  └──────────────┘    └──────────────┘    └──────────────────┘   │
│                              │                    │              │
│                              ▼                    ▼              │
│                    ┌─────────────────────────────────┐          │
│                    │         ABI/                    │          │
│                    │   DonationRegistry.json         │          │
│                    └─────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                               │
                               │ JSON-RPC
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Blockchain (Ethereum)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              DonationRegistry.sol                          │  │
│  │                                                            │  │
│  │  State Variables:                                          │  │
│  │  • campaigns (mapping)                                     │  │
│  │  • donations (mapping)                                     │  │
│  │  • campaignCount                                           │  │
│  │                                                            │  │
│  │  Functions:                                                │  │
│  │  • createCampaign()                                        │  │
│  │  • donate()                                                │  │
│  │  • getCampaign()                                           │  │
│  │  • getDonations()                                          │  │
│  │  • withdrawFunds()                                         │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. Participants & Roles

### 7.1 Primary Participants

| Participant | Role | Responsibilities | System Interaction |
|-------------|------|------------------|-------------------|
| **Donor** | Fund Provider | Select campaigns, make donations, track contributions | Web interface + Wallet |
| **Charitable Organization** | Campaign Creator | Create campaigns, manage details, withdraw funds | Web interface + Wallet |
| **Smart Contract** | Automated Custodian | Hold funds, record donations, enforce rules | On-chain execution |

### 7.2 Infrastructure Participants

| Participant | Role | Responsibilities | System Interaction |
|-------------|------|------------------|-------------------|
| **Blockchain Node Operators** | Transaction Validators | Validate transactions, maintain ledger consensus | Network level |
| **Wallet Provider (MetaMask)** | Secure Interface | Sign transactions, manage keys, connect to dApps | Browser extension |

### 7.3 Participant Interaction Flow

```
                                    ┌─────────────────────┐
                                    │   Charitable Org    │
                                    │                     │
                                    │  1. Creates Campaign│
                                    └──────────┬──────────┘
                                               │
                                               ▼
┌─────────────────┐              ┌─────────────────────────┐
│     Donor       │              │     Smart Contract      │
│                 │              │                         │
│ 2. Browses      │              │  • Stores campaign      │
│    Campaigns    │◄─────────────│  • Validates input      │
│                 │              │  • Emits events         │
│ 3. Selects      │              │                         │
│    Campaign     │              └─────────────────────────┘
│                 │                          │
└────────┬────────┘                          │
         │                                   │
         ▼                                   ▼
┌─────────────────┐              ┌─────────────────────────┐
│ Wallet Provider │              │   Blockchain Network    │
│   (MetaMask)    │              │                         │
│                 │              │  • Node operators       │
│ 4. Signs        │─────────────▶│    validate tx          │
│    Transaction  │              │  • Tx added to block    │
│                 │              │  • State updated        │
└─────────────────┘              └─────────────────────────┘
                                             │
                                             ▼
                                 ┌─────────────────────────┐
                                 │   Donation Recorded     │
                                 │                         │
                                 │  • Publicly visible     │
                                 │  • Immutable            │
                                 │  • Traceable            │
                                 └─────────────────────────┘
```

---

## 8. Functional Requirements

### 8.1 Campaign Management

| ID | Requirement | Description | Priority |
|----|-------------|-------------|----------|
| FR-CM-01 | Create Campaign | Organization can create a new campaign with title, description, goal | High |
| FR-CM-02 | Campaign Validation | Campaign data must be validated before creation | High |
| FR-CM-03 | Campaign Listing | All active campaigns displayed in a list | High |
| FR-CM-04 | Campaign Details | Individual campaign page with full information | High |
| FR-CM-05 | Campaign Status | Display progress toward fundraising goal | Medium |
| FR-CM-06 | Campaign Owner | Only creator can modify or withdraw from campaign | High |

### 8.2 Donation Processing

| ID | Requirement | Description | Priority |
|----|-------------|-------------|----------|
| FR-DP-01 | Wallet Connection | Users must connect wallet before donating | High |
| FR-DP-02 | Donation Amount | Donor specifies ETH amount to donate | High |
| FR-DP-03 | Minimum Donation | Enforce minimum donation amount (> 0) | High |
| FR-DP-04 | Transaction Confirmation | Show pending/confirmed transaction status | High |
| FR-DP-05 | Donation Recording | Record donor address, amount, timestamp on-chain | High |
| FR-DP-06 | Event Emission | Emit DonationReceived event on successful donation | High |

### 8.3 Fund Management

| ID | Requirement | Description | Priority |
|----|-------------|-------------|----------|
| FR-FM-01 | Secure Holding | Smart contract holds donated funds | High |
| FR-FM-02 | Balance Tracking | Track total funds per campaign | High |
| FR-FM-03 | Withdrawal | Campaign owner can withdraw funds | High |
| FR-FM-04 | Withdrawal Event | Emit event when funds are withdrawn | Medium |

### 8.4 Transparency & Traceability

| ID | Requirement | Description | Priority |
|----|-------------|-------------|----------|
| FR-TT-01 | Donation History | Display all donations for a campaign | High |
| FR-TT-02 | Transaction Hash | Provide tx hash for blockchain verification | High |
| FR-TT-03 | Public Access | Campaign and donation data publicly accessible | High |
| FR-TT-04 | Explorer Links | Link to blockchain explorer for verification | Medium |

---

## 9. Non-Functional Requirements

### 9.1 Performance

| ID | Requirement | Specification |
|----|-------------|---------------|
| NFR-P-01 | Page Load Time | < 3 seconds for initial page load |
| NFR-P-02 | Transaction Time | Standard Ethereum confirmation time (~15 seconds) |
| NFR-P-03 | Contract Response | Read operations < 1 second |

### 9.2 Security

| ID | Requirement | Specification |
|----|-------------|---------------|
| NFR-S-01 | Smart Contract Security | No reentrancy vulnerabilities |
| NFR-S-02 | Access Control | Only campaign owner can withdraw |
| NFR-S-03 | Input Validation | All inputs validated on-chain |
| NFR-S-04 | Wallet Security | Private keys never exposed to application |

### 9.3 Usability

| ID | Requirement | Specification |
|----|-------------|---------------|
| NFR-U-01 | Responsive Design | Works on desktop and mobile browsers |
| NFR-U-02 | Wallet UX | Clear prompts for wallet interactions |
| NFR-U-03 | Error Messages | User-friendly error messages |
| NFR-U-04 | Loading States | Visual feedback during transactions |

### 9.4 Reliability

| ID | Requirement | Specification |
|----|-------------|---------------|
| NFR-R-01 | Smart Contract Uptime | 100% (deployed on Ethereum) |
| NFR-R-02 | Data Integrity | Blockchain ensures data immutability |
| NFR-R-03 | Network Handling | Graceful handling of network issues |

---

## 10. Smart Contract Specification

### 10.1 Contract Overview

**Contract Name:** `DonationRegistry`  
**Solidity Version:** ^0.8.0  
**Network:** Ethereum (Sepolia Testnet for development)

### 10.2 Data Structures

```solidity
struct Campaign {
    uint256 id;
    address owner;
    string title;
    string description;
    uint256 goalAmount;
    uint256 raisedAmount;
    uint256 createdAt;
    bool isActive;
}

struct Donation {
    uint256 id;
    uint256 campaignId;
    address donor;
    uint256 amount;
    uint256 timestamp;
}
```

### 10.3 State Variables

| Variable | Type | Description |
|----------|------|-------------|
| `campaigns` | `mapping(uint256 => Campaign)` | Stores all campaigns by ID |
| `donations` | `mapping(uint256 => Donation[])` | Stores donations per campaign |
| `campaignCount` | `uint256` | Total number of campaigns created |
| `donationCount` | `uint256` | Total number of donations made |

### 10.4 Functions

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `createCampaign` | `title`, `description`, `goalAmount` | `uint256 campaignId` | Creates a new campaign |
| `donate` | `campaignId` | - | Donate ETH to a campaign (payable) |
| `getCampaign` | `campaignId` | `Campaign` | Get campaign details |
| `getAllCampaigns` | - | `Campaign[]` | Get all campaigns |
| `getCampaignDonations` | `campaignId` | `Donation[]` | Get donations for a campaign |
| `withdrawFunds` | `campaignId` | - | Withdraw funds (owner only) |

### 10.5 Events

| Event | Parameters | When Emitted |
|-------|------------|--------------|
| `CampaignCreated` | `campaignId`, `owner`, `title`, `goalAmount` | New campaign created |
| `DonationReceived` | `campaignId`, `donor`, `amount`, `timestamp` | Donation received |
| `FundsWithdrawn` | `campaignId`, `owner`, `amount` | Funds withdrawn |

### 10.6 Modifiers

| Modifier | Description |
|----------|-------------|
| `onlyCampaignOwner` | Restricts function to campaign owner |
| `campaignExists` | Validates campaign ID exists |
| `campaignIsActive` | Validates campaign is active |

---

## 11. User Interface Requirements

### 11.1 Page Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                           VERIFUND                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                      Navigation Bar                          ││
│  │  [Logo] [Home] [Campaigns] [Create] [My Donations] [Wallet] ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                      Main Content Area                       ││
│  │                                                              ││
│  │         (Page-specific content renders here)                 ││
│  │                                                              ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                         Footer                               ││
│  │        © 2025 VeriFund | Blockchain Class Project           ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 11.2 Page Specifications

#### Home Page (`/`)

| Element | Description |
|---------|-------------|
| Hero Section | Platform introduction, call-to-action buttons |
| Featured Campaigns | Display top 3-6 active campaigns |
| Statistics | Total campaigns, total donated, total donors |
| How It Works | Step-by-step donation process explanation |

#### Campaigns List Page (`/campaigns`)

| Element | Description |
|---------|-------------|
| Campaign Cards | Grid of campaign cards with key info |
| Search/Filter | Search by title, filter by status |
| Pagination | Handle large numbers of campaigns |
| Progress Indicator | Visual progress toward goal |

#### Campaign Detail Page (`/campaign/[id]`)

| Element | Description |
|---------|-------------|
| Campaign Header | Title, owner address, created date |
| Description | Full campaign description |
| Progress Bar | Visual goal progress with amounts |
| Donate Form | Amount input, donate button |
| Donation History | Table of recent donations |
| Transaction Links | Links to blockchain explorer |

#### Create Campaign Page (`/create`)

| Element | Description |
|---------|-------------|
| Form Fields | Title, description, goal amount inputs |
| Validation | Real-time input validation |
| Preview | Preview before submission |
| Submit Button | Requires wallet connection |

### 11.3 UI Components

| Component | Props | Description |
|-----------|-------|-------------|
| `WalletButton` | `onConnect`, `address` | Wallet connection button |
| `CampaignCard` | `campaign` | Campaign preview card |
| `DonationForm` | `campaignId`, `onDonate` | Donation input form |
| `ProgressBar` | `current`, `goal` | Visual progress indicator |
| `TransactionStatus` | `status`, `hash` | Transaction status display |
| `DonationTable` | `donations` | Donation history table |

---

## 12. Data Models

### 12.1 Frontend Data Types

```typescript
// Campaign type
interface Campaign {
  id: number;
  owner: string;
  title: string;
  description: string;
  goalAmount: bigint;
  raisedAmount: bigint;
  createdAt: number;
  isActive: boolean;
}

// Donation type
interface Donation {
  id: number;
  campaignId: number;
  donor: string;
  amount: bigint;
  timestamp: number;
  transactionHash?: string;
}

// Wallet state
interface WalletState {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  balance: bigint | null;
}

// Transaction state
interface TransactionState {
  status: 'idle' | 'pending' | 'success' | 'error';
  hash: string | null;
  error: string | null;
}
```

### 12.2 Event Data

```typescript
// CampaignCreated event
interface CampaignCreatedEvent {
  campaignId: bigint;
  owner: string;
  title: string;
  goalAmount: bigint;
}

// DonationReceived event
interface DonationReceivedEvent {
  campaignId: bigint;
  donor: string;
  amount: bigint;
  timestamp: bigint;
}
```

---

## 13. User Flow Diagrams

### 13.1 Complete Donation Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DONOR DONATION FLOW                                │
└─────────────────────────────────────────────────────────────────────────────┘

     ┌──────────┐
     │  START   │
     └────┬─────┘
          │
          ▼
┌─────────────────────┐
│ 1. Visit VeriFund   │
│    Homepage         │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐     ┌─────────────────────┐
│ 2. Connect Wallet   │────▶│   MetaMask Popup    │
│    (Click Button)   │     │   - Select Account  │
│                     │◀────│   - Approve Connect │
└─────────┬───────────┘     └─────────────────────┘
          │
          ▼
┌─────────────────────┐
│ 3. Browse Campaigns │
│    (View List)      │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ 4. Select Campaign  │
│    (Click Card)     │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ 5. View Campaign    │
│    Details Page     │
│    - Description    │
│    - Goal/Progress  │
│    - History        │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ 6. Enter Donation   │
│    Amount (ETH)     │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐     ┌─────────────────────┐
│ 7. Click "Donate"   │────▶│   MetaMask Popup    │
│    Button           │     │   - Review Tx       │
│                     │◀────│   - Confirm/Reject  │
└─────────┬───────────┘     └─────────────────────┘
          │
          ▼
┌─────────────────────┐
│ 8. Transaction      │
│    Processing       │
│    (Show Spinner)   │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐     ┌─────────────────────┐
│ 9. Blockchain       │────▶│   Node Operators    │
│    Validation       │     │   - Validate Tx     │
│                     │◀────│   - Add to Block    │
└─────────┬───────────┘     └─────────────────────┘
          │
          ▼
┌─────────────────────┐
│ 10. Success!        │
│    - Show Confirm   │
│    - Display TxHash │
│    - Update UI      │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ 11. View on         │
│    Explorer         │
│    (Optional)       │
└─────────┬───────────┘
          │
          ▼
     ┌──────────┐
     │   END    │
     └──────────┘
```

### 13.2 Campaign Creation Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      ORGANIZATION CAMPAIGN CREATION FLOW                     │
└─────────────────────────────────────────────────────────────────────────────┘

     ┌──────────┐
     │  START   │
     └────┬─────┘
          │
          ▼
┌─────────────────────┐
│ 1. Connect Wallet   │
│    (Organization)   │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ 2. Navigate to      │
│    Create Page      │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ 3. Fill Campaign    │
│    Form:            │
│    - Title          │
│    - Description    │
│    - Goal Amount    │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐     ┌──────────┐
│ 4. Validate Input   │────▶│  Error?  │
│                     │     └────┬─────┘
└─────────────────────┘          │
          │                      │ Yes
          │ No                   ▼
          │            ┌─────────────────────┐
          │            │ Show Validation     │
          │            │ Error Messages      │──────┐
          │            └─────────────────────┘      │
          │                                         │
          ▼                                         │
┌─────────────────────┐                             │
│ 5. Submit Campaign  │◀────────────────────────────┘
│    (Click Create)   │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ 6. Confirm in       │
│    MetaMask         │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ 7. Transaction      │
│    Confirmed        │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ 8. Redirect to      │
│    Campaign Page    │
└─────────┬───────────┘
          │
          ▼
     ┌──────────┐
     │   END    │
     └──────────┘
```

### 13.3 State Diagram - Donation Transaction

```
┌─────────────────────────────────────────────────────────────────┐
│                    DONATION TRANSACTION STATES                   │
└─────────────────────────────────────────────────────────────────┘

                    ┌─────────────┐
                    │    IDLE     │
                    │             │
                    │ • No active │
                    │   transaction│
                    └──────┬──────┘
                           │
                           │ User clicks "Donate"
                           ▼
                    ┌─────────────┐
                    │  AWAITING   │
                    │  APPROVAL   │
                    │             │
                    │ • MetaMask  │
                    │   popup open│
                    └──────┬──────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
           │ User Rejects  │ User Approves │
           ▼               │               ▼
    ┌─────────────┐        │        ┌─────────────┐
    │  REJECTED   │        │        │   PENDING   │
    │             │        │        │             │
    │ • Show error│        │        │ • Tx sent   │
    │ • Reset form│        │        │ • Waiting   │
    └──────┬──────┘        │        │   for conf. │
           │               │        └──────┬──────┘
           │               │               │
           │               │    ┌──────────┼──────────┐
           │               │    │          │          │
           │               │    │ Tx Fails │ Tx Success
           │               │    ▼          │          ▼
           │               │ ┌─────────┐   │   ┌─────────────┐
           │               │ │ FAILED  │   │   │  CONFIRMED  │
           │               │ │         │   │   │             │
           │               │ │ • Show  │   │   │ • Show hash │
           │               │ │   error │   │   │ • Update UI │
           │               │ └────┬────┘   │   │ • Emit event│
           │               │      │        │   └──────┬──────┘
           │               │      │        │          │
           └───────────────┴──────┴────────┴──────────┘
                                  │
                                  ▼
                           ┌─────────────┐
                           │    IDLE     │
                           │  (Reset)    │
                           └─────────────┘
```

---

## 14. Security Considerations

### 14.1 Smart Contract Security

| Risk | Mitigation | Implementation |
|------|------------|----------------|
| **Reentrancy Attack** | Use checks-effects-interactions pattern | Update state before external calls |
| **Integer Overflow** | Solidity 0.8+ built-in overflow checks | Use ^0.8.0 compiler |
| **Unauthorized Access** | Access control modifiers | `onlyCampaignOwner` modifier |
| **Front-Running** | Minimal MEV exposure for donations | Simple donation logic |

### 14.2 Frontend Security

| Risk | Mitigation | Implementation |
|------|------------|----------------|
| **XSS Attacks** | Input sanitization | React's built-in escaping |
| **Private Key Exposure** | Never handle private keys | Wallet provider manages keys |
| **Man-in-the-Middle** | HTTPS only | SSL/TLS certificates |
| **Malicious Contracts** | Verify contract address | Hardcoded contract address |

### 14.3 Security Checklist

- [ ] Smart contract audited for common vulnerabilities
- [ ] All external calls use checks-effects-interactions
- [ ] Access control properly implemented
- [ ] Input validation on both frontend and contract
- [ ] Contract address verified before interaction
- [ ] HTTPS enforced on frontend
- [ ] No sensitive data stored in localStorage

---

## 15. Testing Requirements

### 15.1 Smart Contract Testing

| Test Category | Test Cases | Priority |
|---------------|------------|----------|
| **Unit Tests** | | |
| Campaign Creation | Create campaign with valid data | High |
| | Create campaign with invalid data (revert) | High |
| | Verify campaign data stored correctly | High |
| Donation | Donate to existing campaign | High |
| | Donate to non-existent campaign (revert) | High |
| | Donate zero amount (revert) | High |
| | Verify donation recorded correctly | High |
| Withdrawal | Owner withdraws funds | High |
| | Non-owner withdrawal attempt (revert) | High |
| Events | CampaignCreated event emitted | Medium |
| | DonationReceived event emitted | Medium |

### 15.2 Frontend Testing

| Test Category | Test Cases | Priority |
|---------------|------------|----------|
| **Component Tests** | | |
| Wallet Connection | Connect wallet successfully | High |
| | Handle connection rejection | High |
| | Display connected address | High |
| Campaign Display | Render campaign list | High |
| | Render campaign details | High |
| | Show loading states | Medium |
| Donation Form | Validate donation amount | High |
| | Submit donation | High |
| | Show transaction status | High |

### 15.3 Integration Testing

| Test Scenario | Steps | Expected Result |
|---------------|-------|-----------------|
| Complete Donation Flow | Connect → Browse → Donate → Verify | Donation recorded on-chain |
| Campaign Creation Flow | Connect → Fill Form → Submit → View | Campaign created and visible |

---

## 16. Technology Stack

### 16.1 Blockchain Layer

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Smart Contract Language | Solidity | ^0.8.0 | Contract development |
| Development Framework | Hardhat | Latest | Compile, test, deploy |
| Testing | Chai + Ethers.js | Latest | Contract testing |
| Network (Dev) | Hardhat Network | Latest | Local development |
| Network (Test) | Sepolia | - | Testnet deployment |

### 16.2 Frontend Layer

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Framework | Next.js | 14+ | React framework |
| Language | TypeScript | 5+ | Type-safe development |
| Web3 Library | Ethers.js | 6+ | Blockchain interaction |
| Styling | CSS Modules | - | Component styling |
| Linting | Biome | Latest | Code quality |

### 16.3 Development Tools

| Tool | Purpose |
|------|---------|
| Git | Version control |
| VS Code | IDE |
| MetaMask | Wallet provider |
| Etherscan/Sepolia Explorer | Transaction verification |

---

## 17. Glossary

| Term | Definition |
|------|------------|
| **ABI** | Application Binary Interface - defines how to interact with a smart contract |
| **Block** | A group of transactions bundled together and added to the blockchain |
| **Campaign** | A fundraising initiative created by a charitable organization |
| **dApp** | Decentralized Application - an application that runs on a blockchain |
| **ETH** | Ether - the native cryptocurrency of the Ethereum network |
| **Finality** | The guarantee that a transaction cannot be reversed once confirmed |
| **Gas** | The unit measuring computational effort required to execute operations |
| **Immutability** | The property that data cannot be changed once recorded |
| **MetaMask** | A popular browser extension wallet for Ethereum |
| **Provenance** | The ability to trace the origin and history of assets |
| **Smart Contract** | Self-executing code deployed on the blockchain |
| **Testnet** | A test network for development (e.g., Sepolia) |
| **Transaction Hash** | Unique identifier for a blockchain transaction |
| **Wallet** | Software that stores private keys and manages blockchain accounts |
| **Web3** | Technologies enabling interaction with decentralized networks |
| **Wei** | The smallest unit of ETH (1 ETH = 10^18 Wei) |

---

## Appendix A: Contract ABI Reference

The complete ABI for the DonationRegistry contract is located at:
```
web/abi/DonationRegistry.json
```

## Appendix B: Deployment Information

| Network | Contract Address | Block Explorer |
|---------|------------------|----------------|
| Hardhat Local | (varies per deployment) | N/A |
| Sepolia Testnet | TBD | https://sepolia.etherscan.io |

---

**Document End**

*This PRD is a living document and may be updated as the project evolves.*
