import { cn } from "@/globals/libs/styleUtils";
import type { ReactNode } from "react";

type BaseModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  showCloseButton?: boolean;
};

const BaseModal = ({ 
  isOpen, 
  onClose, 
  children, 
  className,
  showCloseButton = true 
}: BaseModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      {/* Consistent Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity animate-in fade-in duration-300" 
        onClick={onClose} 
      />

      {/* Consistent Container */}
      <div className={cn(
        "relative w-full max-w-lg overflow-hidden rounded-4xl border border-white/20 bg-slate-950 p-10 shadow-2xl animate-in zoom-in-95 duration-200",
        className
      )}>
        {showCloseButton && (
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 group flex h-10 w-10 items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-all z-10"
          >
            <span className="text-white/40 group-hover:text-white transition-colors text-lg">✕</span>
          </button>
        )}
        
        {children}
      </div>
    </div>
  );
};

export default BaseModal;