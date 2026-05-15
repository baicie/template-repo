# 部署指南

本文档详细说明如何将项目部署到 GitHub Pages。

## 🚀 GitHub Pages 自动部署

### 前置条件

1. **GitHub 账户**
2. **Fork 本仓库**到您的 GitHub 账户
3. **确保仓库是公开的**（私有仓库需要 GitHub Pro）

### 部署步骤

#### 1. 配置 GitHub Pages

1. 进入您的仓库页面
2. 点击 **Settings** 选项卡
3. 在左侧菜单中找到 **Pages**
4. 在 **Source** 部分选择 **"GitHub Actions"**

#### 2. 配置仓库路径（重要）

如果您的仓库名称不是 `interview`，需要修改配置文件：

**编辑 `.vitepress/config.mts`**:

```typescript
// 将 '/interview/' 改为您的仓库名
base: process.env.NODE_ENV === 'production' ? '/your-repo-name/' : '/',
```

例如，如果您的仓库名是 `frontend-interview`：

```typescript
base: process.env.NODE_ENV === 'production' ? '/frontend-interview/' : '/',
```

#### 3. 触发部署

推送任何更改到 `main` 分支将自动触发部署：

```bash
git add .
git commit -m "feat: 初始化项目"
git push origin main
```

#### 4. 查看部署状态

1. 进入仓库的 **Actions** 选项卡
2. 查看 "Deploy VitePress site to Pages" 工作流
3. 部署成功后，您的网站将在 `https://username.github.io/repo-name/` 可访问

## ⏰ 自动化特性

### 定时构建

- **时间**: 每日北京时间上午 9:00（UTC 01:00）
- **目的**: 确保最后更新时间准确，保持内容新鲜度

### 触发条件

1. **推送触发**: 推送到 `main` 分支
2. **定时触发**: 每日自动构建
3. **手动触发**: 在 Actions 页面手动运行

### 手动触发部署

1. 进入仓库的 **Actions** 选项卡
2. 选择 "Deploy VitePress site to Pages" 工作流
3. 点击 **"Run workflow"** 按钮
4. 选择分支（通常是 `main`）
5. 点击 **"Run workflow"** 确认

## 🔧 高级配置

### 自定义域名

如果您有自定义域名：

1. 在仓库根目录创建 `public/CNAME` 文件
2. 文件内容为您的域名，例如：
   ```
   interview.yourdomain.com
   ```
3. 在 DNS 设置中添加 CNAME 记录指向 `username.github.io`

### 环境变量

如果需要配置环境变量：

1. 进入仓库 **Settings** → **Secrets and variables** → **Actions**
2. 点击 **"New repository secret"**
3. 添加所需的环境变量

### 修改构建配置

编辑 `.github/workflows/deploy.yml` 来自定义构建过程：

```yaml
# 修改 Node.js 版本
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: 20  # 改为所需版本

# 修改定时构建时间
schedule:
  - cron: '0 2 * * *'  # UTC 02:00 (北京时间上午10点)
```

## 🐛 常见问题

### 1. 页面显示 404

**原因**: base 路径配置错误

**解决方案**:

- 检查 `.vitepress/config.mts` 中的 `base` 配置
- 确保路径与仓库名匹配

### 2. 样式或资源加载失败

**原因**: 资源路径问题

**解决方案**:

- 检查所有资源路径是否使用相对路径
- 确保图片等静态资源放在 `public` 目录中

### 3. 构建失败

**原因**: 依赖问题或代码错误

**解决方案**:

1. 查看 Actions 日志中的错误信息
2. 在本地运行 `pnpm run build:github` 测试
3. 检查 Node.js 和 pnpm 版本兼容性

### 4. 最后更新时间不显示

**原因**: Git 历史记录问题

**解决方案**:

- 确保仓库有完整的 Git 历史记录
- 检查 `lastUpdated: true` 配置是否正确

## 📊 监控和维护

### 查看部署历史

在 **Actions** 选项卡中可以查看所有部署历史和日志。

### 性能监控

可以使用以下工具监控网站性能：

- Google PageSpeed Insights
- Lighthouse CI
- WebPageTest

### 内容更新

1. 直接在 GitHub 网页界面编辑文件
2. 或者克隆到本地，编辑后推送
3. 每次推送都会自动触发重新部署

---

如有任何部署问题，请查看 Actions 日志或提交 Issue。
