# 性能优化策略 - 全链路性能优化方案

## 性能工程体系概览

现代前端性能优化不仅仅是代码层面的优化，而是涵盖从开发、构建、部署到运行时的全链路性能工程体系。

### 性能指标体系 📊

**Core Web Vitals (核心网页指标)**

- **LCP (Largest Contentful Paint)**：最大内容绘制 < 2.5s
- **FID (First Input Delay)**：首次输入延迟 < 100ms
- **CLS (Cumulative Layout Shift)**：累积布局偏移 < 0.1

**其他关键指标**

- **TTFB (Time to First Byte)**：首字节时间 < 600ms
- **FCP (First Contentful Paint)**：首次内容绘制 < 1.8s
- **TTI (Time to Interactive)**：可交互时间 < 3.8s

## 1. 构建时性能优化 🏗️

### Webpack 性能优化配置

```javascript
// webpack.performance.config.js
const path = require("path");
const webpack = require("webpack");
const TerserPlugin = require("terser-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const CompressionPlugin = require("compression-webpack-plugin");
const BundleAnalyzerPlugin =
  require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

module.exports = {
  mode: "production",

  // 优化配置
  optimization: {
    // 代码分割
    splitChunks: {
      chunks: "all",
      cacheGroups: {
        // 第三方库分离
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all",
          priority: 10,
        },

        // 公共代码分离
        common: {
          name: "common",
          minChunks: 2,
          chunks: "all",
          priority: 5,
          reuseExistingChunk: true,
        },

        // CSS 分离
        styles: {
          name: "styles",
          test: /\.(css|scss|sass)$/,
          chunks: "all",
          enforce: true,
        },
      },
    },

    // 运行时代码分离
    runtimeChunk: {
      name: "runtime",
    },

    // 代码压缩
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true, // 删除 console
            drop_debugger: true, // 删除 debugger
            pure_funcs: ["console.log"], // 删除特定函数
          },
          mangle: {
            safari10: true, // Safari 10 兼容
          },
          output: {
            comments: false, // 删除注释
            ascii_only: true, // ASCII 输出
          },
        },
        extractComments: false, // 不提取注释到单独文件
        parallel: true, // 并行处理
      }),

      new CssMinimizerPlugin({
        minimizerOptions: {
          preset: [
            "default",
            {
              discardComments: { removeAll: true },
              normalizeWhitespace: true,
              colormin: true,
              minifySelectors: true,
            },
          ],
        },
      }),
    ],

    // 模块 ID 生成策略
    moduleIds: "deterministic",
    chunkIds: "deterministic",
  },

  // 解析优化
  resolve: {
    // 减少解析步骤
    modules: [path.resolve(__dirname, "src"), "node_modules"],

    // 指定扩展名顺序
    extensions: [".js", ".jsx", ".ts", ".tsx", ".json"],

    // 路径别名
    alias: {
      "@": path.resolve(__dirname, "src"),
      components: path.resolve(__dirname, "src/components"),
      utils: path.resolve(__dirname, "src/utils"),
    },

    // 优化第三方库解析
    mainFields: ["browser", "module", "main"],
  },

  // 模块配置
  module: {
    rules: [
      // JavaScript/TypeScript 处理
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: [
          // 多线程处理
          {
            loader: "thread-loader",
            options: {
              workers: require("os").cpus().length - 1,
            },
          },

          // Babel 编译
          {
            loader: "babel-loader",
            options: {
              presets: [
                [
                  "@babel/preset-env",
                  {
                    targets: "> 0.25%, not dead",
                    useBuiltIns: "usage",
                    corejs: 3,
                    modules: false,
                  },
                ],
                [
                  "@babel/preset-react",
                  {
                    runtime: "automatic",
                  },
                ],
                "@babel/preset-typescript",
              ],
              plugins: [
                // 动态导入支持
                "@babel/plugin-syntax-dynamic-import",

                // 装饰器支持
                ["@babel/plugin-proposal-decorators", { legacy: true }],

                // 类属性支持
                ["@babel/plugin-proposal-class-properties", { loose: true }],
              ],

              // 缓存编译结果
              cacheDirectory: true,
              cacheCompression: false,
            },
          },
        ],
      },

      // CSS 处理
      {
        test: /\.(css|scss|sass)$/,
        use: [
          MiniCssExtractPlugin.loader,

          // CSS 处理
          {
            loader: "css-loader",
            options: {
              modules: {
                auto: /\.module\./,
                localIdentName: "[name]__[local]--[hash:base64:5]",
              },
              sourceMap: false, // 生产环境关闭源映射
            },
          },

          // PostCSS 处理
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                plugins: [
                  ["autoprefixer"],
                  [
                    "cssnano",
                    {
                      preset: "default",
                    },
                  ],
                ],
              },
            },
          },

          // Sass 处理
          {
            loader: "sass-loader",
            options: {
              implementation: require("sass"),
              sourceMap: false,
            },
          },
        ],
      },

      // 图片优化
      {
        test: /\.(png|jpe?g|gif|svg|webp)$/,
        type: "asset",
        parser: {
          dataUrlCondition: {
            maxSize: 8 * 1024, // 8KB 以下内联
          },
        },
        generator: {
          filename: "images/[name].[hash:8][ext]",
        },
        use: [
          {
            loader: "image-webpack-loader",
            options: {
              mozjpeg: {
                progressive: true,
                quality: 80,
              },
              optipng: {
                enabled: false,
              },
              pngquant: {
                quality: [0.65, 0.9],
                speed: 4,
              },
              gifsicle: {
                interlaced: false,
              },
              webp: {
                quality: 80,
              },
            },
          },
        ],
      },
    ],
  },

  // 插件配置
  plugins: [
    // CSS 提取
    new MiniCssExtractPlugin({
      filename: "css/[name].[contenthash:8].css",
      chunkFilename: "css/[name].[contenthash:8].chunk.css",
    }),

    // Gzip 压缩
    new CompressionPlugin({
      filename: "[path][base].gz",
      algorithm: "gzip",
      test: /\.(js|css|html|svg)$/,
      threshold: 8192,
      minRatio: 0.8,
    }),

    // Brotli 压缩
    new CompressionPlugin({
      filename: "[path][base].br",
      algorithm: "brotliCompress",
      test: /\.(js|css|html|svg)$/,
      compressionOptions: {
        params: {
          [require("zlib").constants.BROTLI_PARAM_QUALITY]: 11,
        },
      },
      threshold: 8192,
      minRatio: 0.8,
    }),

    // 环境变量优化
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify("production"),
      __DEV__: false,
    }),

    // 包分析器（开发时使用）
    ...(process.env.ANALYZE ? [new BundleAnalyzerPlugin()] : []),
  ],

  // 性能提示
  performance: {
    hints: "warning",
    maxEntrypointSize: 500000, // 500KB
    maxAssetSize: 300000, // 300KB
    assetFilter: (assetFilename) => {
      return !assetFilename.endsWith(".map");
    },
  },

  // 缓存配置
  cache: {
    type: "filesystem",
    buildDependencies: {
      config: [__filename],
    },
  },
};
```

### Vite 性能优化配置

```javascript
// vite.config.performance.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import { resolve } from "path";

export default defineConfig({
  plugins: [
    react({
      // React Fast Refresh 优化
      fastRefresh: true,

      // Babel 配置
      babel: {
        plugins: [
          // 移除开发时的 PropTypes
          ...(process.env.NODE_ENV === "production"
            ? ["babel-plugin-transform-react-remove-prop-types"]
            : []),
        ],
      },
    }),

    // 构建分析
    visualizer({
      filename: "dist/stats.html",
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ],

  // 构建优化
  build: {
    target: "es2015",

    // 代码分割
    rollupOptions: {
      output: {
        // 手动分包
        manualChunks: {
          // React 相关
          "react-vendor": ["react", "react-dom"],

          // 路由相关
          router: ["react-router-dom"],

          // UI 库
          "ui-vendor": ["antd", "@ant-design/icons"],

          // 工具库
          utils: ["lodash", "dayjs", "axios"],
        },

        // 文件命名
        chunkFileNames: "js/[name]-[hash].js",
        entryFileNames: "js/[name]-[hash].js",
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split(".");
          const extType = info[info.length - 1];

          if (
            /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/i.test(assetInfo.name)
          ) {
            return `media/[name]-[hash][extname]`;
          }

          if (/\.(png|jpe?g|gif|svg|webp)(\?.*)?$/i.test(assetInfo.name)) {
            return `images/[name]-[hash][extname]`;
          }

          if (/\.(woff2?|eot|ttf|otf)(\?.*)?$/i.test(assetInfo.name)) {
            return `fonts/[name]-[hash][extname]`;
          }

          return `assets/[name]-[hash][extname]`;
        },
      },

      // 外部依赖
      external: (id) => {
        // CDN 引入的库
        return ["react", "react-dom"].includes(id);
      },
    },

    // 压缩配置
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ["console.log"],
      },
      mangle: {
        safari10: true,
      },
    },

    // 源映射
    sourcemap: false,

    // 报告压缩后的文件大小
    reportCompressedSize: true,

    // 警告阈值
    chunkSizeWarningLimit: 1000,
  },

  // 依赖预构建优化
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom", "axios", "lodash"],
    exclude: [
      // 大型库延迟加载
      "some-large-library",
    ],
  },

  // 开发服务器优化
  server: {
    // 预热常用文件
    warmup: {
      clientFiles: ["./src/components/**/*.tsx", "./src/pages/**/*.tsx"],
    },
  },

  // 解析配置
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
      components: resolve(__dirname, "src/components"),
      utils: resolve(__dirname, "src/utils"),
    },
  },

  // CSS 配置
  css: {
    // CSS 模块化
    modules: {
      localsConvention: "camelCaseOnly",
      generateScopedName: "[name]__[local]___[hash:base64:5]",
    },

    // PostCSS 配置
    postcss: {
      plugins: [
        require("autoprefixer"),
        require("cssnano")({
          preset: "default",
        }),
      ],
    },
  },
});
```

## 2. 运行时性能优化 🚀

### React 性能优化实践

```tsx
// React 性能优化示例
import React, {
  memo,
  useMemo,
  useCallback,
  lazy,
  Suspense,
  startTransition,
  useDeferredValue,
} from "react";
import { ErrorBoundary } from "react-error-boundary";

// 1. 组件懒加载
const LazyComponent = lazy(() =>
  import("./HeavyComponent").then((module) => ({
    default: module.HeavyComponent,
  }))
);

// 2. 高阶组件 - 性能监控
function withPerformance<T extends object>(
  WrappedComponent: React.ComponentType<T>,
  componentName: string
) {
  return memo((props: T) => {
    const startTime = performance.now();

    React.useEffect(() => {
      const endTime = performance.now();
      console.log(`${componentName} render time: ${endTime - startTime}ms`);
    });

    return <WrappedComponent {...props} />;
  });
}

// 3. 优化的列表组件
interface ListItem {
  id: string;
  name: string;
  description: string;
}

interface VirtualizedListProps {
  items: ListItem[];
  onItemClick: (item: ListItem) => void;
  selectedId?: string;
}

const VirtualizedList: React.FC<VirtualizedListProps> = memo(
  ({ items, onItemClick, selectedId }) => {
    // 虚拟滚动实现
    const [startIndex, setStartIndex] = React.useState(0);
    const [endIndex, setEndIndex] = React.useState(20);

    // 可见项目计算
    const visibleItems = useMemo(
      () => items.slice(startIndex, endIndex + 1),
      [items, startIndex, endIndex]
    );

    // 滚动处理 - 使用防抖
    const handleScroll = useCallback(
      debounce((scrollTop: number) => {
        const itemHeight = 50;
        const containerHeight = 400;
        const visibleCount = Math.ceil(containerHeight / itemHeight);

        const newStartIndex = Math.floor(scrollTop / itemHeight);
        const newEndIndex = Math.min(
          newStartIndex + visibleCount + 5, // 预渲染缓冲
          items.length - 1
        );

        setStartIndex(newStartIndex);
        setEndIndex(newEndIndex);
      }, 16), // 60fps
      [items.length]
    );

    return (
      <div
        className="virtualized-list"
        onScroll={(e) => handleScroll(e.currentTarget.scrollTop)}
      >
        <div style={{ height: items.length * 50 }}>
          <div style={{ transform: `translateY(${startIndex * 50}px)` }}>
            {visibleItems.map((item, index) => (
              <ListItemComponent
                key={item.id}
                item={item}
                onClick={onItemClick}
                isSelected={item.id === selectedId}
                index={startIndex + index}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }
);

// 4. 优化的列表项组件
interface ListItemProps {
  item: ListItem;
  onClick: (item: ListItem) => void;
  isSelected: boolean;
  index: number;
}

const ListItemComponent = memo<ListItemProps>(
  ({ item, onClick, isSelected, index }) => {
    // 点击处理 - 避免内联函数
    const handleClick = useCallback(() => {
      onClick(item);
    }, [item, onClick]);

    // 样式计算 - 避免重复计算
    const itemStyle = useMemo(
      () => ({
        backgroundColor: isSelected
          ? "#e6f7ff"
          : index % 2
          ? "#fafafa"
          : "#ffffff",
        height: 50,
        display: "flex",
        alignItems: "center",
        padding: "0 16px",
        borderBottom: "1px solid #f0f0f0",
        cursor: "pointer",
      }),
      [isSelected, index]
    );

    return (
      <div style={itemStyle} onClick={handleClick}>
        <div>
          <div className="item-name">{item.name}</div>
          <div className="item-description">{item.description}</div>
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    // 自定义比较函数
    return (
      prevProps.item.id === nextProps.item.id &&
      prevProps.isSelected === nextProps.isSelected &&
      prevProps.index === nextProps.index
    );
  }
);

// 5. 数据获取优化
const useOptimizedData = (query: string) => {
  const [data, setData] = React.useState<ListItem[]>([]);
  const [loading, setLoading] = React.useState(false);

  // 延迟查询 - 减少不必要的请求
  const deferredQuery = useDeferredValue(query);

  // 缓存查询结果
  const cachedResults = useMemo(() => new Map<string, ListItem[]>(), []);

  const fetchData = useCallback(
    async (searchQuery: string) => {
      // 检查缓存
      if (cachedResults.has(searchQuery)) {
        setData(cachedResults.get(searchQuery)!);
        return;
      }

      setLoading(true);

      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(searchQuery)}`
        );
        const result = await response.json();

        // 缓存结果
        cachedResults.set(searchQuery, result);
        setData(result);
      } catch (error) {
        console.error("Data fetch error:", error);
      } finally {
        setLoading(false);
      }
    },
    [cachedResults]
  );

  React.useEffect(() => {
    if (deferredQuery) {
      fetchData(deferredQuery);
    }
  }, [deferredQuery, fetchData]);

  return { data, loading };
};

// 6. 主应用组件
const App: React.FC = () => {
  const [query, setQuery] = React.useState("");
  const [selectedId, setSelectedId] = React.useState<string>();

  const { data, loading } = useOptimizedData(query);

  // 搜索处理 - 使用 startTransition
  const handleSearch = useCallback((newQuery: string) => {
    startTransition(() => {
      setQuery(newQuery);
    });
  }, []);

  const handleItemClick = useCallback((item: ListItem) => {
    setSelectedId(item.id);
  }, []);

  return (
    <div className="app">
      <SearchInput onSearch={handleSearch} />

      <ErrorBoundary fallback={<div>Something went wrong</div>}>
        <Suspense fallback={<div>Loading...</div>}>
          {loading ? (
            <div>Searching...</div>
          ) : (
            <VirtualizedList
              items={data}
              onItemClick={handleItemClick}
              selectedId={selectedId}
            />
          )}
        </Suspense>
      </ErrorBoundary>
    </div>
  );
};

// 工具函数 - 防抖
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export default withPerformance(App, "App");
```

### 图片优化策略

```tsx
// 图片优化组件
import React, { useState, useRef, useEffect } from "react";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  loading?: "lazy" | "eager";
  className?: string;
  placeholder?: string;
  sizes?: string;
  quality?: number;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  loading = "lazy",
  className,
  placeholder,
  sizes,
  quality = 80,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // 生成不同尺寸的图片 URL
  const generateSrcSet = (baseSrc: string) => {
    const sizes = [320, 480, 768, 1024, 1280, 1920];
    return sizes
      .map((size) => `${baseSrc}?w=${size}&q=${quality} ${size}w`)
      .join(", ");
  };

  // 懒加载实现
  useEffect(() => {
    if (loading === "lazy" && imgRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target as HTMLImageElement;
              img.src = img.dataset.src!;
              img.srcset = img.dataset.srcset!;
              observer.unobserve(img);
            }
          });
        },
        { threshold: 0.1 }
      );

      observer.observe(imgRef.current);
      return () => observer.disconnect();
    }
  }, [loading]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setError(true);
  };

  if (error) {
    return (
      <div className="image-error" style={{ width, height }}>
        <span>图片加载失败</span>
      </div>
    );
  }

  return (
    <div className={`image-container ${className || ""}`}>
      {/* 占位符 */}
      {!isLoaded && placeholder && (
        <div
          className="image-placeholder"
          style={{
            width,
            height,
            backgroundImage: `url(${placeholder})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      )}

      {/* 实际图片 */}
      <img
        ref={imgRef}
        src={loading === "eager" ? src : undefined}
        data-src={loading === "lazy" ? src : undefined}
        srcSet={loading === "eager" ? generateSrcSet(src) : undefined}
        data-srcset={loading === "lazy" ? generateSrcSet(src) : undefined}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          opacity: isLoaded ? 1 : 0,
          transition: "opacity 0.3s ease-in-out",
        }}
      />
    </div>
  );
};

// WebP 支持检测
const supportsWebP = () => {
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL("image/webp").indexOf("data:image/webp") === 0;
};

// 图片格式优化
const getOptimalImageFormat = (originalSrc: string) => {
  if (supportsWebP()) {
    return originalSrc.replace(/\.(jpg|jpeg|png)$/i, ".webp");
  }
  return originalSrc;
};

export { OptimizedImage, getOptimalImageFormat };
```

## 3. 网络性能优化 🌐

### 资源预加载策略

```html
<!-- 关键资源预加载 -->
<head>
  <!-- DNS 预解析 -->
  <link rel="dns-prefetch" href="//cdn.example.com" />
  <link rel="dns-prefetch" href="//api.example.com" />

  <!-- 预连接 -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />

  <!-- 关键资源预加载 -->
  <link
    rel="preload"
    href="/fonts/main.woff2"
    as="font"
    type="font/woff2"
    crossorigin
  />
  <link rel="preload" href="/css/critical.css" as="style" />
  <link rel="preload" href="/js/main.js" as="script" />

  <!-- 预加载下一页面资源 -->
  <link rel="prefetch" href="/about" />
  <link rel="prefetch" href="/js/about.js" />

  <!-- 模块预加载 -->
  <link rel="modulepreload" href="/js/modules/utils.js" />
</head>
```

```typescript
// 动态资源预加载
class ResourcePreloader {
  private cache = new Map<string, Promise<any>>();

  // 预加载脚本
  preloadScript(src: string): Promise<void> {
    if (this.cache.has(src)) {
      return this.cache.get(src);
    }

    const promise = new Promise<void>((resolve, reject) => {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "script";
      link.href = src;
      link.onload = () => resolve();
      link.onerror = reject;
      document.head.appendChild(link);
    });

    this.cache.set(src, promise);
    return promise;
  }

  // 预加载样式
  preloadStyle(href: string): Promise<void> {
    if (this.cache.has(href)) {
      return this.cache.get(href);
    }

    const promise = new Promise<void>((resolve, reject) => {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "style";
      link.href = href;
      link.onload = () => resolve();
      link.onerror = reject;
      document.head.appendChild(link);
    });

    this.cache.set(href, promise);
    return promise;
  }

  // 预加载图片
  preloadImage(src: string): Promise<void> {
    if (this.cache.has(src)) {
      return this.cache.get(src);
    }

    const promise = new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = src;
    });

    this.cache.set(src, promise);
    return promise;
  }

  // 预加载 JSON 数据
  preloadData(url: string): Promise<any> {
    if (this.cache.has(url)) {
      return this.cache.get(url);
    }

    const promise = fetch(url)
      .then((response) => response.json())
      .catch((error) => {
        console.error(`Failed to preload data: ${url}`, error);
        throw error;
      });

    this.cache.set(url, promise);
    return promise;
  }

  // 智能预加载 - 基于用户行为
  intelligentPreload() {
    // 鼠标悬停预加载
    document.addEventListener("mouseover", (e) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a[href]") as HTMLAnchorElement;

      if (link && link.href) {
        this.preloadPage(link.href);
      }
    });

    // 滚动预加载
    let ticking = false;
    document.addEventListener("scroll", () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          this.preloadVisibleImages();
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  private preloadPage(url: string) {
    const link = document.createElement("link");
    link.rel = "prefetch";
    link.href = url;
    document.head.appendChild(link);
  }

  private preloadVisibleImages() {
    const images = document.querySelectorAll("img[data-src]");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          this.preloadImage(img.dataset.src!);
        }
      });
    });

    images.forEach((img) => observer.observe(img));
  }
}

// 使用示例
const preloader = new ResourcePreloader();

// 页面加载时预加载关键资源
window.addEventListener("load", () => {
  preloader.preloadScript("/js/critical.js");
  preloader.preloadStyle("/css/above-fold.css");
  preloader.intelligentPreload();
});
```

### Service Worker 缓存策略

```javascript
// sw.js - Service Worker
const CACHE_NAME = "myapp-v1.2.0";
const RUNTIME_CACHE = "runtime-cache";

// 需要缓存的静态资源
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/css/main.css",
  "/js/main.js",
  "/images/logo.png",
];

// 安装事件 - 预缓存静态资源
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// 激活事件 - 清理旧缓存
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter(
              (cacheName) =>
                cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE
            )
            .map((cacheName) => caches.delete(cacheName))
        );
      })
      .then(() => self.clients.claim())
  );
});

// 拦截请求 - 实现缓存策略
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 静态资源 - Cache First 策略
  if (STATIC_ASSETS.includes(url.pathname)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // API 请求 - Network First 策略
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirst(request));
    return;
  }

  // 图片资源 - Stale While Revalidate 策略
  if (request.destination === "image") {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // 其他资源 - Network First 策略
  event.respondWith(networkFirst(request));
});

// Cache First 策略
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    console.error("Cache First failed:", error);
    return new Response("Offline", { status: 503 });
  }
}

// Network First 策略
async function networkFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE);

  try {
    const networkResponse = await fetch(request);

    // 只缓存成功的 GET 请求
    if (request.method === "GET" && networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // API 请求失败时返回离线页面
    if (request.url.includes("/api/")) {
      return new Response(JSON.stringify({ error: "Network unavailable" }), {
        status: 503,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response("Offline", { status: 503 });
  }
}

// Stale While Revalidate 策略
async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cachedResponse = await cache.match(request);

  // 后台更新缓存
  const fetchPromise = fetch(request).then((networkResponse) => {
    cache.put(request, networkResponse.clone());
    return networkResponse;
  });

  // 返回缓存的响应，如果没有则等待网络响应
  return cachedResponse || fetchPromise;
}

// 后台同步
self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync") {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // 处理离线时的操作队列
  const offlineActions = await getOfflineActions();

  for (const action of offlineActions) {
    try {
      await fetch(action.url, action.options);
      await removeOfflineAction(action.id);
    } catch (error) {
      console.error("Background sync failed:", error);
    }
  }
}
```

## 4. 性能监控与分析 📊

### 性能监控系统

```typescript
// 性能监控类
class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();
  private observer?: PerformanceObserver;

  constructor() {
    this.initPerformanceObserver();
    this.monitorCoreWebVitals();
    this.monitorResourceTiming();
  }

  // 初始化性能观察器
  private initPerformanceObserver() {
    if ("PerformanceObserver" in window) {
      this.observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          this.processPerformanceEntry(entry);
        });
      });

      // 观察各种性能指标
      this.observer.observe({
        entryTypes: ["measure", "navigation", "resource"],
      });
    }
  }

  // 监控 Core Web Vitals
  private monitorCoreWebVitals() {
    // LCP (Largest Contentful Paint)
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.recordMetric("LCP", lastEntry.startTime);
    }).observe({ entryTypes: ["largest-contentful-paint"] });

    // FID (First Input Delay)
    new PerformanceObserver((entryList) => {
      entryList.getEntries().forEach((entry) => {
        if (entry.name === "first-input") {
          const fid = entry.processingStart - entry.startTime;
          this.recordMetric("FID", fid);
        }
      });
    }).observe({ entryTypes: ["first-input"] });

    // CLS (Cumulative Layout Shift)
    let clsValue = 0;
    new PerformanceObserver((entryList) => {
      entryList.getEntries().forEach((entry) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      this.recordMetric("CLS", clsValue);
    }).observe({ entryTypes: ["layout-shift"] });
  }

  // 监控资源加载时间
  private monitorResourceTiming() {
    new PerformanceObserver((entryList) => {
      entryList.getEntries().forEach((entry) => {
        const resourceEntry = entry as PerformanceResourceTiming;

        // 记录不同类型资源的加载时间
        const resourceType = this.getResourceType(resourceEntry.name);
        const loadTime = resourceEntry.responseEnd - resourceEntry.startTime;

        this.recordMetric(`${resourceType}_load_time`, loadTime);

        // 记录缓存命中率
        if (resourceEntry.transferSize === 0) {
          this.recordMetric(`${resourceType}_cache_hit`, 1);
        } else {
          this.recordMetric(`${resourceType}_cache_miss`, 1);
        }
      });
    }).observe({ entryTypes: ["resource"] });
  }

  // 处理性能条目
  private processPerformanceEntry(entry: PerformanceEntry) {
    switch (entry.entryType) {
      case "navigation":
        this.processNavigationTiming(entry as PerformanceNavigationTiming);
        break;
      case "measure":
        this.recordMetric(entry.name, entry.duration);
        break;
    }
  }

  // 处理导航时间
  private processNavigationTiming(entry: PerformanceNavigationTiming) {
    const metrics = {
      DNS_lookup: entry.domainLookupEnd - entry.domainLookupStart,
      TCP_connect: entry.connectEnd - entry.connectStart,
      SSL_handshake: entry.connectEnd - entry.secureConnectionStart,
      TTFB: entry.responseStart - entry.requestStart,
      DOM_parse: entry.domContentLoadedEventStart - entry.responseEnd,
      Resource_load: entry.loadEventStart - entry.domContentLoadedEventEnd,
      Total_load: entry.loadEventEnd - entry.navigationStart,
    };

    Object.entries(metrics).forEach(([name, value]) => {
      if (value > 0) {
        this.recordMetric(name, value);
      }
    });
  }

  // 记录指标
  private recordMetric(name: string, value: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    this.metrics.get(name)!.push(value);

    // 发送到监控服务
    this.sendMetric(name, value);
  }

  // 获取资源类型
  private getResourceType(url: string): string {
    if (url.match(/\.(js|mjs)$/)) return "script";
    if (url.match(/\.css$/)) return "style";
    if (url.match(/\.(png|jpg|jpeg|gif|svg|webp)$/)) return "image";
    if (url.match(/\.(woff|woff2|ttf|otf)$/)) return "font";
    if (url.includes("/api/")) return "api";
    return "other";
  }

  // 发送指标到监控服务
  private sendMetric(name: string, value: number) {
    // 批量发送，避免频繁请求
    if (!this.sendQueue) {
      this.sendQueue = [];
    }

    this.sendQueue.push({ name, value, timestamp: Date.now() });

    // 延迟发送
    if (this.sendQueue.length >= 10 || !this.sendTimer) {
      this.sendTimer = setTimeout(() => {
        this.flushMetrics();
      }, 5000);
    }
  }

  private sendQueue: Array<{ name: string; value: number; timestamp: number }> =
    [];
  private sendTimer?: NodeJS.Timeout;

  private async flushMetrics() {
    if (this.sendQueue.length === 0) return;

    const metrics = [...this.sendQueue];
    this.sendQueue = [];

    try {
      await fetch("/api/metrics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          metrics,
          userAgent: navigator.userAgent,
          url: window.location.href,
        }),
      });
    } catch (error) {
      console.error("Failed to send metrics:", error);
      // 重新加入队列
      this.sendQueue.unshift(...metrics);
    }

    if (this.sendTimer) {
      clearTimeout(this.sendTimer);
      this.sendTimer = undefined;
    }
  }

  // 自定义性能测量
  measure(name: string, fn: () => void | Promise<void>) {
    const start = performance.now();

    const result = fn();

    if (result instanceof Promise) {
      return result.finally(() => {
        const end = performance.now();
        this.recordMetric(name, end - start);
      });
    } else {
      const end = performance.now();
      this.recordMetric(name, end - start);
      return result;
    }
  }

  // 获取性能报告
  getReport(): Record<string, any> {
    const report: Record<string, any> = {};

    this.metrics.forEach((values, name) => {
      const sorted = values.sort((a, b) => a - b);
      report[name] = {
        count: values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        avg: values.reduce((a, b) => a + b, 0) / values.length,
        p50: sorted[Math.floor(sorted.length * 0.5)],
        p75: sorted[Math.floor(sorted.length * 0.75)],
        p90: sorted[Math.floor(sorted.length * 0.9)],
        p95: sorted[Math.floor(sorted.length * 0.95)],
        p99: sorted[Math.floor(sorted.length * 0.99)],
      };
    });

    return report;
  }

  // 清理资源
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }

    if (this.sendTimer) {
      clearTimeout(this.sendTimer);
    }

    // 发送剩余指标
    this.flushMetrics();
  }
}

// 使用性能监控
const monitor = new PerformanceMonitor();

// 监控 React 组件渲染
const withPerformanceTracking = <T extends object>(
  Component: React.ComponentType<T>,
  componentName: string
) => {
  return (props: T) => {
    React.useEffect(() => {
      monitor.measure(`${componentName}_mount`, () => {
        // 组件挂载时间测量
      });

      return () => {
        monitor.measure(`${componentName}_unmount`, () => {
          // 组件卸载时间测量
        });
      };
    }, []);

    return <Component {...props} />;
  };
};

// 页面可见性变化监控
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    monitor.recordMetric("page_hidden", Date.now());
  } else {
    monitor.recordMetric("page_visible", Date.now());
  }
});

// 错误监控
window.addEventListener("error", (event) => {
  monitor.recordMetric("javascript_error", 1);
});

window.addEventListener("unhandledrejection", (event) => {
  monitor.recordMetric("promise_rejection", 1);
});

export { PerformanceMonitor, withPerformanceTracking };
```

## 面试常见问题解答

### Q1: 前端性能优化的主要策略有哪些？

**回答框架：**

1. **构建优化**：代码分割、压缩、Tree Shaking
2. **加载优化**：懒加载、预加载、CDN
3. **运行时优化**：虚拟滚动、防抖节流、内存管理
4. **网络优化**：缓存策略、资源压缩、HTTP/2
5. **监控优化**：性能监控、错误追踪、用户体验指标

### Q2: 如何优化首屏加载时间？

**核心策略：**

1. **关键资源优先**：内联关键 CSS，预加载关键资源
2. **代码分割**：按需加载非关键代码
3. **图片优化**：WebP 格式、懒加载、响应式图片
4. **缓存策略**：强缓存静态资源，协商缓存动态内容
5. **服务端优化**：SSR、CDN、Gzip 压缩

### Q3: React 应用的性能优化重点是什么？

**优化重点：**

1. **避免不必要渲染**：React.memo、useMemo、useCallback
2. **组件懒加载**：React.lazy、Suspense
3. **状态管理优化**：合理拆分状态，避免过度渲染
4. **列表优化**：虚拟滚动、key 优化
5. **Bundle 优化**：代码分割、Tree Shaking

这样的性能工程体系能确保应用在各种场景下的优异表现！
