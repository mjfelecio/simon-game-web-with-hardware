import { createContext, useContext, type ReactNode } from "react";
import { useGameTransition } from "@/globals/hooks/useGameTransition";
import TransitionScreen from "@/globals/components/layouts/TransitionScreen";

const TransitionContext = createContext<ReturnType<typeof useGameTransition> | null>(null);

export const TransitionProvider = ({ children }: { children: ReactNode }) => {
  const value = useGameTransition();

  return (
    <TransitionContext.Provider value={value}>
      {children}
    </TransitionContext.Provider>
  );
};

export const TransitionOverlay = () => {
  const { active, message, endTransition } = useTransition();

  return (
    <TransitionScreen
      show={active}
      message={message}
      onDone={endTransition}
    />
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTransition = () => {
  const ctx = useContext(TransitionContext);
  if (!ctx) throw new Error("useTransition must be used inside TransitionProvider");
  return ctx;
};