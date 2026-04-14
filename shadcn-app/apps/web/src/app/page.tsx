import { Button } from "@repo/ui";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui";

export default function HomePage() {
  return (
    <main className="container py-10">
      <div className="flex flex-col items-center gap-6">
        <h1 className="text-4xl font-bold tracking-tight">
          欢迎使用 shadcn/ui
        </h1>
        <p className="text-lg text-muted-foreground">
          使用可复制粘贴的组件构建美观的应用程序
        </p>

        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>开始使用</CardTitle>
            <CardDescription>
              这是一个使用 shadcn/ui 组件库构建的示例页面
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              shadcn/ui 不是传统的组件库，而是一组可以直接复制、修改的组件源码，
              强调代码所有权和定制灵活性。
            </p>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button variant="outline">了解更多</Button>
            <Button>快速开始</Button>
          </CardFooter>
        </Card>

        <div className="flex flex-wrap gap-2">
          <Button variant="default">Default</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
      </div>
    </main>
  );
}
