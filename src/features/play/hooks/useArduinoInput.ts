import type { SimonButtonType } from "@/globals/types/simon";
import { useEffect, useRef, useState } from "react";
import { setupSerialConnection } from "simple-web-serial";

export default function useArduinoInput(
  onInput?: (color: SimonButtonType) => void,
) {
  const [isConnected, setIsConnected] = useState(false);

	// Ensures that the callback isn't stale
  const onInputRef = useRef(onInput);
  useEffect(() => {
    onInputRef.current = onInput;
  }, [onInput]);

  const connect = async () => {
    try {
      const connection = setupSerialConnection({
        baudRate: 9600,
      });

      connection.on("simon-input", (data) => {
        if (!data) return;
        if (typeof data !== "string") return;

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

      setIsConnected(true);
    } catch (err) {
      console.error("Arduino Connection Failed:", err);
    }
  };

  return { connect, isConnected };
}
