import { useAccount } from "wagmi";
import { useCapabilities } from "wagmi/experimental";


export function Capabilities() {
  const account = useAccount()
  const {data: capabilities} = useCapabilities({ chainId: account.chainId })

  return (
    <p>
      capabilities: {capabilities && JSON.stringify(capabilities)}
    </p>
  )
}