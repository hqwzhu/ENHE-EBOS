import { z } from "zod";

export const defaultEbosProjectPath = "C:\\Users\\HU\\Documents\\New project 2";
export const defaultTargetDate = "2026-07-03";

export const commandIdSchema = z.enum([
  "external-check",
  "backfill-dry-run",
  "weekly-dry-run",
  "ebos-test",
  "lint",
  "typecheck",
  "build",
]);

export type CommandId = z.infer<typeof commandIdSchema>;

export const operatorSettingsSchema = z.object({
  ebosProjectPath: z.string().min(1),
  defaultDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export type OperatorSettings = z.infer<typeof operatorSettingsSchema>;

export const externalDataEntrySchema = z.object({
  platform: z.string().min(1, "platform is required"),
  channelName: z.string().min(1, "channelName is required"),
  published: z.boolean(),
  publishedAt: z.string().optional().default(""),
  publishedUrl: z.string().trim().optional().default(""),
  views: z.coerce.number().int().min(0),
  clicks: z.coerce.number().int().min(0),
  messages: z.coerce.number().int().min(0),
  leads: z.coerce.number().int().min(0),
  orders: z.coerce.number().int().min(0),
  revenue: z.coerce.number().min(0),
  evidence: z.string().optional().default(""),
  notes: z.string().optional().default(""),
});

export const externalDataPayloadSchema = z
  .object({
    targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    entries: z.array(externalDataEntrySchema).min(1),
    operatorNote: z.string().optional(),
  })
  .superRefine((payload, ctx) => {
    payload.entries.forEach((entry, index) => {
      if (entry.published && entry.publishedUrl.trim().length === 0) {
        ctx.addIssue({
          code: "custom",
          path: ["entries", index, "publishedUrl"],
          message: "published=true requires a real publishedUrl. Do not invent one.",
        });
      }
    });
  });

export type ExternalDataEntry = z.infer<typeof externalDataEntrySchema>;
export type ExternalDataPayload = z.infer<typeof externalDataPayloadSchema>;

export const schemaCheckResultSchema = z.object({
  targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  productionAlreadyApplied: z.boolean(),
  productionPartiallyApplied: z.boolean(),
  productionMissing: z.boolean(),
  stagingAlreadyApplied: z.boolean(),
  stagingPartiallyApplied: z.boolean(),
  stagingMissing: z.boolean(),
  evidenceNotes: z.string().optional().default(""),
  savedAt: z.string().optional(),
});

export type SchemaCheckResult = z.infer<typeof schemaCheckResultSchema>;

export type DashboardData = {
  sourcePath: string;
  operationsReady: boolean;
  deploymentStatus: string;
  postLaunchCheckStatus: string;
  externalPublishingStatus: string;
  hasRealSignals: boolean;
  canBackfill: boolean;
  safeToRunMigration: boolean;
  lastQualityGate: string;
  lastCommitHash: string;
  remainingBlockers: string[];
  nonBlockingRisks: string[];
};

export type ReportSummary = {
  path: string;
  relativePath: string;
  fileName: string;
  type: string;
  extension: "json" | "md" | "other";
  updatedAt: string;
  size: number;
  summary: Record<string, unknown>;
};

export type ReportContent = ReportSummary & {
  content: string;
};

export type RiskSummary = {
  title: string;
  riskLevel: "low" | "medium" | "high" | "critical";
  status: string;
  reason: string;
  canRunNow: boolean;
  canCommitNow: boolean;
  requiresUserConfirmation: boolean;
  nextAction: string;
};

export type CommandRunResult = {
  commandId: CommandId;
  command: string;
  cwd: string;
  blocked: boolean;
  exitCode: number | null;
  stdout: string;
  stderr: string;
  safetyReasons: string[];
  logPath: string | null;
  startedAt: string;
  finishedAt: string;
};

export type PathValidationResult = {
  exists: boolean;
  packageJsonExists: boolean;
  reportsExists: boolean;
  weeklyScriptExists: boolean;
  nodeAvailable: boolean;
  npmAvailable: boolean;
  npxAvailable: boolean;
  messages: string[];
};

export type SchemaKit = {
  markdownPath: string;
  sqlPath: string;
  markdown: string;
  sql: string;
  selectOnly: boolean;
};

export type WeeklyOpsData = {
  targetDate: string;
  weeklyReportPath: string | null;
  weeklyReportPreview: string;
  nextActions: string[];
  hasRealSignals: boolean;
  canBackfill: boolean;
  safeToRunMigration: boolean;
  blockers: string[];
};

export type OperatorApi = {
  getSettings: () => Promise<OperatorSettings>;
  saveSettings: (settings: OperatorSettings) => Promise<OperatorSettings>;
  validateProjectPath: (projectPath: string) => Promise<PathValidationResult>;
  getDashboard: (projectPath: string) => Promise<DashboardData>;
  saveExternalData: (projectPath: string, payload: ExternalDataPayload) => Promise<{ path: string; entries: number }>;
  runCommand: (projectPath: string, commandId: CommandId, targetDate: string) => Promise<CommandRunResult>;
  listReports: (projectPath: string, filter?: string, search?: string) => Promise<ReportSummary[]>;
  readReport: (reportPath: string) => Promise<ReportContent>;
  openContainingFolder: (filePath: string) => Promise<{ opened: boolean }>;
  getRisks: (projectPath: string) => Promise<RiskSummary[]>;
  getSchemaKit: (projectPath: string) => Promise<SchemaKit>;
  saveSchemaCheckResult: (projectPath: string, result: SchemaCheckResult) => Promise<{ path: string }>;
  getWeeklyOps: (projectPath: string, targetDate: string) => Promise<WeeklyOpsData>;
};

declare global {
  interface Window {
    ebos: OperatorApi;
  }
}
