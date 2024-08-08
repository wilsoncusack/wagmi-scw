import { useAccount } from "wagmi";
import { myNFTABI, myNFTAddress } from "@/ABIs/myNFT";
import { TransactButton } from "./TransactButton";
import { useSendCalls } from "wagmi/experimental";

// example batch transaction, making two mint NFT calls
export function Transact() {
  const account = useAccount();
  const { sendCalls } = useSendCalls();

  return (
    <div>
      <h2>Transact</h2>
      <div>
        <button
          type="button"
          onClick={() =>
            sendCalls({
              calls: [
                {
                  to: "0xfd896Bf5Eba7E1B9843B91ef6182DE16B547273B",
                  value: BigInt(1),
                },
              ],
            })
          }
        >
          Send calls
        </button>
      </div>
    </div>
  );
}
