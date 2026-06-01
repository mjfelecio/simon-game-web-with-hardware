import type { SimonButtonType } from "@/globals/types/simon";
import useArduinoConnection, {
  getArduinoConnection,
} from "./useArduinoConnection";
import { useEffect, useRef } from "react";

/**
 * Valid button colors accepted from the Arduino.
 */
const VALID_INPUTS: SimonButtonType[] = ["red", "green", "blue", "yellow"];

export default function useArduinoInput(
  onInput?: (color: SimonButtonType) => void,
) {
  const { connect, status } = useArduinoConnection();

  const onInputRef = useRef(onInput);
  const statusRef = useRef(status);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    onInputRef.current = onInput;
  }, [onInput]);

  useEffect(() => {
    const connection = getArduinoConnection();
    if (!connection || statusRef.current === "unsupported") return;

    /**
     * Fired whenever the Arduino sends a button press.
     */
    const inputListener = connection.on("simon-input", (data: unknown) => {
      if (statusRef.current !== "connected") return;
      if (typeof data !== "string") return;

      const color = data.trim() as SimonButtonType;

      if (!VALID_INPUTS.includes(color)) return;

      onInputRef.current?.(color);
    });

    return () => {
      connection.removeListener(inputListener);
    };
  }, [statusRef]);

  return {
    connect,
    status,
  };
}
