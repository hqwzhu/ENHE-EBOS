import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import ReportViewer from "../components/ReportViewer";
import { operatorApi } from "../lib/api";
import type { OperatorSettings, ReportContent, ReportSummary } from "../lib/types";
import { formatBytes, formatDateTime } from "../lib/format";

type ReportsProps = {
  settings: OperatorSettings;
};

const filters = [
  { value: "all", label: "全部报告" },
  { value: "final", label: "最终报告" },
  { value: "deployment", label: "部署报告" },
  { value: "external-publishing", label: "外部发布" },
  { value: "weekly", label: "每周运营" },
  { value: "monthly", label: "月度复盘" },
  { value: "automation", label: "自动化" },
  { value: "prisma-audit", label: "数据库审计" },
  { value: "package-audit", label: "依赖审计" },
  { value: "seed-audit", label: "种子数据审计" },
  { value: "core-audit", label: "核心代码审计" },
  { value: "unknown-audit", label: "未知风险审计" },
  { value: "autonomous-runs", label: "自动运行记录" },
];

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
    void load();
  }, [load]);

  async function open(report: ReportSummary) {
    setSelected(await operatorApi.readReport(report.path));
  }

  return (
    <div className="grid grid-cols-[420px_minmax(0,1fr)] gap-5">
      <aside className="space-y-4">
        <section className="rounded-md border border-line bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold text-ink">报告中心</h3>
              <p className="mt-1 text-xs leading-5 text-slate-500">先看中文摘要，需要排查时再展开原始技术明细。</p>
            </div>
            <button type="button" onClick={load} className="focus-ring rounded-md border border-line p-2 hover:bg-slate-50" aria-label="刷新">
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
          <select className="focus-ring mt-3 w-full rounded-md border border-line px-3 py-2" value={filter} onChange={(event) => setFilter(event.target.value)}>
            {filters.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
          <input className="focus-ring mt-3 w-full rounded-md border border-line px-3 py-2" placeholder="搜索文件名" value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => event.key === "Enter" && void load()} />
        </section>
        <div className="max-h-[680px] space-y-2 overflow-auto pr-1">
          {reports.map((report) => (
            <button key={report.path} type="button" onClick={() => void open(report)} className="focus-ring w-full rounded-md border border-line bg-white p-3 text-left hover:bg-slate-50">
          <div className="flex items-center justify-between gap-3">
                <span className="min-w-0 truncate text-sm font-semibold text-ink">{report.displayTitle}</span>
                <span className="shrink-0 rounded-md bg-slate-100 px-2 py-1 text-[11px] text-slate-600">{report.categoryLabel}</span>
              </div>
              <p className="mt-2 text-xs text-slate-500">{formatDateTime(report.updatedAt)} · {formatBytes(report.size)}</p>
              <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-600">{report.summaryLines[0] ?? "暂无摘要"}</p>
            </button>
          ))}
          {reports.length === 0 ? (
            <div className="rounded-md border border-dashed border-line bg-white p-4 text-sm text-slate-500">
              没有找到匹配报告。请先确认设置页里的项目路径指向包含 reports/ebos 的 EBOS 项目目录，也可以切换筛选条件或清空搜索词。
            </div>
          ) : null}
        </div>
      </aside>
      <main>
        <ReportViewer report={selected} onOpenFolder={(path) => operatorApi.openContainingFolder(path)} />
        <section className="mt-4 rounded-md border border-line bg-white p-5">
          <h3 className="font-semibold text-ink">下一步建议</h3>
          <p className="mt-2 text-sm text-slate-600">
            新手优先查看“最终报告”和“外部发布”。如果摘要提示等待真实数据，就去外部数据页录入真实链接和数据。
          </p>
        </section>
      </main>
    </div>
  );
}
