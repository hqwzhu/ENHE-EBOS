import { appendFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { CommandId } from "../src/lib/types";

export type CommandPlan = {
  id: CommandId;
  command: string;
  executable: string;
  args: string[];
};

export type SafetyResult = {
  allowed: boolean;
  reasons: string[];
  sanitizedCommand: string;
};

export const forbiddenCommandPatterns = [
  /prisma\s+migrate/i,
  /migrate\s+deploy/i,
  /migrate\s+dev/i,
  /migrate\s+reset/i,
  /prisma\s+db\s+push/i,
  /prisma\s+db\s+seed/i,
  /\bseed\b/i,
  /--apply\b/i,
  /\bdocker\b/i,
  /\bnginx\b/i,
  /\bdeploy\b/i,
  /git\s+add\s+\./i,
  /\bINSERT\b/i,
  /\bUPDATE\b/i,
  /\bDELETE\b/i,
  /\bCREATE\b/i,
  /\bALTER\b/i,
  /\bDROP\b/i,
  /\bTRUNCATE\b/i,
  /DATABASE_URL/i,
  /\.env/i,
];

export const allowedCommandTemplates: Record<CommandId, (date: string) => CommandPlan> = {
  "external-check": (date) => ({
    id: "external-check",
    command: `npx tsx scripts/check-ebos-external-publish-results.ts --date ${date}`,
    executable: executableName("npx"),
    args: ["tsx", "scripts/check-ebos-external-publish-results.ts", "--date", date],
  }),
  "backfill-dry-run": (date) => ({
    id: "backfill-dry-run",
    command: `npx tsx scripts/backfill-ebos-external-channel-data.ts --date ${date}`,
    executable: executableName("npx"),
    args: ["tsx", "scripts/backfill-ebos-external-channel-data.ts", "--date", date],
  }),
  "weekly-dry-run": (date) => ({
    id: "weekly-dry-run",
    command: `npx tsx scripts/run-ebos-weekly-operating-cycle.ts --date ${date} --dry-run`,
    executable: executableName("npx"),
    args: ["tsx", "scripts/run-ebos-weekly-operating-cycle.ts", "--date", date, "--dry-run"],
  }),
  "ebos-test": () => ({
    id: "ebos-test",
    command: "npm run test -- src/lib/ebos",
    executable: executableName("npm"),
    args: ["run", "test", "--", "src/lib/ebos"],
  }),
  lint: () => ({
    id: "lint",
    command: "npm run lint",
    executable: executableName("npm"),
    args: ["run", "lint"],
  }),
  typecheck: () => ({
    id: "typecheck",
    command: "npm run typecheck",
    executable: executableName("npm"),
    args: ["run", "typecheck"],
  }),
  build: () => ({
    id: "build",
    command: "npm run build",
    executable: executableName("npm"),
    args: ["run", "build"],
  }),
};

function executableName(name: "npm" | "npx") {
  return process.platform === "win32" ? `${name}.cmd` : name;
}

export function createCommandPlan(commandId: CommandId, date: string): CommandPlan {
  return allowedCommandTemplates[commandId](date);
}

export function validateCommand(plan: CommandPlan): SafetyResult {
  const reasons: string[] = [];
  const command = plan.command;
  const rebuilt = [plan.executable.replace(/\.cmd$/i, ""), ...plan.args].join(" ");
  const allowedCommands = Object.values(allowedCommandTemplates).map((factory) =>
    normalizeCommand(factory("2026-07-03").command.replace("2026-07-03", "<date>")),
  );
  const normalized = normalizeCommand(command.replace(/\d{4}-\d{2}-\d{2}/g, "<date>"));

  if (!allowedCommands.includes(normalized)) {
    reasons.push("Command is not in the EBOS Operator allowlist.");
  }

  if (!rebuilt.includes(plan.command.split(" ")[0])) {
    reasons.push("Command executable does not match its command plan.");
  }

  for (const pattern of forbiddenCommandPatterns) {
    if (pattern.test(command)) {
      reasons.push(`Forbidden command pattern detected: ${pattern.source}`);
    }
  }

  return {
    allowed: reasons.length === 0,
    reasons,
    sanitizedCommand: sanitizeOutput(command),
  };
}

export function sanitizeOutput(output: string) {
  return output
    .replace(/DATABASE_URL\s*=\s*[^\s]+/gi, "DATABASE_URL=[REDACTED]")
    .replace(/postgres(?:ql)?:\/\/[^\s"']+/gi, "[REDACTED_DATABASE_URL]")
    .replace(/mysql:\/\/[^\s"']+/gi, "[REDACTED_DATABASE_URL]")
    .replace(/([A-Za-z0-9_]*TOKEN[A-Za-z0-9_]*\s*=\s*)[^\s]+/gi, "$1[REDACTED]")
    .replace(/([A-Za-z0-9_]*PASSWORD[A-Za-z0-9_]*\s*=\s*)[^\s]+/gi, "$1[REDACTED]");
}

export function validateOutput(output: string) {
  const sanitized = sanitizeOutput(output);
  return {
    sanitized,
    hadSensitiveContent: sanitized !== output,
  };
}

export async function writeSafetyAudit(appRoot: string, entry: Record<string, unknown>) {
  const date = new Date().toISOString().slice(0, 10);
  const auditPath = join(appRoot, "logs", "safety-audit", `${date}.json`);
  await mkdir(dirname(auditPath), { recursive: true });
  await appendFile(auditPath, `${JSON.stringify({ ...entry, at: new Date().toISOString() })}\n`, "utf8");
  return auditPath;
}

function normalizeCommand(command: string) {
  return command.replace(/\s+/g, " ").trim();
}
