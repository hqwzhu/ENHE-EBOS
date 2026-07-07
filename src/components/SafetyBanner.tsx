import { ShieldAlert } from "lucide-react";

export default function SafetyBanner() {
  return (
    <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
      <div className="flex items-center gap-2 font-semibold">
        <ShieldAlert className="h-4 w-4" />
        安全边界
      </div>
      <p className="mt-2 leading-6">
        本应用只允许读取 EBOS 报告、保存用户真实输入、运行白名单 dry-run 或质量检查命令。禁止 migration、seed、deploy、server/docker/nginx、backfill apply、git add . 和任何数据库写操作。
      </p>
    </div>
  );
}
