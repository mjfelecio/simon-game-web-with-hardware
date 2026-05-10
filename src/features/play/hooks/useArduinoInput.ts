import type { SimonButtonType } from "@/globals/types/simon";
import { useCallback, useEffect, useRef, useState } from "react";
import { setupSerialConnection } from "simple-web-serial";

/**
 * Current state of the Arduino connection.
 */
export type ConnectionStatus = "idle" | "loading" | "connected" | "error";

const ACK_TIMEOUT_MS = 5000;
const HANDSHAKE_RETRY_DELAY_MS = 1500;
const MAX_HANDSHAKE_ATTEMPTS = 3;

/**
 * Shared serial connection instance.
 */
const connection = setupSerialConnection({
  baudRate: 9600,
});

/**
 * Valid button colors accepted from the Arduino.
 */
const VALID_INPUTS: SimonButtonType[] = ["red", "green", "blue", "yellow"];

/**
 * React hook for receiving button input from the Arduino through Web Serial.
 *
 * Workflow:
 * 1. User calls `connect()`.
 * 2. Browser prompts for serial port access.
 * 3. Frontend sends `connection-syn`.
 * 4. Arduino responds with `connection-ack`.
 * 5. Status becomes `connected`.
 * 6. Incoming `simon-input` events invoke the provided callback.
 *
 * @param onInput Callback invoked whenever a valid Simon color is received.
 */
export default function useArduinoInput(
  onInput?: (color: SimonButtonType) => void,
) {
  const [status, setStatus] = useState<ConnectionStatus>("idle");

  /**
   * Mutable refs used inside event listeners to avoid stale closures.
   */
  const statusRef = useRef<ConnectionStatus>("idle");
  const onInputRef = useRef(onInput);
  const ackTimeoutRef = useRef<number | null>(null);
  const handshakeAttemptRef = useRef(0);

  /**
   * Keep refs synchronized with latest values.
   */
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    onInputRef.current = onInput;
  }, [onInput]);

  /**
   * Clears the active handshake timeout.
   */
  const clearAckTimeout = () => {
    if (ackTimeoutRef.current !== null) {
      clearTimeout(ackTimeoutRef.current);
      ackTimeoutRef.current = null;
    }
  };

  /**
   * Sends a handshake request to the Arduino.
   */
  const sendHandshake = () => {
    handshakeAttemptRef.current += 1;

    console.log(
      `Sending handshake attempt ${handshakeAttemptRef.current}/${MAX_HANDSHAKE_ATTEMPTS}`,
    );

    connection.send("connection-syn", "init");

    clearAckTimeout();

    ackTimeoutRef.current = window.setTimeout(() => {
      if (statusRef.current === "connected") return;

      if (handshakeAttemptRef.current < MAX_HANDSHAKE_ATTEMPTS) {
        sendHandshake();
        return;
      }

      console.error("Handshake failed: Arduino did not respond.");
      setStatus("error");
    }, ACK_TIMEOUT_MS);
  };

  /**
   * Registers serial event listeners once.
   */
  useEffect(() => {
    /**
     * Fired when the Arduino acknowledges the handshake.
     */
    connection.on("connection-ack", () => {
      console.log("Arduino handshake successful.");

      clearAckTimeout();
      handshakeAttemptRef.current = 0;

      setStatus("connected");
    });

    /**
     * Fired whenever the Arduino sends a button press.
     */
    connection.on("simon-input", (data: unknown) => {
      if (statusRef.current !== "connected") return;
      if (typeof data !== "string") return;

      const color = data.trim() as SimonButtonType;

      if (!VALID_INPUTS.includes(color)) return;

      onInputRef.current?.(color);
    });

    /**
     * Cleanup timeout when component unmounts.
     */
    return () => {
      clearAckTimeout();
    };
  }, []);

  /**
   * Opens the serial connection and starts the handshake.
   */
  const connect = useCallback(async () => {
    if (statusRef.current === "loading") return;
    if (statusRef.current === "connected") return;

    setStatus("loading");
    handshakeAttemptRef.current = 0;
    clearAckTimeout();

    try {
      if (!connection.ready()) {
        await connection.startConnection();
      }

      /**
       * Small delay to allow the Arduino to reset after the serial port opens.
       * Most Arduino boards reboot when the serial connection starts.
       */
      window.setTimeout(() => {
        sendHandshake();
      }, HANDSHAKE_RETRY_DELAY_MS);
    } catch (error) {
      console.error("Failed to connect to Arduino:", error);
      setStatus("error");
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    connect,
    status,
  };
}
