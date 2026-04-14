import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container px-4 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Shadcn Standalone App
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            基于 shadcn/ui 和 Next.js 15 的现代化单体应用模板。快速启动您的下一个项目。
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/(auth)/login">登录</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/(auth)/register">注册</Link>
            </Button>
            <Button asChild variant="ghost" size="lg">
              <Link href="/(dashboard)/overview">进入仪表盘</Link>
            </Button>
          </div>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>组件丰富</CardTitle>
              <CardDescription>集成了多种精美的 shadcn/ui 组件</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                开箱即用的 UI 组件，包括表单、对话框、数据表格等常用组件。
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>类型安全</CardTitle>
              <CardDescription>完整的 TypeScript 类型支持</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                基于 TypeScript 构建，提供完整的类型推导和编译时检查。
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>现代化工具链</CardTitle>
              <CardDescription>采用最新的开发工具和最佳实践</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Next.js 15、pnpm、ESLint、Prettier 等现代化工具。
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
