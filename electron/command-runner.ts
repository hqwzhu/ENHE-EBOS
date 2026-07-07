import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { CommandId, CommandRunResult } from "../src/lib/types";
import { createCommandPlan, sanitizeOutput, validateCommand, writeSafetyAudit } from "./safety-guard";
import { exists } from "./settings-service";

export async function runEbosCommand(appRoot: string, projectPath: string, commandId: CommandId, targetDate: string): Promise<CommandRunResult> {
  const startedAt = new Date().toISOString();
  const plan = createCommandPlan(commandId, targetDate);
  const safety = validateCommand(plan);
  const cwdValid = await isValidEbosProject(projectPath);
  const safetyReasons = [...safety.reasons];

  if (!cwdValid) {
    safetyReasons.push("Configured EBOS project path is invalid.");
  }

  if (!safety.allowed || !cwdValid) {
    await writeSafetyAudit(appRoot, {
      commandId,
      command: safety.sanitizedCommand,
      allowed: false,
      reasons: safetyReasons,
      cwd: projectPath,
    });
    return {
      commandId,
      command: safety.sanitizedCommand,
      cwd: projectPath,
      blocked: true,
      exitCode: null,
      stdout: "",
      stderr: safetyReasons.join("\n"),
      safetyReasons,
      logPath: null,
      startedAt,
      finishedAt: new Date().toISOString(),
    };
  }

  const result = await spawnCommand(plan.executable, plan.args, projectPath);
  const stdout = sanitizeOutput(result.stdout);
  const stderr = sanitizeOutput(result.stderr);
  const finishedAt = new Date().toISOString();
  const logPath = await writeCommandLog(appRoot, commandId, {
    command: plan.command,
    cwd: projectPath,
    startedAt,
    finishedAt,
    exitCode: result.exitCode,
    stdout,
    stderr,
  });

  await writeSafetyAudit(appRoot, {
    commandId,
    command: safety.sanitizedCommand,
    allowed: true,
    reasons: [],
    cwd: projectPath,
    logPath,
    exitCode: result.exitCode,
  });

  return {
    commandId,
    command: plan.command,
    cwd: projectPath,
    blocked: false,
    exitCode: result.exitCode,
    stdout,
    stderr,
    safetyReasons: [],
    logPath,
    startedAt,
    finishedAt,
  };
}

export async function isValidEbosProject(projectPath: string) {
  return (
    (await exists(projectPath)) &&
    (await exists(join(projectPath, "package.json"))) &&
    (await exists(join(projectPath, "reports", "ebos")))
  );
}

async function spawnCommand(executable: string, args: string[], cwd: string): Promise<{ stdout: string; stderr: string; exitCode: number | null }> {
  return new Promise((resolve) => {
    const child = spawn(executable, args, {
      cwd,
      shell: false,
      windowsHide: true,
      env: minimalEnvironment(process.env),
    });
    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("error", (error) => {
      stderr += error.message;
    });
    child.on("close", (exitCode) => {
      resolve({ stdout, stderr, exitCode });
    });
  });
}

async function writeCommandLog(appRoot: string, commandId: CommandId, body: Record<string, unknown>) {
  const safeTimestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const dir = join(appRoot, "logs", "commands");
  await mkdir(dir, { recursive: true });
  const path = join(dir, `${safeTimestamp}-${commandId}.json`);
  await writeFile(path, `${JSON.stringify(body, null, 2)}\n`, "utf8");
  return path;
}

function minimalEnvironment(env: NodeJS.ProcessEnv) {
  const allowedKeys = ["PATH", "Path", "PATHEXT", "SYSTEMROOT", "SystemRoot", "TEMP", "TMP", "COMSPEC", "HOME", "USERPROFILE", "APPDATA", "LOCALAPPDATA"];
  return Object.fromEntries(Object.entries(env).filter(([key]) => allowedKeys.includes(key)));
}
