import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { defaultEbosProjectPath, defaultTargetDate, operatorSettingsSchema, type OperatorSettings } from "../src/lib/types";

export function settingsPath(appRoot: string) {
  return join(appRoot, "config", "operator-settings.json");
}

export async function readSettings(appRoot: string): Promise<OperatorSettings> {
  const path = settingsPath(appRoot);
  try {
    const raw = await readFile(path, "utf8");
    return operatorSettingsSchema.parse(JSON.parse(raw));
  } catch {
    return {
      ebosProjectPath: defaultEbosProjectPath,
      defaultDate: defaultTargetDate,
    };
  }
}

export async function saveSettings(appRoot: string, settings: OperatorSettings): Promise<OperatorSettings> {
  const parsed = operatorSettingsSchema.parse(settings);
  assertNoSecretLikeValue(parsed);
  const path = settingsPath(appRoot);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(parsed, null, 2)}\n`, "utf8");
  return parsed;
}

export async function exists(path: string) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function assertNoSecretLikeValue(settings: OperatorSettings) {
  const serialized = JSON.stringify(settings);
  if (/DATABASE_URL|TOKEN|PASSWORD|SECRET|COOKIE|\.env/i.test(serialized)) {
    throw new Error("Settings must not contain secrets, cookies, tokens, DATABASE_URL, or .env references.");
  }
}
