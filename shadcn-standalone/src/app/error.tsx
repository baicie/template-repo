"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold">出错了！</h2>
        <p className="mt-2 text-muted-foreground">抱歉，页面加载时发生了错误。</p>
      </div>
      <Button onClick={() => reset()}>重试</Button>
    </div>
  );
}
