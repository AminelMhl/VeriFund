import { useChainId, useContractWrite, usePrepareContractWrite, useContractRead } from "wagmi";
import { CONTRACT_ABI, getContractAddress } from "../lib/contract";

export function useDonationContract() {
  const chainId = useChainId();
  const contractAddress = getContractAddress(chainId);

  return {
    useReadCampaign: (id: number) =>
      useContractRead({
        address: contractAddress,
        abi: CONTRACT_ABI,
        functionName: "campaigns",
        args: [id],
      }),

    useDonateToCampaign: (id: number, value: bigint) => {
      const { config } = usePrepareContractWrite({
        address: contractAddress,
        abi: CONTRACT_ABI,
        functionName: "donateToCampaign",
        args: [id],
        value,
      });

      return useContractWrite(config);
    },
  };
}
