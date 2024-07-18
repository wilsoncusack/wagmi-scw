import { useCallback, useEffect, useMemo, useState } from "react";
import type { Hex } from "viem";
import { useAccount, useConnect, usePublicClient, useSignMessage } from "wagmi";
import { SiweMessage } from "siwe";
import { cbWalletConnector } from "@/wagmi";

export function ConnectAndSIWE() {
  const { connect, status, error } = useConnect({
    mutation: {
      onSuccess: (data) => {
        const address = data.accounts[0];
        const chainId = data.chainId;
        const m = new SiweMessage({
          domain: document.location.host,
          address,
          chainId,
          uri: document.location.origin,
          version: "1",
          statement: "Smart Wallet SIWE Example",
          nonce: "12345678",
        });
        setMessage(m);
        signMessage({ message: m.prepareMessage() });
      },
    },
  });
  const account = useAccount();
  const client = usePublicClient();
  const [signature, setSignature] = useState<Hex | undefined>(undefined);
  const { signMessage } = useSignMessage({
    mutation: { onSuccess: (sig) => setSignature(sig) },
  });
  const [message, setMessage] = useState<SiweMessage | undefined>(undefined);
  // const message = useMemo(() => {
  //   return new SiweMessage({
  //     domain: document.location.host,
  //     address: account.address,
  //     chainId: account.chainId,
  //     uri: document.location.origin,
  //     version: "1",
  //     statement: "Smart Wallet SIWE Example",
  //     nonce: "12345678",
  //   });
  // }, []);

  const [valid, setValid] = useState<boolean | undefined>(undefined);

  const checkValid = useCallback(async () => {
    if (!signature || !account.address || !client || !message) return;

    client
      .verifyMessage({
        address: account.address,
        message: message.prepareMessage(),
        signature,
      })
      .then((v) => setValid(v));
  }, [signature, account]);

  useEffect(() => {
    checkValid();
  }, [signature, account]);

  useEffect(() => {});

  return (
    <div>
      <button onClick={() => connect({ connector: cbWalletConnector })}>
        Connect + SIWE
      </button>
      <p>{}</p>
      {valid != undefined && <p> Is valid: {valid.toString()} </p>}
    </div>
  );
}
