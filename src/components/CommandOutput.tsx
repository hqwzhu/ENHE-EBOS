import type { CommandRunResult } from "../lib/types";
import { summarizeRiskText } from "../lib/display";

type CommandOutputProps = {
  result: CommandRunResult | null;
};

export default function CommandOutput({ result }: CommandOutputProps) {
  if (!result) {
    return (
      <div className="rounded-md border border-dashed border-line bg-white p-5 text-sm text-slate-500">
        点击上方安全按钮后，这里会显示中文结果摘要。技术命令和原始输出默认折叠，新手通常不需要展开。
      </div>
    );
  }

  const success = !result.blocked && result.exitCode === 0;
  const statusText = result.blocked ? "已被安全拦截" : success ? "运行完成" : "运行失败";
  const statusHint = result.blocked
    ? "安全守卫阻止了这次操作，请不要绕过拦截。"
    : success
      ? "本次命令已正常结束。需要排查时再展开技术输出。"
      : "本次命令没有正常结束，请把技术输出交给开发人员排查。";

  return (
    <div className="space-y-4">
      <section className="rounded-md border border-line bg-white p-5">
        <h3 className="font-semibold text-ink">运行结果：{statusText}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">{statusHint}</p>
        <div className="mt-4 grid grid-cols-3 gap-3">
          <Info label="退出码" value={result.exitCode === null ? "已拦截" : String(result.exitCode)} />
          <Info label="是否拦截" value={result.blocked ? "是" : "否"} />
          <Info label="日志路径" value={result.logPath ?? "未写入"} />
        </div>
      </section>
      {result.safetyReasons.length > 0 ? (
        <section className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-900">
          <div className="font-semibold">拦截原因</div>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {result.safetyReasons.map((reason) => (
              <li key={reason}>{summarizeRiskText(reason)}</li>
            ))}
          </ul>
        </section>
      ) : null}
      <details className="rounded-md border border-line bg-white">
        <summary className="cursor-pointer px-5 py-4 text-sm font-semibold text-slate-700">
          查看原始技术输出
        </summary>
        <div className="border-t border-line bg-slate-50 px-5 py-3 text-xs leading-5 text-slate-600">
          以下内容可能包含英文命令、脚本路径或工具日志。普通运营使用时无需阅读。
        </div>
        <div className="grid grid-cols-4 gap-3 p-4">
          <Info label="执行命令" value={result.command} />
        <Info label="退出码" value={result.exitCode === null ? "已拦截" : String(result.exitCode)} />
        <Info label="是否拦截" value={result.blocked ? "是" : "否"} />
        <Info label="日志路径" value={result.logPath ?? "未写入"} />
        </div>
        <div className="space-y-4 p-4 pt-0">
          <OutputBlock title="正常输出" content={result.stdout} />
          <OutputBlock title="错误输出" content={result.stderr} tone="danger" />
        </div>
      </details>
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
