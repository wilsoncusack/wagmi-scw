import { useAccount } from "wagmi";
import { useCallsStatus, useWriteContracts } from "wagmi/experimental";
import { useState } from "react";
import { CallStatus } from "./CallStatus";
import { myNFTABI, myNFTAddress } from "@/ABIs/myNFT";

// example batch transaction, making two mint NFT calls
export function Transact() {
  const account = useAccount();
  const [is_busy, set_busy] = useState(false);
  const {
    data: bundle_id,
    isPending,
    writeContracts,
  } = useWriteContracts({
    mutation: {
      onSuccess() {
        set_busy(true);
      },
    },
  });
  const { data: calls_status } = useCallsStatus({
    id: bundle_id as string,
    query: {
      enabled: !!bundle_id,
      refetchInterval: (data) =>
        data.state.data?.status === "CONFIRMED" ? false : 2000,
    },
  });
  const payload = {
    contracts: [
      {
        address: myNFTAddress,
        abi: myNFTABI,
        functionName: "safeMint",
        args: [account.address],
      },
      {
        address: myNFTAddress,
        abi: myNFTABI,
        functionName: "safeMint",
        args: [account.address],
      },
    ],
  };

  const mint = () => {
    set_busy(true)
    writeContracts(payload as any);
  }

  return (
    <div>
      <h2>Transact</h2>
      <div>
        <button
          disabled={isPending || calls_status?.status === "PENDING"}
          onClick={mint}
        >
          Mint
        </button>
        {bundle_id && <CallStatus id={bundle_id} />}
      </div>
    </div>
  );
}
