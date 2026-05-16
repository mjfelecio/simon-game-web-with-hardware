import { useEffect, useState } from "react";

interface UseDismissibleSignalOptions {
  /**
   * A domain-driven signal that determines whether the condition is active.
   * Examples:
   * - searchState === "no-driver-available"
   * - isErrorWhileStartingSearch
   */
  active: boolean;

  /**
   * If true, the signal can only be dismissed once for the lifetime
   * of the component. Subsequent activations will not re-show it.
   *
   * Useful for:
   * - One-time error acknowledgements
   * - Non-repeatable warnings
   *
   * Default: false
   */
  dismissOnce?: boolean;
}

/**
 * useDismissibleSignal
 *
 * A small UI state helper for "sticky" domain signals that must:
 * - appear when a condition becomes active
 * - be dismissible by the user
 * - optionally reappear when the condition happens again
 *
 * This hook intentionally separates:
 * - **domain truth** (`active`)
 * - **user acknowledgment** (`dismissed`)
 *
 * It prevents screens from manually syncing `useState` with domain state
 * and keeps dismissal/reset behavior consistent and explicit.
 *
 * @example
 * const noDriver = useDismissibleSignal({
 *   active: searchState === "no-driver-available",
 * });
 *
 * if (noDriver.isVisible) {
 *   return <NoDriverModal onClose={noDriver.dismiss} />;
 * }
 */
export function useDismissibleSignal({ active, dismissOnce = false }: UseDismissibleSignalOptions) {
  const [dismissed, setDismissed] = useState(false);

  /**
   * When the domain signal becomes active again,
   * reset dismissal unless this signal is configured
   * to be dismissible only once.
   */
  useEffect(() => {
    if (!dismissOnce && active) {
      setDismissed(false);
    }
  }, [active, dismissOnce]);

  return {
    /**
     * Whether the UI tied to this signal should currently be visible.
     */
    isVisible: active && !dismissed,

    /**
     * Marks the signal as acknowledged by the user,
     * hiding the associated UI until reset conditions are met.
     */
    dismiss: () => setDismissed(true),
  };
}
