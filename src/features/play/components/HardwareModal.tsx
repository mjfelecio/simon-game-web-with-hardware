import BaseModal from "@/globals/components/layouts/BaseModal";
import Button from "@/globals/components/Button";
import { cn } from "@/globals/libs/styleUtils";
import { Loader2, AlertCircle, CheckCircle2, Cpu } from "lucide-react";
import type { ConnectionStatus } from "@/features/play/hooks/useArduinoInput";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  status: ConnectionStatus;
  onConnect: () => void;
};

const HardwareModal = ({ isOpen, onClose, status, onConnect }: Props) => {
  if (!isOpen) return null;

  const isConnected = status === "connected";
  const isLoading = status === "loading";
  const isError = status === "error";

  return (
    <BaseModal isOpen={isOpen} onClose={onClose}>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-wider text-white">
            Hardware Bridge
          </h2>
          <div className="flex items-center gap-2">
            <span className={cn(
              "h-1 w-1 rounded-full",
              isConnected ? "bg-green-500" : isError ? "bg-red-500" : "bg-blue-500"
            )} />
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400">
              Arduino Physical Interface
            </p>
          </div>
        </div>
        <Cpu className={cn("w-8 h-8 transition-colors", isConnected ? "text-green-500" : "text-white/20")} />
      </div>

      <div className="space-y-8">
        {/* Status Card */}
        <div className={cn(
          "relative overflow-hidden rounded-2xl border p-5 transition-all duration-500",
          isConnected ? "border-green-500/40 bg-green-500/5 shadow-[0_0_20px_rgba(34,197,94,0.1)]" :
          isError ? "border-red-500/40 bg-red-500/5" :
          isLoading ? "border-blue-500/40 bg-blue-500/5" : "border-white/10 bg-white/5",
        )}>
          <div className="flex items-center gap-4">
            <div className="shrink-0">
              {isLoading ? <Loader2 className="w-5 h-5 text-blue-500 animate-spin" /> :
               isError ? <AlertCircle className="w-5 h-5 text-red-500" /> :
               isConnected ? <CheckCircle2 className="w-5 h-5 text-green-500" /> :
               <div className="h-4 w-4 rounded-full bg-slate-700" />}
            </div>
            <div>
              <p className="text-xs font-black uppercase text-white tracking-widest">
                {isLoading ? "Verifying Handshake..." : 
                 isError ? "Handshake Failed" : 
                 isConnected ? "Connection Established" : "System Offline"}
              </p>
              <p className="text-[11px] text-slate-400 leading-tight mt-1">
                {isLoading ? "Synchronizing with Arduino firmware (SYN/ACK)..." :
                 isError ? "Device detected but not responding. Check baud rate and code." :
                 isConnected ? "Streaming serial data at 9600 bps. IO bridge is active." :
                 "Connect your Arduino via USB and grant browser permissions."}
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
                <span>
                  Flash the <code className="text-white">.ino</code> file to
                  your Arduino Uno.
                </span>
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
          {isConnected ? (
            <div className="space-y-4">
              <div className="flex justify-center italic text-[10px] text-slate-500">
                Physical input hardware is active
              </div>
              <Button text="Resume Gameplay" className="w-full h-14" onClick={onClose} />
            </div>
          ) : (
            <Button
              text={isLoading ? "Processing..." : isError ? "Retry Connection" : "Initialize Serial Interface"}
              variant={isError ? "danger" : "secondary"}
              disabled={isLoading}
              className="w-full h-14 text-lg font-bold uppercase tracking-widest transition-all"
              onClick={onConnect}
            />
          )}
        </div>
      </div>
    </BaseModal>
  );
};

export default HardwareModal;