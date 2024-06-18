import { useCallsStatus, useShowCallsStatus } from "wagmi/experimental";

export function CallStatus({ id }: { id: string }) {
  const { data: callsStatus } = useCallsStatus({
    id,
    query: {
      refetchInterval: (data) =>
        data.state.data?.status === "CONFIRMED" ? false : 1000,
    },
  });
  const { showCallsStatus } = useShowCallsStatus();

  return (
    <div>
      <p>Status: {callsStatus?.status || "loading"}</p>
      <button onClick={() => showCallsStatus({ id })}>View in Wallet</button>
    </div>
  );
}
