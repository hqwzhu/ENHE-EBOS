import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  BookOpenCheck,
  FileText,
  Home,
  PlayCircle,
  Settings as SettingsIcon,
  ShieldCheck,
  TableProperties,
  UploadCloud,
} from "lucide-react";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import ExternalData from "./pages/ExternalData";
import CommandRunner from "./pages/CommandRunner";
import Reports from "./pages/Reports";
import RiskCenter from "./pages/RiskCenter";
import SchemaCheck from "./pages/SchemaCheck";
import WeeklyOps from "./pages/WeeklyOps";
import Settings from "./pages/Settings";
import BeginnerGuide from "./pages/BeginnerGuide";
import { operatorApi } from "./lib/api";
import { defaultEbosProjectPath, defaultTargetDate, type OperatorSettings } from "./lib/types";

export type AppPage =
  | "dashboard"
  | "guide"
  | "external-data"
  | "commands"
  | "reports"
  | "risks"
  | "schema"
  | "weekly"
  | "settings";

const navItems = [
  { id: "dashboard", label: "首页总览", icon: Home },
  { id: "guide", label: "新手指南", icon: BookOpenCheck },
  { id: "external-data", label: "外部数据", icon: UploadCloud },
  { id: "commands", label: "命令运行", icon: PlayCircle },
  { id: "reports", label: "报告中心", icon: FileText },
  { id: "risks", label: "风险中心", icon: ShieldCheck },
  { id: "schema", label: "结构核对", icon: TableProperties },
  { id: "weekly", label: "每周运营", icon: BarChart3 },
  { id: "settings", label: "设置", icon: SettingsIcon },
] as const;

export default function App() {
  const [page, setPage] = useState<AppPage>("dashboard");
  const [settings, setSettings] = useState<OperatorSettings>({
    ebosProjectPath: defaultEbosProjectPath,
    defaultDate: defaultTargetDate,
  });
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    operatorApi
      .getSettings()
      .then(setSettings)
      .catch((error) => setLoadError(error instanceof Error ? error.message : String(error)));
  }, []);

  const pageTitle = useMemo(() => navItems.find((item) => item.id === page)?.label ?? "首页总览", [page]);

  return (
    <Layout navItems={navItems} activePage={page} onNavigate={setPage} pageTitle={pageTitle} settings={settings}>
      {loadError ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <div className="flex items-center gap-2 font-semibold">
            <AlertTriangle className="h-4 w-4" />
            配置读取失败
          </div>
          <p className="mt-2">{loadError}</p>
        </div>
      ) : null}
      {page === "dashboard" && <Dashboard settings={settings} onNavigate={setPage} />}
      {page === "guide" && <BeginnerGuide onNavigate={setPage} />}
      {page === "external-data" && <ExternalData settings={settings} />}
      {page === "commands" && <CommandRunner settings={settings} />}
      {page === "reports" && <Reports settings={settings} />}
      {page === "risks" && <RiskCenter settings={settings} />}
      {page === "schema" && <SchemaCheck settings={settings} />}
      {page === "weekly" && <WeeklyOps settings={settings} />}
      {page === "settings" && <Settings settings={settings} onSettingsSaved={setSettings} />}
    </Layout>
  );
}
