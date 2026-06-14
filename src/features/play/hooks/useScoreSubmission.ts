import type {
  GameMode,
  InputType,
  SimonButtonType,
} from "@/globals/types/simon";
import { formatDuration } from "@/globals/utils/formatter";
import { submitScore } from "@/globals/utils/scores";
import { toastInfo, toastWarning } from "@/globals/utils/toast";
import { useMutation } from "@tanstack/react-query";
import { useCallback } from "react";

type Params = {
  userId: string | undefined;
  inputsUsed: React.RefObject<Set<InputType>>;
};

type SubmitScoreParams = {
  gameMode: GameMode;
  completedLevel: number;
  goal: number | undefined;
  inputs: SimonButtonType[];
  timeTaken: number;
};

const useScoreSubmission = ({ userId, inputsUsed }: Params) => {
  const scoreSubmission = useCallback(
    async ({
      gameMode,
      completedLevel,
      goal,
      inputs,
      timeTaken,
    }: SubmitScoreParams) => {
      if (!userId) {
        toastWarning("Score discarded", {
          description: "Please login to submit your score.",
        });

        return;
      }

      const hasGoal = gameMode === "burst" || gameMode === "timeattack";

      // For burst/timeattack, level = inputs.length. For others, it's the last completed level.
      const level = hasGoal ? inputs.length : completedLevel;

      // Stored as CSV in string form
      const inputType = Array.from(inputsUsed.current).join(",");

      return submitScore({
        user_id: userId,
        gamemode: gameMode,
        input_type: inputType,
        level: level,
        goal: goal,
        time_taken: timeTaken,
      });
    },
    [userId, inputsUsed],
  );

  return useMutation({
    mutationFn: scoreSubmission,
    onMutate: () => {
      const toastId = toastInfo("Submitting score...", {
        description: "Syncing with leaderboard",
      });

      return { toastId };
    },
    onSuccess: (data, variables, context) => {
      const description =
        variables.gameMode === "burst" || variables.gameMode === "timeattack"
          ? `Time: ${formatDuration(variables.timeTaken)}`
          : `Reached level ${variables.completedLevel}`;

      toastInfo("Score submitted", {
        id: context?.toastId,
        description: description,
      });

      if (data?.isPersonalBest) {
        toastInfo("New Personal Best!", {
          description: `You beat your previous best score for ${variables.gameMode}!`,
        });
      }
    },
    onError: (error, _variables, context) => {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      console.error("Score submission failed:", error);

      toastWarning("Submission failed", {
        id: context?.toastId,
        description: `Could not sync your score: \n ${errorMsg}`,
      });
    },
    retry: 3,
  });
};

export default useScoreSubmission;
