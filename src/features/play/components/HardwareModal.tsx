import Button from "@/globals/components/layouts/Button";
import { cn } from "@/globals/libs/styleUtils";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  isConnected: boolean;
  onConnect: () => void;
};

const HardwareModal = ({ isOpen, onClose, isConnected, onConnect }: Props) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md" 
        onClick={onClose} 
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-4xl border border-white/20 bg-slate-950 p-10 shadow-2xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-wider text-white">
              Hardware Bridge
            </h2>
            <div className="flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-blue-500" />
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400">
                Arduino Physical Interface
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="group flex h-10 w-10 items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-all"
          >
            <span className="text-white/40 group-hover:text-white transition-colors">✕</span>
          </button>
        </div>

        <div className="space-y-8">
          {/* Status Card */}
          <div className={cn(
            "relative overflow-hidden rounded-2xl border p-5 transition-all duration-500",
            isConnected 
              ? "border-green-500/40 bg-green-500/5 shadow-[0_0_20px_rgba(34,197,94,0.1)]" 
              : "border-white/10 bg-white/5"
          )}>
            <div className="flex items-center gap-4">
              <div className={cn(
                "h-4 w-4 rounded-full",
                isConnected ? "bg-green-500 animate-pulse shadow-[0_0_15px_#22c55e]" : "bg-red-500"
              )} />
              <div>
                <p className="text-xs font-black uppercase text-white tracking-widest">
                  {isConnected ? "Connection Established" : "System Offline"}
                </p>
                <p className="text-[11px] text-slate-400 leading-tight mt-1">
                  {isConnected 
                    ? "Streaming serial data at 9600 bps. IO bridge is active." 
                    : "Connect your Arduino via USB and grant browser permissions."}
                </p>
              </div>
            </div>
          </div>

          {/* Guide */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Setup Guide
              </h4>
              <ul className="space-y-2 text-[11px] text-slate-400">
                <li className="flex gap-2">
                  <span className="text-blue-500 font-bold">01</span>
                  <span>Flash the <code className="text-white">.ino</code> file to your Arduino Uno.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-500 font-bold">02</span>
                  <span>Connect buttons to pins 2, 3, 4, and 5.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-500 font-bold">03</span>
                  <span>Click initialize.</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Protocol Architecture
              </h4>
              <div className="rounded-xl bg-black/40 p-3 font-mono text-[10px] leading-relaxed text-slate-300 border border-white/5">
                <p className="text-blue-400">// Incoming Format</p>
                <p className="text-white">"simon-input:red\n"</p>
                <div className="my-1 border-t border-white/5" />
                <p className="text-green-400">// Handshake</p>
                <p className="text-white">Baud: 9600 | Data: 8bit</p>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4">
            {!isConnected ? (
              <Button
                text="Initialize Serial Interface"
                variant="secondary"
                className="w-full h-14 text-sm font-black uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98]"
                onClick={onConnect}
              />
            ) : (
              <div className="space-y-4">
                <div className="flex justify-center italic text-[10px] text-slate-500">
                  Physical input hardware is overriding keyboard/mouse controls
                </div>
                <Button
                  text="Resume Gameplay"
                  className="w-full h-14"
                  onClick={onClose}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HardwareModal;