import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "剑指前端 Offer",
  description: "前端面试高频题指南",
  lang: "zh-CN",
  lastUpdated: true,
  base: process.env.NODE_ENV === "production" ? "/interview/" : "/",
  srcDir: "docs",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: "/logo.png",

    nav: [
      { text: "首页", link: "/" },
      {
        text: "模拟面试题",
        items: [
          { text: "模拟题一", link: "/mocks/question-1" },
          { text: "模拟题二", link: "/mocks/question-2" },
          { text: "模拟题三", link: "/mocks/question-3" },
          { text: "模拟题四", link: "/mocks/question-4" },
        ],
      },
      {
        text: "知识分类",
        items: [
          { text: "JavaScript 基础", link: "/javascript/" },
          { text: "CSS/HTML", link: "/css-html/" },
          { text: "浏览器相关", link: "/browser/" },
          { text: "网络协议", link: "/network/" },
          { text: "前端框架", link: "/frameworks/" },
          { text: "TypeScript", link: "/typescript/" },
          { text: "后端开发", link: "/backend/" },
          { text: "工程化", link: "/engineering/" },
          { text: "小程序开发", link: "/miniprogram/" },
          { text: "算法与数据结构", link: "/algorithms/" },
          { text: "场景题", link: "/scenario/" },
        ],
      },
    ],

    sidebar: {
      "/": [
        {
          text: "模拟面试题",
          collapsed: false,
          items: [
            { text: "模拟题一", link: "/mocks/question-1" },
            { text: "模拟题二", link: "/mocks/question-2" },
          ],
        },
      ],
      "/javascript/": [
        {
          text: "JavaScript 基础",
          collapsed: false,
          items: [
            { text: "数据类型", link: "/javascript/data-types" },
            { text: "Symbol 详解", link: "/javascript/symbol" },
            {
              text: "引用类型常用方法",
              link: "/javascript/reference-types-methods",
            },
            { text: "作用域与闭包", link: "/javascript/scope-closure" },
            { text: "原型与继承", link: "/javascript/prototype-inheritance" },
            { text: "异步编程", link: "/javascript/async-programming" },
            { text: "ES6+ 新特性", link: "/javascript/es6-features" },
            { text: "this 绑定", link: "/javascript/this-binding" },
            { text: "类型转换", link: "/javascript/type-conversion" },
            { text: "手写核心方法", link: "/javascript/hand-written" },
            { text: "深浅拷贝", link: "/javascript/deep-shallow-copy" },
            { text: "防抖节流", link: "/javascript/debounce-throttle" },
            { text: "数组方法详解", link: "/javascript/array-methods" },
            { text: "类型检测方法", link: "/javascript/type-detection" },
          ],
        },
      ],
      "/browser/": [
        {
          text: "浏览器相关",
          collapsed: false,
          items: [
            { text: "浏览器渲染原理", link: "/browser/rendering-process" },
            { text: "跨域问题", link: "/browser/cors" },
            { text: "存储机制", link: "/browser/storage" },
            { text: "性能优化", link: "/browser/performance" },
            { text: "垃圾回收机制", link: "/browser/garbage-collection" },
            { text: "Web 安全防护", link: "/browser/security" },
            { text: "浏览器 API 详解", link: "/browser/api" },
            { text: "浏览器兼容性", link: "/browser/compatibility" },
          ],
        },
      ],
      "/network/": [
        {
          text: "网络协议",
          collapsed: false,
          items: [
            { text: "HTTP/HTTPS 协议详解", link: "/network/http" },
            { text: "TCP/UDP 传输层协议", link: "/network/tcp-udp" },
            { text: "WebSocket 实时通信", link: "/network/websocket" },
            { text: "DNS 域名解析", link: "/network/dns" },
            { text: "HTTP 缓存策略", link: "/network/caching" },
          ],
        },
      ],
      "/frameworks/": [
        {
          text: "前端框架",
          collapsed: false,
          items: [
            { text: "React 深度解析", link: "/frameworks/react" },
            { text: "Vue 全面指南", link: "/frameworks/vue" },
            { text: "状态管理实战", link: "/frameworks/state-management" },
            { text: "组件设计模式", link: "/frameworks/component-design" },
            { text: "React Native 开发", link: "/frameworks/react-native" },
            { text: "服务端渲染实战", link: "/frameworks/ssr" },
            { text: "路由系统详解", link: "/frameworks/routing" },
          ],
        },
      ],
      "/engineering/": [
        {
          text: "工程化",
          collapsed: false,
          items: [
            { text: "构建工具对比", link: "/engineering/build-tools" },
            { text: "CSS 工程化方案", link: "/engineering/css-engineering" },
            { text: "代码质量管控", link: "/engineering/code-quality" },
            { text: "前端测试策略", link: "/engineering/testing" },
            { text: "部署策略详解", link: "/engineering/deployment" },
            {
              text: "CI/CD 完全指南",
              link: "/engineering/ci-cd-comprehensive",
            },
            {
              text: "Docker + Nginx 部署",
              link: "/engineering/docker-nginx-deployment",
            },
            {
              text: "性能优化策略",
              link: "/engineering/performance-engineering",
            },
            { text: "微前端实战", link: "/engineering/micro-frontend" },
            { text: "包管理最佳实践", link: "/engineering/package-management" },
            { text: "Git 常用命令", link: "/engineering/git-commands" },
            {
              text: "大数据表格优化",
              link: "/engineering/large-table-optimization",
            },
          ],
        },
      ],
      "/algorithms/": [
        {
          text: "算法与数据结构",
          collapsed: false,
          items: [
            { text: "数组与字符串", link: "/algorithms/array-string" },
            { text: "链表", link: "/algorithms/linked-list" },
            { text: "树与图", link: "/algorithms/tree-graph" },
            { text: "排序算法", link: "/algorithms/sorting" },
            { text: "动态规划", link: "/algorithms/dynamic-programming" },
          ],
        },
      ],
      "/backend/": [
        {
          text: "后端开发",
          collapsed: false,
          items: [
            { text: "Node.js 核心基础", link: "/backend/nodejs-fundamentals" },
            { text: "Node.js 框架实战", link: "/backend/nodejs-frameworks" },
            { text: "数据库集成", link: "/backend/database-integration" },
            { text: "API 设计实战", link: "/backend/api-design" },
            { text: "认证授权系统", link: "/backend/authentication" },
            { text: "微服务架构", link: "/backend/microservices" },
            { text: "Rust & Go 对比", link: "/backend/rust-go-comparison" },
          ],
        },
      ],
      "/css-html/": [
        {
          text: "CSS/HTML 核心技术",
          collapsed: false,
          items: [
            { text: "HTML 基础与语义化", link: "/css-html/html-fundamentals" },
            { text: "CSS 基础与选择器", link: "/css-html/css-fundamentals" },
            { text: "CSS 布局技术", link: "/css-html/css-layout" },
            { text: "CSS 动画与特效", link: "/css-html/css-animation" },
            { text: "响应式设计", link: "/css-html/responsive-design" },
            {
              text: "CSS/HTML 面试题集",
              link: "/css-html/interview-questions",
            },
          ],
        },
      ],
      "/typescript/": [
        {
          text: "TypeScript 深度解析",
          collapsed: false,
          items: [
            { text: "基础类型与语法", link: "/typescript/basic-types" },
            { text: "高级类型与泛型", link: "/typescript/advanced-types" },
            { text: "TypeScript 工程化", link: "/typescript/engineering" },
            {
              text: "TypeScript 面试题集",
              link: "/typescript/interview-questions",
            },
          ],
        },
      ],
      "/miniprogram/": [
        {
          text: "小程序开发",
          collapsed: false,
          items: [
            { text: "小程序开发概览", link: "/miniprogram/" },
            { text: "微信小程序基础", link: "/miniprogram/wechat-miniprogram" },
            {
              text: "小程序框架对比",
              link: "/miniprogram/framework-comparison",
            },
            {
              text: "组件开发实战",
              link: "/miniprogram/component-development",
            },
            {
              text: "底层实现原理",
              link: "/miniprogram/architecture-principles",
            },
            { text: "状态管理方案", link: "/miniprogram/state-management" },
            {
              text: "性能优化策略",
              link: "/miniprogram/performance-optimization",
            },
            { text: "云开发实践", link: "/miniprogram/cloud-development" },
            {
              text: "小程序面试题集",
              link: "/miniprogram/interview-questions",
            },
          ],
        },
      ],
      "/scenario/": [
        {
          text: "场景题",
          collapsed: false,
          items: [
            // 这里可以根据实际场景题内容添加具体的链接
          ],
        },
      ],
    },

    socialLinks: [
      { icon: "github", link: "https://github.com/baicie/interview" },
    ],

    search: {
      provider: "local",
      options: {
        translations: {
          button: {
            buttonText: "搜索文档",
            buttonAriaLabel: "搜索文档",
          },
          modal: {
            noResultsText: "无法找到相关结果",
            resetButtonTitle: "清除查询条件",
            footer: {
              selectText: "选择",
              navigateText: "切换",
            },
          },
        },
      },
    },

    outline: {
      label: "页面导航",
    },

    docFooter: {
      prev: "上一页",
      next: "下一页",
    },

    darkModeSwitchLabel: "主题",
    sidebarMenuLabel: "菜单",
    returnToTopLabel: "回到顶部",

    lastUpdatedText: "最后更新时间",
  },
  vite: {
    // TODO: add sidebar plugin
    // plugins: [vitepressPluginSidebar()],
  },
});
