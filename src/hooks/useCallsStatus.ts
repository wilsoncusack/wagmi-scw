import { useQuery } from "@tanstack/react-query"
import { useEIP5792WalletClient } from "./useEIP5792WalletClient"
 
export function useCallsStatus({ id }: { id?: string }) {
  const walletClient = useEIP5792WalletClient()
 
  const { data, isLoading } = useQuery({
    queryKey: ["transaction", id],
    queryFn: async () => walletClient?.getCallsStatus({ id: id as string }),
    enabled: !!walletClient && !!id,
    // Poll every second until the calls are confirmed
    refetchInterval: (data) =>
      data.state.data?.status === "CONFIRMED" ? false : 1000,
  })
 
  return { data, isLoading }
}