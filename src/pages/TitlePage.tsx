import PageWrapper from "@/globals/components/layouts/PageWrapper";
import { Link } from "react-router";

const TitlePage = () => {
  return (
    <PageWrapper className="relative flex items-center justify-center overflow-hidden">
      <div className="relative z-10 flex flex-col items-center text-center w-full max-w-2xl px-6">
        <header className="mb-20 w-full uppercase tracking-[0.3em]">
          <h1
            className="text-7xl md:text-[9rem] font-bold font-header 
               bg-linear-to-b from-blue-300 via-emerald-500 to-blue-800 
               bg-clip-text text-transparent
               filter drop-shadow-[6px_6px_0px_rgba(200,120,120,0.2)]"
          >
            Simon
          </h1>
          <span
            className="block text-4xl font-header md:text-5xl text-white tracking-[0.2em] mt-2 
               filter drop-shadow-[4px_4px_0px_rgba(235,83,83,0.5)]"
          >
            Game
          </span>

          <div className="h-1.5 w-full bg-linear-to-r from-red-500 via-yellow-400 to-emerald-500 mt-6 shadow-[0_4px_15px_rgba(0,0,0,0.5)]" />
        </header>

        <nav className="flex flex-col items-center gap-6 w-full max-w-xs">
          <Link
            to="/play"
            className="group relative w-full overflow-hidden rounded-2xl bg-emerald-500 px-8 py-5 transition-all hover:scale-105 active:scale-95 shadow-[0_0_25px_rgba(16,185,129,0.3)]"
          >
            <span className="relative z-10 text-2xl font-black uppercase tracking-widest text-emerald-950 font-header">
              Start Game
            </span>
            <div className="absolute inset-0 translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-linear-to-r from-transparent via-white/30 to-transparent" />
          </Link>

          <div className="grid grid-cols-2 gap-3 w-full">
            <Link
              to="/leaderboard"
              className="rounded-xl border border-white/10 bg-white/5 py-3 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 transition-all hover:bg-white/10 hover:text-white text-center"
            >
              Rankings
            </Link>
            <a
              href="#how-to"
              className="rounded-xl border border-white/10 bg-white/5 py-3 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 transition-all hover:bg-white/10 hover:text-white text-center"
            >
              Manual
            </a>
          </div>
        </nav>

        <footer className="mt-28 flex flex-col items-center gap-3">
          <div className="flex items-center gap-6 text-[9px] font-bold uppercase tracking-[0.3em] text-white/20">
            <span>App Dev</span>
            <div className="h-3 w-px bg-white/20" />
            <span>mjfelecio</span>
            <div className="h-3 w-px bg-white/20" />
            <span>kyla</span>
            <div className="h-3 w-px bg-white/20" />
            <span>kenjie</span>
            <div className="h-3 w-px bg-white/20" />
            <span>justine</span>
          </div>
        </footer>
      </div>
    </PageWrapper>
  );
};

export default TitlePage;