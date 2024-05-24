import { useAccount } from "wagmi";
import { useSendCalls, useWriteContracts } from "wagmi/experimental";
import { useState } from "react";
import { CallStatus } from "./CallStatus";
import { myNFTABI, myNFTAddress } from "@/ABIs/myNFT";

// example batch transaction, making two mint NFT calls
export function Transact() {
  const account = useAccount();
  const [id, setId] = useState<string | undefined>(undefined);
  const { sendCalls } = useSendCalls({
    mutation: { onSuccess: (id) => setId(id) },
  });

  return (
    <div>
      <h2>Transact</h2>
      <div>
        <button
          id="mint-button"
          onClick={() => {
            sendCalls({
              calls: [
                {
                  to: account.address!,
                  value: BigInt(1)
                },
                {
                  to: account.address!,
                  value: BigInt(1)
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
