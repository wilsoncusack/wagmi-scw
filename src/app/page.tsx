'use client'

import { useAccount, useConnect, useDisconnect } from 'wagmi'
import useWalletCapabilities from '@/hooks/useWalletCapabilities'
import { useWriteContracts } from 'wagmi/experimental'
import { useCallsStatus } from '@/hooks/useCallsStatus'
import { useState } from 'react'

const abi = [
	{
		stateMutability: "nonpayable",
		type: "function",
		inputs: [{ name: "to", type: "address" }],
		name: "safeMint",
		outputs: [],
	},
] as const;

function App() {
  const account = useAccount()
  const { connectors, connect, status, error } = useConnect()
  const { disconnect } = useDisconnect()
  const { capabilities } = useWalletCapabilities({ chainId: account.chainId })
  const [id, setId] = useState<string | undefined>(undefined)
  const { writeContracts } = useWriteContracts({mutation: {onSuccess: (id) => setId(id)}})
  const {data: callsStatus} = useCallsStatus({id})

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
      { account.address && 
      <div> 
        <h2>Transact</h2>
        <div>
          <button onClick={() => {
          writeContracts({
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
          
          })
          }}>Mint</button>
          {id && <div> ID: {id}</div>}
          {callsStatus && <div> Status: {callsStatus.status}</div>}
        </div>
      </div>
      }
    </>
  )
}

export default App
