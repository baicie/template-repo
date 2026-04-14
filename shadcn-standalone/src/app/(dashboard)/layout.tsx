import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* 侧边栏 */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-card">
        <div className="p-6">
          <h2 className="text-xl font-bold">Dashboard</h2>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          <Link
            href="/(dashboard)/overview"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            概览
          </Link>
          <Link
            href="/(dashboard)/settings"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            设置
          </Link>
        </nav>
      </aside>

      {/* 主内容区 */}
      <div className="flex flex-1 flex-col">
        {/* 头部 */}
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-6">
          <div className="flex-1">
            <span className="text-sm text-muted-foreground">欢迎使用</span>
          </div>
          <Button variant="outline" size="sm">
            退出登录
          </Button>
        </header>

        {/* 页面内容 */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
