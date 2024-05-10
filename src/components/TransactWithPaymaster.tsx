import { useAccount } from "wagmi";
import { useWriteContracts } from "wagmi/experimental";
import { useState } from "react";
import { CallStatus } from "./CallStatus";
import { myNFTABI, myNFTAddress } from "@/ABIs/myNFT";

const abi = [
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "to", type: "address" }],
    name: "safeMint",
    outputs: [],
  },
] as const;

// example batch transaction, making two mint NFT calls
export function TransactWithPaymaster() {
  const account = useAccount();
  const [id, setId] = useState<string | undefined>(undefined);
  const { writeContracts } = useWriteContracts({
    mutation: { onSuccess: (id) => setId(id) },
  });

  return (
    <div>
      <h2>Transact With Paymaster</h2>
      <p>${document.location.origin}/api/paymaster</p>
      <div>
        <button
          onClick={() => {
            writeContracts({
              contracts: [
                {
                  address: myNFTAddress,
                  abi: myNFTABI,
                  functionName: "safeMint",
                  args: [account.address],
                },
              ],
              capabilities: {
                paymasterService: {
                  url: `${document.location.origin}/api/paymaster`,
                },
              },
            });
          }}
        >
          Mint
        </button>
        {id && <CallStatus id={id} />}
      </div>
    </div>
  );
}
