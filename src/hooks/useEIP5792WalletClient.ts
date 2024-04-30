import { useEffect, useState } from 'react'
import { WalletClient } from 'viem'
import { type Config, type UseWalletClientParameters, type UseWalletClientReturnType, useWalletClient, ResolvedRegister } from 'wagmi'
import { WalletActionsEip5792, walletActionsEip5792 } from 'viem/experimental'
import { GetWalletClientData } from 'wagmi/query'

type EIP5792WalletClient = WalletClient & WalletActionsEip5792;

export function useEIP5792WalletClient<
config extends Config = ResolvedRegister['config'],
chainId extends config['chains'][number]['id'] = config['chains'][number]['id'],
selectData = GetWalletClientData<config, chainId> & WalletActionsEip5792,
>(
parameters: UseWalletClientParameters<config, chainId, selectData> = {},
): UseWalletClientReturnType<config, chainId, selectData> {
  const {data: originalWalletClient, ...rest } = useWalletClient(parameters)
  const [walletClient, setWalletClient] = useState<EIP5792WalletClient | undefined>(undefined);
  
  useEffect(() => {
    if (originalWalletClient) {
      const client = (originalWalletClient as any).extend(walletActionsEip5792());
      setWalletClient(client)
    }
  }, [originalWalletClient])

  return {data: walletClient , ...rest} as any;
}