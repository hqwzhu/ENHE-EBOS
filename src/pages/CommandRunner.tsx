import { useState } from "react";
import { Play } from "lucide-react";
import CommandOutput from "../components/CommandOutput";
import SafetyBanner from "../components/SafetyBanner";
import { operatorApi } from "../lib/api";
import { defaultTargetDate, type CommandId, type CommandRunResult, type OperatorSettings } from "../lib/types";

type CommandRunnerProps = {
  settings: OperatorSettings;
};

const commands: Array<{ id: CommandId; label: string; description: string }> = [
  { id: "external-check", label: "检查外部发布结果", description: "读取真实数据输入并计算 hasRealSignals/canBackfill。" },
  { id: "backfill-dry-run", label: "运行 backfill dry-run", description: "只做 dry-run，不允许 --apply。" },
  { id: "weekly-dry-run", label: "运行 weekly operating cycle dry-run", description: "验证每周运营流程，不创建系统任务。" },
  { id: "ebos-test", label: "运行 EBOS test", description: "npm run test -- src/lib/ebos。" },
  { id: "lint", label: "运行 lint", description: "npm run lint。" },
  { id: "typecheck", label: "运行 typecheck", description: "npm run typecheck。" },
  { id: "build", label: "运行 build", description: "npm run build。" },
];

export default function CommandRunner({ settings }: CommandRunnerProps) {
  const [targetDate, setTargetDate] = useState(settings.defaultDate || defaultTargetDate);
  const [running, setRunning] = useState<CommandId | null>(null);
  const [result, setResult] = useState<CommandRunResult | null>(null);

  async function run(commandId: CommandId) {
    setRunning(commandId);
    try {
      setResult(await operatorApi.runCommand(settings.ebosProjectPath, commandId, targetDate));
    } finally {
      setRunning(null);
    }
  }

  return (
    <div className="space-y-5">
      <SafetyBanner />
      <section className="rounded-md border border-line bg-white p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-ink">白名单命令运行</h3>
            <p className="mt-2 text-sm text-slate-600">用户不能输入任意命令，只能点击白名单按钮。所有命令都会写入 logs/commands 和 safety-audit。</p>
          </div>
          <label className="text-sm font-medium text-slate-700">
            目标日期
            <input className="focus-ring mt-2 rounded-md border border-line px-3 py-2" value={targetDate} onChange={(event) => setTargetDate(event.target.value)} />
          </label>
        </div>
      </section>
      <div className="grid grid-cols-3 gap-4">
        {commands.map((command) => (
          <button
            key={command.id}
            type="button"
            onClick={() => run(command.id)}
            disabled={running !== null}
            className="focus-ring rounded-md border border-line bg-white p-4 text-left shadow-sm transition hover:border-teal-300 hover:bg-teal-50 disabled:cursor-wait disabled:opacity-60"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-ink">{command.label}</span>
              <Play className="h-4 w-4 text-action" />
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">{running === command.id ? "运行中..." : command.description}</p>
          </button>
        ))}
      </div>
      <CommandOutput result={result} />
      <section className="rounded-md border border-line bg-white p-5">
        <h3 className="font-semibold text-ink">下一步建议</h3>
        <p className="mt-2 text-sm text-slate-600">先运行检查外部发布结果，再运行 backfill dry-run。任何被 Safety Guard 阻止的命令都不要绕过。</p>
      </section>
    </div>
  );
}
