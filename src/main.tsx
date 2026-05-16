import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import TitlePage from "@/pages/TitlePage.tsx";
import LeaderboardPage from "@/pages/LeaderboardPage";
import ModeSelectionPage from "@/pages/ModeSelectionPage";
import PlayPage from "@/pages/PlayPage.tsx";
import App from "@/App.tsx";
import { AuthProvider } from "@/features/auth/components/AuthProvider";
import AuthGuard from "@/features/auth/components/AuthGuard";
import {
  TransitionOverlay,
  TransitionProvider,
} from "@/globals/providers/TransitionProvider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <AuthGuard>
        <TransitionProvider>
          <BrowserRouter>
            <Routes>
              {/* Main Layout */}
              <Route element={<App />}>
                <Route index element={<TitlePage />} />
                <Route path="/leaderboard" element={<LeaderboardPage />} />
                <Route path="/mode" element={<ModeSelectionPage />} />
                <Route path="play" element={<PlayPage />} />
              </Route>
            </Routes>
          </BrowserRouter>

          <TransitionOverlay />
        </TransitionProvider>
      </AuthGuard>
    </AuthProvider>
  </StrictMode>,
);
