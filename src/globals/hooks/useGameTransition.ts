import { useEffect, useState } from "react";
import { transitionStore } from "@/globals/stores/transitionStore";

export const useGameTransition = () => {
  const [state, setState] = useState(transitionStore.getState());

  useEffect(() => {
    transitionStore.subscribe(setState);
  }, []);

  return {
    ...state,
    startTransition: transitionStore.start,
    endTransition: transitionStore.stop,
  };
};
