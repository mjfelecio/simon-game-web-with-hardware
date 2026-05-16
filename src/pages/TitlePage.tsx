import LoginModal from "@/features/title/components/LoginModal";
import ManualModal from "@/features/title/components/ManualModal";
import Button from "@/globals/components/Button";
import PageWrapper from "@/globals/components/layouts/PageWrapper";
import { useCallback, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "@/features/auth/components/AuthProvider";

const TitlePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth(); 

  const [activeModal, setActiveModal] = useState<"manual" | "login" | null>(
    null,
  );

  const date = new Date().toLocaleString("en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const handleStartGame = useCallback(() => {
    navigate("/mode");
  }, [navigate]);

  const handleAuth = useCallback(() => {
    if (!isAuthenticated) {
      setActiveModal("login");
      return;
    }

    handleStartGame();
  }, [isAuthenticated, handleStartGame]);

  return (
    <PageWrapper className="relative flex flex-col justify-between p-8 md:p-16 bg-slate-950 overflow-hidden">
      {/* Background "Scanner" Line */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <div className="h-full w-px bg-white absolute left-1/4 animate-[pulse_3s_infinite]" />
        <div className="w-full h-px bg-white absolute top-1/3 animate-[pulse_4s_infinite]" />
      </div>

      {/* TOP SECTION: System Info */}
      <header className="relative z-10 flex justify-between items-start w-full">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-500">
            System Online
          </span>
          <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-white/20 leading-none">
            Node: Ormoc // Protocol: Initialized
          </span>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">
            {date}
          </span>
        </div>
      </header>

      {/* CENTER SECTION: Asymmetric Title */}
      <main className="relative z-10 flex flex-col mt-8 md:mt-0 mb-6 md:mb-4 items-start text-left">
        <div className="relative group">
          <h1
            className="text-[7rem] md:text-[14rem] font-black font-header uppercase leading-[0.8] 
             bg-linear-to-b from-blue-300 via-emerald-500 to-blue-800 
             bg-clip-text text-transparent
             filter drop-shadow-[12px_12px_0px_rgba(0,0,0,0.5)] transition-transform duration-500 group-hover:scale-[1.02]"
          >
            Simon
          </h1>
          <div className="absolute -bottom-4 left-2 flex items-center gap-4">
            <span className="text-4xl md:text-6xl text-white font-header tracking-widest uppercase italic drop-shadow-[4px_4px_0px_#eb5353]">
              Game
            </span>
            <div className="h-1 w-32 bg-linear-to-r from-red-500 via-yellow-400 to-emerald-500" />
          </div>
        </div>
      </main>

      {/* BOTTOM SECTION: Control Cluster */}
      <footer className="relative z-10 flex flex-col md:flex-row items-end justify-between gap-12">
        {/* Credits - Minimalist Block */}
        <div className="flex flex-col gap-2 opacity-30 hover:opacity-100 transition-opacity">
          <span className="text-[8px] font-black uppercase tracking-widest text-white/50">
            Developers
          </span>
          <div className="flex gap-4 text-[9px] font-bold uppercase tracking-[0.2em] text-white">
            <span>mjfelecio</span>
            <span>kyla</span>
            <span>kenjie</span>
            <span>justine</span>
          </div>
        </div>

        {/* Action Buttons - Clustered in the bottom right */}
        <nav className="flex flex-col items-center md:items-end gap-4 w-full max-w-xs">
          <Button
            onClick={handleAuth}
            className="group relative md:w-full overflow-hidden bg-emerald-500 px-4 py-2 md:px-8 md:py-6 transition-all hover:-translate-y-1 active:translate-y-0 shadow-[8px_8px_0px_rgba(16,185,129,0.2)]"
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-emerald-950 font-header italic">
                Start Game
              </span>
              <span className="text-2xl pl-2 inline-block text-emerald-950 group-hover:translate-x-1 transition-transform">
                →
              </span>
            </div>
            {/* Glossy sweep */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-linear-to-r from-transparent via-white/40 to-transparent" />
          </Button>

          <div className="flex gap-2 w-full">
            <Link
              to="/leaderboard"
              className="text-[8px] md:text-[10px] flex-1 border border-white/10 bg-white/5 py-2 md:py-4 font-black uppercase tracking-[0.3em] text-slate-400 hover:bg-white/10 hover:text-white transition-all text-center"
            >
              Rankings
            </Link>
            <button
              onClick={() => setActiveModal("manual")}
              className="text-[8px] md:text-[10px] flex-1 border border-white/10 bg-white/5 py-2 md:py-4 font-black uppercase tracking-[0.3em] text-slate-400 hover:bg-white/10 hover:text-white transition-all text-center cursor-pointer"
            >
              Manual
            </button>
          </div>
        </nav>
      </footer>

      <ManualModal
        isOpen={activeModal === "manual"}
        onClose={() => setActiveModal(null)}
      />

      <LoginModal
        isOpen={activeModal === "login"}
        onClose={() => setActiveModal(null)}
        onLogin={handleStartGame}
      />
    </PageWrapper>
  );
};

export default TitlePage;
