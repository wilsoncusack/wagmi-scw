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

const paymasterClient = createClient({
  chain: baseSepolia,
  transport: http(paymasterService),
}).extend(paymasterActionsEip7677({ entryPoint: ENTRYPOINT_ADDRESS_V06 }));

export async function POST(r: Request) {
  const req = await r.json();
  const method = req.method;
  const [userOp, entrypoint, chainId] = req.params;
  console.log(req);
  if (chainId !== baseSepolia.id) {
    Response.json({ error: "Chain ID not supported" });
  }

  if (method === "pm_getPaymasterStubData") {
    const result = await paymasterClient.getPaymasterStubData({
      userOperation: userOp,
    });
    // console.log(res);
    return Response.json({result});
    // const data = {
    //   id: 1,
    //   jsonrpc: '2.0',
    //   method: 'pm_getPaymasterStubData',
    //   params: [userOp, entrypoint, chainId],
    // }
    // const res = await fetch(paymasterService, { // URL from your paymaster service provider
    //   headers: {
    //     'Content-Type': 'application/json'
    //   },
    //   method: 'POST',
    //   body: JSON.stringify(data)
    // })
    // const q = await res.json();
    // console.log(q)
    // return Response.json(q)
  } else if (method === "pm_getPaymasterData") {
    console.log("in pm_getPaymasterData");
    const result = await paymasterClient.getPaymasterData({
      userOperation: userOp,
    });
    // console.log(result);
    return Response.json({result});
    // const data = {
    //   id: 1,
    //   jsonrpc: '2.0',
    //   method: 'pm_getPaymasterData',
    //   params: [userOp, entrypoint, chainId],
    // }
    // const res = await fetch(paymasterService, { // URL from your paymaster service provider
    //   headers: {
    //     'Content-Type': 'application/json'
    //   },
    //   method: 'POST',
    //   body: JSON.stringify(data)
    // })
    // return Response.json(await res.json())
  }
  return Response.json({ error: "Method not found" });
}
