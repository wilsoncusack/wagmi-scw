import { AllowanceTransfer, MaxAllowanceTransferAmount, PERMIT2_ADDRESS, PermitSingle } from '@uniswap/permit2-sdk'
import ms from 'ms'
import { useMemo, useState } from 'react'
import { Address, Hex, decodeAbiParameters } from 'viem'
import { useAccount, useSignTypedData } from 'wagmi'
import { useWriteContracts } from 'wagmi/experimental'

const abi = [{
  type: 'function',
  inputs: [
    { name: 'owner', internalType: 'address', type: 'address' },
    {
      name: 'permitSingle',
      internalType: 'struct IAllowanceTransfer.PermitSingle',
      type: 'tuple',
      components: [
        {
          name: 'details',
          internalType: 'struct IAllowanceTransfer.PermitDetails',
          type: 'tuple',
          components: [
            { name: 'token', internalType: 'address', type: 'address' },
            { name: 'amount', internalType: 'uint160', type: 'uint160' },
            { name: 'expiration', internalType: 'uint48', type: 'uint48' },
            { name: 'nonce', internalType: 'uint48', type: 'uint48' },
          ],
        },
        { name: 'spender', internalType: 'address', type: 'address' },
        { name: 'sigDeadline', internalType: 'uint256', type: 'uint256' },
      ],
    },
    { name: 'signature', internalType: 'bytes', type: 'bytes' },
  ],
  name: 'permit',
  outputs: [],
  stateMutability: 'nonpayable',
}] as const

interface Permit extends PermitSingle {
  sigDeadline: number
}

export interface PermitSignature extends Permit {
  signature: string
}

const PERMIT_EXPIRATION = ms(`30d`)
const PERMIT_SIG_EXPIRATION = ms(`30m`)

// Example of parsing ERC6492 signatures for onchain use
export function Permit2({chainId}: {chainId: number}) {
  const dummyToken = '0x0000000000000000000000000000000000000B0b'
  const dummySpender = '0x0000000000000000000000000000000000000B0b'
  const permit: Permit = useMemo(() => {
    return {
      details: {
        token: dummyToken,
        amount: BigInt(MaxAllowanceTransferAmount.toString()),
        expiration: toDeadline(PERMIT_EXPIRATION),
        nonce: 0, // note only works once per account right now, would need to make dynamic 
      },
      spender: dummySpender,
      sigDeadline: toDeadline(PERMIT_SIG_EXPIRATION),
    }
  }, [])
  const { domain, types, values } = useMemo(() => {
    return AllowanceTransfer.getPermitData(permit, PERMIT2_ADDRESS, chainId)
  }, [permit, chainId])
  const [signature, setSignature] = useState<Hex | undefined>(undefined)
  const {signTypedData} = useSignTypedData({mutation: {onSuccess: (sig) => setSignature(sig)}});
  const parsedSignature = useMemo(() => {
    if (!signature) return 
    return parseERC6492Signature(signature).signature
  }, [signature])
  const { writeContracts } = useWriteContracts(); 
  const account = useAccount();

  return(
    <div>
      <h2>Permit2 Example</h2>
      <p>Code sample for parsing ERC-6492 signatures for onchain use. Nonce is set to 0 so will work once per address</p>
      {!signature && <button onClick={() => {
        signTypedData({domain: domain as Record<string, unknown>, types, message: values as any, primaryType: 'PermitSingle'})}
      }
        >
        Sign Permit
      </button>}
      {signature && <button onClick={() => {
        writeContracts({
          contracts: [{
            address: '0x000000000022D473030F116dDEE9F6B43aC78BA3',
          abi, 
          functionName: 'permit', 
          args: [account.address, values, parsedSignature]
        }]})
      }}> Submit Onchain </button>}
    </div>
  )
}

function toDeadline(expiration: number): number {
  return Math.floor((Date.now() + expiration) / 1000)
}

/// delete for viem 

function isERC6492Signature(signature: Hex) : boolean {
  const ERC6492_DETECTION_SUFFIX = "6492649264926492649264926492649264926492649264926492649264926492";
  return signature.slice(signature.length - 64, signature.length) == ERC6492_DETECTION_SUFFIX;
}
 
export type ParseERC6492ReturnType = {
  signature: Hex;
  factory?: Address;
  factoryCalldata?: Hex;
};
 
// NOTE: Works with non-ERC-6492 siganture
// parseERC6492Signature(eoaSignature).sigToValidate == eoaSignature  
// parseERC6492Signature(deployedSmartAccountSignature).sigToValidate == deployedSmartAccountSignature
function parseERC6492Signature(signature_: Hex): ParseERC6492ReturnType {
  if (!isERC6492Signature(signature_)) return { signature: signature_ };
 
  const [factory, factoryCalldata, signature] = decodeAbiParameters(
    [
      { type: "address" },
      { type: "bytes" },
      { type: "bytes" },
    ],
    signature_,
  );
  return { signature, factory, factoryCalldata };
}