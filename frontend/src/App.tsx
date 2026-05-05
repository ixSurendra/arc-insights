import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppShell } from "./layout/AppShell";
import { BuilderPage } from "./pages/Builder";
import { DashboardPage } from "./pages/Dashboard";
import { OverviewPage } from "./pages/Overview";
import { SqlEditorPage } from "./pages/SqlEditor";

export default function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<OverviewPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/builder" element={<BuilderPage />} />
          <Route path="/sql" element={<SqlEditorPage />} />
          <Route path="*" element={<OverviewPage />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}
