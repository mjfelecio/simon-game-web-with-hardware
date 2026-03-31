import BaseModal from "@/globals/components/layouts/BaseModal";
import Button from "@/globals/components/Button";
import { Link } from "react-router";
import { cn } from "@/globals/libs/styleUtils";

type PauseMenuProps = {
  isOpen: boolean;
  onRetry: () => void;
  onResume: () => void;
  onQuit: () => void;
  isConnected: boolean; // Pass this from PlayPage
};

const PauseMenu = ({ isOpen, onRetry, onResume, onQuit, isConnected }: PauseMenuProps) => (
  <BaseModal isOpen={isOpen} onClose={onResume} showCloseButton={false} className="max-w-sm">
    <div className="text-center mb-8">
      <h2 className="text-5xl font-black italic uppercase tracking-wider text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
        Paused
      </h2>
      <div className="flex items-center justify-center gap-2 mt-2">
        <div className={cn("h-1.5 w-1.5 rounded-full animate-pulse", isConnected ? "bg-green-500 shadow-[0_0_8px_#22c55e]" : "bg-red-500")} />
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-400">
          {isConnected ? "Controller Online" : "Controller Offline"}
        </p>
      </div>
    </div>

    <div className="flex flex-col gap-3">
      <Button 
        text="Resume Game" 
        onClick={onResume} 
        className="h-14 text-lg shadow-[0_0_20px_rgba(59,130,246,0.2)]"
      />
      
      <div className="grid grid-cols-2 gap-3">
        <Button text="Retry" variant="secondary" onClick={onRetry} size="sm" />
        <Link to="/leaderboard" className="w-full">
          <Button text="Rankings" variant="secondary" size="sm" fullWidth />
        </Link>
      </div>

      <div className="mt-4 pt-6 border-t border-white/10 text-center">
        <Button text="Save & Quit" variant="danger" onClick={onQuit} size="sm" />
      </div>
    </div>
  </BaseModal>
);

export default PauseMenu;