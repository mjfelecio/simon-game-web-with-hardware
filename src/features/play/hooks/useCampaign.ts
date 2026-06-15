import { fetchCampaignProgress } from "@/features/campaign/services/campaignService";
import type { GameMode } from "@/globals/types/simon";
import { useQuery } from "@tanstack/react-query";

type Params = {
  isCampaign: boolean;
  gameMode: GameMode;
  userId: string | undefined;
};

const useCampaign = ({ isCampaign, gameMode, userId }: Params) => {
  const { data: campaignProgress, isLoading } = useQuery({
    queryKey: [gameMode, userId],
    queryFn: () => fetchCampaignProgress({ gameMode, userId: userId! }),
    enabled: isCampaign && userId !== undefined,
  });

  const campaignProgressLevel = campaignProgress?.highest_level ?? 0;

  return {
    isCampaignLoading: isLoading,
    campaignProgressLevel,
  };
};

export default useCampaign;
