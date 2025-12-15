import type { FormattedCampaign } from "@/types/campaign";

const STORAGE_KEY = "verifund_mock_chain";

interface StoredCampaign {
  id: number;
  title: string;
  description: string;
  goalEth: string;
  raisedEth: string;
  verified: boolean;
  active: boolean;
  createdAt: number; // timestamp (ms)
}

interface MockChainState {
  nextId: number;
  campaigns: StoredCampaign[];
}

function loadState(): MockChainState {
  if (typeof window === "undefined") {
    return { nextId: 1, campaigns: [] };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { nextId: 1, campaigns: [] };
    const parsed = JSON.parse(raw) as MockChainState;
    if (!parsed || !Array.isArray(parsed.campaigns)) {
      return { nextId: 1, campaigns: [] };
    }
    return parsed;
  } catch {
    return { nextId: 1, campaigns: [] };
  }
}

function saveState(state: MockChainState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function toFormatted(c: StoredCampaign): FormattedCampaign {
  const goal = Number.parseFloat(c.goalEth || "0");
  const raised = Number.parseFloat(c.raisedEth || "0");

  // Approximate wei values for display / progress
  const goalWei = BigInt(Math.round(goal * 1e18));
  const raisedWei = BigInt(Math.round(raised * 1e18));

  return {
    id: String(c.id),
    owner: "0x0000000000000000000000000000000000000000",
    title: c.title,
    description: c.description,
    goalETH: c.goalEth,
    raisedETH: c.raisedEth,
    goalWei,
    raisedWei,
    progress: goal > 0 ? Math.min(Math.round((raised / goal) * 100), 100) : 0,
    verified: c.verified,
    active: c.active,
    createdAt: new Date(c.createdAt),
  };
}

export function mockGetAllCampaigns(): FormattedCampaign[] {
  const state = loadState();
  return state.campaigns.map(toFormatted);
}

export function mockGetCampaign(id: bigint | number): FormattedCampaign | undefined {
  const numericId = typeof id === "bigint" ? Number(id) : id;
  const state = loadState();
  const found = state.campaigns.find((c) => c.id === numericId);
  return found ? toFormatted(found) : undefined;
}

export function mockCreateCampaign(input: {
  title: string;
  description: string;
  goalEth: string;
}): FormattedCampaign {
  const state = loadState();
  const id = state.nextId;

  const newCampaign: StoredCampaign = {
    id,
    title: input.title,
    description: input.description,
    goalEth: input.goalEth,
    raisedEth: "0",
    verified: false,
    active: true,
    createdAt: Date.now(),
  };

  const nextState: MockChainState = {
    nextId: id + 1,
    campaigns: [...state.campaigns, newCampaign],
  };

  saveState(nextState);

  return toFormatted(newCampaign);
}

export function mockDonateToCampaign(id: bigint, amountEth: string): FormattedCampaign | undefined {
  const numericId = Number(id);
  const state = loadState();
  const idx = state.campaigns.findIndex((c) => c.id === numericId);
  if (idx === -1) return undefined;

  const campaign = state.campaigns[idx];
  const current = Number.parseFloat(campaign.raisedEth || "0");
  const delta = Number.parseFloat(amountEth || "0");
  const nextRaised = (current + (Number.isFinite(delta) ? delta : 0)).toString();

  const updated: StoredCampaign = {
    ...campaign,
    raisedEth: nextRaised,
  };

  const nextState: MockChainState = {
    ...state,
    campaigns: [...state.campaigns.slice(0, idx), updated, ...state.campaigns.slice(idx + 1)],
  };

  saveState(nextState);
  return toFormatted(updated);
}

export function mockApproveCampaign(id: bigint): FormattedCampaign | undefined {
  const numericId = Number(id);
  const state = loadState();
  const idx = state.campaigns.findIndex((c) => c.id === numericId);
  if (idx === -1) return undefined;

  const updated: StoredCampaign = {
    ...state.campaigns[idx],
    verified: true,
  };

  const nextState: MockChainState = {
    ...state,
    campaigns: [...state.campaigns.slice(0, idx), updated, ...state.campaigns.slice(idx + 1)],
  };

  saveState(nextState);
  return toFormatted(updated);
}

export function mockCloseCampaign(id: bigint): FormattedCampaign | undefined {
  const numericId = Number(id);
  const state = loadState();
  const idx = state.campaigns.findIndex((c) => c.id === numericId);
  if (idx === -1) return undefined;

  const updated: StoredCampaign = {
    ...state.campaigns[idx],
    active: false,
  };

  const nextState: MockChainState = {
    ...state,
    campaigns: [...state.campaigns.slice(0, idx), updated, ...state.campaigns.slice(idx + 1)],
  };

  saveState(nextState);
  return toFormatted(updated);
}

export function mockDeleteCampaign(id: bigint): void {
  const numericId = Number(id);
  const state = loadState();
  const nextState: MockChainState = {
    ...state,
    campaigns: state.campaigns.filter((c) => c.id !== numericId),
  };
  saveState(nextState);
}
