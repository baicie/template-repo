import { Button } from "@repo/ui";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui";
import { Badge } from "@repo/ui";
import { Progress } from "@repo/ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui";

export default function OverviewPage() {
  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">仪表盘概览</h1>
        <p className="text-muted-foreground">
          查看您的业务数据统计和最新活动
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总收入</CardTitle>
            <span className="text-2xl">¥12,450</span>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              +12.5% 较上月
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">用户数</CardTitle>
            <span className="text-2xl">1,234</span>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              +8.2% 较上月
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">订单数</CardTitle>
            <span className="text-2xl">456</span>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              +5.1% 较上月
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">转化率</CardTitle>
            <span className="text-2xl">24.5%</span>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              +2.3% 较上月
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Tabs defaultValue="activity" className="w-full">
          <TabsList>
            <TabsTrigger value="activity">活动</TabsTrigger>
            <TabsTrigger value="orders">订单</TabsTrigger>
            <TabsTrigger value="performance">性能</TabsTrigger>
          </TabsList>
          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>最近活动</CardTitle>
                <CardDescription>您的最近操作记录</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Badge variant="outline">新建</Badge>
                    <p className="text-sm">创建了新项目 "电商后台"</p>
                    <span className="text-xs text-muted-foreground ml-auto">
                      2分钟前
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline">更新</Badge>
                    <p className="text-sm">更新了用户资料</p>
                    <span className="text-xs text-muted-foreground ml-auto">
                      15分钟前
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline">登录</Badge>
                    <p className="text-sm">新设备登录</p>
                    <span className="text-xs text-muted-foreground ml-auto">
                      1小时前
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>最近订单</CardTitle>
                <CardDescription>最新的订单记录</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>订单号</TableHead>
                      <TableHead>客户</TableHead>
                      <TableHead>金额</TableHead>
                      <TableHead>状态</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">#1001</TableCell>
                      <TableCell>张三</TableCell>
                      <TableCell>¥299.00</TableCell>
                      <TableCell>
                        <Badge>已完成</Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">#1002</TableCell>
                      <TableCell>李四</TableCell>
                      <TableCell>¥599.00</TableCell>
                      <TableCell>
                        <Badge variant="secondary">处理中</Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">#1003</TableCell>
                      <TableCell>王五</TableCell>
                      <TableCell>¥899.00</TableCell>
                      <TableCell>
                        <Badge variant="outline">待支付</Badge>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>系统性能</CardTitle>
                <CardDescription>当前系统资源使用情况</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>CPU 使用率</span>
                    <span className="text-muted-foreground">45%</span>
                  </div>
                  <Progress value={45} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>内存使用率</span>
                    <span className="text-muted-foreground">62%</span>
                  </div>
                  <Progress value={62} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>磁盘使用率</span>
                    <span className="text-muted-foreground">38%</span>
                  </div>
                  <Progress value={38} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <Button variant="outline">导出报告</Button>
        <Button>查看更多</Button>
      </div>
    </div>
  );
}
