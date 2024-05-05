import { useAccount } from "wagmi";
import { useWriteContracts } from "wagmi/experimental"
import { useState } from 'react'
import { CallStatus } from "./CallStatus";

const abi = [
	{
		stateMutability: "nonpayable",
		type: "function",
		inputs: [{ name: "to", type: "address" }],
		name: "safeMint",
		outputs: [],
	},
] as const;

// example batch transaction, making two mint NFT calls
export function Transact() {
  const account = useAccount()
  const [id, setId] = useState<string | undefined>(undefined)
  const { writeContracts } = useWriteContracts({mutation: {onSuccess: (id) => setId(id)}})

  return (
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
      {id && <CallStatus id={id} />}
    </div>
  </div>
  )
}