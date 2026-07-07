import { useCallback, useEffect, useState } from "react";
import { ArrowRight, RefreshCw } from "lucide-react";
import type { AppPage } from "../App";
import StatusCard from "../components/StatusCard";
import SafetyBanner from "../components/SafetyBanner";
import { operatorApi } from "../lib/api";
import type { DashboardData, OperatorSettings } from "../lib/types";
import { formatBoolean } from "../lib/format";

type DashboardProps = {
  settings: OperatorSettings;
  onNavigate: (page: AppPage) => void;
};

export default function Dashboard({ settings, onNavigate }: DashboardProps) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setData(await operatorApi.getDashboard(settings.ebosProjectPath));
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(false);
    }
  }, [settings.ebosProjectPath]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return <div className="rounded-md border border-line bg-white p-6 text-slate-500">正在读取 EBOS final report...</div>;
  }

  if (error || !data) {
    return (
      <div className="space-y-4">
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-900">{error || "未读取到 Dashboard 数据"}</div>
        <button className="focus-ring rounded-md bg-action px-4 py-2 text-sm font-semibold text-white" type="button" onClick={load}>
          重试
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SafetyBanner />
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-ink">运营状态总览</h3>
          <p className="mt-1 text-sm text-slate-600">优先读取 EBOS operations ready final report。</p>
        </div>
        <button type="button" onClick={load} className="focus-ring inline-flex items-center gap-2 rounded-md border border-line bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
          <RefreshCw className="h-4 w-4" />
          刷新
        </button>
      </div>
      <div className="grid grid-cols-4 gap-4">
        <StatusCard label="operationsReady" value={formatBoolean(data.operationsReady)} tone={data.operationsReady ? "good" : "danger"} />
        <StatusCard label="deploymentStatus" value={data.deploymentStatus} tone={data.deploymentStatus === "verified" ? "good" : "warn"} />
        <StatusCard label="postLaunchCheckStatus" value={data.postLaunchCheckStatus} tone={data.postLaunchCheckStatus === "passed" ? "good" : "warn"} />
        <StatusCard label="externalPublishingStatus" value={data.externalPublishingStatus} tone={data.externalPublishingStatus === "waiting_real_data" ? "warn" : "good"} />
        <StatusCard label="hasRealSignals" value={formatBoolean(data.hasRealSignals)} tone={data.hasRealSignals ? "good" : "warn"} />
        <StatusCard label="canBackfill" value={formatBoolean(data.canBackfill)} tone={data.canBackfill ? "warn" : "good"} />
        <StatusCard label="safeToRunMigration" value={formatBoolean(data.safeToRunMigration)} tone={data.safeToRunMigration ? "danger" : "good"} />
        <StatusCard label="lastQualityGate" value={data.lastQualityGate} tone={data.lastQualityGate === "passed" ? "good" : "neutral"} />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <section className="rounded-md border border-line bg-white p-5">
          <p className="text-sm text-slate-500">lastCommitHash</p>
          <p className="mt-2 text-xl font-semibold text-ink">{data.lastCommitHash}</p>
          <p className="mt-3 break-all text-xs text-slate-500">{data.sourcePath}</p>
        </section>
        <section className="rounded-md border border-line bg-white p-5">
          <h3 className="font-semibold text-ink">remainingBlockers</h3>
          <List values={data.remainingBlockers} empty="没有阻塞运营 readiness 的 blocker" />
        </section>
        <section className="rounded-md border border-line bg-white p-5">
          <h3 className="font-semibold text-ink">nonBlockingRisks</h3>
          <List values={data.nonBlockingRisks} empty="没有记录非阻塞风险" />
        </section>
      </div>
      <div className="rounded-md border border-line bg-white p-5">
        <h3 className="font-semibold text-ink">下一步建议</h3>
        <div className="mt-4 grid grid-cols-3 gap-3">
          <Action label="录入真实外部数据" onClick={() => onNavigate("external-data")} />
          <Action label="查看风险隔离状态" onClick={() => onNavigate("risks")} />
          <Action label="执行每周运营 dry-run" onClick={() => onNavigate("weekly")} />
        </div>
      </div>
    </div>
  );
}

function List({ values, empty }: { values: string[]; empty: string }) {
  if (values.length === 0) return <p className="mt-3 text-sm text-slate-600">{empty}</p>;
  return (
    <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
      {values.map((value) => (
        <li key={value}>{value}</li>
      ))}
    </ul>
  );
}

function Action({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="focus-ring flex items-center justify-between rounded-md border border-line px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50">
      {label}
      <ArrowRight className="h-4 w-4" />
    </button>
  );
}
