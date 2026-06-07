import type { PropsWithChildren } from "react";
import { Navigate, useLocation } from "react-router";
import { useGamemodes } from "./GamemodeProvider";
import type { GameMode } from "@/globals/types/simon";
import { toastWarning } from "@/globals/utils/toast";

const GamemodeGuard = ({ children }: PropsWithChildren) => {
  const { isUnlocked } = useGamemodes();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const activeMode = params.get("mode");

  if (activeMode && !isUnlocked(activeMode as GameMode)) {
    toastWarning("Invalid gamemode", {
      description: `You must unlock the gamemode "${activeMode}" to play it.`,
    });
    return <Navigate to={"/mode"} replace />;
  }

  return children;
};

export default GamemodeGuard;
