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
  { id: "external-check", label: "检查外部发布结果", description: "读取真实数据输入，并计算是否已有真实信号、是否允许回填。" },
  { id: "backfill-dry-run", label: "运行数据回填演练", description: "只做演练，不会写入真实回填数据。" },
  { id: "weekly-dry-run", label: "运行每周运营演练", description: "验证每周运营流程，不创建系统任务。" },
  { id: "ebos-test", label: "运行系统测试", description: "只运行经营系统相关测试。" },
  { id: "lint", label: "运行代码检查", description: "检查代码风格和潜在问题。" },
  { id: "typecheck", label: "运行类型检查", description: "检查类型是否正确。" },
  { id: "build", label: "运行构建检查", description: "检查项目是否能够正常构建。" },
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
            <p className="mt-2 text-sm text-slate-600">
              用户不能输入任意命令，只能点击这里列出的安全按钮。危险命令会被安全守卫拦截。
            </p>
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
        <p className="mt-2 text-sm text-slate-600">
          先运行“检查外部发布结果”，再运行“数据回填演练”。如果某个命令被安全守卫拦截，不要绕过。
        </p>
      </section>
    </div>
  );
}
