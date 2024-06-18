import { ResolvedRegister, type Config } from "wagmi";
import {
  UseSendCallsParameters,
  UseSendCallsReturnType,
  useWriteContracts,
  useCallsStatus,
} from "wagmi/experimental";
import { useMemo, useState } from "react";
import { WriteContractsErrorType } from "viem/experimental";
import { TransactionExecutionError } from "viem";
import { CallStatus } from "./CallStatus";

export type TransactButtonProps<
  config extends Config = Config,
  context = unknown,
> = UseSendCallsReturnType<config, context>["sendCalls"]["arguments"] & {
  mutation?: UseSendCallsParameters<config, context>["mutation"];
} & { text: string };

export function TransactButton<
  config extends Config = ResolvedRegister["config"],
  context = unknown,
>({ mutation, text, ...rest }: TransactButtonProps<config, context>) {
  const [error, setError] = useState<string | undefined>(undefined);
  const [id, setId] = useState<string | undefined>(undefined);
  const { writeContracts, status } = useWriteContracts({
    mutation: {
      ...mutation,
      onError: (e) => {
        if (
          (e as TransactionExecutionError).cause.name ==
          "UserRejectedRequestError"
        ) {
          setError("User rejected request");
        } else {
          setError(e.message);
        }
        mutation.onError(error);
      },
      onSuccess: (id) => {
        console.log("id", id);
        setId(id);
        mutation.onSuccess(id);
      },
    },
  });

  const displayText = useMemo(() => {
    if (status == "pending") {
      setError(undefined);
      setId(undefined);
      return "Confirm in popup";
    }
    return text;
  }, [status, error]);

  return (
    <>
      <button
        onClick={() => writeContracts(rest)}
        disabled={status == "pending"}
      >
        {displayText}
      </button>
      {!id && error && <p>error: {error}</p>}
      {id && <CallStatus id={id} />}
    </>
  );
}
