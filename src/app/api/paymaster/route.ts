import { ENTRYPOINT_ADDRESS_V06 } from "permissionless";
import { paymasterActionsEip7677 } from "permissionless/experimental";
import { createClient, http } from "viem";
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

export const paymasterClient = createClient({
  chain: baseSepolia,
  transport: http(paymasterService),
}).extend(paymasterActionsEip7677({ entryPoint: ENTRYPOINT_ADDRESS_V06 }));

export async function POST(r: Request) {
  const req = await r.json();
  const method = req.method;
  const [userOp, _, chainId] = req.params;

  if (method === "pm_getPaymasterStubData") {
    const res = await paymasterClient.getPaymasterStubData({
      userOperation: userOp,
      chain: chainId,
    });

    return Response.json(res);
  } else if (method === "pm_getPaymasterData") {
    return Response.json(
      await paymasterClient.getPaymasterData({
        userOperation: userOp,
        chain: chainId,
      }),
    );
  }
  return Response.json({ error: "Method not found" });
}
