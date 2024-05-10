import { myNFTABI, myNFTAddress } from "@/ABIs/myNFT";
import { ENTRYPOINT_ADDRESS_V06, UserOperation } from "permissionless";
import { paymasterActionsEip7677 } from "permissionless/experimental";
import {
  Address,
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
  console.log(0);
  if (chainId !== baseSepolia.id) return false;
  console.log(0.1);
  if (entrypoint.toLowerCase() !== ENTRYPOINT_ADDRESS_V06.toLowerCase())
    return false;
  console.log(0.2);
  try {
    const code = await client.getBytecode({ address: userOp.sender });
    if (code != coinbaseSmartWalletProxyBytecode) return false;
    console.log(0.3);

    const implementation = await client.request<{
      Parameters: [Address, Hex];
      ReturnType: Hex;
    }>({ method: "eth_getStorageAt", params: [userOp.sender, ERC1967_IMPLENENTATION_SLOT] });
    console.log("implementation", implementation);
    const implementationAddress = decodeAbiParameters(
      [{ type: "address" }],
      implementation,
    )[0];
    if (implementationAddress != coinbaseSmartWalletV1Implementation)
      return false;
    console.log(0.4);

    const calldata = decodeFunctionData({
      abi: coinbaseSmartWalletABI,
      data: userOp.callData,
    });
    console.log(calldata.args);

    // keys.coinbase.com always uses executeBatch
    console.log(1);
    if (calldata.functionName !== "executeBatch") return false;
    console.log(2);
    if (!calldata.args || calldata.args.length == 0) return false;

    const calls = calldata.args[0] as {
      target: Address;
      value: bigint;
      data: Hex;
    }[];
    console.log(3);
    if (calls.length > 2) return false;

    console.log(4);
    let callToCheckIndex = 0;
    if (calls.length == 2) {
      // if there are two calls, the first should be Magic Spend
      if (calls[0].target.toLowerCase() !== MAGIC_SPEND_ADDRESS.toLowerCase())
        return false;
      callToCheckIndex = 1;
    }
    console.log(5);
    console.log(calls[callToCheckIndex]);
    if (
      calls[callToCheckIndex].target.toLowerCase() !==
      myNFTAddress.toLowerCase()
    )
      return false;
    console.log(6);
    const innerCalldata = decodeFunctionData({
      abi: myNFTABI,
      data: calls[callToCheckIndex].data,
    });
    console.log(7);
    if (innerCalldata.functionName !== "safeMint") return false;

    return true;
  } catch (e) {
    console.error(`willSponsor check failed: ${e}`);
    return false;
  }
}
