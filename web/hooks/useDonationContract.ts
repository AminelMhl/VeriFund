import { useContractWrite, usePrepareContractWrite, useContractRead } from 'wagmi';
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "../lib/contract";

export function useDonationContract() {
  return {
    useReadCampaign: (id: number) =>
      useContractRead({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "campaigns",
        args: [id],
      }),

    useDonateToCampaign: (id: number, value: bigint) => {
      const { config } = usePrepareContractWrite({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "donateToCampaign",
        args: [id],
        value,
      });

      return useContractWrite(config);
    },
  };
}
