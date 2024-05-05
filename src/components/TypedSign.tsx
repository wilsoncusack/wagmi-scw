'use client'

import { useCallback, useEffect, useMemo, useState } from "react";
import { Address, Hex } from "viem";
import { useAccount, usePublicClient, useSignMessage, useSignTypedData } from "wagmi";
import { SiweMessage } from "siwe";

export const domain = {
  name: 'Ether Mail',
  version: '1',
  chainId: 1,
  verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
} as const
 
export const types = {
  Person: [
    { name: 'name', type: 'string' },
    { name: 'wallet', type: 'address' },
  ],
  Mail: [
    { name: 'from', type: 'Person' },
    { name: 'to', type: 'Person' },
    { name: 'contents', type: 'string' },
  ],
} as const

export function TypedSign() {
  const account = useAccount()
  const client = usePublicClient()
  const [signature, setSignature] = useState<Hex | undefined>(undefined)
  const {signTypedData} = useSignTypedData({mutation: {onSuccess: (sig) => setSignature(sig)}});
  const message = {
    from: {
      name: 'Cow',
      wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826' as Address,
    },
    to: {
      name: 'Bob',
      wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB' as Address,
    },
    contents: 'Hello, Bob!',
  };

  const [valid, setValid] = useState<boolean | undefined>(undefined)

  const checkValid = useCallback(async () =>{
    if (!signature || !account.address) return

    client.verifyTypedData({
      address: account.address,
      types,
      domain,
      primaryType: 'Mail',
      message,
      signature,
    }).then((v) => setValid(v))
  }, [signature, account])

  useEffect(() => {
    checkValid()
  }, [signature, account])

  return(
    <div>
      <h2>Sign Typed Data</h2>
      <button onClick={() => signTypedData({domain, types, message, primaryType: 'Mail'})}>
        Sign
      </button>
      <p>{}</p>
      {signature && <p>Signature: {signature}</p>}
      {valid != undefined && <p> Is valid: {valid.toString()} </p>}
    </div>
  )
}