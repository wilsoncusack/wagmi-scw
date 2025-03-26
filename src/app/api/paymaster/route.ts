import { paymasterClient, bundlerClient } from "../config";
import { willSponsor } from "../utils";

export async function POST(r: Request) {
  const req = await r.json();
  const method = req.method;
  const [userOp, entrypoint, chainId] = req.params;

  const sponsorable = await willSponsor({
    chainId: parseInt(chainId),
    entrypoint,
    userOp,
  });
  if (!sponsorable) {
    return Response.json({ error: "Not a sponsorable operation" });
  }

  if (method === "pm_getPaymasterStubData") {
    const result = await paymasterClient.getPaymasterStubData({
      callData: userOp.callData,
      chainId: chainId,
      entryPointAddress: entrypoint,
      nonce: userOp.nonce,
      sender: userOp.sender,
    });
    return Response.json({ result });
  } else if (method === "pm_getPaymasterData") {
    const result = await paymasterClient.getPaymasterData({
      callData: userOp.callData,
      chainId: chainId,
      entryPointAddress: entrypoint,
      nonce: userOp.nonce,
      sender: userOp.sender,
    });
    return Response.json({ result });
  }
  return Response.json({ error: "Method not found" });
}
