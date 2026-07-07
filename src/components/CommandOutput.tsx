import type { CommandRunResult } from "../lib/types";

type CommandOutputProps = {
  result: CommandRunResult | null;
};

export default function CommandOutput({ result }: CommandOutputProps) {
  if (!result) {
    return (
      <div className="rounded-md border border-dashed border-line bg-white p-5 text-sm text-slate-500">
        运行白名单命令后，stdout、stderr、退出码和日志路径会显示在这里。
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <Info label="命令" value={result.command} />
        <Info label="退出码" value={result.exitCode === null ? "blocked" : String(result.exitCode)} />
        <Info label="是否阻止" value={result.blocked ? "是" : "否"} />
        <Info label="日志路径" value={result.logPath ?? "未写入"} />
      </div>
      {result.safetyReasons.length > 0 ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-900">
          <div className="font-semibold">阻止原因</div>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {result.safetyReasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </div>
      ) : null}
      <OutputBlock title="stdout" content={result.stdout} />
      <OutputBlock title="stderr" content={result.stderr} tone="danger" />
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-line bg-white p-3">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 break-all text-sm font-medium text-ink">{value}</div>
    </div>
  );
}

function OutputBlock({ title, content, tone = "neutral" }: { title: string; content: string; tone?: "neutral" | "danger" }) {
  return (
    <div className="overflow-hidden rounded-md border border-line bg-white">
      <div className={tone === "danger" ? "border-b border-red-100 bg-red-50 px-4 py-2 text-sm font-semibold text-red-900" : "border-b border-line bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700"}>
        {title}
      </div>
      <pre className="max-h-72 overflow-auto p-4 text-xs leading-5 text-slate-800">{content || "无输出"}</pre>
    </div>
  );
}
