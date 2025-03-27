import { createClient, createPublicClient, http } from "viem";
import { baseSepolia } from "viem/chains";
import { entryPoint06Address, createPaymasterClient, createBundlerClient } from "viem/account-abstraction";

export const client = createPublicClient({
  chain: baseSepolia,
  transport: http(),
});

const paymasterService = process.env.PAYMASTER_SERVICE_URL!;

export const paymasterClient = createPaymasterClient({
  transport: http(paymasterService),
});

export const bundlerClient = createBundlerClient({
  chain: baseSepolia,
  paymaster: paymasterClient, 
  transport: http(paymasterService),
})
