# 部署策略详解 - 现代化部署流程与最佳实践

## 现代化部署体系概览

前端部署已经从简单的文件上传发展为复杂的自动化流程，涵盖构建、测试、部署、监控的完整生命周期。

### 核心目标

- **自动化**：减少人工干预，提升部署效率
- **可靠性**：确保部署过程稳定可控
- **可回滚**：快速恢复到稳定版本
- **可观测**：全面的监控和日志记录

## 1. CI/CD 流水线设计 🚀

### GitHub Actions 完整流程

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: "18"
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  # 代码质量检查
  quality-check:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Type check
        run: npm run type-check

      - name: Lint check
        run: npm run lint

      - name: Format check
        run: npm run format:check

      - name: Security audit
        run: npm audit --audit-level=high

      - name: License check
        run: npx license-checker --onlyAllow 'MIT;Apache-2.0;BSD-3-Clause'

  # 测试阶段
  test:
    runs-on: ubuntu-latest
    needs: quality-check

    strategy:
      matrix:
        node-version: [16, 18, 20]

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm test -- --coverage --watchAll=false

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
          flags: unittests
          name: codecov-umbrella

      - name: Run integration tests
        run: npm run test:integration

      - name: Build application
        run: npm run build

      - name: Test build artifacts
        run: |
          ls -la build/
          test -f build/index.html
          test -d build/static

  # E2E 测试
  e2e-test:
    runs-on: ubuntu-latest
    needs: test

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Build and start app
        run: |
          npm run build
          npm run start:ci &

      - name: Wait for server
        run: npx wait-on http://localhost:3000

      - name: Run Playwright tests
        run: npx playwright test

      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/

  # 构建 Docker 镜像
  build-image:
    runs-on: ubuntu-latest
    needs: [test, e2e-test]
    if: github.ref == 'refs/heads/main'

    outputs:
      image: ${{ steps.image.outputs.image }}
      digest: ${{ steps.build.outputs.digest }}

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=sha,prefix={{branch}}-
            type=raw,value=latest,enable={{is_default_branch}}

      - name: Build and push Docker image
        id: build
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Output image
        id: image
        run: |
          echo "image=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}" >> $GITHUB_OUTPUT

  # 安全扫描
  security-scan:
    runs-on: ubuntu-latest
    needs: build-image
    if: github.ref == 'refs/heads/main'

    steps:
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: ${{ needs.build-image.outputs.image }}
          format: "sarif"
          output: "trivy-results.sarif"

      - name: Upload Trivy scan results
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: "trivy-results.sarif"

  # 部署到 Staging
  deploy-staging:
    runs-on: ubuntu-latest
    needs: [build-image, security-scan]
    if: github.ref == 'refs/heads/main'
    environment: staging

    steps:
      - name: Deploy to staging
        run: |
          echo "Deploying ${{ needs.build-image.outputs.image }} to staging"
          # 部署到 staging 环境的实际命令

      - name: Run smoke tests
        run: |
          # 运行冒烟测试
          curl -f https://staging.example.com/health || exit 1

      - name: Notify team
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          channel: "#deployments"
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}

  # 部署到生产环境
  deploy-production:
    runs-on: ubuntu-latest
    needs: [build-image, deploy-staging]
    if: github.ref == 'refs/heads/main'
    environment: production

    steps:
      - name: Deploy to production
        run: |
          echo "Deploying ${{ needs.build-image.outputs.image }} to production"
          # 蓝绿部署或滚动更新

      - name: Health check
        run: |
          # 健康检查
          for i in {1..30}; do
            if curl -f https://example.com/health; then
              echo "Health check passed"
              break
            fi
            echo "Waiting for health check... ($i/30)"
            sleep 10
          done

      - name: Update monitoring
        run: |
          # 更新监控配置
          curl -X POST "https://monitoring.example.com/api/deployments" \
            -H "Authorization: Bearer ${{ secrets.MONITORING_TOKEN }}" \
            -d '{"version": "${{ github.sha }}", "environment": "production"}'
```

### GitLab CI/CD 配置

```yaml
# .gitlab-ci.yml
stages:
  - quality
  - test
  - build
  - security
  - deploy-staging
  - deploy-production

variables:
  DOCKER_DRIVER: overlay2
  DOCKER_TLS_CERTDIR: "/certs"
  NODE_VERSION: "18"

# 缓存配置
.node_cache: &node_cache
  cache:
    key:
      files:
        - package-lock.json
    paths:
      - node_modules/
    policy: pull-push

# 基础镜像
.node_base: &node_base
  image: node:${NODE_VERSION}
  <<: *node_cache
  before_script:
    - npm ci

# 代码质量检查
quality:lint:
  <<: *node_base
  stage: quality
  script:
    - npm run lint
    - npm run type-check
    - npm run format:check
  artifacts:
    reports:
      junit: reports/junit.xml

quality:security:
  <<: *node_base
  stage: quality
  script:
    - npm audit --audit-level=high
    - npx license-checker --onlyAllow 'MIT;Apache-2.0;BSD-3-Clause'
  allow_failure: true

# 测试阶段
test:unit:
  <<: *node_base
  stage: test
  script:
    - npm test -- --coverage --watchAll=false
  coverage: '/Lines\s*:\s*(\d+\.\d+)%/'
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml
      junit: reports/junit.xml
    paths:
      - coverage/

test:e2e:
  <<: *node_base
  stage: test
  services:
    - name: selenium/standalone-chrome:latest
      alias: chrome
  script:
    - npm run build
    - npm run start:ci &
    - npx wait-on http://localhost:3000
    - npm run test:e2e
  artifacts:
    when: on_failure
    paths:
      - cypress/screenshots/
      - cypress/videos/
    expire_in: 1 week

# 构建阶段
build:docker:
  stage: build
  image: docker:latest
  services:
    - docker:dind
  variables:
    DOCKER_IMAGE: $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
  before_script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
  script:
    - docker build -t $DOCKER_IMAGE .
    - docker push $DOCKER_IMAGE
  only:
    - main

# 安全扫描
security:container:
  stage: security
  image: aquasec/trivy:latest
  script:
    - trivy image --exit-code 0 --format template --template "@contrib/sarif.tpl" -o gl-container-scanning-report.json $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
  artifacts:
    reports:
      container_scanning: gl-container-scanning-report.json
  only:
    - main

# 部署到 Staging
deploy:staging:
  stage: deploy-staging
  image: alpine/helm:latest
  environment:
    name: staging
    url: https://staging.example.com
  script:
    - helm upgrade --install myapp-staging ./helm-chart
      --set image.tag=$CI_COMMIT_SHA
      --set environment=staging
      --namespace staging
  only:
    - main

# 部署到生产环境
deploy:production:
  stage: deploy-production
  image: alpine/helm:latest
  environment:
    name: production
    url: https://example.com
  when: manual
  script:
    - helm upgrade --install myapp-production ./helm-chart
      --set image.tag=$CI_COMMIT_SHA
      --set environment=production
      --namespace production
  only:
    - main
```

## 2. Docker 容器化部署 🐳

### 多阶段构建 Dockerfile

```dockerfile
# Dockerfile
# 构建阶段
FROM node:18-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production && npm cache clean --force

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 生产阶段
FROM nginx:alpine AS production

# 安装必要工具
RUN apk add --no-cache curl

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# 复制自定义 nginx 配置
COPY nginx.conf /etc/nginx/nginx.conf

# 复制构建产物
COPY --from=builder /app/build /usr/share/nginx/html

# 复制健康检查脚本
COPY healthcheck.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/healthcheck.sh

# 设置权限
RUN chown -R nextjs:nodejs /usr/share/nginx/html && \
    chown -R nextjs:nodejs /var/cache/nginx && \
    chown -R nextjs:nodejs /var/log/nginx && \
    chown -R nextjs:nodejs /etc/nginx/conf.d

RUN touch /var/run/nginx.pid && \
    chown -R nextjs:nodejs /var/run/nginx.pid

# 切换到非 root 用户
USER nextjs

# 暴露端口
EXPOSE 8080

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD /usr/local/bin/healthcheck.sh

# 启动命令
CMD ["nginx", "-g", "daemon off;"]

# nginx.conf
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log notice;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # 日志格式
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    # 性能优化
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        application/atom+xml
        application/javascript
        application/json
        application/rss+xml
        application/vnd.ms-fontobject
        application/x-font-ttf
        application/x-web-app-manifest+json
        application/xhtml+xml
        application/xml
        font/opentype
        image/svg+xml
        image/x-icon
        text/css
        text/plain
        text/x-component;

    server {
        listen 8080;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        # 安全头
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;
        add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;" always;

        # 静态资源缓存
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            add_header Vary "Accept-Encoding";
        }

        # HTML 文件不缓存
        location ~* \.html$ {
            expires -1;
            add_header Cache-Control "no-cache, no-store, must-revalidate";
            add_header Pragma "no-cache";
        }

        # SPA 路由支持
        location / {
            try_files $uri $uri/ /index.html;
        }

        # API 代理
        location /api/ {
            proxy_pass http://backend-service:8080/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # 健康检查端点
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}

# healthcheck.sh
#!/bin/sh
curl -f http://localhost:8080/health || exit 1
```

### Docker Compose 开发环境

```yaml
# docker-compose.yml
version: "3.8"

services:
  # 前端应用
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
      target: production
    ports:
      - "3000:8080"
    environment:
      - NODE_ENV=production
      - API_URL=http://backend:8080
    depends_on:
      - backend
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    restart: unless-stopped

  # 后端 API
  backend:
    image: backend-api:latest
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:password@postgres:5432/myapp
      - REDIS_URL=redis://redis:6379
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped

  # 数据库
  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=myapp
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user -d myapp"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  # Redis 缓存
  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  # Nginx 负载均衡
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
    depends_on:
      - frontend
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

## 3. Kubernetes 部署配置 ☸️

### 完整的 K8s 部署清单

```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: myapp
  labels:
    name: myapp

---
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: myapp-config
  namespace: myapp
data:
  NODE_ENV: "production"
  API_URL: "https://api.example.com"
  LOG_LEVEL: "info"

---
# k8s/secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: myapp-secrets
  namespace: myapp
type: Opaque
data:
  # Base64 编码的敏感信息
  database-url: cG9zdGdyZXNxbDovL3VzZXI6cGFzc3dvcmRAcG9zdGdyZXM6NTQzMi9teWFwcA==
  jwt-secret: bXlfc2VjcmV0X2tleQ==

---
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp-frontend
  namespace: myapp
  labels:
    app: myapp-frontend
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1
      maxSurge: 1
  selector:
    matchLabels:
      app: myapp-frontend
  template:
    metadata:
      labels:
        app: myapp-frontend
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "8080"
        prometheus.io/path: "/metrics"
    spec:
      containers:
        - name: frontend
          image: myregistry.com/myapp-frontend:latest
          imagePullPolicy: Always
          ports:
            - containerPort: 8080
              name: http
          env:
            - name: NODE_ENV
              valueFrom:
                configMapKeyRef:
                  name: myapp-config
                  key: NODE_ENV
            - name: API_URL
              valueFrom:
                configMapKeyRef:
                  name: myapp-config
                  key: API_URL
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: myapp-secrets
                  key: database-url
          resources:
            requests:
              memory: "128Mi"
              cpu: "100m"
            limits:
              memory: "256Mi"
              cpu: "200m"
          livenessProbe:
            httpGet:
              path: /health
              port: 8080
            initialDelaySeconds: 30
            periodSeconds: 10
            timeoutSeconds: 5
            failureThreshold: 3
          readinessProbe:
            httpGet:
              path: /health
              port: 8080
            initialDelaySeconds: 5
            periodSeconds: 5
            timeoutSeconds: 3
            successThreshold: 1
            failureThreshold: 3
          securityContext:
            runAsNonRoot: true
            runAsUser: 1001
            allowPrivilegeEscalation: false
            readOnlyRootFilesystem: true
            capabilities:
              drop:
                - ALL
          volumeMounts:
            - name: tmp
              mountPath: /tmp
            - name: cache
              mountPath: /var/cache/nginx
      volumes:
        - name: tmp
          emptyDir: {}
        - name: cache
          emptyDir: {}
      securityContext:
        fsGroup: 1001

---
# k8s/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: myapp-frontend-service
  namespace: myapp
  labels:
    app: myapp-frontend
spec:
  selector:
    app: myapp-frontend
  ports:
    - port: 80
      targetPort: 8080
      protocol: TCP
      name: http
  type: ClusterIP

---
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: myapp-ingress
  namespace: myapp
  annotations:
    kubernetes.io/ingress.class: "nginx"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
    nginx.ingress.kubernetes.io/rate-limit: "100"
    nginx.ingress.kubernetes.io/rate-limit-window: "1m"
spec:
  tls:
    - hosts:
        - example.com
        - www.example.com
      secretName: myapp-tls
  rules:
    - host: example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: myapp-frontend-service
                port:
                  number: 80
    - host: www.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: myapp-frontend-service
                port:
                  number: 80

---
# k8s/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: myapp-frontend-hpa
  namespace: myapp
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: myapp-frontend
  minReplicas: 3
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
        - type: Percent
          value: 10
          periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
        - type: Percent
          value: 100
          periodSeconds: 15
```

### Helm Chart 配置

```yaml
# helm-chart/Chart.yaml
apiVersion: v2
name: myapp-frontend
description: My App Frontend Helm Chart
type: application
version: 0.1.0
appVersion: "1.0.0"

dependencies:
  - name: postgresql
    version: 11.9.13
    repository: https://charts.bitnami.com/bitnami
    condition: postgresql.enabled
  - name: redis
    version: 17.3.7
    repository: https://charts.bitnami.com/bitnami
    condition: redis.enabled

# helm-chart/values.yaml
replicaCount: 3

image:
  repository: myregistry.com/myapp-frontend
  pullPolicy: IfNotPresent
  tag: ""

imagePullSecrets: []
nameOverride: ""
fullnameOverride: ""

serviceAccount:
  create: true
  annotations: {}
  name: ""

podAnnotations: {}

podSecurityContext:
  fsGroup: 1001

securityContext:
  runAsNonRoot: true
  runAsUser: 1001
  allowPrivilegeEscalation: false
  readOnlyRootFilesystem: true
  capabilities:
    drop:
      - ALL

service:
  type: ClusterIP
  port: 80

ingress:
  enabled: true
  className: "nginx"
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
  hosts:
    - host: example.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: myapp-tls
      hosts:
        - example.com

resources:
  limits:
    cpu: 200m
    memory: 256Mi
  requests:
    cpu: 100m
    memory: 128Mi

autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 10
  targetCPUUtilizationPercentage: 70
  targetMemoryUtilizationPercentage: 80

nodeSelector: {}

tolerations: []

affinity:
  podAntiAffinity:
    preferredDuringSchedulingIgnoredDuringExecution:
      - weight: 100
        podAffinityTerm:
          labelSelector:
            matchExpressions:
              - key: app.kubernetes.io/name
                operator: In
                values:
                  - myapp-frontend
          topologyKey: kubernetes.io/hostname

# 数据库配置
postgresql:
  enabled: true
  auth:
    postgresPassword: "password"
    database: "myapp"
  primary:
    persistence:
      enabled: true
      size: 10Gi

# Redis 配置
redis:
  enabled: true
  auth:
    enabled: false
  master:
    persistence:
      enabled: true
      size: 2Gi
```

## 4. 部署策略模式 🎯

### 蓝绿部署实现

```bash
#!/bin/bash
# blue-green-deploy.sh

set -e

NAMESPACE="myapp"
SERVICE_NAME="myapp-frontend-service"
DEPLOYMENT_NAME="myapp-frontend"
NEW_IMAGE="$1"

if [ -z "$NEW_IMAGE" ]; then
    echo "Usage: $0 <new-image>"
    exit 1
fi

echo "Starting blue-green deployment..."

# 获取当前活跃的部署
CURRENT_VERSION=$(kubectl get deployment $DEPLOYMENT_NAME -n $NAMESPACE -o jsonpath='{.metadata.labels.version}')
echo "Current version: $CURRENT_VERSION"

# 确定新版本
if [ "$CURRENT_VERSION" = "blue" ]; then
    NEW_VERSION="green"
    OLD_VERSION="blue"
else
    NEW_VERSION="blue"
    OLD_VERSION="green"
fi

echo "Deploying new version: $NEW_VERSION"

# 创建新版本的部署
kubectl patch deployment $DEPLOYMENT_NAME -n $NAMESPACE -p '{
  "metadata": {
    "labels": {
      "version": "'$NEW_VERSION'"
    }
  },
  "spec": {
    "selector": {
      "matchLabels": {
        "app": "myapp-frontend",
        "version": "'$NEW_VERSION'"
      }
    },
    "template": {
      "metadata": {
        "labels": {
          "app": "myapp-frontend",
          "version": "'$NEW_VERSION'"
        }
      },
      "spec": {
        "containers": [{
          "name": "frontend",
          "image": "'$NEW_IMAGE'"
        }]
      }
    }
  }
}'

# 等待新部署就绪
echo "Waiting for new deployment to be ready..."
kubectl rollout status deployment/$DEPLOYMENT_NAME -n $NAMESPACE --timeout=300s

# 运行健康检查
echo "Running health checks..."
PODS=$(kubectl get pods -n $NAMESPACE -l app=myapp-frontend,version=$NEW_VERSION -o jsonpath='{.items[*].metadata.name}')

for pod in $PODS; do
    echo "Health checking pod: $pod"
    kubectl exec -n $NAMESPACE $pod -- curl -f http://localhost:8080/health
done

# 切换流量
echo "Switching traffic to new version..."
kubectl patch service $SERVICE_NAME -n $NAMESPACE -p '{
  "spec": {
    "selector": {
      "app": "myapp-frontend",
      "version": "'$NEW_VERSION'"
    }
  }
}'

echo "Traffic switched successfully!"

# 可选：清理旧版本
read -p "Do you want to clean up the old version ($OLD_VERSION)? [y/N] " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Cleaning up old version..."
    kubectl delete deployment $DEPLOYMENT_NAME-$OLD_VERSION -n $NAMESPACE --ignore-not-found
    echo "Old version cleaned up!"
fi

echo "Blue-green deployment completed successfully!"
```

### 金丝雀部署配置

```yaml
# canary-deployment.yaml
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: myapp-frontend-rollout
  namespace: myapp
spec:
  replicas: 5
  strategy:
    canary:
      # 金丝雀分析
      analysis:
        templates:
          - templateName: success-rate
        args:
          - name: service-name
            value: myapp-frontend-service

      # 部署步骤
      steps:
        - setWeight: 20 # 20% 流量到新版本
        - pause: { duration: 10m } # 暂停 10 分钟观察

        - setWeight: 40 # 增加到 40%
        - pause: { duration: 10m }

        - setWeight: 60 # 增加到 60%
        - pause: { duration: 10m }

        - setWeight: 80 # 增加到 80%
        - pause: { duration: 10m }

        # 完全切换
        - setWeight: 100

      # 流量分割配置
      trafficRouting:
        nginx:
          stableIngress: myapp-ingress
          annotationPrefix: nginx.ingress.kubernetes.io
          additionalIngressAnnotations:
            canary-by-header: X-Canary
            canary-by-header-value: "true"

      # 自动回滚条件
      scaleDownDelaySeconds: 30
      scaleDownDelayRevisionLimit: 2

  selector:
    matchLabels:
      app: myapp-frontend

  template:
    metadata:
      labels:
        app: myapp-frontend
    spec:
      containers:
        - name: frontend
          image: myregistry.com/myapp-frontend:stable
          ports:
            - containerPort: 8080

---
# 分析模板
apiVersion: argoproj.io/v1alpha1
kind: AnalysisTemplate
metadata:
  name: success-rate
  namespace: myapp
spec:
  args:
    - name: service-name
  metrics:
    - name: success-rate
      interval: 2m
      successCondition: result[0] >= 0.95
      failureLimit: 3
      provider:
        prometheus:
          address: http://prometheus.monitoring.svc.cluster.local:9090
          query: |
            sum(rate(
              nginx_ingress_controller_requests{
                service="{{args.service-name}}",
                status!~"5.*"
              }[2m]
            )) / 
            sum(rate(
              nginx_ingress_controller_requests{
                service="{{args.service-name}}"
              }[2m]
            ))
```

## 5. 监控和可观测性 📊

### Prometheus 监控配置

```yaml
# monitoring/prometheus-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
  namespace: monitoring
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
      evaluation_interval: 15s
      
    rule_files:
      - "/etc/prometheus/rules/*.yml"
      
    alerting:
      alertmanagers:
      - static_configs:
        - targets:
          - alertmanager:9093
          
    scrape_configs:
    # Frontend 应用监控
    - job_name: 'myapp-frontend'
      kubernetes_sd_configs:
      - role: pod
        namespaces:
          names:
          - myapp
      relabel_configs:
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_path]
        action: replace
        target_label: __metrics_path__
        regex: (.+)
      - source_labels: [__address__, __meta_kubernetes_pod_annotation_prometheus_io_port]
        action: replace
        regex: ([^:]+)(?::\d+)?;(\d+)
        replacement: $1:$2
        target_label: __address__
        
    # Nginx Ingress 监控
    - job_name: 'nginx-ingress'
      kubernetes_sd_configs:
      - role: pod
        namespaces:
          names:
          - ingress-nginx
      relabel_configs:
      - source_labels: [__meta_kubernetes_pod_label_app_kubernetes_io_name]
        action: keep
        regex: ingress-nginx

---
# 告警规则
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-rules
  namespace: monitoring
data:
  frontend.yml: |
    groups:
    - name: frontend
      rules:
      # 高错误率告警
      - alert: HighErrorRate
        expr: |
          (
            sum(rate(nginx_ingress_controller_requests{status=~"5.*"}[5m])) by (ingress)
            /
            sum(rate(nginx_ingress_controller_requests[5m])) by (ingress)
          ) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value | humanizePercentage }} for ingress {{ $labels.ingress }}"
          
      # 响应时间告警
      - alert: HighResponseTime
        expr: |
          histogram_quantile(0.95,
            sum(rate(nginx_ingress_controller_request_duration_seconds_bucket[5m]))
            by (ingress, le)
          ) > 2
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High response time detected"
          description: "95th percentile response time is {{ $value }}s for ingress {{ $labels.ingress }}"
          
      # 应用不可用告警
      - alert: ApplicationDown
        expr: up{job="myapp-frontend"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Application is down"
          description: "Application {{ $labels.instance }} has been down for more than 1 minute"
```

### Grafana 仪表板配置

```json
{
  "dashboard": {
    "title": "Frontend Application Dashboard",
    "panels": [
      {
        "title": "Request Rate",
        "type": "stat",
        "targets": [
          {
            "expr": "sum(rate(nginx_ingress_controller_requests[5m]))",
            "legendFormat": "Requests/sec"
          }
        ]
      },
      {
        "title": "Error Rate",
        "type": "stat",
        "targets": [
          {
            "expr": "sum(rate(nginx_ingress_controller_requests{status=~\"5.*\"}[5m])) / sum(rate(nginx_ingress_controller_requests[5m]))",
            "legendFormat": "Error Rate"
          }
        ]
      },
      {
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.50, sum(rate(nginx_ingress_controller_request_duration_seconds_bucket[5m])) by (le))",
            "legendFormat": "50th percentile"
          },
          {
            "expr": "histogram_quantile(0.95, sum(rate(nginx_ingress_controller_request_duration_seconds_bucket[5m])) by (le))",
            "legendFormat": "95th percentile"
          }
        ]
      }
    ]
  }
}
```

## 面试常见问题解答

### Q1: CI/CD 流水线的设计原则是什么？

**回答框架：**

1. **快速反馈**：尽早发现问题
2. **自动化**：减少人工干预
3. **可重复**：每次部署结果一致
4. **可回滚**：支持快速回滚
5. **安全性**：代码和部署安全

### Q2: 蓝绿部署和金丝雀部署的区别？

**核心区别：**

- **蓝绿部署**：瞬间切换全部流量
- **金丝雀部署**：逐步增加新版本流量
- **适用场景**：蓝绿适合快速切换，金丝雀适合风险控制

### Q3: 如何确保部署的安全性？

**安全措施：**

1. **镜像扫描**：检查安全漏洞
2. **权限控制**：最小权限原则
3. **秘钥管理**：使用 Secret 管理敏感信息
4. **网络隔离**：Pod 安全策略
5. **监控告警**：实时监控异常

这样的部署体系能确保应用的稳定、安全和高效部署！
