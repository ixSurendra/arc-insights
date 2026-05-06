import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppShell } from "./layout/AppShell";
import { BuilderPage } from "./pages/Builder";
import { ConnectDataPage } from "./pages/ConnectData";
import { DashboardPage } from "./pages/Dashboard";
import { DashboardsPage } from "./pages/Dashboards";
import { DataModelPage } from "./pages/DataModel";
import { DataSourcesPage } from "./pages/DataSources";
import { OverviewPage } from "./pages/Overview";
import { ReportEditorPage } from "./pages/ReportEditor";
import { ReportsPage } from "./pages/Reports";
import { SqlEditorPage } from "./pages/SqlEditor";
import { WidgetsPage } from "./pages/Widgets";

export default function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<OverviewPage />} />
          <Route path="/dashboards" element={<DashboardsPage />} />
          <Route path="/dashboards/:id" element={<DashboardPage />} />
          {/* Legacy /dashboard kept for the existing demo link in Overview cards. */}
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/widgets" element={<WidgetsPage />} />
          <Route path="/widgets/new" element={<BuilderPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/reports/new" element={<ReportEditorPage />} />
          <Route path="/reports/:id" element={<ReportEditorPage />} />
          <Route path="/data-model" element={<DataModelPage />} />
          <Route path="/data-sources" element={<DataSourcesPage />} />
          <Route path="/data-sources/new" element={<ConnectDataPage />} />
          <Route path="/builder" element={<BuilderPage />} />
          <Route path="/sql" element={<SqlEditorPage />} />
          <Route path="*" element={<OverviewPage />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}
