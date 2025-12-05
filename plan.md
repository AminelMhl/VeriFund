# VeriFund Task 2 - Implementation Plan
## Section 1: Foundation & Infrastructure (Day 1)

**Objective:** Set up the foundational infrastructure for the donor-side frontend, including wallet configuration, type definitions, utility functions, and React hooks.

**Estimated Time:** 4 hours  
**Priority:** HIGH (All other sections depend on this)

---

### Overview

This section establishes the core infrastructure needed for the entire donor experience. We'll update the wagmi configuration to support both local and testnet environments, create type-safe interfaces for campaign data, build utility functions for data transformation, and implement modern React hooks using wagmi v2 API.

**Key Outcomes:**
- ✅ Multi-network support (Hardhat local + Sepolia testnet)
- ✅ Type-safe TypeScript interfaces for all contract data
- ✅ Reusable utility functions for wei/ETH conversion and data parsing
- ✅ Modern wagmi v2 hooks for reading campaigns and making donations
- ✅ Verified working integration via test page

---

### Task Breakdown (8 Tasks)

#### **Task 1.1: Update wagmi Configuration for Multi-Network Support**
**File:** `web/app/layout.tsx`  
**Time Estimate:** 30 minutes  
**Priority:** HIGH

**Current State:**
- Only configured for Hardhat local network
- Missing Sepolia testnet support
- RainbowKit provider exists but needs verification

**Required Changes:**
```typescript
// Add sepolia import
import { hardhat, sepolia } from "wagmi/chains";

// Update config to include both networks
const config = createConfig({
  chains: [hardhat, sepolia],
  transports: {
    [hardhat.id]: http("http://127.0.0.1:8545"),
    [sepolia.id]: http(), // Uses default public RPC
  },
});
```

**Acceptance Criteria:**
- [ ] Layout imports both `hardhat` and `sepolia` chains
- [ ] createConfig includes both chains in the array
- [ ] Transports configured for both networks
- [ ] RainbowKitProvider wraps the application
- [ ] No TypeScript errors
- [ ] Application runs without console errors

**Testing:**
1. Start dev server: `npm run dev` (in web folder)
2. Check browser console - no errors
3. Click "Connect Wallet" button - RainbowKit modal appears
4. Verify network switcher shows both Hardhat and Sepolia

---

#### **Task 1.2: Update Contract Configuration**
**File:** `web/lib/contract.ts`  
**Time Estimate:** 15 minutes  
**Priority:** HIGH

**Current State:**
- Contract address may be hardcoded or missing
- No Sepolia address placeholder

**Required Changes:**
```typescript
import donationAbi from "../abi/DonationRegistry.json";

// Hardhat local deployment address (update after deployment)
export const CONTRACT_ADDRESS_LOCAL = "0x5FbDB2315678afecb367f032d93F642f64180aa3" as const;

// Sepolia testnet address (update when Teammate 1 deploys)
export const CONTRACT_ADDRESS_SEPOLIA = "0x0000000000000000000000000000000000000000" as const;

// Default to local for development
export const CONTRACT_ADDRESS = CONTRACT_ADDRESS_LOCAL;

export const CONTRACT_ABI = donationAbi.abi;
```

**Acceptance Criteria:**
- [ ] File exports contract addresses for both networks
- [ ] File exports CONTRACT_ABI from the JSON file
- [ ] TypeScript types are properly inferred (use `as const`)
- [ ] Comments indicate when to update addresses
- [ ] No TypeScript errors

**Notes:**
- You'll get the actual Hardhat address after running deployment
- Sepolia address will come from Teammate 1 (leave as placeholder for now)

---

#### **Task 1.3: Create TypeScript Type Definitions**
**File:** `web/types/campaign.ts` (NEW)  
**Time Estimate:** 20 minutes  
**Priority:** HIGH

**Purpose:**  
Define TypeScript interfaces that match the smart contract's Campaign struct and provide type safety throughout the application.

**Required Types:**
```typescript
// Raw campaign data from contract (all values as returned by blockchain)
export interface RawCampaign {
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
  description: string;
  createdAt?: number;
}

// Formatted campaign for UI consumption
export interface FormattedCampaign {
  id: string;
  owner: string;
  title: string;
  description: string;
  goalETH: string;
  raisedETH: string;
  goalWei: bigint;
  raisedWei: bigint;
  progress: number;
  verified: boolean;
  active: boolean;
  createdAt: Date;
}

// Hook return types
export interface UseCampaignsReturn {
  campaigns: FormattedCampaign[] | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export interface UseCampaignReturn {
  campaign: FormattedCampaign | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export interface UseDonateReturn {
  donate: (campaignId: bigint, amountETH: string) => void;
  isPending: boolean;
  isSuccess: boolean;
  error: Error | null;
  hash: `0x${string}` | undefined;
}
```

**Acceptance Criteria:**
- [ ] All interfaces exported
- [ ] Types match contract struct exactly
- [ ] Includes both raw and formatted types
- [ ] Hook return types defined
- [ ] No TypeScript errors
- [ ] File is in `web/types/` folder

---

#### **Task 1.4: Create Utility Functions**
**File:** `web/lib/utils.ts` (NEW)  
**Time Estimate:** 45 minutes  
**Priority:** HIGH

**Purpose:**  
Centralize common transformations and parsing logic used throughout the application.

**Required Functions:**

```typescript
import { formatEther, parseEther } from "viem";
import type { RawCampaign, CampaignMetadata, FormattedCampaign } from "@/types/campaign";

/**
 * Convert wei (bigint) to ETH (string)
 * @param wei Amount in wei
 * @param decimals Number of decimal places (default 4)
 * @returns Formatted ETH string
 */
export function weiToETH(wei: bigint, decimals: number = 4): string {
  const eth = formatEther(wei);
  return parseFloat(eth).toFixed(decimals);
}

/**
 * Convert ETH (string) to wei (bigint)
 * @param eth Amount in ETH
 * @returns Amount in wei as bigint
 */
export function ethToWei(eth: string): bigint {
  return parseEther(eth);
}

/**
 * Calculate progress percentage
 * @param raised Amount raised in wei
 * @param goal Goal amount in wei
 * @returns Percentage (0-100)
 */
export function calculateProgress(raised: bigint, goal: bigint): number {
  if (goal === 0n) return 0;
  const progress = (Number(raised) / Number(goal)) * 100;
  return Math.min(Math.round(progress), 100);
}

/**
 * Parse metadataURI to extract campaign metadata
 * @param metadataURI URI string (e.g., "data:application/json,{...}")
 * @returns Parsed metadata object
 */
export function parseMetadata(metadataURI: string): CampaignMetadata {
  try {
    // Handle data URI format: "data:application/json,{...}"
    if (metadataURI.startsWith("data:application/json,")) {
      const jsonString = metadataURI.replace("data:application/json,", "");
      const parsed = JSON.parse(jsonString);
      return {
        title: parsed.title || "Untitled Campaign",
        description: parsed.description || "No description available",
        createdAt: parsed.createdAt,
      };
    }
    
    // Handle plain JSON string
    const parsed = JSON.parse(metadataURI);
    return {
      title: parsed.title || "Untitled Campaign",
      description: parsed.description || "No description available",
      createdAt: parsed.createdAt,
    };
  } catch (error) {
    console.error("Failed to parse metadata:", error);
    return {
      title: "Untitled Campaign",
      description: "No description available",
    };
  }
}

/**
 * Format a raw campaign from contract into UI-friendly format
 * @param raw Raw campaign data from contract
 * @returns Formatted campaign object
 */
export function formatCampaign(raw: RawCampaign): FormattedCampaign {
  const metadata = parseMetadata(raw.metadataURI);
  
  return {
    id: raw.id.toString(),
    owner: raw.owner,
    title: metadata.title,
    description: metadata.description,
    goalETH: weiToETH(raw.goal),
    raisedETH: weiToETH(raw.raised),
    goalWei: raw.goal,
    raisedWei: raw.raised,
    progress: calculateProgress(raw.raised, raw.goal),
    verified: raw.verified,
    active: raw.active,
    createdAt: new Date(Number(raw.createdAt) * 1000),
  };
}

/**
 * Truncate Ethereum address for display
 * @param address Full address
 * @param chars Number of chars to show on each side (default 4)
 * @returns Truncated address (e.g., "0x1234...5678")
 */
export function truncateAddress(address: string, chars: number = 4): string {
  if (address.length < chars * 2 + 2) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Format date for display
 * @param date Date object
 * @returns Formatted date string
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}
```

**Acceptance Criteria:**
- [ ] All utility functions implemented
- [ ] Functions use viem's formatEther/parseEther
- [ ] Proper error handling in parseMetadata
- [ ] Default values for optional parameters
- [ ] TypeScript types imported and used
- [ ] Functions exported
- [ ] No runtime errors when called with valid inputs

**Testing (manual in console or test page):**
```typescript
// Test conversions
weiToETH(1000000000000000000n) // Should return "1.0000"
ethToWei("1.5") // Should return 1500000000000000000n
calculateProgress(50n, 100n) // Should return 50
truncateAddress("0x1234567890abcdef1234567890abcdef12345678") // "0x1234...5678"
```

---

#### **Task 1.5: Create useCampaigns Hook**
**File:** `web/hooks/useCampaigns.ts` (NEW)  
**Time Estimate:** 1 hour  
**Priority:** HIGH

**Purpose:**  
Provide a React hook to fetch all campaigns from the contract using wagmi v2 API.

**Implementation Strategy:**
1. Get total number of campaigns via `nextCampaignId()`
2. Batch fetch all campaigns using `useReadContracts`
3. Format the data using utility functions
4. Return formatted campaigns with loading/error states

**Required Code:**
```typescript
"use client";

import { useReadContracts } from "wagmi";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/lib/contract";
import { formatCampaign } from "@/lib/utils";
import type { RawCampaign, UseCampaignsReturn } from "@/types/campaign";

/**
 * Hook to fetch all campaigns from the contract
 * Uses batch reading for efficiency
 */
export function useCampaigns(): UseCampaignsReturn {
  // First, get the next campaign ID to know how many campaigns exist
  const { data: nextIdData } = useReadContracts({
    contracts: [
      {
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "nextCampaignId",
      },
    ],
  });

  const nextId = nextIdData?.[0]?.result as bigint | undefined;
  const totalCampaigns = nextId ? Number(nextId) - 1 : 0;

  // Build array of contract calls for all campaigns
  const campaignCalls = Array.from({ length: totalCampaigns }, (_, i) => ({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getCampaign",
    args: [BigInt(i + 1)],
  }));

  // Batch fetch all campaigns
  const {
    data: campaignsData,
    isLoading,
    error,
    refetch,
  } = useReadContracts({
    contracts: campaignCalls,
  });

  // Format campaigns
  const campaigns = campaignsData
    ?.map((result) => {
      if (result.status === "success" && result.result) {
        const raw = result.result as unknown as RawCampaign;
        return formatCampaign(raw);
      }
      return null;
    })
    .filter((c) => c !== null);

  return {
    campaigns,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}
```

**Acceptance Criteria:**
- [ ] Hook fetches nextCampaignId first
- [ ] Batch fetches all campaigns using useReadContracts
- [ ] Uses formatCampaign utility to transform data
- [ ] Returns properly typed data
- [ ] Handles loading and error states
- [ ] Includes refetch function
- [ ] No TypeScript errors
- [ ] "use client" directive at top

**Testing:**
- Use in `/test/page.tsx` to verify campaigns load
- Check console for any errors
- Verify data structure matches FormattedCampaign type

---

#### **Task 1.6: Create useCampaign Hook (Single Campaign)**
**File:** `web/hooks/useCampaigns.ts` (add to existing file)  
**Time Estimate:** 20 minutes  
**Priority:** HIGH

**Purpose:**  
Fetch a single campaign by ID for the detail page.

**Add this function to the same file:**
```typescript
/**
 * Hook to fetch a single campaign by ID
 * @param campaignId Campaign ID to fetch
 */
export function useCampaign(campaignId: bigint | undefined): UseCampaignReturn {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useReadContracts({
    contracts: campaignId
      ? [
          {
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            functionName: "getCampaign",
            args: [campaignId],
          },
        ]
      : [],
  });

  const campaign = data?.[0]?.status === "success" && data[0].result
    ? formatCampaign(data[0].result as unknown as RawCampaign)
    : undefined;

  return {
    campaign,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}
```

**Acceptance Criteria:**
- [ ] Hook accepts campaignId parameter
- [ ] Uses useReadContracts for single campaign
- [ ] Handles undefined campaignId gracefully
- [ ] Formats campaign data
- [ ] Returns typed UseCampaignReturn
- [ ] No TypeScript errors

---

#### **Task 1.7: Create useDonate Hook**
**File:** `web/hooks/useDonate.ts` (NEW)  
**Time Estimate:** 30 minutes  
**Priority:** HIGH

**Purpose:**  
Provide a hook to handle donation transactions with proper state management.

**Required Code:**
```typescript
"use client";

import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/lib/contract";
import { ethToWei } from "@/lib/utils";
import type { UseDonateReturn } from "@/types/campaign";

/**
 * Hook to handle campaign donations
 * Manages transaction state and confirmation
 */
export function useDonate(): UseDonateReturn {
  const {
    writeContract,
    data: hash,
    isPending: isWritePending,
    error: writeError,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess,
  } = useWaitForTransactionReceipt({
    hash,
  });

  /**
   * Make a donation to a campaign
   * @param campaignId Campaign ID
   * @param amountETH Amount in ETH (as string)
   */
  const donate = (campaignId: bigint, amountETH: string) => {
    const amountWei = ethToWei(amountETH);
    
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "donateToCampaign",
      args: [campaignId],
      value: amountWei,
    });
  };

  return {
    donate,
    isPending: isWritePending || isConfirming,
    isSuccess,
    error: writeError as Error | null,
    hash,
  };
}
```

**Acceptance Criteria:**
- [ ] Hook uses useWriteContract for transaction
- [ ] Uses useWaitForTransactionReceipt for confirmation
- [ ] donate function converts ETH to wei
- [ ] Properly handles loading states (write + confirm)
- [ ] Returns transaction hash
- [ ] Returns error state
- [ ] No TypeScript errors
- [ ] "use client" directive at top

**Testing:**
- Will be tested in Task 1.8 via test page
- Must be connected to wallet to test

---

#### **Task 1.8: Verify Integration with Test Page**
**File:** `web/app/test/page.tsx` (modify existing)  
**Time Estimate:** 30 minutes  
**Priority:** HIGH

**Purpose:**  
Verify all hooks and utilities work correctly before building the main pages.

**Update test page to use new hooks:**
```typescript
"use client";

import { useCampaigns, useCampaign } from "@/hooks/useCampaigns";
import { useDonate } from "@/hooks/useDonate";
import { useAccount } from "wagmi";
import { useState } from "react";

export default function TestPage() {
  const [testId, setTestId] = useState<string>("1");
  const [donationAmount, setDonationAmount] = useState<string>("0.01");
  
  const { address, isConnected } = useAccount();
  const { campaigns, isLoading: loadingAll, error: errorAll } = useCampaigns();
  const { campaign, isLoading: loadingOne, error: errorOne } = useCampaign(
    testId ? BigInt(testId) : undefined
  );
  const { donate, isPending, isSuccess, hash } = useDonate();

  const handleDonate = () => {
    if (testId && donationAmount) {
      donate(BigInt(testId), donationAmount);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <h1>🧪 Contract Integration Test Page</h1>
      
      <section style={{ marginTop: "2rem" }}>
        <h2>Wallet Status</h2>
        <p>Connected: {isConnected ? "✅ Yes" : "❌ No"}</p>
        <p>Address: {address || "Not connected"}</p>
      </section>

      <section style={{ marginTop: "2rem" }}>
        <h2>All Campaigns (useCampaigns)</h2>
        {loadingAll && <p>Loading campaigns...</p>}
        {errorAll && <p style={{ color: "red" }}>Error: {errorAll.message}</p>}
        {campaigns && (
          <>
            <p>Total campaigns: {campaigns.length}</p>
            <div style={{ display: "grid", gap: "1rem", marginTop: "1rem" }}>
              {campaigns.map((c) => (
                <div key={c.id} style={{ border: "1px solid #ccc", padding: "1rem", borderRadius: "8px" }}>
                  <h3>{c.title}</h3>
                  <p>{c.description}</p>
                  <p>Goal: {c.goalETH} ETH | Raised: {c.raisedETH} ETH | Progress: {c.progress}%</p>
                  <p>Verified: {c.verified ? "✅" : "⏳"} | Active: {c.active ? "✅" : "❌"}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      <section style={{ marginTop: "2rem" }}>
        <h2>Single Campaign (useCampaign)</h2>
        <input
          type="text"
          value={testId}
          onChange={(e) => setTestId(e.target.value)}
          placeholder="Campaign ID"
          style={{ padding: "0.5rem", marginRight: "1rem" }}
        />
        {loadingOne && <p>Loading campaign...</p>}
        {errorOne && <p style={{ color: "red" }}>Error: {errorOne.message}</p>}
        {campaign && (
          <div style={{ border: "1px solid #ccc", padding: "1rem", borderRadius: "8px", marginTop: "1rem" }}>
            <h3>{campaign.title}</h3>
            <p>{campaign.description}</p>
            <p>ID: {campaign.id}</p>
            <p>Owner: {campaign.owner}</p>
            <p>Goal: {campaign.goalETH} ETH</p>
            <p>Raised: {campaign.raisedETH} ETH</p>
            <p>Progress: {campaign.progress}%</p>
            <p>Verified: {campaign.verified ? "✅" : "⏳"}</p>
            <p>Active: {campaign.active ? "✅" : "❌"}</p>
          </div>
        )}
      </section>

      <section style={{ marginTop: "2rem" }}>
        <h2>Make Donation (useDonate)</h2>
        {!isConnected && <p style={{ color: "orange" }}>⚠️ Connect wallet first</p>}
        <div>
          <input
            type="text"
            value={donationAmount}
            onChange={(e) => setDonationAmount(e.target.value)}
            placeholder="Amount in ETH"
            style={{ padding: "0.5rem", marginRight: "1rem" }}
            disabled={!isConnected}
          />
          <button
            onClick={handleDonate}
            disabled={!isConnected || isPending || !testId || !donationAmount}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: isConnected ? "#0070f3" : "#ccc",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: isConnected ? "pointer" : "not-allowed",
            }}
          >
            {isPending ? "Processing..." : `Donate to Campaign ${testId}`}
          </button>
        </div>
        {hash && (
          <p style={{ marginTop: "1rem" }}>
            Transaction: <code>{hash}</code>
          </p>
        )}
        {isSuccess && (
          <p style={{ color: "green", marginTop: "1rem" }}>
            ✅ Donation successful!
          </p>
        )}
      </section>
    </div>
  );
}
```

**Testing Steps:**

1. **Prerequisites:**
   ```bash
   # Terminal 1 - Start Hardhat node (in blockchain folder)
   cd VeriFund/blockchain
   npx hardhat node
   
   # Terminal 2 - Deploy contract (in blockchain folder)
   npx hardhat run scripts/deploy.js --network localhost
   # Copy the contract address from output
   
   # Terminal 3 - Start dev server (in web folder)
   cd VeriFund/web
   npm run dev
   ```

2. **Update contract address:**
   - Copy deployed contract address from Terminal 2
   - Update `CONTRACT_ADDRESS_LOCAL` in `web/lib/contract.ts`

3. **Create test campaign:**
   - Visit http://localhost:3000/create
   - Create a campaign (or use Hardhat console)

4. **Test the test page:**
   - Visit http://localhost:3000/test
   - Verify all campaigns load
   - Verify single campaign loads by ID
   - Connect MetaMask wallet
   - Make a test donation
   - Verify transaction succeeds
   - Check that raised amount updates

**Acceptance Criteria:**
- [ ] Test page displays without errors
- [ ] useCampaigns hook loads all campaigns
- [ ] useCampaign hook loads single campaign by ID
- [ ] Wallet connection works
- [ ] Donation transaction can be initiated
- [ ] Transaction hash is displayed
- [ ] Success message shows after confirmation
- [ ] No console errors
- [ ] All data formats correctly (ETH, progress %, dates)

---

### Completion Checklist

Before moving to Section 2, verify:

**Configuration:**
- [ ] `layout.tsx` supports both Hardhat and Sepolia
- [ ] `contract.ts` exports addresses and ABI
- [ ] No TypeScript compilation errors
- [ ] Dev server runs without errors

**Types & Utils:**
- [ ] All TypeScript interfaces defined in `types/campaign.ts`
- [ ] All utility functions implemented in `lib/utils.ts`
- [ ] Functions handle edge cases (0 values, invalid JSON, etc.)

**Hooks:**
- [ ] `useCampaigns` fetches and formats all campaigns
- [ ] `useCampaign` fetches single campaign
- [ ] `useDonate` handles transactions properly
- [ ] All hooks use wagmi v2 API (not v1)

**Testing:**
- [ ] Test page shows all campaigns
- [ ] Test page shows single campaign
- [ ] Donation flow works end-to-end
- [ ] Transaction confirmation detected
- [ ] No runtime errors

**Documentation:**
- [ ] All functions have JSDoc comments
- [ ] Complex logic explained with comments
- [ ] File structure matches plan

---

### Common Issues & Solutions

**Issue 1: "Cannot read nextCampaignId"**
- **Cause:** Contract not deployed or wrong address
- **Solution:** Deploy contract and update CONTRACT_ADDRESS

**Issue 2: "User rejected transaction"**
- **Cause:** User cancelled in MetaMask
- **Solution:** This is expected behavior, just try again

**Issue 3: "Campaign not found"**
- **Cause:** Campaign ID doesn't exist
- **Solution:** Create a campaign first via `/create` or contract

**Issue 4: MetaMask not connecting**
- **Cause:** Wrong network selected
- **Solution:** Switch to Hardhat network (Chain ID 31337) in MetaMask

**Issue 5: TypeScript errors with bigint**
- **Cause:** Missing type assertions
- **Solution:** Use `as bigint` or proper type guards

---

### Next Steps

After completing Section 1, you'll have:
- ✅ Working infrastructure for contract interaction
- ✅ Reusable hooks for all pages
- ✅ Type-safe data handling
- ✅ Verified working integration

You can then proceed to:
- **Section 2:** Campaign Listing Page (`/campaigns`)
- **Section 3:** Campaign Detail Page (`/campaign/[id]`)
- **Section 4:** Donation Flow Components

---

**End of Section 1 Plan**
