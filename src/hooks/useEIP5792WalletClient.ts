import { useEffect, useState } from 'react'
import { WalletClient } from 'viem'
import {useWalletClient } from 'wagmi'
import { WalletActionsEip5792, walletActionsEip5792 } from 'viem/experimental'

type EIP5792WalletClient = WalletClient & WalletActionsEip5792;

export function useEIP5792WalletClient(): EIP5792WalletClient | undefined {
  const {data: originalWalletClient } = useWalletClient()
  const [walletClient, setWalletClient] = useState<EIP5792WalletClient | undefined>(undefined);
  
  useEffect(() => {
    if (originalWalletClient) {
      setWalletClient(originalWalletClient.extend(walletActionsEip5792()))
    }
  }, [originalWalletClient])

  return walletClient;
}