import { useAchievementUnlocker } from "../hooks/useAchievementUnlocker";
import { useRewardApplicator } from "../hooks/useRewardApplicator";
import { AchievementToast } from "./AchievementToast";

/**
 * Headless orchestrator component that wires together all achievement subsystems:
 *
 * 1. Listens to game events and unlocks achievements (useAchievementUnlocker)
 * 2. Applies rewards to settings/modes/titles (useRewardApplicator)
 * 3. Displays toast notifications (AchievementToast)
 *
 * Must be placed INSIDE AuthProvider and EventBusProvider.
 * Renders nothing to the DOM itself.
 */
export function AchievementProvider() {
  useAchievementUnlocker();
  useRewardApplicator();

  return <AchievementToast />;
}