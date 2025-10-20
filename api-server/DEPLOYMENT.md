# 🚀 部署指南

本文档详细介绍了 NestJS API 服务的完整部署方案，包括 Docker 容器化、CI/CD 流程和监控配置。

## 📋 目录

- [快速开始](#快速开始)
- [环境配置](#环境配置)
- [Docker 部署](#docker-部署)
- [CI/CD 流程](#cicd-流程)
- [监控与报警](#监控与报警)
- [安全配置](#安全配置)
- [故障排除](#故障排除)

## 🚀 快速开始

### 本地开发环境

```bash
# 1. 克隆项目
git clone <repository-url>
cd api-server

# 2. 安装依赖
pnpm install

# 3. 配置环境变量
cp .env.example .env

# 4. 启动开发服务器
pnpm run dev
```

### Docker 快速部署

```bash
# 1. 使用 Docker Compose 启动所有服务
docker-compose up -d

# 2. 查看服务状态
docker-compose ps

# 3. 查看日志
docker-compose logs -f api
```

## ⚙️ 环境配置

### 环境变量

创建 `.env` 文件并配置以下变量：

```bash
# 基础配置
NODE_ENV=production
PORT=3000

# 数据库配置
DB_TYPE=sqljs
DB_DATABASE=/app/data/database.sqljs
DB_SYNCHRONIZE=false
DB_LOGGING=false

# JWT 配置
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# 日志配置
LOG_LEVEL=info
LOG_FILE_PATH=/app/logs

# CORS 配置
CORS_ORIGIN=https://yourdomain.com

# 上传配置
UPLOAD_DESTINATION=/app/uploads
UPLOAD_MAX_FILE_SIZE=10485760

# 国际化配置
I18N_FALLBACK_LANGUAGE=zh

# 安全配置
RATE_LIMIT_TTL=60000
RATE_LIMIT_MAX=100

# 监控配置
GRAFANA_PASSWORD=your-secure-grafana-password
```

### 生产环境建议

1. **安全性**
   - 使用强密码和密钥
   - 启用 HTTPS
   - 配置防火墙规则
   - 定期更新依赖

2. **性能**
   - 使用负载均衡
   - 配置缓存策略
   - 优化数据库查询
   - 监控资源使用

3. **可靠性**
   - 实施健康检查
   - 配置自动重启
   - 设置备份策略
   - 监控和报警

## 🐳 Docker 部署

### 单容器部署

```bash
# 构建镜像
docker build -t nestjs-api .

# 运行容器
docker run -d \
  --name api-server \
  -p 3000:3000 \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/logs:/app/logs \
  -v $(pwd)/uploads:/app/uploads \
  --env-file .env \
  nestjs-api
```

### Docker Compose 部署

我们的 `docker-compose.yml` 包含以下服务：

- **api**: NestJS 应用服务器
- **nginx**: 反向代理和负载均衡器
- **prometheus**: 监控数据收集
- **grafana**: 监控仪表板

```bash
# 启动所有服务
docker-compose up -d

# 扩展 API 服务实例
docker-compose up -d --scale api=3

# 更新服务
docker-compose pull
docker-compose up -d
```

### 容器健康检查

应用包含以下健康检查端点：

- `/health` - 基本健康状态
- `/health/ready` - 就绪状态检查
- `/health/live` - 存活状态检查

## 🔄 CI/CD 流程

### GitHub Actions 工作流

我们的 CI/CD 流程包括：

1. **测试阶段**
   - 代码质量检查 (ESLint)
   - 单元测试和覆盖率
   - E2E 测试

2. **安全扫描**
   - 依赖漏洞扫描
   - 代码安全分析

3. **构建阶段**
   - Docker 镜像构建
   - 多架构支持 (amd64/arm64)
   - 镜像推送到注册表

4. **部署阶段**
   - 自动部署到测试环境
   - 生产环境需手动批准

### 部署策略

#### 蓝绿部署

```bash
# 1. 部署到绿环境
docker-compose -f docker-compose.green.yml up -d

# 2. 健康检查
curl -f http://green.example.com/health

# 3. 切换流量
# 更新负载均衡器配置

# 4. 停止蓝环境
docker-compose -f docker-compose.blue.yml down
```

#### 滚动更新

```bash
# 更新镜像版本
docker-compose pull api

# 逐个重启容器
docker-compose up -d --no-deps api
```

## 📊 监控与报警

### Prometheus 监控

监控指标包括：

- **应用指标**: HTTP 请求、响应时间、错误率
- **系统指标**: CPU、内存、磁盘使用率
- **业务指标**: 用户活跃度、API 调用量

### Grafana 仪表板

默认仪表板包含：

- **系统概览**: 服务状态、资源使用
- **API 性能**: 请求量、响应时间、错误率
- **业务指标**: 用户统计、操作审计

访问地址: `http://localhost:3001` (admin/admin123)

### 报警配置

重要报警规则：

```yaml
# CPU 使用率过高
- alert: HighCPUUsage
  expr: cpu_usage > 80
  for: 5m

# 内存使用率过高
- alert: HighMemoryUsage
  expr: memory_usage > 90
  for: 5m

# API 错误率过高
- alert: HighErrorRate
  expr: http_requests_total{status=~"5.."} / http_requests_total > 0.05
  for: 2m
```

## 🔒 安全配置

### SSL/TLS 配置

1. **获取证书**

   ```bash
   # 使用 Let's Encrypt
   certbot certonly --webroot -w /var/www/html -d yourdomain.com
   ```

2. **配置 Nginx**
   ```nginx
   ssl_certificate /etc/nginx/ssl/cert.pem;
   ssl_certificate_key /etc/nginx/ssl/key.pem;
   ```

### 防火墙配置

```bash
# 只允许必要端口
ufw allow 22    # SSH
ufw allow 80    # HTTP
ufw allow 443   # HTTPS
ufw enable
```

### 安全最佳实践

1. **定期更新**
   - 及时更新操作系统
   - 更新 Docker 镜像
   - 更新应用依赖

2. **访问控制**
   - 使用强密码策略
   - 实施双因素认证
   - 限制管理员权限

3. **监控和审计**
   - 启用访问日志
   - 监控异常活动
   - 定期安全审计

## 🛠️ 故障排除

### 常见问题

#### 1. 容器启动失败

```bash
# 查看详细日志
docker-compose logs api

# 检查容器状态
docker-compose ps

# 进入容器调试
docker-compose exec api sh
```

#### 2. 数据库连接问题

```bash
# 检查数据库文件权限
ls -la data/

# 查看数据库连接日志
docker-compose logs api | grep -i database
```

#### 3. 性能问题

```bash
# 查看资源使用情况
docker stats

# 分析慢查询
# 查看应用日志中的性能指标
```

### 日志分析

```bash
# 实时查看应用日志
docker-compose logs -f api

# 查看 Nginx 访问日志
docker-compose exec nginx tail -f /var/log/nginx/access.log

# 查看系统资源
docker-compose exec api top
```

### 备份和恢复

```bash
# 创建数据备份
docker-compose exec api node -e "
  const { DatabaseMigrationService } = require('./dist/common/services/database-migration.service');
  // 创建备份逻辑
"

# 恢复数据
# 参考 API 文档中的备份恢复接口
```

## 📈 扩展建议

### 水平扩展

1. **负载均衡**

   ```bash
   # 增加 API 实例
   docker-compose up -d --scale api=5
   ```

2. **数据库分离**
   - 使用外部数据库服务
   - 实施读写分离
   - 配置数据库集群

3. **缓存层**
   ```yaml
   redis:
     image: redis:alpine
     ports:
       - '6379:6379'
   ```

### 微服务架构

考虑将单体应用拆分为微服务：

- 用户服务
- 产品服务
- 订单服务
- 通知服务

### 云原生部署

#### Kubernetes 部署

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nestjs-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nestjs-api
  template:
    metadata:
      labels:
        app: nestjs-api
    spec:
      containers:
        - name: api
          image: nestjs-api:latest
          ports:
            - containerPort: 3000
          env:
            - name: NODE_ENV
              value: 'production'
```

## 📞 支持

如遇问题，请参考：

- [API 文档](http://localhost:3000/docs)
- [GitHub Issues](https://github.com/your-repo/issues)
- [监控仪表板](http://localhost:3001)

---

**注意**: 请确保在生产环境中修改所有默认密码和密钥！
