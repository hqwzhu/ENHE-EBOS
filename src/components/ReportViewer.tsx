import { Copy, FolderOpen } from "lucide-react";
import type { ReportContent } from "../lib/types";

type ReportViewerProps = {
  report: ReportContent | null;
  onOpenFolder: (path: string) => void;
};

export default function ReportViewer({ report, onOpenFolder }: ReportViewerProps) {
  if (!report) {
    return (
      <div className="rounded-md border border-dashed border-line bg-white p-6 text-sm text-slate-500">
        从左侧选择一份报告查看。
      </div>
    );
  }

  return (
    <div className="rounded-md border border-line bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-ink">{report.fileName}</h3>
          <p className="mt-1 truncate text-xs text-slate-500">{report.path}</p>
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
      <pre className="max-h-[620px] overflow-auto p-4 text-xs leading-5 text-slate-800">{report.content}</pre>
    </div>
  );
}
