import { useListener } from "react-bus";
import type { AppEventName, AppEvents } from "../appEvents";

/** Typed listener hook — wraps react-bus with full type safety + auto-cleanup */
export default function useEventListener<K extends AppEventName>(
  event: K,
  callback: (payload: AppEvents[K]) => void,
) {
  // react-bus's useListener expects (eventName, handler)
  // We cast because react-bus doesn't know about our AppEvents contract
  useListener(event, callback as (payload: unknown) => void);
}
