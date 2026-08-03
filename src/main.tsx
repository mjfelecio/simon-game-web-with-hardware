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
import { Toaster } from "react-hot-toast";
import { MusicProvider } from "@/features/audio/components/MusicProvider";
import WelcomeModal from "@/features/title/components/WelcomeModal";
import { SettingsProvider } from "@/globals/providers/SettingsProvider";
import { Provider as EventBusProvider } from "react-bus";
import { AchievementProvider } from "./features/achievements/components/AchievementProvider";
import { GamemodeProvider } from "./features/gamemode/components/GamemodeProvider";
import GamemodeGuard from "./features/gamemode/components/GamemodeGuard";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FEATURE_FLAGS } from "@/globals/constants/featureFlags";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <EventBusProvider>
        <SettingsProvider>
          <MusicProvider>
            <TransitionProvider>
              <AuthProvider>
                <GamemodeProvider>
                  <AuthGuard>
                    {FEATURE_FLAGS.achievementsEnabled && <AchievementProvider />}
                    <WelcomeModal />
                    <Toaster />
                    <BrowserRouter>
                      <GamemodeGuard>
                        <Routes>
                          {/* Main Layout */}
                          <Route element={<App />}>
                            <Route index element={<TitlePage />} />
                            <Route
                              path="/leaderboard"
                              element={<LeaderboardPage />}
                            />
                            <Route
                              path="/mode"
                              element={<ModeSelectionPage />}
                            />
                            <Route path="play" element={<PlayPage />} />
                          </Route>
                        </Routes>
                      </GamemodeGuard>
                    </BrowserRouter>
                  </AuthGuard>
                </GamemodeProvider>
              </AuthProvider>
              <TransitionOverlay />
            </TransitionProvider>
          </MusicProvider>
        </SettingsProvider>
      </EventBusProvider>
    </QueryClientProvider>
  </StrictMode>,
);
