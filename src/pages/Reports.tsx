import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import ReportViewer from "../components/ReportViewer";
import { operatorApi } from "../lib/api";
import type { OperatorSettings, ReportContent, ReportSummary } from "../lib/types";
import { formatBytes, formatDateTime } from "../lib/format";

type ReportsProps = {
  settings: OperatorSettings;
};

const filters = ["all", "final", "deployment", "external-publishing", "automation", "prisma-audit", "package-audit", "seed-audit", "core-audit", "unknown-audit", "autonomous-runs"];

export default function Reports({ settings }: ReportsProps) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [selected, setSelected] = useState<ReportContent | null>(null);

  const load = useCallback(async () => {
    const data = await operatorApi.listReports(settings.ebosProjectPath, filter, search);
    setReports(data);
  }, [settings.ebosProjectPath, filter, search]);

  useEffect(() => {
    load();
  }, [load]);

  async function open(report: ReportSummary) {
    setSelected(await operatorApi.readReport(report.path));
  }

  return (
    <div className="grid grid-cols-[420px_minmax(0,1fr)] gap-5">
      <aside className="space-y-4">
        <section className="rounded-md border border-line bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-semibold text-ink">报告筛选</h3>
            <button type="button" onClick={load} className="focus-ring rounded-md border border-line p-2 hover:bg-slate-50" aria-label="刷新">
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
          <select className="focus-ring mt-3 w-full rounded-md border border-line px-3 py-2" value={filter} onChange={(event) => setFilter(event.target.value)}>
            {filters.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <input className="focus-ring mt-3 w-full rounded-md border border-line px-3 py-2" placeholder="搜索文件名" value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => event.key === "Enter" && load()} />
        </section>
        <div className="max-h-[680px] space-y-2 overflow-auto pr-1">
          {reports.map((report) => (
            <button key={report.path} type="button" onClick={() => open(report)} className="focus-ring w-full rounded-md border border-line bg-white p-3 text-left hover:bg-slate-50">
              <div className="flex items-center justify-between gap-3">
                <span className="min-w-0 truncate text-sm font-semibold text-ink">{report.fileName}</span>
                <span className="shrink-0 rounded-md bg-slate-100 px-2 py-1 text-[11px] text-slate-600">{report.type}</span>
              </div>
              <p className="mt-2 text-xs text-slate-500">{formatDateTime(report.updatedAt)} · {formatBytes(report.size)}</p>
              <p className="mt-1 truncate text-xs text-slate-500">{report.relativePath}</p>
            </button>
          ))}
        </div>
      </aside>
      <main>
        <ReportViewer report={selected} onOpenFolder={(path) => operatorApi.openContainingFolder(path)} />
        <section className="mt-4 rounded-md border border-line bg-white p-5">
          <h3 className="font-semibold text-ink">下一步建议</h3>
          <p className="mt-2 text-sm text-slate-600">优先查看 final、deployment、external-publishing 和 prisma-audit 报告，再决定是否需要人工动作。</p>
        </section>
      </main>
    </div>
  );
}
