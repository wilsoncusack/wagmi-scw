import { myNFTABI, myNFTAddress } from "@/ABIs/myNFT";
import { ENTRYPOINT_ADDRESS_V06, UserOperation } from "permissionless";
import { paymasterActionsEip7677 } from "permissionless/experimental";
import {
  Address,
  BlockTag,
  Hex,
  createClient,
  createPublicClient,
  decodeAbiParameters,
  decodeFunctionData,
  http,
} from "viem";
import { baseSepolia } from "viem/chains";

const coinbaseSmartWalletABI = [
  {
    type: "function",
    name: "executeBatch",
    inputs: [
      {
        name: "calls",
        type: "tuple[]",
        internalType: "struct CoinbaseSmartWallet.Call[]",
        components: [
          {
            name: "target",
            type: "address",
            internalType: "address",
          },
          {
            name: "value",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "data",
            type: "bytes",
            internalType: "bytes",
          },
        ],
      },
    ],
    outputs: [],
    stateMutability: "payable",
  },
];

const paymasterService = process.env.PAYMASTER_SERVICE_URL!;
const coinbaseSmartWalletProxyBytecode =
  "0x363d3d373d3d363d7f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc545af43d6000803e6038573d6000fd5b3d6000f3";
const coinbaseSmartWalletV1Implementation =
  "0x000100abaad02f1cfC8Bbe32bD5a564817339E72";
const MAGIC_SPEND_ADDRESS = "0x011A61C07DbF256A68256B1cB51A5e246730aB92";
const ERC1967_IMPLENENTATION_SLOT =
  "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";

const client = createPublicClient({
  chain: baseSepolia,
  transport: http(),
});

const paymasterClient = createClient({
  chain: baseSepolia,
  transport: http(paymasterService),
}).extend(paymasterActionsEip7677({ entryPoint: ENTRYPOINT_ADDRESS_V06 }));

export async function POST(r: Request) {
  const req = await r.json();
  const method = req.method;
  const [userOp, entrypoint, chainId] = req.params;
  console.log(req.params);
  if (!willSponsor({ chainId: parseInt(chainId), entrypoint, userOp })) {
    return Response.json({ error: "Not a sponsorable operation" });
  }

  if (method === "pm_getPaymasterStubData") {
    const result = await paymasterClient.getPaymasterStubData({
      userOperation: userOp,
    });
    return Response.json({ result });
  } else if (method === "pm_getPaymasterData") {
    const result = await paymasterClient.getPaymasterData({
      userOperation: userOp,
    });
    return Response.json({ result });
  }
  return Response.json({ error: "Method not found" });
}

async function willSponsor({
  chainId,
  entrypoint,
  userOp,
}: { chainId: number; entrypoint: string; userOp: UserOperation<"v0.6"> }) {
  // check chain id
  if (chainId !== baseSepolia.id) return false;
  // check entrypoint
  // not strictly needed given below check on implementation address, but leaving as example
  if (entrypoint.toLowerCase() !== ENTRYPOINT_ADDRESS_V06.toLowerCase())
    return false;

  try {
    // check the userOp.sender is a proxy with the expected bytecode
    const code = await client.getBytecode({ address: userOp.sender });
    if (code != coinbaseSmartWalletProxyBytecode) return false;

    // check that userOp.sender proxies to expected implementation
    const implementation = await client.request<{
      Parameters: [Address, Hex, BlockTag];
      ReturnType: Hex;
    }>({
      method: "eth_getStorageAt",
      params: [userOp.sender, ERC1967_IMPLENENTATION_SLOT, "latest"],
    });
    const implementationAddress = decodeAbiParameters(
      [{ type: "address" }],
      implementation,
    )[0];
    if (implementationAddress != coinbaseSmartWalletV1Implementation)
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
      if (calls[0].target.toLowerCase() !== MAGIC_SPEND_ADDRESS.toLowerCase())
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
