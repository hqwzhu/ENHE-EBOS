import { useCallback, useEffect, useState } from "react";
import { ArrowRight, RefreshCw } from "lucide-react";
import type { AppPage } from "../App";
import StatusCard from "../components/StatusCard";
import SafetyBanner from "../components/SafetyBanner";
import { operatorApi } from "../lib/api";
import type { DashboardData, OperatorSettings } from "../lib/types";
import { formatBoolean } from "../lib/format";
import { summarizeRiskText, translateDashboardLabel, translateStatus } from "../lib/display";

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
    void load();
  }, [load]);

  if (loading) {
    return <div className="rounded-md border border-line bg-white p-6 text-slate-500">正在读取最终运营报告...</div>;
  }

  if (error || !data) {
    return (
      <div className="space-y-4">
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-900">{error || "未读取到首页数据"}</div>
        <button className="focus-ring rounded-md bg-action px-4 py-2 text-sm font-semibold text-white" type="button" onClick={load}>
          重试
        </button>
      </div>
    );
  }

  const statusCards = [
    {
      label: "operationsReady",
      value: formatBoolean(data.operationsReady),
      tone: data.operationsReady ? ("good" as const) : ("danger" as const),
      hint: data.operationsReady ? "系统已具备运营查看条件。" : "仍存在阻塞项，需要先处理。",
    },
    {
      label: "deploymentStatus",
      value: translateStatus(data.deploymentStatus),
      tone: data.deploymentStatus === "verified" ? ("good" as const) : ("warn" as const),
      hint: "当前线上部署状态。",
    },
    {
      label: "postLaunchCheckStatus",
      value: translateStatus(data.postLaunchCheckStatus),
      tone: data.postLaunchCheckStatus === "passed" ? ("good" as const) : ("warn" as const),
      hint: "上线后页面检查结果。",
    },
    {
      label: "externalPublishingStatus",
      value: translateStatus(data.externalPublishingStatus),
      tone: data.externalPublishingStatus === "waiting_real_data" ? ("warn" as const) : ("good" as const),
      hint: "这不是程序异常，只表示还在等待真实渠道数据。",
    },
    {
      label: "hasRealSignals",
      value: formatBoolean(data.hasRealSignals),
      tone: data.hasRealSignals ? ("good" as const) : ("warn" as const),
      hint: "这不是程序异常，只表示还没有录入真实浏览、咨询或订单。",
    },
    {
      label: "canBackfill",
      value: formatBoolean(data.canBackfill),
      tone: data.canBackfill ? ("warn" as const) : ("good" as const),
      hint: "是否允许进行真实数据回填。",
    },
    {
      label: "safeToRunMigration",
      value: formatBoolean(data.safeToRunMigration),
      tone: data.safeToRunMigration ? ("danger" as const) : ("good" as const),
      hint: "日常运营应保持为否。",
    },
    {
      label: "lastQualityGate",
      value: translateStatus(data.lastQualityGate),
      tone: data.lastQualityGate === "passed" ? ("good" as const) : ("neutral" as const),
      hint: "最近一次质量检查结果。",
    },
  ];

  return (
    <div className="space-y-6">
      <SafetyBanner />
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-ink">运营状态总览</h3>
          <p className="mt-1 text-sm text-slate-600">优先读取最终运营报告，展示当前是否可以继续运营动作。</p>
        </div>
        <button type="button" onClick={load} className="focus-ring inline-flex items-center gap-2 rounded-md border border-line bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
          <RefreshCw className="h-4 w-4" />
          刷新
        </button>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {statusCards.map((card) => (
          <StatusCard
            key={card.label}
            label={translateDashboardLabel(card.label)}
            value={card.value}
            tone={card.tone}
            hint={card.hint}
          />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-4">
        <section className="rounded-md border border-line bg-white p-5">
          <p className="text-sm text-slate-500">最近提交</p>
          <p className="mt-2 text-xl font-semibold text-ink">{data.lastCommitHash}</p>
          <p className="mt-3 break-all text-xs text-slate-500">{data.sourcePath}</p>
        </section>
        <section className="rounded-md border border-line bg-white p-5">
          <h3 className="font-semibold text-ink">阻塞项</h3>
          <List values={data.remainingBlockers.map(summarizeRiskText)} empty="当前没有阻塞运营的事项。" />
        </section>
        <section className="rounded-md border border-line bg-white p-5">
          <h3 className="font-semibold text-ink">待关注风险</h3>
          <List values={data.nonBlockingRisks.map(summarizeRiskText)} empty="当前没有记录待关注风险。" />
        </section>
      </div>
      <section className="rounded-md border border-line bg-white p-5">
        <h3 className="font-semibold text-ink">新手操作步骤</h3>
        <ol className="mt-3 grid grid-cols-2 gap-3 text-sm leading-6 text-slate-700">
          <li className="rounded-md bg-panel p-3">1. 先进入设置页，确认项目路径检查通过。</li>
          <li className="rounded-md bg-panel p-3">2. 回到首页刷新，确认部署和质量检查已通过。</li>
          <li className="rounded-md bg-panel p-3">3. 真实发布后，再到外部数据页录入真实链接和数据。</li>
          <li className="rounded-md bg-panel p-3">4. 到命令运行页执行检查和演练，不执行危险动作。</li>
        </ol>
      </section>
      <div className="rounded-md border border-line bg-white p-5">
        <h3 className="font-semibold text-ink">下一步建议</h3>
        <div className="mt-4 grid grid-cols-4 gap-3">
          <Action label="查看新手指南" onClick={() => onNavigate("guide")} />
          <Action label="录入真实数据" onClick={() => onNavigate("external-data")} />
          <Action label="查看风险状态" onClick={() => onNavigate("risks")} />
          <Action label="执行每周演练" onClick={() => onNavigate("weekly")} />
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
