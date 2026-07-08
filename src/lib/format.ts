import { clsx } from "clsx";
import { formatBooleanZh } from "./display";

export function cx(...values: Array<string | false | null | undefined>) {
  return clsx(values);
}

export function formatBoolean(value: boolean) {
  return formatBooleanZh(value);
}

export function formatDateTime(value: string) {
  if (!value) return "未记录";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("zh-CN", { hour12: false });
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} 字节`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} 千字节`;
  return `${(bytes / 1024 / 1024).toFixed(1)} 兆字节`;
}

export function shortText(value: unknown, fallback = "未记录") {
  if (value === null || value === undefined || value === "") return fallback;
  if (Array.isArray(value)) return value.length === 0 ? fallback : value.join("，");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}
