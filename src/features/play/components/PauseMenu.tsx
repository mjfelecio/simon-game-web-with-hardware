import Button from "@/globals/components/layouts/Button";

type PauseMenuProps = {
  onRetry: () => void;
  onResume: () => void;
  onQuit: () => void;
};

const PauseMenu = ({ onRetry, onResume, onQuit }: PauseMenuProps) => (
  <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm">
    <div className="w-full max-w-md rounded-2xl border border-white/30 bg-white/10 p-10 shadow-2xl backdrop-blur-xl transition-all">
      <h2 className="mb-8 text-center text-4xl font-bold text-white drop-shadow-md">
        Paused
      </h2>
      <div className="flex flex-col gap-5">
        <Button text="Retry" onClick={onRetry} />
        <Button text="Resume" onClick={onResume} />
        <Button text="Save & Quit" onClick={onQuit} />
      </div>
    </div>
  </div>
);

export default PauseMenu;