import { useEffect, useMemo, useRef } from "react";
import type { SimonButtonType } from "@/globals/types/simon";
import { useSettings } from "@/globals/providers/SettingsProvider";

export default function useKeyboardInput(
  onInput?: (color: SimonButtonType) => void,
) {
  const { keyMap } = useSettings();
  const onInputRef = useRef(onInput);

  const keyToButton = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(keyMap).map(([button, key]) => [
          key,
          button as SimonButtonType,
        ]),
      ),
    [keyMap],
  );

  useEffect(() => {
    onInputRef.current = onInput;
  }, [onInput]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent repeat while holding a key
      if (event.repeat) return;

      const color = keyToButton[event.key.toLowerCase()];

      if (!color) return;

      onInputRef.current?.(color);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [keyToButton]);
}
