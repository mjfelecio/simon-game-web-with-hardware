import {
  fetchCampaignProgress,
  updateCampaignProgress,
} from "@/features/campaign/services/campaignService";
import useEventListener from "@/features/events/hooks/useEventListener";
import type { GameMode } from "@/globals/types/simon";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

type CampaignProgressUpdatePayload = {
  mode: GameMode;
  level: number;
  timeTakenMs?: number;
  isCampaign: boolean;
};

type Params = {
  isCampaign: boolean;
  gameMode: GameMode;
  userId: string | undefined;
};

const useCampaign = ({ isCampaign, gameMode, userId }: Params) => {
  const queryClient = useQueryClient();

  const { data: campaignProgress, isLoading } = useQuery({
    queryKey: ["campaignProgress", gameMode, userId],
    queryFn: () => fetchCampaignProgress({ gameMode, userId: userId! }),
    enabled: isCampaign && userId !== undefined,
  });

  /**
   * The highest level attained in `campaign` play type
   */
  const campaignProgressLevel = campaignProgress?.highest_level ?? 0;

  /**
   * Handles the `game_ended` event to update campaign progress
   */
  const handleCampaignProgressUpdate = useCallback(
    async (payload: CampaignProgressUpdatePayload) => {
      if (!payload.isCampaign) return;
      if (!userId) {
        console.warn(
          "Failed to update campaign progress: User is not signed in",
        );
        return;
      }

      const campaignProgress = await updateCampaignProgress({
        userId: userId,
        gameMode: payload.mode,
        level: payload.level,
      });

      // Update local cache directly without refetching
      if (campaignProgress) {
        queryClient.setQueryData(
          ["campaignProgress", gameMode, userId],
          campaignProgress,
        );
      }
    },
    [gameMode, userId, queryClient],
  );

  useEventListener("game_ended", handleCampaignProgressUpdate);

  return {
    isCampaignLoading: isLoading,
    campaignProgressLevel,
  };
};

export default useCampaign;
