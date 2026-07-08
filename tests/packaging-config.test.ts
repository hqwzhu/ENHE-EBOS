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

  it("builds one NSIS installer for customer distribution", () => {
    const packageJson = JSON.parse(readFileSync(join(process.cwd(), "package.json"), "utf8")) as {
      scripts: Record<string, string>;
      build: { win: { target: string[] }; nsis: Record<string, unknown> };
    };

    expect(packageJson.scripts["package:win"]).toContain("electron-builder --win nsis");
    expect(packageJson.scripts["package:win"]).toContain("--config.electronDist=node_modules/electron/dist");
    expect(packageJson.scripts["package:win"]).toContain("Remove-Item");
    expect(packageJson.build.win.target).toEqual(["nsis"]);
    expect(packageJson.build.nsis.createDesktopShortcut).toBe(true);
    expect(packageJson.build.nsis.createStartMenuShortcut).toBe(true);
  });

  it("removes the default English Electron menu", () => {
    const mainSource = readFileSync(join(process.cwd(), "electron", "main.ts"), "utf8");
    expect(mainSource).toContain("Menu.setApplicationMenu(null)");
  });

  it("uses a Chinese document title in the packaged renderer", () => {
    const indexHtml = readFileSync(join(process.cwd(), "index.html"), "utf8");

    expect(indexHtml).toContain("<title>ENHE 经营系统操作台</title>");
    expect(indexHtml).not.toContain("<title>ENHE EBOS Operator</title>");
  });

  it("bundles the sidebar logo as a renderer asset", () => {
    const layoutSource = readFileSync(join(process.cwd(), "src", "components", "Layout.tsx"), "utf8");

    expect(layoutSource).toContain('import logoSrc from "../assets/enhe_horizontal_black_transparent_white_bg.png"');
    expect(layoutSource).not.toContain("/brand/enhe_horizontal_black_transparent_white_bg.png");
  });
});
