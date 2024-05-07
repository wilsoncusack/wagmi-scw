import {
  AllowanceTransfer,
  MaxAllowanceTransferAmount,
  PERMIT2_ADDRESS,
  type PermitSingle,
} from "@uniswap/permit2-sdk";
import ms from "ms";
import { useMemo, useState } from "react";
import type { Hex } from "viem";
import { parseErc6492Signature } from "viem/experimental";
import { useAccount, useReadContract, useSignTypedData } from "wagmi";
import { useWriteContracts } from "wagmi/experimental";

const abi = [
  {
    type: "function",
    inputs: [
      { name: "owner", internalType: "address", type: "address" },
      {
        name: "permitSingle",
        internalType: "struct IAllowanceTransfer.PermitSingle",
        type: "tuple",
        components: [
          {
            name: "details",
            internalType: "struct IAllowanceTransfer.PermitDetails",
            type: "tuple",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "amount", internalType: "uint160", type: "uint160" },
              { name: "expiration", internalType: "uint48", type: "uint48" },
              { name: "nonce", internalType: "uint48", type: "uint48" },
            ],
          },
          { name: "spender", internalType: "address", type: "address" },
          { name: "sigDeadline", internalType: "uint256", type: "uint256" },
        ],
      },
      { name: "signature", internalType: "bytes", type: "bytes" },
    ],
    name: "permit",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "", internalType: "address", type: "address" },
      { name: "", internalType: "address", type: "address" },
      { name: "", internalType: "address", type: "address" },
    ],
    name: "allowance",
    outputs: [
      { name: "amount", internalType: "uint160", type: "uint160" },
      { name: "expiration", internalType: "uint48", type: "uint48" },
      { name: "nonce", internalType: "uint48", type: "uint48" },
    ],
    stateMutability: "view",
  },
] as const;

const allowanceTransferContract = "0x000000000022D473030F116dDEE9F6B43aC78BA3";

interface Permit extends PermitSingle {
  sigDeadline: number;
}

export interface PermitSignature extends Permit {
  signature: string;
}

const PERMIT_EXPIRATION = ms(`30d`);
const PERMIT_SIG_EXPIRATION = ms(`30m`);

// Example of parsing ERC6492 signatures for onchain use
export function Permit2({ chainId }: { chainId: number }) {
  const dummyToken = "0x0000000000000000000000000000000000000B0b";
  const dummySpender = "0x0000000000000000000000000000000000000B0b";
  const account = useAccount();

  const { data: allowance } = useReadContract({
    abi,
    address: allowanceTransferContract,
    functionName: "allowance",
    args: [account.address!, dummyToken, dummySpender],
  });

  const permit: Permit | undefined = useMemo(() => {
    if (!allowance) return;

    return {
      details: {
        token: dummyToken,
        amount: BigInt(MaxAllowanceTransferAmount.toString()),
        expiration: toDeadline(PERMIT_EXPIRATION),
        nonce: allowance[2], // note only works once per account right now, would need to make dynamic
      },
      spender: dummySpender,
      sigDeadline: toDeadline(PERMIT_SIG_EXPIRATION),
    };
  }, [allowance]);

  const permitData = useMemo(() => {
    if (!permit) return;
    return AllowanceTransfer.getPermitData(permit, PERMIT2_ADDRESS, chainId);
  }, [permit, chainId]);

  const [signature, setSignature] = useState<Hex | undefined>(undefined);
  const { signTypedData } = useSignTypedData({
    mutation: { onSuccess: (sig) => setSignature(sig) },
  });

  /// THIS IS THE KEY PART ///
  const parsedSignature = useMemo(() => {
    if (!signature) return;

    return parseErc6492Signature(signature).signature;
  }, [signature]);

  const { writeContracts } = useWriteContracts();

  return (
    <div>
      <h2>Permit2 Example</h2>
      <p>Code sample for parsing ERC-6492 signatures for onchain use </p>
      {
        <button
          onClick={() => {
            if (!permitData) return;

            signTypedData({
              domain: permitData.domain as Record<string, unknown>,
              types: permitData?.types,
              message: permitData.values as any,
              primaryType: "PermitSingle",
            });
          }}
        >
          Sign Permit
        </button>
      }
      {signature && (
        <button
          onClick={() => {
            writeContracts({
              contracts: [
                {
                  address: "0x000000000022D473030F116dDEE9F6B43aC78BA3",
                  abi,
                  functionName: "permit",
                  args: [account.address, permitData!.values, parsedSignature],
                },
              ],
            });
          }}
        >
          Submit Onchain
        </button>
      )}
    </div>
  );
}

function toDeadline(expiration: number): number {
  return Math.floor((Date.now() + expiration) / 1000);
}
