import type { SimonButtonType } from "@/globals/types/simon";
import { useEffect, useRef, useState } from "react";
import { setupSerialConnection } from "simple-web-serial";

export type ConnectionStatus = "idle" | "loading" | "connected" | "error";

const ACK_TIMEOUT = 5000; // in ms

export default function useArduinoInput(
  onInput?: (color: SimonButtonType) => void,
) {
  const [status, setStatus] = useState<ConnectionStatus>("idle");
  const onInputRef = useRef(onInput);
  const connectionRef = useRef<ReturnType<typeof setupSerialConnection> | null>(
    null,
  );
  const timeoutIdRef = useRef<number | null>(null);

  useEffect(() => {
    onInputRef.current = onInput;
  }, [onInput]);

  const connect = async () => {
    // Clear any existing timeouts or connections
    if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
    setStatus("loading");

    try {
      const connection = setupSerialConnection({
        baudRate: 9600,
        logIncomingSerialData: true,
      });
      connectionRef.current = connection;

      // Listen for the "ack" from Arduino
      connection.on("connection-ack", () => {
        console.log("Hardware Handshake Successful");
        if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
        setStatus("connected");
      });

      connection.on("simon-input", (data) => {
        if (!data || typeof data !== "string" || status !== "connected") return;
        const validInputs: SimonButtonType[] = [
          "red",
          "green",
          "blue",
          "yellow",
        ];
        const color = data.trim() as SimonButtonType;
        if (validInputs.includes(color)) {
          onInputRef.current?.(color);
        }
      });

      // START HANDSHAKE PROCESS
      setTimeout(() => {
        connection.send("connection-syn", "init");

        // Start the Timeout Watchdog (5 seconds to receive ACK)
				// If still not responding, we throw error n shit
        timeoutIdRef.current = setTimeout(() => {
          if (status !== "connected") {
            console.error("Handshake Timeout: No response from Arduino");
            setStatus("error");
          }
        }, ACK_TIMEOUT);
      }, 1500);
    } catch (err) {
      console.error("Arduino Connection Failed:", err);
      setStatus("error");
    }
  };

  return { connect, status };
}
