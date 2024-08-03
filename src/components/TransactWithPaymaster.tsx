import { useAccount } from "wagmi";
import { useCapabilities, useSendCalls } from "wagmi/experimental";
import { useMemo } from "react";
import { myNFTABI, myNFTAddress } from "@/ABIs/myNFT";
import { TransactButton } from "./TransactButton";

export function TransactWithPaymaster() {
  const account = useAccount();
  const { data: availableCapabilities } = useCapabilities({
    account: account.address,
  });
  const capabilities = useMemo(() => {
    if (!availableCapabilities || !account.chainId) return;
    const capabilitiesForChain = availableCapabilities[account.chainId];
    if (capabilitiesForChain.paymasterService?.supported) {
      return {
        paymasterService: {
          url:
            process.env.PAYMASTER_PROXY_SERVER_URL ||
            `${document.location.origin}/api/paymaster`,
        },
      };
    }
  }, [availableCapabilities, account.chainId]);

  const { sendCalls } = useSendCalls();

  return (
    <div>
      <h2>Transact With Paymaster</h2>
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
              capabilities,
            })
          }
        >
          Send calls
        </button>
        '
      </div>
    </div>
  );
}
