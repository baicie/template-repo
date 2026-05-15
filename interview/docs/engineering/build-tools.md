# 构建工具对比与实战 - Webpack vs Vite vs Rollup

## 核心概念对比

### 1. Webpack - 功能强大的模块打包器 📦

**核心理念：** 一切皆模块，通过依赖图构建应用

#### 工作原理

```javascript
// webpack.config.js
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  // 入口配置
  entry: {
    main: "./src/index.js",
    vendor: "./src/vendor.js",
  },

  // 输出配置
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].[contenthash].js",
    chunkFilename: "[name].[contenthash].chunk.js",
    clean: true,
  },

  // 模式配置
  mode: "production",

  // 模块规则
  module: {
    rules: [
      // JavaScript 处理
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },

      // CSS 处理
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "postcss-loader"],
      },

      // 图片处理
      {
        test: /\.(png|jpg|gif|svg)$/,
        type: "asset/resource",
        generator: {
          filename: "images/[name].[hash][ext]",
        },
      },
    ],
  },

  // 插件配置
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html",
      minify: {
        removeComments: true,
        collapseWhitespace: true,
      },
    }),

    new MiniCssExtractPlugin({
      filename: "[name].[contenthash].css",
    }),
  ],

  // 优化配置
  optimization: {
    splitChunks: {
      chunks: "all",
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all",
        },
      },
    },
  },

  // 开发服务器
  devServer: {
    contentBase: "./dist",
    hot: true,
    port: 3000,
  },
};
```

#### Webpack 核心概念详解

**1. Entry（入口）**

```javascript
// 单入口
entry: './src/index.js'

// 多入口
entry: {
  home: './src/home.js',
  about: './src/about.js',
  contact: './src/contact.js'
}

// 动态入口
entry: () => {
  return new Promise((resolve) => {
    resolve({
      app: './app.js',
      adminApp: './adminApp.js'
    });
  });
}
```

**2. Loader（加载器）**

```javascript
// 自定义 Loader 示例
module.exports = function(source) {
  // 转换源代码
  const transformedSource = source.replace(/console\.log/g, '');

  // 返回转换后的代码
  return transformedSource;
};

// 使用自定义 Loader
{
  test: /\.js$/,
  use: [
    {
      loader: path.resolve('./loaders/remove-console-loader.js'),
      options: {
        level: 'warn' // 传递选项
      }
    }
  ]
}
```

**3. Plugin（插件）**

```javascript
// 自定义插件示例
class BundleAnalyzerPlugin {
  apply(compiler) {
    compiler.hooks.done.tap("BundleAnalyzerPlugin", (stats) => {
      const bundles = stats.compilation.chunks;

      bundles.forEach((chunk) => {
        console.log(`Chunk: ${chunk.name}, Size: ${chunk.size()}`);
      });
    });
  }
}

// 使用插件
plugins: [new BundleAnalyzerPlugin()];
```

### 2. Vite - 现代化快速构建工具 ⚡

**核心理念：** 开发时使用 ESM，生产时使用 Rollup

#### Vite 配置示例

```javascript
// vite.config.js
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

export default defineConfig({
  // 插件配置
  plugins: [
    vue(),
    // 自定义插件
    {
      name: "custom-plugin",
      buildStart() {
        console.log("构建开始");
      },
    },
  ],

  // 开发服务器配置
  server: {
    port: 3000,
    hot: true,
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },

  // 构建配置
  build: {
    target: "es2015",
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: true,

    // Rollup 选项
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        admin: resolve(__dirname, "admin.html"),
      },

      output: {
        chunkFileNames: "js/[name]-[hash].js",
        entryFileNames: "js/[name]-[hash].js",
        assetFileNames: "[ext]/[name]-[hash].[ext]",
      },
    },

    // 代码分割
    chunkSizeWarningLimit: 1000,
  },

  // 路径别名
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
      components: resolve(__dirname, "src/components"),
    },
  },

  // CSS 配置
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`,
      },
    },
    modules: {
      localsConvention: "camelCaseOnly",
    },
  },

  // 环境变量
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
});
```

#### Vite 核心优势

**1. 极速冷启动**

```javascript
// 开发模式：直接使用 ESM
import { createApp } from "vue";
import App from "./App.vue";

// Vite 直接在浏览器中加载，无需打包
createApp(App).mount("#app");
```

**2. 热更新 (HMR)**

```javascript
// 热更新 API
if (import.meta.hot) {
  import.meta.hot.accept("./component.vue", (newModule) => {
    // 热更新逻辑
    updateComponent(newModule.default);
  });

  import.meta.hot.dispose(() => {
    // 清理逻辑
    cleanup();
  });
}
```

### 3. Rollup - 专注于库打包 🎯

**核心理念：** Tree-shaking 优先，生成更小的包

#### Rollup 配置示例

```javascript
// rollup.config.js
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import babel from "@rollup/plugin-babel";
import terser from "@rollup/plugin-terser";
import { defineConfig } from "rollup";

export default defineConfig([
  // UMD 构建
  {
    input: "src/index.js",
    output: {
      file: "dist/my-library.umd.js",
      format: "umd",
      name: "MyLibrary",
      globals: {
        react: "React",
        "react-dom": "ReactDOM",
      },
    },
    plugins: [
      resolve(),
      commonjs(),
      babel({
        babelHelpers: "bundled",
        exclude: "node_modules/**",
      }),
      terser(),
    ],
    external: ["react", "react-dom"],
  },

  // ES Module 构建
  {
    input: "src/index.js",
    output: {
      file: "dist/my-library.esm.js",
      format: "es",
    },
    plugins: [
      resolve(),
      commonjs(),
      babel({
        babelHelpers: "bundled",
        exclude: "node_modules/**",
      }),
    ],
    external: ["react", "react-dom"],
  },

  // CommonJS 构建
  {
    input: "src/index.js",
    output: {
      file: "dist/my-library.cjs.js",
      format: "cjs",
    },
    plugins: [
      resolve(),
      commonjs(),
      babel({
        babelHelpers: "bundled",
        exclude: "node_modules/**",
      }),
    ],
    external: ["react", "react-dom"],
  },
]);
```

## 性能对比分析

### 1. 构建速度对比 ⚡

```javascript
// 性能测试脚本
const { performance } = require("perf_hooks");

async function benchmarkBuildTools() {
  const results = {};

  // Webpack 构建测试
  const webpackStart = performance.now();
  await runWebpackBuild();
  const webpackEnd = performance.now();
  results.webpack = webpackEnd - webpackStart;

  // Vite 构建测试
  const viteStart = performance.now();
  await runViteBuild();
  const viteEnd = performance.now();
  results.vite = viteEnd - viteStart;

  // Rollup 构建测试
  const rollupStart = performance.now();
  await runRollupBuild();
  const rollupEnd = performance.now();
  results.rollup = rollupEnd - rollupStart;

  console.table(results);
}

// 典型结果（毫秒）
// ┌─────────┬──────────────┐
// │ Tool    │ Build Time   │
// ├─────────┼──────────────┤
// │ Webpack │ 15000        │
// │ Vite    │ 3000         │
// │ Rollup  │ 8000         │
// └─────────┴──────────────┘
```

### 2. 开发体验对比

| 特性       | Webpack     | Vite       | Rollup      |
| ---------- | ----------- | ---------- | ----------- |
| 冷启动     | 慢 (10-30s) | 极快 (<1s) | 中等 (3-8s) |
| 热更新     | 快          | 极快       | 需配置      |
| 配置复杂度 | 高          | 低         | 中等        |
| 插件生态   | 最丰富      | 快速增长   | 专业化      |
| 学习曲线   | 陡峭        | 平缓       | 中等        |

### 3. 打包结果对比

```javascript
// 打包体积分析
const bundleAnalysis = {
  webpack: {
    "main.js": "245KB",
    "vendor.js": "180KB",
    "runtime.js": "12KB",
    total: "437KB",
  },

  vite: {
    "index.js": "220KB",
    "vendor.js": "165KB",
    total: "385KB",
  },

  rollup: {
    "bundle.js": "200KB",
    total: "200KB", // 更好的 Tree Shaking
  },
};
```

## 实际项目选型指南

### 1. 大型应用项目 🏢

**推荐：Webpack**

```javascript
// 复杂的企业级配置
const config = {
  // 多入口配置
  entry: {
    app: "./src/app.js",
    admin: "./src/admin.js",
    mobile: "./src/mobile.js",
  },

  // 环境差异化配置
  optimization: {
    splitChunks: {
      cacheGroups: {
        // 第三方库单独打包
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all",
        },

        // 公共代码提取
        common: {
          name: "common",
          minChunks: 2,
          chunks: "all",
          enforce: true,
        },
      },
    },
  },

  // 复杂的 Loader 链
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          "babel-loader",
          {
            loader: "ts-loader",
            options: {
              transpileOnly: true,
            },
          },
        ],
      },
    ],
  },
};
```

### 2. 现代前端项目 🚀

**推荐：Vite**

```javascript
// 简洁的现代配置
export default defineConfig({
  plugins: [
    vue(),
    // 开箱即用的功能
    {
      name: "auto-import",
      resolveId(id) {
        if (id === "virtual:my-module") {
          return id;
        }
      },
    },
  ],

  // 简单的优化配置
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["vue", "vue-router"],
          ui: ["element-plus"],
        },
      },
    },
  },
});
```

### 3. 组件库/工具库 📚

**推荐：Rollup**

```javascript
// 专业的库打包配置
export default {
  input: "src/index.js",

  // 多格式输出
  output: [
    { file: "dist/index.cjs.js", format: "cjs" },
    { file: "dist/index.esm.js", format: "es" },
    { file: "dist/index.umd.js", format: "umd", name: "MyLib" },
  ],

  // 精确的外部依赖控制
  external: (id) => !id.startsWith(".") && !path.isAbsolute(id),

  plugins: [
    // 专业的插件配置
    resolve(),
    commonjs(),
    babel({
      babelHelpers: "bundled",
    }),
  ],
};
```

## 高级优化技巧

### 1. Webpack 性能优化

```javascript
// webpack.optimization.js
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");
const BundleAnalyzerPlugin =
  require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

module.exports = {
  // 缓存优化
  cache: {
    type: "filesystem",
    buildDependencies: {
      config: [__filename],
    },
  },

  // 并行处理
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: "thread-loader",
            options: {
              workers: 2,
            },
          },
          "babel-loader",
        ],
      },
    ],
  },

  // 分析插件
  plugins: [
    new SpeedMeasurePlugin(),
    new BundleAnalyzerPlugin({
      analyzerMode: "static",
      openAnalyzer: false,
    }),
  ],

  // 解析优化
  resolve: {
    modules: ["node_modules"],
    extensions: [".js", ".jsx"],
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
};
```

### 2. Vite 优化配置

```javascript
// vite.config.optimization.js
export default defineConfig({
  // 依赖预构建优化
  optimizeDeps: {
    include: ["lodash", "axios"],
    exclude: ["your-local-package"],
  },

  // 构建优化
  build: {
    // 启用 CSS 代码分割
    cssCodeSplit: true,

    // 自定义 chunk 分割
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            return "vendor";
          }

          if (id.includes("src/components")) {
            return "components";
          }
        },
      },
    },
  },

  // 开发服务器优化
  server: {
    fs: {
      // 允许访问上级目录
      allow: [".."],
    },
  },
});
```

## 面试常见问题解答

### Q1: Webpack 和 Vite 的核心区别是什么？

**答案框架：**

**开发模式：**

- Webpack：打包后在浏览器运行
- Vite：直接在浏览器中运行 ESM

**构建速度：**

- Webpack：需要分析整个依赖图
- Vite：按需编译，只处理修改的文件

**生产构建：**

- Webpack：使用自己的打包器
- Vite：使用 Rollup 进行优化

### Q2: 什么时候选择 Rollup？

**答案要点：**

1. **库开发**：更好的 Tree Shaking
2. **多格式输出**：UMD、ESM、CJS
3. **更小的包体积**：专注于代码优化
4. **简单的依赖关系**：不需要复杂的 Loader

### Q3: 如何优化 Webpack 构建速度？

**答案结构：**

1. **缓存策略**：filesystem cache
2. **并行处理**：thread-loader、parallel-webpack
3. **减少解析**：resolve 优化、noParse
4. **代码分割**：动态导入、SplitChunks
5. **开发优化**：DllPlugin、HardSourcePlugin

这样的系统性对比能让面试官看到你对构建工具的深度理解！
