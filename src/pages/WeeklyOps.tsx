import { useCallback, useEffect, useState } from "react";
import { Copy, Play } from "lucide-react";
import CommandOutput from "../components/CommandOutput";
import SafetyBanner from "../components/SafetyBanner";
import { operatorApi } from "../lib/api";
import { defaultTargetDate, type CommandRunResult, type OperatorSettings, type WeeklyOpsData } from "../lib/types";
import { formatBoolean } from "../lib/format";

type WeeklyOpsProps = {
  settings: OperatorSettings;
};

export default function WeeklyOps({ settings }: WeeklyOpsProps) {
  const [targetDate, setTargetDate] = useState(settings.defaultDate || defaultTargetDate);
  const [data, setData] = useState<WeeklyOpsData | null>(null);
  const [result, setResult] = useState<CommandRunResult | null>(null);

  const load = useCallback(async () => {
    setData(await operatorApi.getWeeklyOps(settings.ebosProjectPath, targetDate));
  }, [settings.ebosProjectPath, targetDate]);

  useEffect(() => {
    void load();
  }, [load]);

  async function runDryRun() {
    setResult(await operatorApi.runCommand(settings.ebosProjectPath, "weekly-dry-run", targetDate));
    await load();
  }

  const command = `npx tsx scripts/run-ebos-weekly-operating-cycle.ts --date ${targetDate} --dry-run`;

  return (
    <div className="space-y-5">
      <SafetyBanner />
      <section className="rounded-md border border-line bg-white p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-ink">每周运营</h3>
            <p className="mt-2 text-sm text-slate-600">这里只运行本地演练命令，不创建系统级定时任务。</p>
          </div>
          <label className="text-sm font-medium text-slate-700">
            日期
            <input className="focus-ring mt-2 rounded-md border border-line px-3 py-2" value={targetDate} onChange={(event) => setTargetDate(event.target.value)} />
          </label>
        </div>
        <div className="mt-4 flex gap-3">
          <button type="button" onClick={runDryRun} className="focus-ring inline-flex items-center gap-2 rounded-md bg-action px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800">
            <Play className="h-4 w-4" />
            运行每周演练
          </button>
          <button type="button" onClick={() => void navigator.clipboard.writeText(command)} className="focus-ring inline-flex items-center gap-2 rounded-md border border-line px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <Copy className="h-4 w-4" />
            复制每周命令
          </button>
        </div>
      </section>
      {data ? (
        <>
          <div className="grid grid-cols-4 gap-4">
            <Mini label="真实信号" value={formatBoolean(data.hasRealSignals)} />
            <Mini label="允许回填" value={formatBoolean(data.canBackfill)} />
            <Mini label="允许迁移" value={formatBoolean(data.safeToRunMigration)} />
            <Mini label="阻塞数量" value={String(data.blockers.length)} />
          </div>
          <section className="rounded-md border border-line bg-white">
            <div className="border-b border-line px-4 py-3 text-sm font-semibold text-ink">本周报告预览</div>
            <pre className="max-h-80 overflow-auto p-4 text-xs leading-5 text-slate-800">{data.weeklyReportPreview || "未找到每周报告"}</pre>
          </section>
          <section className="rounded-md border border-line bg-white p-5">
            <h3 className="font-semibold text-ink">下周行动清单</h3>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
              {data.nextActions.map((action) => (
                <li key={action}>{action}</li>
              ))}
            </ul>
          </section>
        </>
      ) : null}
      <CommandOutput result={result} />
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-line bg-white p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-2 text-lg font-semibold text-ink">{value}</p>
    </div>
  );
}
