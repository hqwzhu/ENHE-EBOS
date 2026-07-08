import { app, BrowserWindow, ipcMain, shell } from "electron";
import { dirname, join } from "node:path";
import type { CommandId, ExternalDataPayload, OperatorSettings, SchemaCheckResult } from "../src/lib/types";
import {
  getDashboard,
  getRisks,
  getSchemaKit,
  getWeeklyOps,
  listReports,
  readReport,
  saveExternalData,
  saveSchemaCheckResult,
  validateProjectPath,
} from "./file-service";
import { runEbosCommand } from "./command-runner";
import { readSettings, saveSettings } from "./settings-service";

const appRoot = process.cwd();

async function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1360,
    height: 880,
    minWidth: 1120,
    minHeight: 720,
    title: "ENHE EBOS Operator",
    icon: getWindowIconPath(),
    backgroundColor: "#f7f8fa",
    webPreferences: {
      preload: join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  const devUrl = process.env.VITE_DEV_SERVER_URL;
  if (devUrl) {
    await mainWindow.loadURL(devUrl);
  } else {
    await mainWindow.loadFile(join(appRoot, "dist", "index.html"));
  }
}

function getWindowIconPath() {
  if (process.env.VITE_DEV_SERVER_URL) {
    return join(appRoot, "public", "brand", "enhe_app_icon_1024.png");
  }

  return join(appRoot, "dist", "brand", "enhe_app_icon_1024.png");
}

app.whenReady().then(async () => {
  registerIpc();
  await createWindow();

  app.on("activate", async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

function registerIpc() {
  ipcMain.handle("settings:get", () => readSettings(appRoot));
  ipcMain.handle("settings:save", (_event, settings: OperatorSettings) => saveSettings(appRoot, settings));
  ipcMain.handle("project:validate", (_event, projectPath: string) => validateProjectPath(projectPath));
  ipcMain.handle("dashboard:get", (_event, projectPath: string) => getDashboard(projectPath));
  ipcMain.handle("external-data:save", (_event, projectPath: string, payload: ExternalDataPayload) =>
    saveExternalData(projectPath, payload),
  );
  ipcMain.handle("command:run", (_event, projectPath: string, commandId: CommandId, targetDate: string) =>
    runEbosCommand(appRoot, projectPath, commandId, targetDate),
  );
  ipcMain.handle("reports:list", (_event, projectPath: string, filter?: string, search?: string) =>
    listReports(projectPath, filter, search),
  );
  ipcMain.handle("reports:read", (_event, reportPath: string) => readReport(reportPath));
  ipcMain.handle("reports:open-folder", async (_event, filePath: string) => {
    await shell.openPath(dirname(filePath));
    return { opened: true };
  });
  ipcMain.handle("risks:get", (_event, projectPath: string) => getRisks(projectPath));
  ipcMain.handle("schema-kit:get", (_event, projectPath: string) => getSchemaKit(projectPath));
  ipcMain.handle("schema-kit:save-result", (_event, projectPath: string, result: SchemaCheckResult) =>
    saveSchemaCheckResult(projectPath, result),
  );
  ipcMain.handle("weekly:get", (_event, projectPath: string, targetDate: string) => getWeeklyOps(projectPath, targetDate));
}
