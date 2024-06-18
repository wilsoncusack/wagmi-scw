import { useAccount } from "wagmi";
import { useCapabilities, useWriteContracts } from "wagmi/experimental";
import { useMemo, useState } from "react";
import { CallStatus } from "./CallStatus";
import { myNFTABI, myNFTAddress } from "@/ABIs/myNFT";
import { TransactButton } from "./TransactButton";

export function TransactWithPaymaster() {
  const account = useAccount();
  const [id, setId] = useState<string | undefined>(undefined);
  const { writeContracts } = useWriteContracts({
    mutation: { onSuccess: (id) => setId(id) },
  });
  const { data: availableCapabilities } = useCapabilities({
    account: account.address,
  });
  const capabilities = useMemo(() => {
    if (!availableCapabilities || !account.chainId) return;
    const capabilitiesForChain = availableCapabilities[account.chainId];
    if (
      capabilitiesForChain["paymasterService"] &&
      capabilitiesForChain["paymasterService"].supported
    ) {
      return {
        paymasterService: {
          url:
            process.env.PAYMASTER_PROXY_SERVER_URL ||
            `${document.location.origin}/api/paymaster`,
        },
      };
    }
  }, [availableCapabilities, account.chainId]);

  return (
    <div>
      <h2>Transact With Paymaster</h2>
      <div>
        <TransactButton
          text="Mint"
          contracts={[
            {
              address: myNFTAddress,
              abi: myNFTABI,
              functionName: "safeMint",
              args: [account.address],
            },
          ]}
          capabilities={capabilities}
          mutation={{ onSuccess: (id: string) => setId(id) }}
        />
      </div>
    </div>
  );
}
