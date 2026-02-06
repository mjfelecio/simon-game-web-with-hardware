import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import TitlePage from "@/pages/TitlePage.tsx";
import SettingsPage from "@/pages/SettingsPage.tsx";
import PlayPage from "@/pages/PlayPage.tsx";
import SetupPage from "@/pages/SetupPage.tsx";
import App from "@/App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Main Layout */}
        <Route element={<App />}>
          <Route index element={<TitlePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/setup" element={<SetupPage />} />
          <Route path="play" element={<PlayPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
