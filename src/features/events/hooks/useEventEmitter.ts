// ---------------------------------------------------------------------------
// Typed emitter hook — wraps react-bus with full type safety

import { useCallback, useMemo } from "react";
import { useBus } from "react-bus";
import type { AppEventName, AppEvents } from "../appEvents";

// ---------------------------------------------------------------------------
export default function useEventEmitter() {
  const bus = useBus();

  const emit = useCallback(
    <K extends AppEventName>(event: K, payload: AppEvents[K]) => {
      bus.emit(event, payload);
    },
    [bus],
  );

  return useMemo(() => ({ emit }), [emit]);
}