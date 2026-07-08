import { ShieldAlert } from "lucide-react";

export default function SafetyBanner() {
  return (
    <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
      <div className="flex items-center gap-2 font-semibold">
        <ShieldAlert className="h-4 w-4" />
        安全边界
      </div>
      <p className="mt-2 leading-6">
        本应用只允许读取报告、保存用户真实输入、运行白名单检查和演练命令。禁止数据库迁移、种子数据、部署、服务器、容器、反向代理、真实回填、批量提交和任何数据库写入操作。
      </p>
    </div>
  );
}
