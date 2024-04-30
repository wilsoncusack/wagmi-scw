import { SendCallsParameters, WriteContractsParameters } from "viem/experimental";
import { useEIP5792WalletClient } from "./useEIP5792WalletClient";
import { useAccount } from "wagmi";

export function useWriteContracts(parameters: Omit<WriteContractsParameters, 'account'>) {
  const { data: walletClient } = useEIP5792WalletClient()

  if (!walletClient) {
    throw new Error('Wallet client not found')
  }

  return walletClient.writeContracts({account: walletClient.account, contracts: parameters.contracts})
}