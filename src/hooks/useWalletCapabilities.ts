import { useEffect, useState } from 'react'
import { WalletCapabilities } from 'viem'
import { useWalletClient } from 'wagmi'
import { walletActionsEip5792 } from 'viem/experimental'
import { useEIP5792WalletClient } from './useEIP5792WalletClient'

function useWalletCapabilities({chainId} : {chainId?: number}) {
  const { data: walletClient } = useEIP5792WalletClient()
  const [capabilities, setCapabilities] = useState<{ [chainId: number]: WalletCapabilities }>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (walletClient) {
      walletClient.getCapabilities()
      .then((capabilities) => {
        setCapabilities(capabilities)
        setLoading(false)
      })
      .catch((e) => {
        setLoading(false)
      })
    } 
  }, [walletClient])

  return { capabilities: capabilities && chainId ? capabilities[chainId] : capabilities, loading }
}

export default useWalletCapabilities