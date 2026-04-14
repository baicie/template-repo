import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold">404</h1>
        <h2 className="mt-4 text-2xl font-semibold">页面未找到</h2>
        <p className="mt-2 text-muted-foreground">抱歉，您访问的页面不存在或已被移除。</p>
      </div>
      <Button asChild>
        <Link href="/">返回首页</Link>
      </Button>
    </div>
  );
}
