# 算法与数据结构

算法与数据结构是程序员的内功，也是技术面试的重中之重。掌握核心算法思想和数据结构操作，不仅能应对面试挑战，更能提升解决复杂问题的能力。

## 🧮 完整知识体系

### 📊 数据结构基础

**线性数据结构**

- [数组与字符串](./array-string.md) - 最基础的数据存储结构

**核心概念**

- **数组操作**: 遍历、查找、排序、去重、合并
- **字符串处理**: 模式匹配、子串查找、字符统计
- **双指针技巧**: 快慢指针、左右指针、滑动窗口
- **哈希表应用**: 快速查找、统计频次、缓存实现

**常见题型**

- 两数之和、三数之和系列问题
- 最长无重复字符子串
- 数组去重与合并
- 字符串反转与回文判断
- 滑动窗口最值问题

### 🔗 链表结构

**链表基础**

- [链表操作详解](./linked-list.md) - 动态数据结构的核心

**核心操作**

- **基础操作**: 插入、删除、查找、遍历
- **链表反转**: 迭代法、递归法、部分反转
- **双指针应用**: 环检测、中点查找、倒数第 K 个节点
- **链表合并**: 有序链表合并、K 个链表合并
- **复杂结构**: 双向链表、循环链表

**经典题目**

- 反转链表系列问题
- 合并两个有序链表
- 链表中环的检测
- 删除链表中的节点
- 复制带随机指针的链表

### 🌳 树形结构

**二叉树基础**

- [二叉树遍历](./binary-tree.md) - 递归与非递归实现

**核心概念**

- **树的遍历**: 前序、中序、后序、层次遍历
- **二叉搜索树**: 查找、插入、删除操作
- **平衡二叉树**: AVL 树、红黑树原理
- **堆结构**: 最大堆、最小堆、堆排序
- **Trie 树**: 前缀树的构建与应用

**高级应用**

- 最近公共祖先问题
- 二叉树的序列化与反序列化
- 路径和问题系列
- 树的重构问题
- 二叉搜索树的验证

### 📈 图论算法

**图的基础**

- 图遍历算法 - BFS 与 DFS 的应用

**核心算法**

- **图的表示**: 邻接矩阵、邻接表
- **遍历算法**: 深度优先搜索(DFS)、广度优先搜索(BFS)
- **最短路径**: Dijkstra 算法、Floyd 算法
- **最小生成树**: Kruskal 算法、Prim 算法
- **拓扑排序**: 有向无环图的应用

**实际应用**

- 岛屿数量问题
- 朋友圈数量统计
- 课程调度问题
- 网络连通性检测
- 最短路径规划

### 🔄 排序算法

**排序算法大全**

- 排序算法详解 - 10 种排序算法实现与分析

**基础排序**

- **冒泡排序**: 相邻元素比较交换
- **选择排序**: 选择最值进行交换
- **插入排序**: 构建有序序列
- **希尔排序**: 插入排序的优化版本

**高效排序**

- **快速排序**: 分治思想的经典应用
- **归并排序**: 稳定的分治排序算法
- **堆排序**: 利用堆数据结构的排序
- **计数排序**: 非比较排序算法

**特殊排序**

- **桶排序**: 适用于均匀分布数据
- **基数排序**: 按位数进行排序

### 🔍 查找算法

**查找策略**

- 查找算法集合 - 多种查找方法对比

**基础查找**

- **线性查找**: 顺序遍历查找
- **二分查找**: 有序数组的高效查找
- **哈希查找**: O(1)时间复杂度查找

**高级查找**

- **二分查找变种**: 查找边界、旋转数组查找
- **KMP 算法**: 字符串模式匹配
- **Boyer-Moore 算法**: 高效字符串搜索

### 🎯 动态规划

**DP 核心思想**

- 动态规划详解 - 从递归到动态规划的转化

**基础概念**

- **状态定义**: 如何抽象问题状态
- **状态转移**: 建立状态间的关系
- **边界条件**: 递归的终止条件
- **优化技巧**: 滚动数组、状态压缩

**经典问题**

- **背包问题**: 0-1 背包、完全背包、多重背包
- **路径问题**: 不同路径、最小路径和
- **子序列问题**: 最长公共子序列、最长递增子序列
- **字符串 DP**: 编辑距离、回文串问题
- **区间 DP**: 矩阵链乘法、石子合并

### 🔄 回溯算法

**回溯核心思想**

- [回溯算法详解](./backtracking.md) - 穷举搜索的系统化方法

**核心概念**

- **搜索空间**: 问题的所有可能解构成的空间
- **约束条件**: 限制搜索的条件和规则
- **剪枝优化**: 提前终止无效搜索路径
- **状态回退**: 撤销当前选择，尝试其他可能

**经典问题模式**

- **排列组合**: 全排列、组合、子集生成
- **路径搜索**: N 皇后、数独求解、迷宫路径
- **分割问题**: 字符串分割、数组分割
- **图搜索**: 单词搜索、岛屿问题变种

**代码模板**

```typescript
function backtrack(path: number[], choices: number[]): void {
  // 结束条件
  if (shouldEnd(path, choices)) {
    result.push([...path]); // 记录解
    return;
  }

  // 遍历所有选择
  for (const choice of choices) {
    // 做选择
    path.push(choice);

    // 递归搜索
    backtrack(path, getUpdatedChoices(choices, choice));

    // 撤销选择（回溯）
    path.pop();
  }
}
```

**经典题目**

- 全排列与组合问题
- N 皇后问题
- 数独求解器
- 单词搜索
- 分割回文串
- 子集生成
- 括号生成

**详细解析 - N 皇后问题**

N 皇后是回溯算法的经典问题，要求在 N×N 棋盘上放置 N 个皇后，使得任意两个皇后都不能相互攻击。

```typescript
function solveNQueens(n: number): string[][] {
  const result: string[][] = [];

  function isValid(board: string[][], row: number, col: number): boolean {
    // 检查列
    for (let i = 0; i < row; i++) {
      if (board[i][col] === "Q") {
        return false;
      }
    }

    // 检查左上对角线
    let i = row - 1,
      j = col - 1;
    while (i >= 0 && j >= 0) {
      if (board[i][j] === "Q") {
        return false;
      }
      i--;
      j--;
    }

    // 检查右上对角线
    i = row - 1;
    j = col + 1;
    while (i >= 0 && j < n) {
      if (board[i][j] === "Q") {
        return false;
      }
      i--;
      j++;
    }

    return true;
  }

  function backtrack(board: string[][], row: number): void {
    if (row === n) {
      result.push(board.map((row) => row.join("")));
      return;
    }

    for (let col = 0; col < n; col++) {
      if (isValid(board, row, col)) {
        board[row][col] = "Q";
        backtrack(board, row + 1);
        board[row][col] = "."; // 回溯
      }
    }
  }

  const board: string[][] = Array(n)
    .fill(null)
    .map(() => Array(n).fill("."));
  backtrack(board, 0);
  return result;
}
```

**详细解析 - 全排列问题**

生成数组的所有排列是回溯的基础应用，需要处理重复元素的情况。

```typescript
function permute(nums: number[]): number[][] {
  const result: number[][] = [];
  const used: boolean[] = new Array(nums.length).fill(false);

  function backtrack(path: number[]): void {
    if (path.length === nums.length) {
      result.push([...path]);
      return;
    }

    for (let i = 0; i < nums.length; i++) {
      if (used[i]) {
        continue;
      }

      path.push(nums[i]);
      used[i] = true;
      backtrack(path);
      path.pop();
      used[i] = false;
    }
  }

  backtrack([]);
  return result;
}

// 处理重复元素的排列
function permuteUnique(nums: number[]): number[][] {
  const result: number[][] = [];
  const used: boolean[] = new Array(nums.length).fill(false);

  function backtrack(path: number[]): void {
    if (path.length === nums.length) {
      result.push([...path]);
      return;
    }

    for (let i = 0; i < nums.length; i++) {
      if (used[i]) {
        continue;
      }
      // 剪枝：跳过重复元素
      if (i > 0 && nums[i] === nums[i - 1] && !used[i - 1]) {
        continue;
      }

      path.push(nums[i]);
      used[i] = true;
      backtrack(path);
      path.pop();
      used[i] = false;
    }
  }

  nums.sort((a, b) => a - b); // 排序是关键
  backtrack([]);
  return result;
}
```

### 🎯 贪心算法

**贪心核心思想**

- [贪心算法详解](./greedy.md) - 局部最优到全局最优的策略

**核心概念**

- **贪心策略**: 每步选择当前看起来最优的解
- **局部最优**: 在当前状态下的最佳选择
- **全局最优**: 整个问题的最优解
- **贪心选择性质**: 局部最优能导致全局最优

**常见问题模式**

- **区间调度**: 活动选择、会议室安排
- **最小生成树**: Kruskal、Prim 算法
- **最短路径**: Dijkstra 算法
- **哈夫曼编码**: 最优前缀码构造
- **分数背包**: 可分割物品的背包问题

**贪心策略设计**

```typescript
function greedyAlgorithm<T>(problem: Problem<T>): T[] {
  // 1. 确定贪心策略
  const strategy = defineGreedyStrategy<T>();

  // 2. 排序或预处理
  const sortedData = sortByStrategy(problem.data, strategy);

  // 3. 贪心选择
  const result: T[] = [];
  for (const item of sortedData) {
    if (canSelect(item, result)) {
      result.push(item);
    }
  }

  return result;
}

interface Problem<T> {
  data: T[];
}
```

**经典题目**

- 分发饼干
- 跳跃游戏
- 买卖股票的最佳时机
- 加油站问题
- 任务调度器
- 重构字符串
- 合并区间

**详细解析 - 区间调度问题**

区间调度是贪心算法的经典应用，目标是选择最多的不重叠区间。

```typescript
/**
 * 移除最少的区间，使剩余区间不重叠
 * 贪心策略：按结束时间排序，优先选择结束早的区间
 */
function eraseOverlapIntervals(intervals: number[][]): number {
  if (intervals.length === 0) return 0;

  // 按结束时间排序
  intervals.sort((a, b) => a[1] - b[1]);

  let count = 0; // 需要移除的区间数
  let end = intervals[0][1]; // 当前选择的区间的结束时间

  for (let i = 1; i < intervals.length; i++) {
    if (intervals[i][0] < end) {
      // 重叠
      count++;
    } else {
      // 不重叠，更新结束时间
      end = intervals[i][1];
    }
  }

  return count;
}

/**
 * 射气球问题：用最少的箭射破所有气球
 * 贪心策略：按结束位置排序，每次射在最早结束的位置
 */
function findMinArrowShots(points: number[][]): number {
  if (points.length === 0) return 0;

  points.sort((a, b) => a[1] - b[1]);
  let arrows = 1;
  let end = points[0][1];

  for (let i = 1; i < points.length; i++) {
    if (points[i][0] > end) {
      // 当前气球不能被之前的箭射中
      arrows++;
      end = points[i][1];
    }
  }

  return arrows;
}
```

**详细解析 - 跳跃游戏**

跳跃游戏展示了贪心算法在动态决策中的应用。

```typescript
/**
 * 判断能否到达最后一个位置
 * 贪心策略：维护能到达的最远位置
 */
function canJump(nums: number[]): boolean {
  let maxReach = 0;

  for (let i = 0; i < nums.length; i++) {
    if (i > maxReach) {
      // 当前位置无法到达
      return false;
    }
    maxReach = Math.max(maxReach, i + nums[i]);
    if (maxReach >= nums.length - 1) {
      return true;
    }
  }

  return true;
}

/**
 * 计算到达最后位置的最少跳跃次数
 * 贪心策略：在当前跳跃范围内，选择能跳得最远的位置
 */
function jump(nums: number[]): number {
  if (nums.length <= 1) return 0;

  let jumps = 0;
  let currentEnd = 0; // 当前跳跃能到达的边界
  let farthest = 0; // 在当前跳跃范围内能到达的最远位置

  for (let i = 0; i < nums.length - 1; i++) {
    farthest = Math.max(farthest, i + nums[i]);

    if (i === currentEnd) {
      // 到达当前跳跃的边界
      jumps++;
      currentEnd = farthest;
    }
  }

  return jumps;
}
```

**详细解析 - 分发饼干**

分发饼干问题展示了贪心算法的双指针应用。

```typescript
/**
 * g[i] 是第 i 个孩子的胃口值
 * s[j] 是第 j 块饼干的尺寸
 * 贪心策略：用最小的饼干满足最小的胃口
 */
function findContentChildren(g: number[], s: number[]): number {
  g.sort((a, b) => a - b); // 胃口值排序
  s.sort((a, b) => a - b); // 饼干尺寸排序

  let child = 0; // 孩子指针
  let cookie = 0; // 饼干指针

  while (child < g.length && cookie < s.length) {
    if (s[cookie] >= g[child]) {
      // 饼干能满足孩子
      child++;
    }
    cookie++;
  }

  return child;
}

// 另一种贪心策略：用最大的饼干满足最大的胃口
function findContentChildren2(g: number[], s: number[]): number {
  g.sort((a, b) => b - a); // 胃口值降序
  s.sort((a, b) => b - a); // 饼干尺寸降序

  let child = 0;
  let cookie = 0;

  while (child < g.length && cookie < s.length) {
    if (s[cookie] >= g[child]) {
      child++;
      cookie++;
    } else {
      child++;
    }
  }

  return g.length - child;
}
```

**贪心算法正确性证明**

贪心算法的正确性通常需要证明两个性质：

1. **贪心选择性质**：局部最优选择能导致全局最优解
2. **最优子结构**：原问题的最优解包含子问题的最优解

```typescript
// 证明示例：区间调度问题
/*
证明按结束时间排序的贪心策略是正确的：

1. 贪心选择性质：
   - 设最优解为 OPT，贪心解为 GREEDY
   - 假设第一个选择的区间不同：OPT选择a1，GREEDY选择g1
   - 由于按结束时间排序，g1.end <= a1.end
   - 将OPT中的a1替换为g1，不会影响后续区间的选择
   - 因此贪心选择不会让解变差

2. 最优子结构：
   - 选择第一个区间后，剩余问题变为在剩余区间中选择最多不重叠区间
   - 这是原问题的子问题，具有相同的结构

证明框架：
*/
interface GreedyProof {
  greedyChoice: string; // 贪心选择性质证明
  optimalSubstructure: string; // 最优子结构证明
}

const intervalSchedulingProof: GreedyProof = {
  greedyChoice: "按结束时间排序的选择不会让解变差",
  optimalSubstructure: "子问题具有相同的结构",
};
```

### 🔢 数学算法

**数学基础**

- 算法中的数学 - 数学思维在算法中的应用

**核心概念**

- **位运算**: 与、或、异或、移位操作
- **数论基础**: 质数判断、最大公约数、快速幂
- **组合数学**: 排列组合、卡特兰数、容斥原理
- **概率统计**: 随机算法、蒙特卡洛方法

**实际应用**

- 缺失数字查找
- 只出现一次的数字
- 快速幂计算
- 阶乘尾零统计

## 🎯 高频面试考点

### 📋 基础数据结构类

- 数组和链表的区别？时间复杂度对比？
- 如何反转链表？迭代和递归两种方法？
- 栈和队列的实现？如何用队列实现栈？
- 哈希表的实现原理？如何解决哈希冲突？

### 🌳 树和图类

- 二叉树的三种遍历方式？如何非递归实现？
- 什么是平衡二叉树？如何判断？
- BFS 和 DFS 的区别？分别适用于什么场景？
- 如何检测图中是否有环？

### 🔄 排序查找类

- 快速排序的原理？最坏时间复杂度是什么？
- 归并排序和快速排序的区别？
- 二分查找的边界条件如何处理？
- 如何在旋转数组中查找元素？

### 🎯 动态规划类

- 什么是动态规划？与递归的区别？
- 如何识别 DP 问题？状态转移方程如何建立？
- 背包问题的几种变形？
- 如何优化 DP 的空间复杂度？

### 🔄 回溯算法类

- 什么是回溯算法？与 DFS 的区别？
- 如何识别回溯问题？什么时候需要剪枝？
- N 皇后问题的解题思路？如何优化？
- 全排列和组合问题的区别？
- 如何在回溯中处理重复元素？

### 🎯 贪心算法类

- 什么是贪心算法？如何证明贪心策略的正确性？
- 贪心算法与动态规划的区别？
- 区间调度问题的贪心策略？
- 如何判断一个问题是否适合用贪心算法？
- 分数背包和 0-1 背包为什么策略不同？

## 📖 学习路径建议

### 🚀 快速入门路径（2-3 周）

1. **数组字符串** → **链表操作** → **栈队列** → **基础排序**
2. 重点掌握：双指针技巧、链表反转、栈队列实现、冒泡选择插入排序

### 📚 系统学习路径（6-8 周）

1. **线性结构** → **树形结构** → **图论基础** → **高级排序** → **动态规划** → **回溯算法** → **贪心算法**
2. 重点掌握：树的遍历、图的搜索、快排归并、经典 DP 问题、回溯模板、贪心策略

### 🎯 面试冲刺路径（2-3 周）

1. **高频算法题** → **回溯贪心专题** → **复杂 DP** → **数据结构设计** → **系统设计**
2. 重点掌握：LeetCode 热题 100、N 皇后、全排列、区间调度、优化技巧

## 💡 学习方法建议

### 📝 理论与实践结合

- **理解原理**: 深入理解算法的核心思想，不要死记硬背
- **动手实现**: 每个算法都要亲自编码实现
- **复杂度分析**: 养成分析时间空间复杂度的习惯
- **举一反三**: 学会一个算法要想其变形和应用

### 🛠️ 刷题策略

- **分类刷题**: 按数据结构和算法类型分类练习
- **循序渐进**: 从简单到困难，逐步提升难度
- **重复练习**: 重要题目要多次练习直到熟练
- **总结归纳**: 建立自己的题型解法模板

### 🎯 面试准备

- **表达能力**: 能够清晰地讲解算法思路
- **代码规范**: 写出可读性强的代码
- **边界处理**: 考虑各种边界情况和异常输入
- **优化思考**: 主动思考算法的优化空间

### 🔄 知识巩固

- **定期复习**: 建立复习计划，防止遗忘
- **实际应用**: 在项目中应用学到的算法
- **技术分享**: 通过讲解巩固理解
- **竞赛练习**: 参加编程竞赛提升实战能力

## 🎖️ 掌握标准

### ⭐ 初级标准

- 熟悉基本数据结构操作
- 掌握常见排序和查找算法
- 能解决简单的算法问题
- 理解时间空间复杂度概念

### ⭐⭐ 中级标准

- 深入理解树和图的算法
- 掌握动态规划基本思想
- 理解回溯算法的搜索策略
- 掌握贪心算法的选择原理
- 能够分析和优化算法复杂度
- 具备数据结构设计能力

### ⭐⭐⭐ 高级标准

- 精通高级算法和数据结构
- 熟练运用回溯剪枝优化技巧
- 能够设计和证明贪心策略
- 能够解决复杂的算法问题
- 具备系统设计中的算法选择能力
- 掌握算法工程化实践

## 📚 推荐资源

### 📖 经典书籍

- 《算法导论》- 算法理论的权威教材
- 《剑指 Offer》- 面试算法题的经典集合
- 《程序员代码面试指南》- 实战导向的算法书

### 💻 在线平台

- **LeetCode** - 最受欢迎的算法练习平台
- **牛客网** - 国内优秀的面试刷题平台
- **HackerRank** - 国际化的编程挑战平台

### 🎥 学习视频

- MIT 算法公开课
- 清华大学数据结构课程
- B 站优质算法讲解视频

---

🧮 **开始刷题**: 选择左侧具体算法主题，开启算法修炼之旅！
