import { contextBridge, ipcRenderer } from "electron";
import type {
  CommandId,
  ExternalDataPayload,
  OperatorApi,
  OperatorSettings,
  SchemaCheckResult,
} from "../src/lib/types";

const api: OperatorApi = {
  getSettings: () => ipcRenderer.invoke("settings:get"),
  saveSettings: (settings: OperatorSettings) => ipcRenderer.invoke("settings:save", settings),
  validateProjectPath: (projectPath: string) => ipcRenderer.invoke("project:validate", projectPath),
  getDashboard: (projectPath: string) => ipcRenderer.invoke("dashboard:get", projectPath),
  saveExternalData: (projectPath: string, payload: ExternalDataPayload) =>
    ipcRenderer.invoke("external-data:save", projectPath, payload),
  runCommand: (projectPath: string, commandId: CommandId, targetDate: string) =>
    ipcRenderer.invoke("command:run", projectPath, commandId, targetDate),
  listReports: (projectPath: string, filter?: string, search?: string) =>
    ipcRenderer.invoke("reports:list", projectPath, filter, search),
  readReport: (reportPath: string) => ipcRenderer.invoke("reports:read", reportPath),
  openContainingFolder: (filePath: string) => ipcRenderer.invoke("reports:open-folder", filePath),
  getRisks: (projectPath: string) => ipcRenderer.invoke("risks:get", projectPath),
  getSchemaKit: (projectPath: string) => ipcRenderer.invoke("schema-kit:get", projectPath),
  saveSchemaCheckResult: (projectPath: string, result: SchemaCheckResult) =>
    ipcRenderer.invoke("schema-kit:save-result", projectPath, result),
  getWeeklyOps: (projectPath: string, targetDate: string) => ipcRenderer.invoke("weekly:get", projectPath, targetDate),
};

contextBridge.exposeInMainWorld("ebos", api);
