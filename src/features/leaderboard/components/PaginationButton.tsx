import { SFX } from "@/features/audio/constants/sfx";
import { sfxPlayer } from "@/features/audio/utils/sfxPlayer";
import { cn } from "@/globals/libs/styleUtils";

type Props = {
  page: number;
  onPageChange: (page: number) => void;
  prevDisabled: boolean;
  nextDisabled: boolean;
};

const PaginationButton = ({
  page,
  onPageChange,
  prevDisabled,
  nextDisabled,
}: Props) => {
  return (
    <div className="flex items-center gap-4 mt-4">
      <button
        className={cn(
          "px-4 py-1 border-2 rounded-2xl cursor-pointer",
          "hover:bg-slate-50/20 disabled:opacity-40 disabled:cursor-not-allowed",
        )}
        disabled={prevDisabled}
        onMouseEnter={() => {
          sfxPlayer.play(SFX.BTN_HOVER);
        }}
        onTouchStart={() => {
          sfxPlayer.play(SFX.BTN_HOVER);
        }}
        onClick={() => {
          sfxPlayer.play(SFX.BTN_CLICK);
          onPageChange(page - 1);
        }}
      >
        Previous
      </button>

      <span className="font-bold text-sm">Page {page + 1}</span>

      <button
        className={cn(
          "px-4 py-1 border-2 rounded-2xl cursor-pointer",
          "hover:bg-slate-50/20 disabled:opacity-40 disabled:cursor-not-allowed",
        )}
        disabled={nextDisabled}
        onMouseEnter={() => {
          sfxPlayer.play(SFX.BTN_HOVER);
        }}
        onTouchStart={() => {
          sfxPlayer.play(SFX.BTN_HOVER);
        }}
        onClick={() => {
          sfxPlayer.play(SFX.BTN_CLICK);
          onPageChange(Math.min(page + 1, 9));
        }}
      >
        Next
      </button>
    </div>
  );
};

export default PaginationButton;
