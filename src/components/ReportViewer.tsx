import { Copy, FolderOpen } from "lucide-react";
import type { ReportContent } from "../lib/types";
import { formatBytes, formatDateTime } from "../lib/format";

type ReportViewerProps = {
  report: ReportContent | null;
  onOpenFolder: (path: string) => void;
};

export default function ReportViewer({ report, onOpenFolder }: ReportViewerProps) {
  if (!report) {
    return (
      <div className="rounded-md border border-dashed border-line bg-white p-6 text-sm text-slate-500">
        从左侧选择一份报告。应用会先显示中文摘要，原始技术明细默认折叠。
      </div>
    );
  }

  return (
    <div className="rounded-md border border-line bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
        <div className="min-w-0">
          <div className="text-xs font-medium text-action">{report.categoryLabel}</div>
          <h3 className="mt-1 truncate text-base font-semibold text-ink">{report.displayTitle}</h3>
          <p className="mt-1 text-xs text-slate-500">
            更新时间：{formatDateTime(report.updatedAt)}，大小：{formatBytes(report.size)}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void navigator.clipboard.writeText(report.path)}
            className="focus-ring inline-flex items-center gap-2 rounded-md border border-line px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            <Copy className="h-4 w-4" />
            复制路径
          </button>
          <button
            type="button"
            onClick={() => onOpenFolder(report.path)}
            className="focus-ring inline-flex items-center gap-2 rounded-md bg-action px-3 py-2 text-sm font-medium text-white hover:bg-teal-800"
          >
            <FolderOpen className="h-4 w-4" />
            打开目录
          </button>
        </div>
      </div>
      <section className="p-5">
        <h4 className="text-sm font-semibold text-ink">中文摘要</h4>
        <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
          {report.summaryLines.map((line) => (
            <li key={line} className="rounded-md bg-panel px-3 py-2">
              {line}
            </li>
          ))}
        </ul>
        <div className="mt-5 rounded-md border border-teal-200 bg-teal-50 p-4 text-sm leading-6 text-teal-950">
          这份报告主要帮助你判断：当前经营系统是否正常、是否有阻塞项、下一步是否需要录入真实渠道数据，或是否需要人工审计风险。
        </div>
      </section>
      <details className="border-t border-line">
        <summary className="cursor-pointer px-5 py-4 text-sm font-semibold text-slate-700">
          查看原始技术明细
        </summary>
        <div className="border-t border-line bg-slate-50 px-5 py-3 text-xs leading-5 text-slate-600">
          以下内容来自原始报告文件，可能包含英文文件名、字段名或技术日志。普通使用时无需阅读。
        </div>
        <pre className="max-h-[520px] overflow-auto p-4 text-xs leading-5 text-slate-800">{report.content}</pre>
      </details>
    </div>
  );
}
