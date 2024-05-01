import { WriteContractsParameters} from "viem/experimental";
import { useEIP5792WalletClient } from "./useEIP5792WalletClient";
import { useState } from "react";

export function useWriteContracts() {
  const walletClient = useEIP5792WalletClient()
  const [id, setId] = useState<string | undefined>(undefined);

  const writeContracts = (parameters: Omit<WriteContractsParameters, 'account' | 'chain'>) => {
    if (!walletClient || !walletClient.account || !walletClient.chain) {
      throw new Error('Wallet client not available')
    }
    walletClient.writeContracts({
      account: walletClient.account,
      chain: walletClient.chain, 
      ...parameters,
    }).then((id) => {
      setId(id)
    })
  }

  return {id, writeContracts}
}