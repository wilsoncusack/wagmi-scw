'use client'

import { useEffect, useState } from 'react'
import { WalletCapabilities } from 'viem'
import { useAccount, useConnect, useDisconnect, useWalletClient } from 'wagmi'
import { walletActionsEip5792 } from 'viem/experimental'
import useWalletCapabilities from '@/hooks/useWalletCapabilities'
import { useWriteContracts } from '@/hooks/useWriteContracts'
import { useEIP5792WalletClient } from '@/hooks/useEIP5792WalletClient'


const abi = [
	{
		stateMutability: "nonpayable",
		type: "function",
		inputs: [{ name: "to", type: "address" }],
		name: "safeMint",
		outputs: [],
	},
];

function App() {
  const account = useAccount()
  const { connectors, connect, status, error } = useConnect()
  const { disconnect } = useDisconnect()
  const { capabilities } = useWalletCapabilities({ chainId: account.chainId })
  const { data: walletClient } = useEIP5792WalletClient()

  return (
    <>
      <div>
        <h2>Account</h2>

        <div>
          status: {account.status}
          <br />
          capabilities: {capabilities && JSON.stringify(capabilities)}
          <br />
          addresses: {JSON.stringify(account.addresses)}
          <br />
          chainId: {account.chainId}
        </div>

        {account.status === 'connected' && (
          <button type="button" onClick={() => disconnect()}>
            Disconnect
          </button>
        )}
      </div>

      <div>
        <h2>Connect</h2>
        {connectors.map((connector) => (
          <button
            key={connector.uid}
            onClick={() => connect({ connector })}
            type="button"
          >
            {connector.name}
          </button>
        ))}
        <div>{status}</div>
        <div>{error?.message}</div>
      </div>
      { walletClient && account.address && 
      <div> 
        <h2>Transact</h2>
        <div>
          <button onClick={() => walletClient?.writeContracts({
            contracts: [{
              address: "0x119Ea671030FBf79AB93b436D2E20af6ea469a19",
              abi,
              functionName: "safeMint",
              args: [account.address],
            }, {
              address: "0x119Ea671030FBf79AB93b436D2E20af6ea469a19",
              abi,
              functionName: "safeMint",
              args: [account.address],
            }],
            // TODO: better types on useEIP5792WalletClient so these are derived 
            account: walletClient.account,
            chain: walletClient.chain
          })}>Mint</button>
        </div>
      </div>
      }
    </>
  )
}

export default App
