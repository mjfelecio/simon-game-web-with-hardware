export const FEATURE_FLAGS = {
  /** Achievements are still under construction; surface as "Coming Soon" when false. */
  achievementsEnabled: false,
  /** Campaign play type is not fleshed out yet; lock quick play only when false. */
  campaignEnabled: false,
} as const;
