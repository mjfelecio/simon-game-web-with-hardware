import { ENDLESS_MODES } from "@/features/play/hooks/useGameMode";

/**
 * Defines the modes that are allowed to be campaign mode
 */
export const CAMPAIGN_MODES = ENDLESS_MODES;

export type PlayType = "quickplay" | "campaign"