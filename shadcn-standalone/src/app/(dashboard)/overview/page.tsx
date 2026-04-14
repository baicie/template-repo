import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function OverviewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">仪表盘概览</h1>
        <p className="text-muted-foreground">
          查看您的项目概览和统计数据。
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>总用户数</CardDescription>
            <CardTitle className="text-4xl">1,234</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              较上月 +12%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>总收入</CardDescription>
            <CardTitle className="text-4xl">¥45,231</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              较上月 +8%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>活跃用户</CardDescription>
            <CardTitle className="text-4xl">892</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              较上月 +5%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>订单数</CardDescription>
            <CardTitle className="text-4xl">3,456</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              较上月 +15%
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>最近活动</CardTitle>
          <CardDescription>您最近的系统活动记录</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <div>
                <p className="font-medium">新用户注册</p>
                <p className="text-sm text-muted-foreground">user@example.com</p>
              </div>
              <span className="text-sm text-muted-foreground">2 分钟前</span>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <div>
                <p className="font-medium">新订单创建</p>
                <p className="text-sm text-muted-foreground">订单 #1234</p>
              </div>
              <span className="text-sm text-muted-foreground">15 分钟前</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">系统更新</p>
                <p className="text-sm text-muted-foreground">版本 1.2.0 已发布</p>
              </div>
              <span className="text-sm text-muted-foreground">1 小时前</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
