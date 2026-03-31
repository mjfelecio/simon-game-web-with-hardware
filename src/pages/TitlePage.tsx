import PageWrapper from "@/globals/components/layouts/PageWrapper";
import { Link } from "react-router";

const TitlePage = () => {
  return (
    <PageWrapper>
      <div className="flex flex-col items-center text-center w-full max-w-lg px-4">
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

          <div className="h-1.5 w-full bg-linear-to-r from-simon-red via-simon-yellow to-simon-green mt-6 shadow-[0_4px_10px_rgba(0,0,0,0.5)]" />
        </header>

        <nav className="flex flex-col gap-4 w-full max-w-64">
          <Link
            to="/play"
            className="btn-pixel-bevel bg-[#8de16f] text-[#1a5d2c] py-4 text-2xl font-bold uppercase tracking-widest font-header"
          >
            Start Game
          </Link>

          <a
            href="#how-to"
            className="text-slate-500 hover:text-white py-2 text-sm font-bold uppercase tracking-[0.3em] transition-colors text-center"
          >
            How to Play
          </a>

          <a
            href="/leaderboard"
            className="text-slate-500 hover:text-white py-2 text-sm font-bold uppercase tracking-[0.3em] transition-colors text-center"
          >
            Leaderboards
          </a>
        </nav>
      </div>
    </PageWrapper>
  );
};

export default TitlePage;
