import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("desktop packaging configuration", () => {
  it("uses relative Vite asset paths for file:// packaged loading", () => {
    const viteConfig = readFileSync(join(process.cwd(), "vite.config.ts"), "utf8");
    expect(viteConfig).toContain('base: "./"');
  });

  it("loads packaged files from Electron app path instead of process cwd", () => {
    const mainSource = readFileSync(join(process.cwd(), "electron", "main.ts"), "utf8");
    expect(mainSource).toContain("app.getAppPath()");
    expect(mainSource).toContain('loadFile(join(getApplicationRoot(), "dist", "index.html"))');
  });

  it("builds both an NSIS installer and an unpacked Windows app", () => {
    const packageJson = JSON.parse(readFileSync(join(process.cwd(), "package.json"), "utf8")) as {
      scripts: Record<string, string>;
      build: { win: { target: string[] }; nsis: Record<string, unknown> };
    };

    expect(packageJson.scripts["package:win"]).toBe("npm run build && electron-builder --win");
    expect(packageJson.build.win.target).toEqual(["nsis", "dir"]);
    expect(packageJson.build.nsis.createDesktopShortcut).toBe(true);
    expect(packageJson.build.nsis.createStartMenuShortcut).toBe(true);
  });
});
