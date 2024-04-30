'use client'

import { useEffect, useState } from 'react'
import { WalletCapabilities } from 'viem'
import { useAccount, useConnect, useDisconnect, useWalletClient } from 'wagmi'
import { walletActionsEip5792 } from 'viem/experimental'
import useWalletCapabilities from '@/hooks/useWalletCapabilities'

function App() {
  const account = useAccount()
  const { connectors, connect, status, error } = useConnect()
  const { disconnect } = useDisconnect()
  const { capabilities } = useWalletCapabilities({ chainId: account.chainId })

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
    </>
  )
}

export default App
