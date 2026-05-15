# 大数据表格渲染优化 - 工程化解决方案

## 问题分析

面对大数据表格（如 10 万+ 行数据），直接渲染会导致：

- **性能问题**：页面卡顿、响应缓慢
- **内存问题**：DOM 节点过多，内存占用过高
- **用户体验**：滚动不流畅，操作延迟

## 核心优化策略

### 1. 虚拟滚动 (Virtual Scrolling) 🚀

**原理：** 只渲染可视区域的数据，动态计算和更新显示内容

#### 基础实现思路

```javascript
class VirtualTable {
  constructor(container, data, itemHeight = 40) {
    this.container = container;
    this.data = data;
    this.itemHeight = itemHeight;
    this.visibleCount = Math.ceil(container.clientHeight / itemHeight);
    this.startIndex = 0;

    this.init();
  }

  init() {
    // 创建虚拟容器（总高度）
    this.virtualContainer = document.createElement("div");
    this.virtualContainer.style.height = `${
      this.data.length * this.itemHeight
    }px`;

    // 创建可视区域容器
    this.visibleContainer = document.createElement("div");
    this.visibleContainer.style.transform = "translateY(0px)";

    this.container.appendChild(this.virtualContainer);
    this.virtualContainer.appendChild(this.visibleContainer);

    this.bindEvents();
    this.render();
  }

  bindEvents() {
    this.container.addEventListener("scroll", () => {
      const scrollTop = this.container.scrollTop;
      const newStartIndex = Math.floor(scrollTop / this.itemHeight);

      if (newStartIndex !== this.startIndex) {
        this.startIndex = newStartIndex;
        this.render();
      }
    });
  }

  render() {
    const endIndex = Math.min(
      this.startIndex + this.visibleCount + 5, // 预渲染缓冲
      this.data.length
    );

    // 更新可视容器位置
    this.visibleContainer.style.transform = `translateY(${
      this.startIndex * this.itemHeight
    }px)`;

    // 渲染可视项
    this.visibleContainer.innerHTML = "";
    for (let i = this.startIndex; i < endIndex; i++) {
      const item = this.createItem(this.data[i], i);
      this.visibleContainer.appendChild(item);
    }
  }

  createItem(data, index) {
    const div = document.createElement("div");
    div.style.height = `${this.itemHeight}px`;
    div.innerHTML = `<td>${data.id}</td><td>${data.name}</td><td>${data.email}</td>`;
    return div;
  }
}
```

#### React 虚拟滚动实现

```jsx
import { useState, useEffect, useRef, useMemo } from "react";

function VirtualTable({ data, itemHeight = 50, containerHeight = 600 }) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef();

  // 计算可视区域参数
  const { startIndex, endIndex, visibleItems, offsetY } = useMemo(() => {
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.min(start + visibleCount + 5, data.length); // 缓冲区

    return {
      startIndex: start,
      endIndex: end,
      visibleItems: data.slice(start, end),
      offsetY: start * itemHeight,
    };
  }, [scrollTop, data.length, itemHeight, containerHeight]);

  const handleScroll = (e) => {
    setScrollTop(e.target.scrollTop);
  };

  return (
    <div
      ref={containerRef}
      className="virtual-table-container"
      style={{ height: containerHeight, overflow: "auto" }}
      onScroll={handleScroll}
    >
      {/* 虚拟容器 - 撑开总高度 */}
      <div style={{ height: data.length * itemHeight, position: "relative" }}>
        {/* 可视区域容器 */}
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((item, index) => (
            <div
              key={startIndex + index}
              style={{ height: itemHeight }}
              className="table-row"
            >
              <span>{item.id}</span>
              <span>{item.name}</span>
              <span>{item.email}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### 2. 数据层面优化 📊

#### 分页 + 无限滚动

```javascript
class InfiniteTable {
  constructor(apiUrl, pageSize = 100) {
    this.apiUrl = apiUrl;
    this.pageSize = pageSize;
    this.currentPage = 1;
    this.data = [];
    this.loading = false;
    this.hasMore = true;
  }

  async loadMore() {
    if (this.loading || !this.hasMore) return;

    this.loading = true;
    try {
      const response = await fetch(
        `${this.apiUrl}?page=${this.currentPage}&size=${this.pageSize}`
      );
      const newData = await response.json();

      if (newData.length < this.pageSize) {
        this.hasMore = false;
      }

      this.data = [...this.data, ...newData];
      this.currentPage++;
    } catch (error) {
      console.error("加载数据失败:", error);
    } finally {
      this.loading = false;
    }
  }

  // 检测是否需要加载更多
  checkLoadMore(scrollTop, containerHeight, totalHeight) {
    const threshold = 200; // 距离底部200px时开始加载
    if (scrollTop + containerHeight >= totalHeight - threshold) {
      this.loadMore();
    }
  }
}
```

#### 数据预处理和缓存

```javascript
class DataManager {
  constructor() {
    this.cache = new Map();
    this.processedData = null;
  }

  // 数据预处理
  preprocessData(rawData) {
    return rawData.map((item, index) => ({
      ...item,
      _index: index,
      _search: `${item.name} ${item.email}`.toLowerCase(), // 搜索字段
      _formatted: {
        date: this.formatDate(item.date),
        amount: this.formatCurrency(item.amount),
      },
    }));
  }

  // 内存缓存
  getCachedData(key) {
    return this.cache.get(key);
  }

  setCachedData(key, data) {
    // LRU 缓存策略
    if (this.cache.size >= 100) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, data);
  }

  // 搜索优化
  search(query, data) {
    const cacheKey = `search_${query}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    const result = data.filter((item) =>
      item._search.includes(query.toLowerCase())
    );

    this.setCachedData(cacheKey, result);
    return result;
  }
}
```

### 3. 渲染层面优化 🎨

#### 防抖优化

```javascript
// 防抖滚动处理
function useDebounceScroll(callback, delay = 16) {
  const timeoutRef = useRef();

  return useCallback(
    (e) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(e);
      }, delay);
    },
    [callback, delay]
  );
}

// 使用 RequestAnimationFrame 优化
function useRafScroll(callback) {
  const rafRef = useRef();

  return useCallback(
    (e) => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        callback(e);
      });
    },
    [callback]
  );
}
```

#### React.memo 和 useMemo 优化

```jsx
// 单行组件优化
const TableRow = React.memo(
  ({ item, style }) => {
    const formattedData = useMemo(
      () => ({
        date: formatDate(item.date),
        amount: formatCurrency(item.amount),
      }),
      [item.date, item.amount]
    );

    return (
      <div style={style} className="table-row">
        <span>{item.name}</span>
        <span>{formattedData.date}</span>
        <span>{formattedData.amount}</span>
      </div>
    );
  },
  (prevProps, nextProps) => {
    // 自定义比较函数
    return (
      prevProps.item.id === nextProps.item.id &&
      prevProps.style.height === nextProps.style.height
    );
  }
);

// 表格组件优化
const OptimizedTable = ({ data }) => {
  const memoizedData = useMemo(
    () => data.map((item) => ({ ...item, key: item.id })),
    [data]
  );

  return <VirtualTable data={memoizedData} />;
};
```

### 4. 工程化解决方案 🛠️

#### 1. 使用成熟的虚拟滚动库

```bash
# React
npm install react-window react-window-infinite-loader

# Vue
npm install vue-virtual-scroll-list

# 原生 JS
npm install virtual-list
```

**React Window 示例：**

```jsx
import { FixedSizeList as List } from "react-window";
import InfiniteLoader from "react-window-infinite-loader";

function EnhancedTable({ data, loadMore, hasMore }) {
  const Row = ({ index, style }) => (
    <div style={style}>
      {data[index] ? <TableRow item={data[index]} /> : <div>Loading...</div>}
    </div>
  );

  return (
    <InfiniteLoader
      isItemLoaded={(index) => !!data[index]}
      itemCount={hasMore ? data.length + 1 : data.length}
      loadMoreItems={loadMore}
    >
      {({ onItemsRendered, ref }) => (
        <List
          ref={ref}
          height={600}
          itemCount={data.length}
          itemSize={50}
          onItemsRendered={onItemsRendered}
        >
          {Row}
        </List>
      )}
    </InfiniteLoader>
  );
}
```

#### 2. Web Workers 处理大数据

```javascript
// worker.js
self.onmessage = function (e) {
  const { data, action } = e.data;

  switch (action) {
    case "SORT_DATA":
      const sorted = data.sort((a, b) => a.name.localeCompare(b.name));
      self.postMessage({ action: "SORT_COMPLETE", data: sorted });
      break;

    case "FILTER_DATA":
      const filtered = data.filter((item) =>
        item.name.toLowerCase().includes(e.data.query.toLowerCase())
      );
      self.postMessage({ action: "FILTER_COMPLETE", data: filtered });
      break;
  }
};

// 主线程
class WorkerDataProcessor {
  constructor() {
    this.worker = new Worker("worker.js");
    this.worker.onmessage = this.handleWorkerMessage.bind(this);
  }

  sortData(data) {
    return new Promise((resolve) => {
      this.resolveMap.set("SORT_COMPLETE", resolve);
      this.worker.postMessage({ action: "SORT_DATA", data });
    });
  }

  handleWorkerMessage(e) {
    const { action, data } = e.data;
    const resolve = this.resolveMap.get(action);
    if (resolve) {
      resolve(data);
      this.resolveMap.delete(action);
    }
  }
}
```

#### 3. 监控和性能分析

```javascript
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      renderTime: [],
      scrollLatency: [],
      memoryUsage: [],
    };
  }

  measureRender(renderFn) {
    const start = performance.now();
    const result = renderFn();
    const end = performance.now();

    this.metrics.renderTime.push(end - start);

    // 内存使用情况
    if (performance.memory) {
      this.metrics.memoryUsage.push({
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        timestamp: Date.now(),
      });
    }

    return result;
  }

  getAverageRenderTime() {
    const times = this.metrics.renderTime;
    return times.reduce((a, b) => a + b, 0) / times.length;
  }

  // 发送监控数据到服务端
  reportMetrics() {
    fetch("/api/performance", {
      method: "POST",
      body: JSON.stringify({
        avgRenderTime: this.getAverageRenderTime(),
        memoryPeak: Math.max(...this.metrics.memoryUsage.map((m) => m.used)),
      }),
    });
  }
}
```

## 面试回答框架

### 30 秒版本

"大数据表格优化主要通过虚拟滚动、数据分页和渲染优化三个维度。核心是只渲染可视区域的数据，降低 DOM 节点数量。"

### 1 分钟版本

"从工程化角度，我会采用：

1. **虚拟滚动** - 只渲染可见区域，减少 DOM 开销
2. **数据分层** - 分页加载 + 缓存策略
3. **渲染优化** - React.memo、防抖、RAF
4. **工具化** - 使用 react-window 等成熟库"

### 完整版本

"大数据表格优化是一个系统工程：

**技术方案：**

- 虚拟滚动解决渲染性能
- 无限滚动 + 预加载解决数据问题
- Web Workers 处理计算密集任务

**工程实践：**

- 选择合适的虚拟滚动库
- 建立性能监控体系
- 制定缓存策略

**关键指标：**

- 首屏渲染时间 < 200ms
- 滚动帧率保持 60fps
- 内存占用控制在合理范围"

## 最佳实践总结

1. **优先使用成熟库**：react-window、vue-virtual-scroll-list
2. **建立性能监控**：FPS、内存、渲染时间
3. **渐进式优化**：先解决最关键的性能瓶颈
4. **用户体验优先**：loading 状态、骨架屏、错误处理

这样的工程化思维，能让面试官看到你的系统性思考能力！
