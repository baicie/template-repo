# 剑指前端 Offer

> 前端面试高频题指南 - 助力前端开发者高效备战面试

## 🚀 特性

- 📚 **系统化分类**: 按知识点和难度分层组织内容
- 🎯 **高频题库**: 精选互联网大厂前端面试高频题目
- ⚡ **高效复习**: 提供简洁明了的答案要点
- 🔍 **深度解析**: 每道题目都有由浅入深的知识点解析
- 🎪 **模拟面试**: 4 套完整的模拟面试题
- 💡 **实战导向**: 注重面试表达技巧和回答要点

## 📖 内容结构

### 知识分类

- **JavaScript 基础**: 数据类型、作用域、原型链、异步编程等
- **浏览器相关**: 渲染原理、跨域、存储、性能优化、安全等
- **网络协议**: HTTP/HTTPS、TCP/UDP、WebSocket、DNS、缓存等
- **前端框架**: React、Vue、状态管理、路由、组件设计等
- **工程化**: 构建工具、模块化、代码规范、测试、部署等
- **算法与数据结构**: 数组、链表、树、排序、动态规划等

### 模拟面试题

- 模拟题一: 基础题 + 浏览器题 + 网络题 + 编码题
- 模拟题二: 框架题 + 工程化题 + 性能优化题
- 模拟题三: 算法题 + 系统设计题 + 项目经验题
- 模拟题四: 综合题 + 开放性题目 + 技术深度题

## 🛠️ 本地开发

### 环境要求

- Node.js 18+
- pnpm 8+

### 安装依赖

```bash
pnpm install
```

### 开发服务器

```bash
pnpm run dev
```

### 构建生产版本

```bash
pnpm run build
```

### 预览构建结果

```bash
pnpm run preview
```

## 🚀 部署

### GitHub Pages 自动部署

本项目配置了 GitHub Actions 工作流，支持：

1. **推送触发**: 推送到 `main` 分支时自动构建部署
2. **定时构建**: 每日北京时间上午 9 点自动构建（确保最后更新时间准确）
3. **手动触发**: 可在 GitHub Actions 页面手动触发部署

#### 设置步骤：

1. **Fork 本仓库**到您的 GitHub 账户

2. **启用 GitHub Pages**:

   - 进入仓库 Settings → Pages
   - Source 选择 "GitHub Actions"

3. **配置仓库名称**:

   - 如果仓库名不是 `interview`，需要修改 `.vitepress/config.mts` 中的 base 路径

   ```typescript
   base: process.env.NODE_ENV === 'production' ? '/your-repo-name/' : '/',
   ```

4. **推送代码**触发首次部署

### 其他部署方式

#### Vercel

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel --prod
```

#### Netlify

1. 连接 GitHub 仓库
2. 设置构建命令: `pnpm run build`
3. 设置发布目录: `.vitepress/dist`

## 📝 内容贡献

欢迎贡献内容！请遵循以下规范：

### 文件结构

```
├── javascript/          # JavaScript 相关
├── browser/             # 浏览器相关
├── network/             # 网络协议相关
├── frameworks/          # 框架相关
├── engineering/         # 工程化相关
├── algorithms/          # 算法相关
└── mock-test-*.md       # 模拟面试题
```

### 内容格式

每个知识点页面应包含：

- **相关问题**: 常见面试问题
- **回答关键点**: 简洁的核心答案
- **知识点深入**: 详细解析和代码示例
- **面试要点**: 面试时的注意事项
- **参考资料**: 相关学习资源

## 📄 许可证

MIT License

## 🤝 贡献者

感谢所有贡献者的努力！

---

⭐ 如果这个项目对你有帮助，请给个 Star 支持一下！
