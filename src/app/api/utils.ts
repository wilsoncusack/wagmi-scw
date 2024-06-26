import { UserOperation } from "permissionless";
import { Address, Hex, decodeFunctionData } from "viem";
import { baseSepolia } from "viem/chains";
import { client } from "./config";
import { coinbaseSmartWalletABI, magicSpendAddress } from "./constants";
import { myNFTABI, myNFTAddress } from "@/ABIs/myNFT";
import { isValidAAEntrypoint } from "@coinbase/onchainkit/wallet";
import { isWalletASmartWallet } from "@coinbase/onchainkit/wallet";
import type { IsValidAAEntrypointOptions } from "@coinbase/onchainkit/wallet";
import type { IsWalletASmartWalletOptions } from "@coinbase/onchainkit/wallet";

export async function willSponsor({
  chainId,
  entrypoint,
  userOp,
}: {
  chainId: number;
  entrypoint: string;
  userOp: UserOperation<"v0.6">;
}) {
  // check chain id
  if (chainId !== baseSepolia.id) return false;

  // check entrypoint
  // not strictly needed given below check on implementation address, but leaving as example
  if (!isValidAAEntrypoint({ entrypoint } as IsValidAAEntrypointOptions))
    return false;

  try {
    // check the userOp.sender is a proxy with the expected bytecode
    // check that userOp.sender proxies to expected implementation
    if (
      !(await isWalletASmartWallet({
        client,
        userOp,
      } as IsWalletASmartWalletOptions))
    )
      return false;

    // check that userOp.callData is making a call we want to sponsor
    const calldata = decodeFunctionData({
      abi: coinbaseSmartWalletABI,
      data: userOp.callData,
    });

    // keys.coinbase.com always uses executeBatch
    if (calldata.functionName !== "executeBatch") return false;
    if (!calldata.args || calldata.args.length == 0) return false;

    const calls = calldata.args[0] as {
      target: Address;
      value: bigint;
      data: Hex;
    }[];

    // modify if want to allow batch calls to your contract
    if (calls.length > 2) return false;

    let callToCheckIndex = 0;
    if (calls.length > 1) {
      // if there is more than one call, check if the first is a magic spend call
      if (calls[0].target.toLowerCase() !== magicSpendAddress.toLowerCase())
        return false;
      callToCheckIndex = 1;
    }

    if (
      calls[callToCheckIndex].target.toLowerCase() !==
      myNFTAddress.toLowerCase()
    )
      return false;

    const innerCalldata = decodeFunctionData({
      abi: myNFTABI,
      data: calls[callToCheckIndex].data,
    });

    if (innerCalldata.functionName !== "safeMint") return false;

    return true;
  } catch (e) {
    console.error(`willSponsor check failed: ${e}`);
    return false;
  }
}
