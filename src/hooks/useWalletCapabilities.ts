import { useEffect, useState } from 'react'
import { WalletCapabilities } from 'viem'
import { useWalletClient } from 'wagmi'
import { walletActionsEip5792 } from 'viem/experimental'

function useWalletCapabilities({chainId} : {chainId?: number}) {
  const { data: walletClient } = useWalletClient()
  const [capabilities, setCapabilities] = useState<{ [chainId: number]: WalletCapabilities } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (walletClient) {
      const client = walletClient.extend(walletActionsEip5792())
      client.getCapabilities().then((capabilities) => {
        setCapabilities(capabilities)
        setLoading(false)
      })
    } else {
      setLoading(false)
    }
  }, [walletClient])

  return { capabilities: capabilities && chainId ? capabilities[chainId] : capabilities, loading }
}

export default useWalletCapabilities