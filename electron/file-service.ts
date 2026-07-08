import { execFile } from "node:child_process";
import { copyFile, mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import { basename, dirname, extname, isAbsolute, join, relative, resolve } from "node:path";
import { promisify } from "node:util";
import {
  defaultTargetDate,
  externalDataPayloadSchema,
  schemaCheckResultSchema,
  type DashboardData,
  type ExternalDataPayload,
  type PathValidationResult,
  type ReportContent,
  type ReportSummary,
  type RiskSummary,
  type SchemaCheckResult,
  type SchemaKit,
  type WeeklyOpsData,
} from "../src/lib/types";
import { exists } from "./settings-service";

const execFileAsync = promisify(execFile);

export async function validateProjectPath(projectPath: string): Promise<PathValidationResult> {
  const packageJson = join(projectPath, "package.json");
  const reports = join(projectPath, "reports", "ebos");
  const weeklyScript = join(projectPath, "scripts", "run-ebos-weekly-operating-cycle.ts");
  const [pathExists, packageJsonExists, reportsExists, weeklyScriptExists, nodeAvailable, npmAvailable, npxAvailable] =
    await Promise.all([
      exists(projectPath),
      exists(packageJson),
      exists(reports),
      exists(weeklyScript),
      commandAvailable("node", ["--version"]),
      commandAvailable(process.platform === "win32" ? "npm.cmd" : "npm", ["--version"]),
      commandAvailable(process.platform === "win32" ? "npx.cmd" : "npx", ["--version"]),
    ]);

  const messages = [
    pathExists ? "项目路径存在。" : "项目路径不存在。",
    packageJsonExists ? "已找到项目配置文件。" : "缺少项目配置文件。",
    reportsExists ? "已找到报告目录。" : "缺少报告目录。",
    weeklyScriptExists ? "已找到每周运营脚本。" : "缺少每周运营脚本。",
    nodeAvailable ? "本机运行环境可用。" : "本机运行环境不可用。",
    npmAvailable ? "包管理工具可用。" : "包管理工具不可用。",
    npxAvailable ? "命令执行工具可用。" : "命令执行工具不可用。",
  ];

  return {
    exists: pathExists,
    packageJsonExists,
    reportsExists,
    weeklyScriptExists,
    nodeAvailable,
    npmAvailable,
    npxAvailable,
    messages,
  };
}

export async function getDashboard(projectPath: string): Promise<DashboardData> {
  const finalPath = await findLatestFinalReport(projectPath);
  const parsed = finalPath ? await readJson(finalPath) : {};
  const currentStatuses = record(parsed.currentStatuses);
  const gitOperations = record(parsed.gitOperations);
  const finalQualityGate = record(parsed.finalQualityGate);

  return {
    sourcePath: finalPath ?? "",
    operationsReady: Boolean(parsed.operationsReady),
    deploymentStatus: stringValue(currentStatuses.deploymentStatus, "unknown"),
    postLaunchCheckStatus: stringValue(currentStatuses.postLaunchCheckStatus, "unknown"),
    externalPublishingStatus: stringValue(currentStatuses.externalPublishingStatus, "unknown"),
    hasRealSignals: Boolean(currentStatuses.hasRealSignals),
    canBackfill: Boolean(currentStatuses.canBackfill),
    safeToRunMigration: Boolean(currentStatuses.safeToRunMigration),
    lastQualityGate: stringValue(finalQualityGate.status, stringValue(finalQualityGate.qualityGatePassed, "unknown")),
    lastCommitHash: stringValue(gitOperations.commitHash, "none"),
    remainingBlockers: stringArray(parsed.remainingBlockers),
    nonBlockingRisks: stringArray(parsed.nonBlockingRisks),
  };
}

export async function saveExternalData(projectPath: string, payload: ExternalDataPayload) {
  const parsed = externalDataPayloadSchema.parse(payload);
  const outputPath = join(projectPath, "reports", "ebos", "external-publishing", "inputs", "operator-user-real-data-input.json");
  await mkdir(dirname(outputPath), { recursive: true });
  const body = {
    inputType: "operator_user_real_data_input",
    savedAt: new Date().toISOString(),
    note: "Only real observed data is allowed. The operator app does not generate publishedUrl or fake metrics.",
    ...parsed,
  };
  await writeFile(outputPath, `${JSON.stringify(body, null, 2)}\n`, "utf8");
  return {
    path: outputPath,
    entries: parsed.entries.length,
  };
}

export async function listReports(projectPath: string, filter = "all", search = ""): Promise<ReportSummary[]> {
  const root = join(projectPath, "reports", "ebos");
  if (!(await exists(root))) return [];
  const files = await walk(root);
  const normalizedSearch = search.trim().toLowerCase();
  const summaries = await Promise.all(
    files
      .filter((file) => [".json", ".md"].includes(extname(file).toLowerCase()))
      .map(async (file) => summarizeReport(root, file)),
  );

  return summaries
    .filter((summary) => filter === "all" || summary.type === filter)
    .filter((summary) => !normalizedSearch || summary.fileName.toLowerCase().includes(normalizedSearch))
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export async function readReport(reportPath: string): Promise<ReportContent> {
  if (!isAbsolute(reportPath)) {
    throw new Error("Report path must be absolute.");
  }
  if (!/\.(json|md)$/i.test(reportPath)) {
    throw new Error("Only JSON and Markdown reports can be read.");
  }
  const content = await readFile(reportPath, "utf8");
  const root = reportPath.includes(`${join("reports", "ebos")}`) ? reportPath.slice(0, reportPath.indexOf(join("reports", "ebos")) + join("reports", "ebos").length) : dirname(reportPath);
  return {
    ...(await summarizeReport(root, reportPath)),
    content,
  };
}

export async function getRisks(projectPath: string): Promise<RiskSummary[]> {
  const final = await readOptionalJson(await findLatestFinalReport(projectPath));
  const quarantine = record(final?.quarantineAndReviewStatus);
  const risks: RiskSummary[] = [
    riskFromRecord("Package quarantine", record(quarantine.packageQuarantine), "high", "Package files remain quarantined."),
    riskFromRecord("Prisma migration quarantine", record(quarantine.prismaMigrationQuarantine), "critical", "Migration files require manual checks."),
    riskFromRecord("Seed quarantine", record(quarantine.seedQuarantine), "high", "Seed files must not run in production."),
    riskFromRecord("Admin/API/Core review", record(quarantine.adminApiCoreReview), "high", "Admin/API/core files need dedicated review."),
    riskFromRecord("Unknown/risky files", record(quarantine.unknownRiskyReview), "high", "Unknown risky files remain separated."),
    {
      title: "Production/staging schema manual check",
      riskLevel: "high",
      status: "manual_check_required",
      reason: "Production/staging readonly schema state has not been verified by an authorized human.",
      canRunNow: false,
      canCommitNow: false,
      requiresUserConfirmation: true,
      nextAction: "Use the manual schema check kit. Do not run migration from this app.",
    },
    {
      title: "External real data waiting",
      riskLevel: "medium",
      status: stringValue(record(final?.currentStatuses).externalPublishingStatus, "waiting_real_data"),
      reason: "Real external channel URL and metrics are required before backfill apply can be considered.",
      canRunNow: false,
      canCommitNow: false,
      requiresUserConfirmation: true,
      nextAction: "Collect real channel data and run check plus backfill dry-run only.",
    },
  ];
  return risks;
}

export async function getSchemaKit(projectPath: string): Promise<SchemaKit> {
  const markdownPath = join(projectPath, "reports", "ebos", "deployment", "prisma-audit", "2026-07-03-production-staging-manual-schema-check-kit.md");
  const sqlPath = join(projectPath, "reports", "ebos", "deployment", "prisma-audit", "2026-07-03-production-staging-schema-readonly-query-pack.sql");
  const [markdown, sql] = await Promise.all([readOptionalText(markdownPath), readOptionalText(sqlPath)]);
  return {
    markdownPath,
    sqlPath,
    markdown,
    sql,
    selectOnly: isSelectOnlySql(sql),
  };
}

export async function saveSchemaCheckResult(projectPath: string, result: SchemaCheckResult) {
  const parsed = schemaCheckResultSchema.parse({
    ...result,
    savedAt: new Date().toISOString(),
  });
  const outputPath = join(projectPath, "reports", "ebos", "deployment", "prisma-audit", "operator-production-staging-schema-check-result.json");
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(parsed, null, 2)}\n`, "utf8");
  return { path: outputPath };
}

export async function getWeeklyOps(projectPath: string, targetDate = defaultTargetDate): Promise<WeeklyOpsData> {
  const final = await readOptionalJson(await findLatestFinalReport(projectPath));
  const status = record(final?.currentStatuses);
  const weeklyReportPath = await findLatestMatching(join(projectPath, "reports", "ebos", "weekly"), /\.md$/i);
  const weeklyReportPreview = weeklyReportPath ? (await readOptionalText(weeklyReportPath)).slice(0, 5000) : "";
  return {
    targetDate,
    weeklyReportPath,
    weeklyReportPreview,
    nextActions: stringArray(final?.firstWeekOperatingActions),
    hasRealSignals: Boolean(status.hasRealSignals),
    canBackfill: Boolean(status.canBackfill),
    safeToRunMigration: Boolean(status.safeToRunMigration),
    blockers: stringArray(final?.remainingBlockers),
  };
}

export async function copyReportTo(appRoot: string, reportPath: string) {
  const outputDir = join(appRoot, "reports", "exports");
  await mkdir(outputDir, { recursive: true });
  const outputPath = join(outputDir, basename(reportPath));
  await copyFile(reportPath, outputPath);
  return outputPath;
}

async function findLatestFinalReport(projectPath: string) {
  const preferred = join(projectPath, "reports", "ebos", "final", "2026-07-03-ebos-operations-ready-final-report.json");
  if (await exists(preferred)) return preferred;
  return findLatestMatching(join(projectPath, "reports", "ebos", "final"), /\.json$/i);
}

async function findLatestMatching(dir: string, pattern: RegExp) {
  if (!(await exists(dir))) return null;
  const files = (await walk(dir)).filter((file) => pattern.test(file));
  if (files.length === 0) return null;
  const stats = await Promise.all(files.map(async (file) => ({ file, stat: await stat(file) })));
  return stats.sort((a, b) => b.stat.mtimeMs - a.stat.mtimeMs)[0]?.file ?? null;
}

async function summarizeReport(root: string, file: string): Promise<ReportSummary> {
  const fileStat = await stat(file);
  const extension = extname(file).toLowerCase();
  const content = extension === ".json" ? await readOptionalJson(file) : null;
  const relativePath = relative(root, file);
  return {
    path: file,
    relativePath,
    fileName: basename(file),
    type: typeFromPath(relativePath),
    extension: extension === ".json" ? "json" : extension === ".md" ? "md" : "other",
    updatedAt: fileStat.mtime.toISOString(),
    size: fileStat.size,
    summary: summarizeJson(content),
  };
}

async function walk(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const path = join(dir, entry.name);
      return entry.isDirectory() ? walk(path) : Promise.resolve([path]);
    }),
  );
  return files.flat();
}

async function readJson(path: string): Promise<Record<string, unknown>> {
  return JSON.parse(await readFile(path, "utf8")) as Record<string, unknown>;
}

async function readOptionalJson(path: string | null): Promise<Record<string, unknown> | null> {
  if (!path) return null;
  try {
    return await readJson(path);
  } catch {
    return null;
  }
}

async function readOptionalText(path: string) {
  try {
    return await readFile(path, "utf8");
  } catch {
    return "";
  }
}

function summarizeJson(content: Record<string, unknown> | null): Record<string, unknown> {
  if (!content) return {};
  const keys = [
    "reportType",
    "targetDate",
    "operationsReady",
    "deploymentStatus",
    "externalPublishingStatus",
    "safeToRunMigration",
    "qualityGatePassed",
    "canBackfill",
    "hasRealSignals",
    "status",
    "riskLevel",
    "commitHash",
  ];
  return Object.fromEntries(keys.filter((key) => key in content).map((key) => [key, content[key]]));
}

function typeFromPath(path: string) {
  const normalized = path.replace(/\\/g, "/");
  if (normalized.includes("prisma-audit")) return "prisma-audit";
  if (normalized.includes("package-audit")) return "package-audit";
  if (normalized.includes("seed-audit")) return "seed-audit";
  if (normalized.includes("core-audit")) return "core-audit";
  if (normalized.includes("unknown-audit")) return "unknown-audit";
  return normalized.split("/")[0] || "other";
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String) : [];
}

function stringValue(value: unknown, fallback: string) {
  if (value === undefined || value === null || value === "") return fallback;
  return String(value);
}

function riskFromRecord(title: string, data: Record<string, unknown>, riskLevel: RiskSummary["riskLevel"], fallbackReason: string): RiskSummary {
  return {
    title,
    riskLevel,
    status: stringValue(data.status, "quarantined"),
    reason: stringValue(data.reason, fallbackReason),
    canRunNow: Boolean(data.canRunNow),
    canCommitNow: Boolean(data.canCommitNow ?? data.safeToCommit),
    requiresUserConfirmation: Boolean(data.requiresUserConfirmation ?? true),
    nextAction: stringValue(data.nextAction ?? data.recommendedAction, "Keep quarantined and review separately."),
  };
}

function isSelectOnlySql(sql: string) {
  const noComments = sql.replace(/--.*$/gm, "");
  if (!noComments.trim()) return false;
  if (/\b(INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|TRUNCATE)\b/i.test(noComments)) return false;
  return noComments
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .every((statement) => /^SELECT\b/i.test(statement));
}

async function commandAvailable(command: string, args: string[]) {
  try {
    await execFileAsync(command, args, { timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

export function assertPathInsideProject(projectPath: string, candidatePath: string) {
  const root = resolve(projectPath);
  const target = resolve(candidatePath);
  if (!target.startsWith(root)) {
    throw new Error("Path is outside the configured EBOS project.");
  }
}
