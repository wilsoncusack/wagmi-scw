import { useAccount } from "wagmi";
import { useWriteContracts } from "wagmi/experimental";
import { useState } from "react";
import { CallStatus } from "./CallStatus";
import { myNFTABI, myNFTAddress } from "@/ABIs/myNFT";

// example batch transaction, making two mint NFT calls
export function Transact() {
  const account = useAccount();
  const [id, setId] = useState<string | undefined>(undefined);
  const { writeContracts } = useWriteContracts({
    mutation: { onSuccess: (id) => setId(id) },
  });

  return (
    <div>
      <h2>Transact</h2>
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
                {
                  address: myNFTAddress,
                  abi: myNFTABI,
                  functionName: "safeMint",
                  args: [account.address],
                },
              ],
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
