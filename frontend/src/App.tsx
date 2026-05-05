import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppShell } from "./layout/AppShell";
import { BuilderPage } from "./pages/Builder";
import { OverviewPage } from "./pages/Overview";

export default function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<OverviewPage />} />
          <Route path="/builder" element={<BuilderPage />} />
          <Route path="*" element={<OverviewPage />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}
