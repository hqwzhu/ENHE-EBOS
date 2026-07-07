import type {
  CommandId,
  ExternalDataPayload,
  OperatorSettings,
  SchemaCheckResult,
} from "./types";

function getApi() {
  if (!window.ebos) {
    throw new Error("EBOS preload API is unavailable.");
  }

  return window.ebos;
}

export const operatorApi = {
  getSettings: () => getApi().getSettings(),
  saveSettings: (settings: OperatorSettings) => getApi().saveSettings(settings),
  validateProjectPath: (projectPath: string) => getApi().validateProjectPath(projectPath),
  getDashboard: (projectPath: string) => getApi().getDashboard(projectPath),
  saveExternalData: (projectPath: string, payload: ExternalDataPayload) =>
    getApi().saveExternalData(projectPath, payload),
  runCommand: (projectPath: string, commandId: CommandId, targetDate: string) =>
    getApi().runCommand(projectPath, commandId, targetDate),
  listReports: (projectPath: string, filter?: string, search?: string) =>
    getApi().listReports(projectPath, filter, search),
  readReport: (reportPath: string) => getApi().readReport(reportPath),
  openContainingFolder: (filePath: string) => getApi().openContainingFolder(filePath),
  getRisks: (projectPath: string) => getApi().getRisks(projectPath),
  getSchemaKit: (projectPath: string) => getApi().getSchemaKit(projectPath),
  saveSchemaCheckResult: (projectPath: string, result: SchemaCheckResult) =>
    getApi().saveSchemaCheckResult(projectPath, result),
  getWeeklyOps: (projectPath: string, targetDate: string) => getApi().getWeeklyOps(projectPath, targetDate),
};
