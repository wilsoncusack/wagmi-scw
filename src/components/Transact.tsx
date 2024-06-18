import { useAccount } from "wagmi";
import { myNFTABI, myNFTAddress } from "@/ABIs/myNFT";
import { TransactButton } from "./TransactButton";

// example batch transaction, making two mint NFT calls
export function Transact() {
  const account = useAccount();

  return (
    <div>
      <h2>Transact</h2>
      <div>
        <TransactButton
          id="mint-button"
          contracts={[
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
          ]}
          text="Mint"
        />
      </div>
    </div>
  );
}
