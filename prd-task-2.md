# VeriFund - Task 2: Donor Side Frontend Lead

## Product Requirements Document (PRD)

**Version:** 1.0  
**Date:** December 5, 2025  
**Owner:** Teammate 2 (Donor Side Frontend Lead)  
**Project:** VeriFund - Blockchain Charity Donation Platform

---

## Table of Contents

1. [Task Overview](#1-task-overview)
2. [Current Codebase Analysis](#2-current-codebase-analysis)
3. [Dependencies & Setup Tasks](#3-dependencies--setup-tasks)
4. [Functional Requirements](#4-functional-requirements)
5. [Technical Specifications](#5-technical-specifications)
6. [Page Specifications](#6-page-specifications)
7. [Component Specifications](#7-component-specifications)
8. [Smart Contract Integration](#8-smart-contract-integration)
9. [Implementation Plan](#9-implementation-plan)
10. [Testing Checklist](#10-testing-checklist)

---

## 1. Task Overview

### 1.1 Role Definition

As the **Donor Side Frontend Lead**, you are responsible for building the complete donor experience - from browsing campaigns to making donations and tracking their contributions.

### 1.2 Task Breakdown

| Category | Tasks | Priority |
|----------|-------|----------|
| **Setup** | Install wagmi and viem | High |
| | Add wallet connection support | High |
| | Verify contract calls via test page | High |
| **Pages** | Create `/campaigns` listing page | High |
| | Create `/campaign/[id]` detail page | High |
| **Donation Flow** | Implement donation input & button | High |
| | Call `donateToCampaign(id)` | High |
| | ETH to wei conversion | High |
| | Loading states & success confirmation | High |
| | Refresh data after donation | Medium |
| **UI** | Basic CSS styling | Medium |
| | Readable donor-focused layout | Medium |

### 1.3 Dependencies on Other Teammates

| Dependency | From | Status | Notes |
|------------|------|--------|-------|
| Deployed Contract Address | Teammate 1 | ⏳ Pending | Need for production |
| Updated ABI | Teammate 1 | ✅ Available | Located at `web/abi/DonationRegistry.json` |
| Test Campaigns | Teammate 1/3 | ⏳ Pending | Need campaigns to display |

---

## 2. Current Codebase Analysis

### 2.1 Existing Project Structure

```
web/
├── app/
│   ├── layout.tsx          ✅ Has WagmiProvider setup (Hardhat only)
│   ├── page.tsx            ✅ Basic home with ConnectButton
│   ├── globals.css         ✅ Basic dark/light theme CSS
│   ├── page.module.css     ✅ Some existing styles
│   ├── create/
│   │   └── page.tsx        ✅ Campaign creation form (Teammate 3)
│   └── test/
│       └── page.tsx        ✅ Test contract read (useful reference)
├── hooks/
│   └── useDonationContract.ts  ⚠️ Uses deprecated wagmi v1 API
├── lib/
│   └── contract.ts         ✅ Contract address & ABI export
├── abi/
│   └── DonationRegistry.json   ✅ Full ABI available
└── package.json            ✅ wagmi & viem already installed
```

### 2.2 Current Dependencies (package.json)

```json
{
  "dependencies": {
    "@reown/appkit": "^1.8.14",
    "@reown/appkit-adapter-wagmi": "^1.8.14",
    "@tanstack/react-query": "^5.90.10",
    "ethers": "^6.15.0",
    "next": "16.0.3",
    "react": "19.2.0",
    "react-dom": "19.2.0",
    "viem": "^2.40.3",          // ✅ Already installed
    "wagmi": "^2.19.5"          // ✅ Already installed
  },
  "devDependencies": {
    "@rainbow-me/rainbowkit": "^2.2.9"  // ✅ Available for wallet UI
  }
}
```

**Key Finding:** `wagmi` and `viem` are **already installed**! No need to install them again.

### 2.3 Current Layout Configuration (layout.tsx)

```typescript
// Current setup - Hardhat network only
const config = createConfig({
  chains: [hardhat],
  transports: {
    [hardhat.id]: http("http://127.0.0.1:8545"),
  },
});
```

**Issue:** Only configured for local Hardhat. Need to add Sepolia support.

### 2.4 Existing Hook Analysis (useDonationContract.ts)

```typescript
// ⚠️ DEPRECATED API - Uses wagmi v1 hooks
import { useContractWrite, usePrepareContractWrite, useContractRead } from 'wagmi';
```

**Issue:** This hook uses the **deprecated wagmi v1 API**. Wagmi v2 uses different hooks:
- `useContractRead` → `useReadContract`
- `useContractWrite` → `useWriteContract`
- `usePrepareContractWrite` → Removed (not needed in v2)

### 2.5 Smart Contract Functions Available

| Function | Type | Parameters | Returns | Notes |
|----------|------|------------|---------|-------|
| `getCampaign(id)` | Read | `uint256 id` | `Campaign` struct | Main function for details |
| `campaigns(id)` | Read | `uint256 id` | Campaign fields | Direct mapping access |
| `nextCampaignId()` | Read | - | `uint256` | For iterating campaigns |
| `donateToCampaign(id)` | Write (payable) | `uint256 id` | - | Send ETH with call |
| `getDonationOf(donor, id)` | Read | `address, uint256` | `uint256` | User's donation to campaign |
| `donationsByAddress(addr, id)` | Read | `address, uint256` | `uint256` | Direct mapping |

### 2.6 Campaign Struct (from Contract)

```solidity
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
```

### 2.7 MetadataURI Format

Based on `/create/page.tsx`, metadata is stored as:
```javascript
const metadata = {
  title,
  description: "Temporary description",
  createdAt: Date.now()
};
const metadataURI = "data:application/json," + JSON.stringify(metadata);
```

**Parsing required:** Extract title/description from `data:application/json,{...}` string.

---

## 3. Dependencies & Setup Tasks

### 3.1 Package Installation

**Status:** ✅ Already Installed - No action needed

```json
// Already in package.json
"viem": "^2.40.3",
"wagmi": "^2.19.5"
```

### 3.2 Wallet Connection Setup

#### Current State
- `layout.tsx` has `WagmiProvider` configured
- `page.tsx` uses `@rainbow-me/rainbowkit`'s `ConnectButton`
- Only Hardhat network is configured

#### Required Changes

**File: `web/app/layout.tsx`**

```typescript
"use client";

import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http } from "wagmi";
import { hardhat, sepolia } from "wagmi/chains";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import "./globals.css";

const config = createConfig({
  chains: [hardhat, sepolia],
  transports: {
    [hardhat.id]: http("http://127.0.0.1:8545"),
    [sepolia.id]: http(), // Uses public RPC
  },
});

const queryClient = new QueryClient();

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <RainbowKitProvider>
              {children}
            </RainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </body>
    </html>
  );
}
```

### 3.3 Update Contract Configuration

**File: `web/lib/contract.ts`**

```typescript
import donationAbi from "../abi/DonationRegistry.json";

// Hardhat local deployment address (Teammate 1 will provide Sepolia address)
export const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3" as const;

// For Sepolia testnet (update when available)
export const CONTRACT_ADDRESS_SEPOLIA = "0x..." as const;

export const CONTRACT_ABI = donationAbi.abi;
```

### 3.4 Verify Contract Calls (Test Page)

The existing `/test` page already demonstrates reading from the contract. Verify it works:

1. Start Hardhat node: `npx hardhat node`
2. Deploy contract: `npx hardhat run scripts/deploy.js --network localhost`
3. Create a test campaign
4. Visit `http://localhost:3000/test`
5. Confirm campaign data displays

---

## 4. Functional Requirements

### 4.1 Campaign Listing Page (`/campaigns`)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| CL-01 | Display all campaigns | All campaigns from contract visible |
| CL-02 | Show campaign title | Title parsed from metadataURI |
| CL-03 | Show fundraising goal | Goal displayed in ETH (converted from wei) |
| CL-04 | Show raised amount | Raised displayed in ETH |
| CL-05 | Show verification status | Badge: "Verified" ✓ or "Pending" |
| CL-06 | Show active status | Indicate if campaign is active |
| CL-07 | Progress indicator | Visual progress bar (raised/goal) |
| CL-08 | Click to details | Each card links to `/campaign/[id]` |
| CL-09 | Loading state | Show skeleton/spinner while loading |
| CL-10 | Empty state | Message when no campaigns exist |
| CL-11 | Error handling | Display error if contract read fails |

### 4.2 Campaign Detail Page (`/campaign/[id]`)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| CD-01 | Fetch campaign by ID | Use `getCampaign(id)` |
| CD-02 | Parse metadataURI | Extract and display title, description |
| CD-03 | Display goal | Show goal in ETH |
| CD-04 | Display raised | Show raised in ETH |
| CD-05 | Progress bar | Visual goal progress |
| CD-06 | Verification badge | Show verified/pending status |
| CD-07 | Campaign owner | Display owner address (truncated) |
| CD-08 | Created date | Format `createdAt` timestamp |
| CD-09 | 404 handling | Show error if campaign not found |
| CD-10 | Loading state | Spinner while fetching |

### 4.3 Donation Flow

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| DF-01 | Donation input | Text field for ETH amount |
| DF-02 | Min validation | Amount must be > 0 |
| DF-03 | Donate button | Triggers `donateToCampaign(id)` |
| DF-04 | Wallet required | Prompt to connect if not connected |
| DF-05 | ETH to wei | Convert input ETH to wei (×10^18) |
| DF-06 | Transaction sent | Call contract with value |
| DF-07 | Loading state | Show "Processing..." during tx |
| DF-08 | Success message | Show confirmation on success |
| DF-09 | Error handling | Display error message on failure |
| DF-10 | Refresh data | Refetch campaign after donation |
| DF-11 | Verified check | Only allow donation to verified campaigns |
| DF-12 | Active check | Only allow donation to active campaigns |

---

## 5. Technical Specifications

### 5.1 TypeScript Interfaces

**File: `web/types/campaign.ts`** (Create new)

```typescript
// Campaign data from smart contract
export interface CampaignRaw {
  id: bigint;
  owner: `0x${string}`;
  metadataURI: string;
  goal: bigint;
  raised: bigint;
  verified: boolean;
  active: boolean;
  createdAt: bigint;
}

// Parsed metadata from metadataURI
export interface CampaignMetadata {
  title: string;
  description?: string;
  createdAt?: number;
}

// Combined campaign with parsed metadata
export interface Campaign {
  id: number;
  owner: `0x${string}`;
  title: string;
  description: string;
  goal: bigint;
  raised: bigint;
  verified: boolean;
  active: boolean;
  createdAt: Date;
  goalEth: string;
  raisedEth: string;
  progress: number;
}
```

### 5.2 Utility Functions

**File: `web/lib/utils.ts`** (Create new)

```typescript
import { formatEther, parseEther } from "viem";

/**
 * Parse metadataURI to extract campaign metadata
 * Format: "data:application/json,{...}"
 */
export function parseMetadataURI(uri: string): { title: string; description: string } {
  try {
    const prefix = "data:application/json,";
    if (uri.startsWith(prefix)) {
      const json = uri.slice(prefix.length);
      const data = JSON.parse(decodeURIComponent(json));
      return {
        title: data.title || "Untitled Campaign",
        description: data.description || "No description provided.",
      };
    }
    // Handle IPFS or other formats in future
    return { title: "Untitled Campaign", description: "No description provided." };
  } catch {
    return { title: "Untitled Campaign", description: "No description provided." };
  }
}

/**
 * Convert wei to ETH string with formatting
 */
export function weiToEth(wei: bigint): string {
  return formatEther(wei);
}

/**
 * Convert ETH string to wei bigint
 */
export function ethToWei(eth: string): bigint {
  return parseEther(eth);
}

/**
 * Calculate progress percentage
 */
export function calculateProgress(raised: bigint, goal: bigint): number {
  if (goal === 0n) return 0;
  return Number((raised * 100n) / goal);
}

/**
 * Truncate address for display
 */
export function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Format timestamp to readable date
 */
export function formatDate(timestamp: bigint): string {
  return new Date(Number(timestamp) * 1000).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
```

### 5.3 Updated Hooks (wagmi v2)

**File: `web/hooks/useCampaigns.ts`** (Create new)

```typescript
"use client";

import { useReadContract, useReadContracts } from "wagmi";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "../lib/contract";
import { parseMetadataURI, weiToEth, calculateProgress } from "../lib/utils";
import type { Campaign, CampaignRaw } from "../types/campaign";

/**
 * Hook to fetch a single campaign by ID
 */
export function useCampaign(id: number) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getCampaign",
    args: [BigInt(id)],
    query: {
      enabled: id > 0,
      retry: 1,
    },
  });

  const campaign = data ? transformCampaign(data as CampaignRaw) : null;

  return { campaign, isLoading, error, refetch };
}

/**
 * Hook to fetch the next campaign ID (total count)
 */
export function useNextCampaignId() {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "nextCampaignId",
  });
}

/**
 * Hook to fetch all campaigns
 */
export function useAllCampaigns() {
  const { data: nextId, isLoading: loadingCount } = useNextCampaignId();

  const campaignCount = nextId ? Number(nextId) - 1 : 0;
  const campaignIds = Array.from({ length: campaignCount }, (_, i) => i + 1);

  const contracts = campaignIds.map((id) => ({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: "getCampaign",
    args: [BigInt(id)],
  }));

  const { data, isLoading, error, refetch } = useReadContracts({
    contracts,
    query: {
      enabled: campaignCount > 0,
    },
  });

  const campaigns: Campaign[] = data
    ? data
        .map((result, index) => {
          if (result.status === "success" && result.result) {
            return transformCampaign(result.result as CampaignRaw);
          }
          return null;
        })
        .filter((c): c is Campaign => c !== null)
    : [];

  return {
    campaigns,
    isLoading: loadingCount || isLoading,
    error,
    refetch,
  };
}

/**
 * Transform raw contract data to Campaign type
 */
function transformCampaign(raw: CampaignRaw): Campaign {
  const { title, description } = parseMetadataURI(raw.metadataURI);
  
  return {
    id: Number(raw.id),
    owner: raw.owner,
    title,
    description,
    goal: raw.goal,
    raised: raw.raised,
    verified: raw.verified,
    active: raw.active,
    createdAt: new Date(Number(raw.createdAt) * 1000),
    goalEth: weiToEth(raw.goal),
    raisedEth: weiToEth(raw.raised),
    progress: calculateProgress(raw.raised, raw.goal),
  };
}
```

**File: `web/hooks/useDonate.ts`** (Create new)

```typescript
"use client";

import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "../lib/contract";

/**
 * Hook for donation functionality
 */
export function useDonate() {
  const { 
    data: hash,
    writeContract, 
    isPending,
    error: writeError,
    reset 
  } = useWriteContract();

  const { 
    isLoading: isConfirming, 
    isSuccess,
    error: confirmError 
  } = useWaitForTransactionReceipt({ hash });

  const donate = async (campaignId: number, amountEth: string) => {
    const amountWei = parseEther(amountEth);
    
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "donateToCampaign",
      args: [BigInt(campaignId)],
      value: amountWei,
    });
  };

  return {
    donate,
    isPending,
    isConfirming,
    isSuccess,
    hash,
    error: writeError || confirmError,
    reset,
  };
}
```

---

## 6. Page Specifications

### 6.1 Campaigns Listing Page

**File: `web/app/campaigns/page.tsx`**

#### Wireframe

```
┌──────────────────────────────────────────────────────────────────┐
│  VeriFund                    [Connect Wallet]                    │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  All Campaigns                                                   │
│  ──────────────────────────────────────────────                  │
│                                                                  │
│  ┌─────────────────────┐  ┌─────────────────────┐               │
│  │ ✓ VERIFIED          │  │ ⏳ PENDING          │               │
│  │                     │  │                     │               │
│  │ Clean Water Project │  │ School Supplies     │               │
│  │                     │  │                     │               │
│  │ Goal: 5.00 ETH      │  │ Goal: 2.00 ETH      │               │
│  │ Raised: 2.35 ETH    │  │ Raised: 0.50 ETH    │               │
│  │                     │  │                     │               │
│  │ ████████░░░░ 47%    │  │ ███░░░░░░░░░ 25%    │               │
│  │                     │  │                     │               │
│  │ [View Details]      │  │ [View Details]      │               │
│  └─────────────────────┘  └─────────────────────┘               │
│                                                                  │
│  ┌─────────────────────┐                                        │
│  │ ✓ VERIFIED          │                                        │
│  │                     │                                        │
│  │ Medical Aid Fund    │                                        │
│  │                     │                                        │
│  │ Goal: 10.00 ETH     │                                        │
│  │ Raised: 10.00 ETH   │                                        │
│  │                     │                                        │
│  │ ████████████ 100%   │                                        │
│  │                     │                                        │
│  │ [View Details]      │                                        │
│  └─────────────────────┘                                        │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

#### Component Structure

```typescript
// /campaigns/page.tsx
export default function CampaignsPage() {
  return (
    <div>
      <Header />
      <main>
        <h1>All Campaigns</h1>
        <CampaignGrid />
      </main>
    </div>
  );
}

// Components:
// - <CampaignCard campaign={campaign} />
// - <CampaignGrid /> - uses useAllCampaigns hook
// - <LoadingState />
// - <EmptyState />
// - <ErrorState error={error} />
```

### 6.2 Campaign Detail Page

**File: `web/app/campaign/[id]/page.tsx`**

#### Wireframe

```
┌──────────────────────────────────────────────────────────────────┐
│  VeriFund                    [Connect Wallet]                    │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ← Back to Campaigns                                             │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                                                            │ │
│  │  ✓ VERIFIED                               Active           │ │
│  │                                                            │ │
│  │  Clean Water Project                                       │ │
│  │  ──────────────────────────────────────────────            │ │
│  │                                                            │ │
│  │  Owner: 0x1234...5678                                      │ │
│  │  Created: Dec 1, 2025                                      │ │
│  │                                                            │ │
│  │  Description:                                              │ │
│  │  Providing clean water access to rural communities         │ │
│  │  in developing regions. Every donation helps install       │ │
│  │  water filtration systems.                                 │ │
│  │                                                            │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │  Fundraising Progress                                 │ │ │
│  │  │                                                       │ │ │
│  │  │  ████████████████████░░░░░░░░░░░░░░░░ 47%            │ │ │
│  │  │                                                       │ │ │
│  │  │  2.35 ETH raised of 5.00 ETH goal                    │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  │                                                            │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Make a Donation                                           │ │
│  │                                                            │ │
│  │  Amount (ETH):  ┌──────────────────┐                      │ │
│  │                 │ 0.1              │                       │ │
│  │                 └──────────────────┘                       │ │
│  │                                                            │ │
│  │  Quick amounts: [0.01] [0.05] [0.1] [0.5] [1.0]           │ │
│  │                                                            │ │
│  │  ┌────────────────────────────────────────────────────┐   │ │
│  │  │              💚 Donate Now                          │   │ │
│  │  └────────────────────────────────────────────────────┘   │ │
│  │                                                            │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

#### Component Structure

```typescript
// /campaign/[id]/page.tsx
export default function CampaignDetailPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <Header />
      <main>
        <BackLink />
        <CampaignDetails campaignId={Number(params.id)} />
        <DonationForm campaignId={Number(params.id)} />
      </main>
    </div>
  );
}

// Components:
// - <CampaignDetails campaignId={id} />
// - <ProgressBar progress={progress} />
// - <DonationForm campaignId={id} onSuccess={refetch} />
// - <QuickAmountButtons onSelect={setAmount} />
// - <StatusBadge verified={verified} active={active} />
```

---

## 7. Component Specifications

### 7.1 Component List

| Component | Location | Props | Description |
|-----------|----------|-------|-------------|
| `Header` | `components/Header.tsx` | - | Nav bar with wallet button |
| `CampaignCard` | `components/CampaignCard.tsx` | `campaign: Campaign` | Campaign preview card |
| `CampaignGrid` | `components/CampaignGrid.tsx` | - | Grid of campaign cards |
| `CampaignDetails` | `components/CampaignDetails.tsx` | `campaignId: number` | Full campaign info |
| `DonationForm` | `components/DonationForm.tsx` | `campaignId, onSuccess` | Donation input & button |
| `ProgressBar` | `components/ProgressBar.tsx` | `progress: number` | Visual progress |
| `StatusBadge` | `components/StatusBadge.tsx` | `verified, active` | Status indicators |
| `LoadingSpinner` | `components/LoadingSpinner.tsx` | - | Loading indicator |
| `ErrorMessage` | `components/ErrorMessage.tsx` | `message: string` | Error display |
| `TransactionStatus` | `components/TransactionStatus.tsx` | `status, hash` | Tx feedback |

### 7.2 DonationForm Component Details

```typescript
interface DonationFormProps {
  campaignId: number;
  isVerified: boolean;
  isActive: boolean;
  onSuccess?: () => void;
}

// States:
// - idle: Default state, form ready
// - pending: Transaction submitted, waiting for wallet
// - confirming: Transaction sent, waiting for confirmation
// - success: Transaction confirmed
// - error: Transaction failed

// Features:
// - Input validation (> 0, valid number)
// - Quick amount buttons
// - Wallet connection check
// - Disabled if not verified or not active
// - Loading spinner during transaction
// - Success message with tx hash link
// - Error message with retry option
```

---

## 8. Smart Contract Integration

### 8.1 Contract Read Operations

| Operation | Function | Hook | Usage |
|-----------|----------|------|-------|
| Get campaign count | `nextCampaignId()` | `useNextCampaignId` | Determine total campaigns |
| Get single campaign | `getCampaign(id)` | `useCampaign(id)` | Detail page |
| Get all campaigns | Loop `getCampaign` | `useAllCampaigns` | Listing page |
| Get user donation | `getDonationOf(addr, id)` | Custom hook | Show user's contribution |

### 8.2 Contract Write Operations

| Operation | Function | Hook | Parameters |
|-----------|----------|------|------------|
| Make donation | `donateToCampaign(id)` | `useDonate` | `campaignId`, `value` (wei) |

### 8.3 Contract Events to Monitor

| Event | Data | Usage |
|-------|------|-------|
| `DonationReceived` | `campaignId`, `donor`, `amount` | Refresh on new donations |
| `CampaignApproved` | `id`, `approver` | Update verified status |
| `CampaignClosed` | `id` | Update active status |

### 8.4 Error Handling

| Contract Error | User Message |
|----------------|--------------|
| `CampaignNotFound` | "Campaign does not exist" |
| `CampaignNotVerified` | "Campaign is not verified yet" |
| `CampaignNotActive` | "Campaign is no longer accepting donations" |
| User rejected tx | "Transaction was cancelled" |
| Insufficient funds | "Insufficient ETH balance" |

---

## 9. Implementation Plan

### 9.1 Phase 1: Setup & Infrastructure (Day 1)

| Task | Time Est. | Status |
|------|-----------|--------|
| Update `layout.tsx` with Sepolia support | 30 min | ⬜ |
| Add RainbowKit provider properly | 30 min | ⬜ |
| Create `types/campaign.ts` | 15 min | ⬜ |
| Create `lib/utils.ts` | 30 min | ⬜ |
| Update `hooks/useCampaigns.ts` (wagmi v2) | 1 hour | ⬜ |
| Create `hooks/useDonate.ts` | 30 min | ⬜ |
| Test with existing `/test` page | 30 min | ⬜ |

### 9.2 Phase 2: Campaigns Listing Page (Day 2)

| Task | Time Est. | Status |
|------|-----------|--------|
| Create `/campaigns/page.tsx` | 1 hour | ⬜ |
| Create `CampaignCard` component | 45 min | ⬜ |
| Create `CampaignGrid` component | 30 min | ⬜ |
| Create `StatusBadge` component | 15 min | ⬜ |
| Create `ProgressBar` component | 20 min | ⬜ |
| Add loading & empty states | 30 min | ⬜ |
| Style the listing page | 1 hour | ⬜ |

### 9.3 Phase 3: Campaign Detail Page (Day 3)

| Task | Time Est. | Status |
|------|-----------|--------|
| Create `/campaign/[id]/page.tsx` | 1 hour | ⬜ |
| Create `CampaignDetails` component | 45 min | ⬜ |
| Implement metadataURI parsing | 30 min | ⬜ |
| Add 404/error handling | 30 min | ⬜ |
| Style the detail page | 1 hour | ⬜ |

### 9.4 Phase 4: Donation Flow (Day 4)

| Task | Time Est. | Status |
|------|-----------|--------|
| Create `DonationForm` component | 1.5 hours | ⬜ |
| Implement ETH to wei conversion | 15 min | ⬜ |
| Add transaction status UI | 45 min | ⬜ |
| Add wallet connection prompt | 30 min | ⬜ |
| Implement data refresh after donation | 30 min | ⬜ |
| Test full donation flow | 1 hour | ⬜ |

### 9.5 Phase 5: Polish & Testing (Day 5)

| Task | Time Est. | Status |
|------|-----------|--------|
| Create shared `Header` component | 30 min | ⬜ |
| Add navigation links | 20 min | ⬜ |
| Improve overall CSS styling | 2 hours | ⬜ |
| Test on Hardhat local network | 1 hour | ⬜ |
| Test on Sepolia (when available) | 1 hour | ⬜ |
| Fix bugs and edge cases | 2 hours | ⬜ |

---

## 10. Testing Checklist

### 10.1 Unit Tests (Manual Verification)

| Test | Expected Result | ✓ |
|------|-----------------|---|
| Parse metadataURI with valid JSON | Returns title & description | ⬜ |
| Parse metadataURI with invalid data | Returns default values | ⬜ |
| Convert 1 ETH to wei | Returns 1000000000000000000n | ⬜ |
| Convert 1000000000000000000 wei to ETH | Returns "1.0" | ⬜ |
| Calculate progress 50/100 | Returns 50 | ⬜ |
| Calculate progress 0/100 | Returns 0 | ⬜ |
| Truncate address | Returns "0x1234...5678" | ⬜ |

### 10.2 Integration Tests (Local Hardhat)

| Test | Steps | Expected | ✓ |
|------|-------|----------|---|
| Load campaigns page | Visit /campaigns | Shows campaign list | ⬜ |
| Empty state | No campaigns | Shows "No campaigns" message | ⬜ |
| Campaign card display | Create campaign | Shows title, goal, progress | ⬜ |
| Navigate to detail | Click campaign | Opens /campaign/[id] | ⬜ |
| Campaign detail load | Visit detail page | Shows full campaign info | ⬜ |
| Invalid campaign ID | Visit /campaign/999 | Shows error/404 | ⬜ |
| Connect wallet | Click connect | MetaMask popup appears | ⬜ |
| Donate without wallet | Click donate | Prompts to connect | ⬜ |
| Make donation | Enter amount, click donate | Transaction sent | ⬜ |
| Donation success | Confirm in MetaMask | Success message, data refreshes | ⬜ |
| Donation to unverified | Try to donate | Button disabled or error | ⬜ |
| Donation to inactive | Try to donate | Button disabled or error | ⬜ |

### 10.3 E2E Flow Test

```
1. Start Hardhat node
2. Deploy contract
3. Create campaign (via /create or script)
4. Approve campaign (admin)
5. Visit /campaigns - verify campaign appears
6. Click campaign - verify detail page
7. Connect wallet
8. Enter donation amount
9. Click donate
10. Confirm in MetaMask
11. Verify success message
12. Verify raised amount updated
```

---

## Appendix A: File Structure After Implementation

```
web/
├── app/
│   ├── layout.tsx              # Updated with Sepolia + RainbowKit
│   ├── page.tsx                # Home page
│   ├── globals.css             # Global styles
│   ├── campaigns/
│   │   └── page.tsx            # NEW: Campaign listing
│   ├── campaign/
│   │   └── [id]/
│   │       └── page.tsx        # NEW: Campaign detail
│   ├── create/
│   │   └── page.tsx            # Teammate 3
│   └── test/
│       └── page.tsx            # Existing test page
├── components/                  # NEW folder
│   ├── Header.tsx
│   ├── CampaignCard.tsx
│   ├── CampaignGrid.tsx
│   ├── CampaignDetails.tsx
│   ├── DonationForm.tsx
│   ├── ProgressBar.tsx
│   ├── StatusBadge.tsx
│   ├── LoadingSpinner.tsx
│   ├── ErrorMessage.tsx
│   └── TransactionStatus.tsx
├── hooks/
│   ├── useDonationContract.ts  # Deprecated (can remove)
│   ├── useCampaigns.ts         # NEW: Campaign hooks
│   └── useDonate.ts            # NEW: Donation hook
├── lib/
│   ├── contract.ts             # Updated with Sepolia address
│   └── utils.ts                # NEW: Utility functions
├── types/                       # NEW folder
│   └── campaign.ts             # TypeScript interfaces
└── abi/
    └── DonationRegistry.json   # Existing ABI
```

---

## Appendix B: Quick Reference - Wagmi v2 Hooks

```typescript
// Read single value
const { data, isLoading, error } = useReadContract({
  address: CONTRACT_ADDRESS,
  abi: CONTRACT_ABI,
  functionName: "getCampaign",
  args: [1n],
});

// Read multiple values (batch)
const { data } = useReadContracts({
  contracts: [
    { address, abi, functionName: "getCampaign", args: [1n] },
    { address, abi, functionName: "getCampaign", args: [2n] },
  ],
});

// Write (transaction)
const { writeContract, isPending } = useWriteContract();
writeContract({
  address: CONTRACT_ADDRESS,
  abi: CONTRACT_ABI,
  functionName: "donateToCampaign",
  args: [1n],
  value: parseEther("0.1"),
});

// Wait for transaction
const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash });

// Account info
const { address, isConnected } = useAccount();

// Chain info
const { chain } = useNetwork();
```

---

## Appendix C: Useful Commands

```bash
# Start local Hardhat node (in /blockchain folder)
npx hardhat node

# Deploy contract locally
npx hardhat run scripts/deploy.js --network localhost

# Start Next.js dev server (in /web folder)
npm run dev

# Build for production
npm run build
```

---

**Document End**

*This PRD is specific to Task 2: Donor Side Frontend Lead. Coordinate with Teammate 1 for contract deployment and Teammate 3 for shared components.*
