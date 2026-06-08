import { fetchCampaignProgress } from "@/features/campaign/services/campaignService";
import type { GameMode } from "@/globals/types/simon";
import { toastError } from "@/globals/utils/toast";
import { useEffect, useState } from "react";

type Params = {
  isCampaign: boolean;
  gameMode: GameMode;
  userId: string | undefined;
};

const useCampaign = ({
  isCampaign,
  gameMode,
  userId,
}: Params) => {
  const [campaignProgressLevel, setCampaignProgressLevel] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isCampaign) return;

    const initializeCampaign = async () => {
      setIsLoading(true);
      try {
				if (!userId) return;

        const campaignProgress = await fetchCampaignProgress({
          gameMode,
          userId,
        });

        setCampaignProgressLevel(campaignProgress?.highest_level ?? 1);
      } catch {
        console.error("Failed to fetch campaign data");
        toastError("Failed to fetch campaign data");
      } finally {
        setIsLoading(false);
      }
    };

    initializeCampaign();
  }, [isCampaign, gameMode, userId]);

  return {
    isCampaignLoading: isLoading,
		campaignProgressLevel,
  };
};

export default useCampaign;
