# 数组与字符串 - 最基础的数据存储结构

## 数组与字符串概述

数组和字符串是编程中最基础、最重要的数据结构。掌握它们的操作技巧是解决复杂算法问题的基础，也是面试中的高频考点。

### 核心特点

- **数组**：连续内存存储，支持随机访问，插入删除成本较高
- **字符串**：字符数组的特殊形式，通常不可变，有丰富的操作方法
- **时间复杂度**：访问 O(1)，查找 O(n)，插入/删除 O(n)

## 🎯 双指针技巧详解

双指针是数组和字符串问题的核心技巧，根据指针移动方式分为三种类型。

### 1. 对撞指针 (Two Pointers)

```typescript
/**
 * 对撞指针模板
 * 两个指针从两端向中间移动
 */
function twoPointersTemplate<T>(arr: T[]): boolean {
  let left = 0;
  let right = arr.length - 1;

  while (left < right) {
    // 根据条件移动指针
    if (shouldMoveLeft(arr[left], arr[right])) {
      left++;
    } else if (shouldMoveRight(arr[left], arr[right])) {
      right--;
    } else {
      // 找到目标或同时移动
      return true;
    }
  }

  return false;
}

// 辅助函数（需要根据具体问题实现）
function shouldMoveLeft<T>(left: T, right: T): boolean {
  // 实现具体逻辑
  return false;
}

function shouldMoveRight<T>(left: T, right: T): boolean {
  // 实现具体逻辑
  return false;
}
```

**经典应用：两数之和**

```typescript
/**
 * 两数之和 - 有序数组版本
 * @param numbers 有序整数数组
 * @param target 目标值
 * @returns 两个数的索引（1-based）
 */
function twoSum(numbers: number[], target: number): number[] {
  let left = 0;
  let right = numbers.length - 1;

  while (left < right) {
    const sum = numbers[left] + numbers[right];

    if (sum === target) {
      return [left + 1, right + 1]; // 1-based index
    } else if (sum < target) {
      left++;
    } else {
      right--;
    }
  }

  return []; // 未找到
}

/**
 * 三数之和
 * @param nums 整数数组
 * @returns 所有不重复的三元组
 */
function threeSum(nums: number[]): number[][] {
  const result: number[][] = [];
  nums.sort((a, b) => a - b);

  for (let i = 0; i < nums.length - 2; i++) {
    // 跳过重复元素
    if (i > 0 && nums[i] === nums[i - 1]) continue;

    let left = i + 1;
    let right = nums.length - 1;

    while (left < right) {
      const sum = nums[i] + nums[left] + nums[right];

      if (sum === 0) {
        result.push([nums[i], nums[left], nums[right]]);

        // 跳过重复元素
        while (left < right && nums[left] === nums[left + 1]) left++;
        while (left < right && nums[right] === nums[right - 1]) right--;

        left++;
        right--;
      } else if (sum < 0) {
        left++;
      } else {
        right--;
      }
    }
  }

  return result;
}
```

**回文判断**

```typescript
/**
 * 验证回文串
 * @param s 字符串
 * @returns 是否为回文串
 */
function isPalindrome(s: string): boolean {
  // 预处理：只保留字母和数字，转为小写
  const cleaned = s.toLowerCase().replace(/[^a-z0-9]/g, "");

  let left = 0;
  let right = cleaned.length - 1;

  while (left < right) {
    if (cleaned[left] !== cleaned[right]) {
      return false;
    }
    left++;
    right--;
  }

  return true;
}

/**
 * 最长回文子串
 * @param s 字符串
 * @returns 最长回文子串
 */
function longestPalindrome(s: string): string {
  if (!s || s.length < 2) return s;

  let start = 0;
  let maxLength = 1;

  // 辅助函数：从中心扩展
  function expandAroundCenter(left: number, right: number): void {
    while (left >= 0 && right < s.length && s[left] === s[right]) {
      const currentLength = right - left + 1;
      if (currentLength > maxLength) {
        maxLength = currentLength;
        start = left;
      }
      left--;
      right++;
    }
  }

  for (let i = 0; i < s.length; i++) {
    // 奇数长度回文
    expandAroundCenter(i, i);
    // 偶数长度回文
    expandAroundCenter(i, i + 1);
  }

  return s.substring(start, start + maxLength);
}
```

### 2. 快慢指针 (Fast-Slow Pointers)

```typescript
/**
 * 快慢指针模板
 * 快指针移动速度是慢指针的2倍
 */
function fastSlowPointers<T>(arr: T[]): T | null {
  if (arr.length === 0) return null;

  let slow = 0;
  let fast = 0;

  // 第一阶段：检测是否有环/找到中点
  while (fast < arr.length && fast + 1 < arr.length) {
    slow++;
    fast += 2;

    // 根据具体问题添加检测逻辑
    if (shouldStop(arr, slow, fast)) {
      break;
    }
  }

  return arr[slow];
}

function shouldStop<T>(arr: T[], slow: number, fast: number): boolean {
  // 具体实现根据问题而定
  return false;
}
```

**移除重复元素**

```typescript
/**
 * 删除有序数组中的重复项
 * @param nums 有序数组
 * @returns 新数组长度
 */
function removeDuplicates(nums: number[]): number {
  if (nums.length <= 1) return nums.length;

  let slow = 0; // 慢指针指向不重复元素的位置

  for (let fast = 1; fast < nums.length; fast++) {
    if (nums[fast] !== nums[slow]) {
      slow++;
      nums[slow] = nums[fast];
    }
  }

  return slow + 1;
}

/**
 * 移动零到末尾
 * @param nums 整数数组
 */
function moveZeroes(nums: number[]): void {
  let slow = 0; // 慢指针指向下一个非零元素应该放置的位置

  for (let fast = 0; fast < nums.length; fast++) {
    if (nums[fast] !== 0) {
      if (slow !== fast) {
        [nums[slow], nums[fast]] = [nums[fast], nums[slow]];
      }
      slow++;
    }
  }
}

/**
 * 颜色分类（荷兰国旗问题）
 * @param nums 包含0、1、2的数组
 */
function sortColors(nums: number[]): void {
  let left = 0; // 指向下一个0应该放置的位置
  let right = nums.length - 1; // 指向下一个2应该放置的位置
  let current = 0; // 当前处理的位置

  while (current <= right) {
    if (nums[current] === 0) {
      [nums[left], nums[current]] = [nums[current], nums[left]];
      left++;
      current++;
    } else if (nums[current] === 2) {
      [nums[current], nums[right]] = [nums[right], nums[current]];
      right--;
      // 注意：这里current不增加，因为交换过来的元素还需要处理
    } else {
      current++;
    }
  }
}
```

### 3. 滑动窗口 (Sliding Window)

```typescript
/**
 * 滑动窗口模板
 * @param s 输入字符串或数组
 * @returns 结果
 */
function slidingWindowTemplate(s: string): number {
  const window = new Map<string, number>();
  let left = 0;
  let right = 0;
  let result = 0;

  while (right < s.length) {
    // 扩大窗口
    const rightChar = s[right];
    window.set(rightChar, (window.get(rightChar) || 0) + 1);
    right++;

    // 判断是否需要收缩窗口
    while (shouldShrink(window)) {
      // 更新结果
      result = Math.max(result, right - left);

      // 收缩窗口
      const leftChar = s[left];
      window.set(leftChar, window.get(leftChar)! - 1);
      if (window.get(leftChar) === 0) {
        window.delete(leftChar);
      }
      left++;
    }
  }

  return result;
}

function shouldShrink(window: Map<string, number>): boolean {
  // 根据具体问题实现收缩条件
  return false;
}
```

**最长无重复字符子串**

```typescript
/**
 * 无重复字符的最长子串
 * @param s 字符串
 * @returns 最长子串长度
 */
function lengthOfLongestSubstring(s: string): number {
  const window = new Map<string, number>();
  let left = 0;
  let maxLength = 0;

  for (let right = 0; right < s.length; right++) {
    const rightChar = s[right];

    // 如果字符已存在且在当前窗口内
    if (window.has(rightChar) && window.get(rightChar)! >= left) {
      left = window.get(rightChar)! + 1;
    }

    window.set(rightChar, right);
    maxLength = Math.max(maxLength, right - left + 1);
  }

  return maxLength;
}

/**
 * 最小覆盖子串
 * @param s 源字符串
 * @param t 目标字符串
 * @returns 最小覆盖子串
 */
function minWindow(s: string, t: string): string {
  if (s.length < t.length) return "";

  // 统计目标字符串中各字符的频次
  const need = new Map<string, number>();
  for (const char of t) {
    need.set(char, (need.get(char) || 0) + 1);
  }

  const window = new Map<string, number>();
  let left = 0;
  let valid = 0; // 窗口中满足条件的字符种类数
  let start = 0;
  let minLength = Infinity;

  for (let right = 0; right < s.length; right++) {
    const rightChar = s[right];

    // 扩大窗口
    if (need.has(rightChar)) {
      window.set(rightChar, (window.get(rightChar) || 0) + 1);
      if (window.get(rightChar) === need.get(rightChar)) {
        valid++;
      }
    }

    // 判断是否需要收缩窗口
    while (valid === need.size) {
      // 更新最小覆盖子串
      if (right - left + 1 < minLength) {
        start = left;
        minLength = right - left + 1;
      }

      // 收缩窗口
      const leftChar = s[left];
      if (need.has(leftChar)) {
        if (window.get(leftChar) === need.get(leftChar)) {
          valid--;
        }
        window.set(leftChar, window.get(leftChar)! - 1);
      }
      left++;
    }
  }

  return minLength === Infinity ? "" : s.substring(start, start + minLength);
}
```

**固定窗口大小问题**

```typescript
/**
 * 长度为K的子数组的最大值
 * @param nums 整数数组
 * @param k 窗口大小
 * @returns 每个窗口的最大值
 */
function maxSlidingWindow(nums: number[], k: number): number[] {
  if (nums.length === 0 || k === 0) return [];

  const result: number[] = [];
  const deque: number[] = []; // 存储数组索引，保持递减顺序

  for (let i = 0; i < nums.length; i++) {
    // 移除超出窗口范围的元素
    while (deque.length > 0 && deque[0] < i - k + 1) {
      deque.shift();
    }

    // 移除所有小于当前元素的元素
    while (deque.length > 0 && nums[deque[deque.length - 1]] < nums[i]) {
      deque.pop();
    }

    deque.push(i);

    // 当窗口大小达到k时，记录最大值
    if (i >= k - 1) {
      result.push(nums[deque[0]]);
    }
  }

  return result;
}

/**
 * 大小为K且平均值大于等于阈值的子数组数目
 * @param arr 整数数组
 * @param k 子数组长度
 * @param threshold 阈值
 * @returns 满足条件的子数组数目
 */
function numOfSubarrays(arr: number[], k: number, threshold: number): number {
  let count = 0;
  let sum = 0;
  const target = threshold * k;

  // 计算第一个窗口的和
  for (let i = 0; i < k; i++) {
    sum += arr[i];
  }

  if (sum >= target) count++;

  // 滑动窗口
  for (let i = k; i < arr.length; i++) {
    sum = sum - arr[i - k] + arr[i];
    if (sum >= target) count++;
  }

  return count;
}
```

## 🔧 数组操作进阶

### 1. 前缀和技巧

```typescript
/**
 * 前缀和数组类
 */
class PrefixSum {
  private prefix: number[];

  constructor(nums: number[]) {
    this.prefix = new Array(nums.length + 1).fill(0);

    // 构建前缀和数组
    for (let i = 0; i < nums.length; i++) {
      this.prefix[i + 1] = this.prefix[i] + nums[i];
    }
  }

  /**
   * 查询区间和 [left, right]（闭区间）
   */
  query(left: number, right: number): number {
    return this.prefix[right + 1] - this.prefix[left];
  }
}

/**
 * 和为K的子数组
 * @param nums 整数数组
 * @param k 目标和
 * @returns 子数组个数
 */
function subarraySum(nums: number[], k: number): number {
  const prefixSumCount = new Map<number, number>();
  prefixSumCount.set(0, 1); // 前缀和为0的情况

  let count = 0;
  let prefixSum = 0;

  for (const num of nums) {
    prefixSum += num;

    // 查找是否存在前缀和为 prefixSum - k
    if (prefixSumCount.has(prefixSum - k)) {
      count += prefixSumCount.get(prefixSum - k)!;
    }

    // 更新当前前缀和的计数
    prefixSumCount.set(prefixSum, (prefixSumCount.get(prefixSum) || 0) + 1);
  }

  return count;
}

/**
 * 二维区域和检索
 */
class NumMatrix {
  private prefix: number[][];

  constructor(matrix: number[][]) {
    const m = matrix.length;
    const n = matrix[0].length;

    // 构建二维前缀和数组
    this.prefix = Array(m + 1)
      .fill(null)
      .map(() => Array(n + 1).fill(0));

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        this.prefix[i][j] =
          this.prefix[i - 1][j] +
          this.prefix[i][j - 1] -
          this.prefix[i - 1][j - 1] +
          matrix[i - 1][j - 1];
      }
    }
  }

  /**
   * 计算矩形区域 (row1, col1) 到 (row2, col2) 的和
   */
  sumRegion(row1: number, col1: number, row2: number, col2: number): number {
    return (
      this.prefix[row2 + 1][col2 + 1] -
      this.prefix[row1][col2 + 1] -
      this.prefix[row2 + 1][col1] +
      this.prefix[row1][col1]
    );
  }
}
```

### 2. 差分数组

```typescript
/**
 * 差分数组类
 * 用于高效处理区间更新操作
 */
class DifferenceArray {
  private diff: number[];

  constructor(nums: number[]) {
    this.diff = new Array(nums.length);
    this.diff[0] = nums[0];

    for (let i = 1; i < nums.length; i++) {
      this.diff[i] = nums[i] - nums[i - 1];
    }
  }

  /**
   * 在区间 [left, right] 上增加 val
   */
  increment(left: number, right: number, val: number): void {
    this.diff[left] += val;
    if (right + 1 < this.diff.length) {
      this.diff[right + 1] -= val;
    }
  }

  /**
   * 返回原数组
   */
  result(): number[] {
    const res = new Array(this.diff.length);
    res[0] = this.diff[0];

    for (let i = 1; i < this.diff.length; i++) {
      res[i] = res[i - 1] + this.diff[i];
    }

    return res;
  }
}

/**
 * 航班预订统计
 * @param bookings 预订记录 [first, last, seats]
 * @param n 航班总数
 * @returns 每个航班的预订座位数
 */
function corpFlightBookings(bookings: number[][], n: number): number[] {
  const diff = new DifferenceArray(new Array(n).fill(0));

  for (const [first, last, seats] of bookings) {
    diff.increment(first - 1, last - 1, seats); // 转换为0-based索引
  }

  return diff.result();
}
```

## 📝 字符串算法详解

### 1. KMP 算法

```typescript
/**
 * KMP字符串匹配算法
 */
class KMP {
  private pattern: string;
  private next: number[];

  constructor(pattern: string) {
    this.pattern = pattern;
    this.next = this.buildNext(pattern);
  }

  /**
   * 构建next数组（部分匹配表）
   */
  private buildNext(pattern: string): number[] {
    const next = new Array(pattern.length).fill(0);
    let j = 0;

    for (let i = 1; i < pattern.length; i++) {
      while (j > 0 && pattern[i] !== pattern[j]) {
        j = next[j - 1];
      }

      if (pattern[i] === pattern[j]) {
        j++;
      }

      next[i] = j;
    }

    return next;
  }

  /**
   * 在文本中搜索模式串
   */
  search(text: string): number[] {
    const result: number[] = [];
    let j = 0;

    for (let i = 0; i < text.length; i++) {
      while (j > 0 && text[i] !== this.pattern[j]) {
        j = this.next[j - 1];
      }

      if (text[i] === this.pattern[j]) {
        j++;
      }

      if (j === this.pattern.length) {
        result.push(i - j + 1);
        j = this.next[j - 1];
      }
    }

    return result;
  }
}

/**
 * 实现strStr()
 * @param haystack 主字符串
 * @param needle 模式字符串
 * @returns 第一次出现的索引，未找到返回-1
 */
function strStr(haystack: string, needle: string): number {
  if (needle.length === 0) return 0;

  const kmp = new KMP(needle);
  const matches = kmp.search(haystack);

  return matches.length > 0 ? matches[0] : -1;
}
```

### 2. 字符串处理技巧

```typescript
/**
 * 字符串压缩
 * @param s 字符串
 * @returns 压缩后的字符串
 */
function compressString(s: string): string {
  if (s.length <= 2) return s;

  const compressed: string[] = [];
  let count = 1;

  for (let i = 1; i < s.length; i++) {
    if (s[i] === s[i - 1]) {
      count++;
    } else {
      compressed.push(s[i - 1] + count);
      count = 1;
    }
  }

  // 处理最后一组字符
  compressed.push(s[s.length - 1] + count);

  const result = compressed.join("");
  return result.length < s.length ? result : s;
}

/**
 * 反转字符串中的单词
 * @param s 字符串
 * @returns 反转后的字符串
 */
function reverseWords(s: string): string {
  // 去除多余空格并分割单词
  const words = s.trim().split(/\s+/);

  // 反转单词数组
  return words.reverse().join(" ");
}

/**
 * 字符串相乘
 * @param num1 数字字符串1
 * @param num2 数字字符串2
 * @returns 乘积字符串
 */
function multiply(num1: string, num2: string): string {
  if (num1 === "0" || num2 === "0") return "0";

  const m = num1.length;
  const n = num2.length;
  const result = new Array(m + n).fill(0);

  // 从右到左遍历两个字符串
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      const mul = parseInt(num1[i]) * parseInt(num2[j]);
      const p1 = i + j;
      const p2 = i + j + 1;
      const sum = mul + result[p2];

      result[p2] = sum % 10;
      result[p1] += Math.floor(sum / 10);
    }
  }

  // 去除前导零
  let start = 0;
  while (start < result.length && result[start] === 0) {
    start++;
  }

  return result.slice(start).join("");
}
```

### 3. 回文字符串

```typescript
/**
 * 马拉车算法 - 最长回文子串
 * @param s 字符串
 * @returns 最长回文子串
 */
function longestPalindromeManacher(s: string): string {
  if (!s) return "";

  // 预处理：在每个字符间插入特殊字符
  const processed = "#" + s.split("").join("#") + "#";
  const n = processed.length;
  const radius = new Array(n).fill(0); // 回文半径数组

  let center = 0; // 回文中心
  let right = 0; // 回文右边界
  let maxLen = 0; // 最长回文长度
  let maxCenter = 0; // 最长回文中心

  for (let i = 0; i < n; i++) {
    // 利用回文的对称性
    if (i < right) {
      radius[i] = Math.min(right - i, radius[2 * center - i]);
    }

    // 尝试扩展回文
    try {
      while (
        i + radius[i] + 1 < n &&
        i - radius[i] - 1 >= 0 &&
        processed[i + radius[i] + 1] === processed[i - radius[i] - 1]
      ) {
        radius[i]++;
      }
    } catch (e) {
      // 边界处理
    }

    // 更新中心和右边界
    if (i + radius[i] > right) {
      center = i;
      right = i + radius[i];
    }

    // 更新最长回文
    if (radius[i] > maxLen) {
      maxLen = radius[i];
      maxCenter = i;
    }
  }

  // 从处理后的字符串中提取原始回文
  const start = Math.floor((maxCenter - maxLen) / 2);
  return s.substring(start, start + maxLen);
}

/**
 * 回文子串个数
 * @param s 字符串
 * @returns 回文子串总数
 */
function countSubstrings(s: string): number {
  let count = 0;

  function expandAroundCenter(left: number, right: number): void {
    while (left >= 0 && right < s.length && s[left] === s[right]) {
      count++;
      left--;
      right++;
    }
  }

  for (let i = 0; i < s.length; i++) {
    // 奇数长度回文
    expandAroundCenter(i, i);
    // 偶数长度回文
    expandAroundCenter(i, i + 1);
  }

  return count;
}
```

## 🎯 高频面试题

### 1. 数组题目

```typescript
/**
 * 旋转数组
 * @param nums 整数数组
 * @param k 旋转步数
 */
function rotate(nums: number[], k: number): void {
  k = k % nums.length;

  function reverse(start: number, end: number): void {
    while (start < end) {
      [nums[start], nums[end]] = [nums[end], nums[start]];
      start++;
      end--;
    }
  }

  // 三次反转
  reverse(0, nums.length - 1); // 反转整个数组
  reverse(0, k - 1); // 反转前k个元素
  reverse(k, nums.length - 1); // 反转后面的元素
}

/**
 * 下一个排列
 * @param nums 整数数组
 */
function nextPermutation(nums: number[]): void {
  let i = nums.length - 2;

  // 找到第一个升序对
  while (i >= 0 && nums[i] >= nums[i + 1]) {
    i--;
  }

  if (i >= 0) {
    // 找到第一个大于nums[i]的元素
    let j = nums.length - 1;
    while (nums[j] <= nums[i]) {
      j--;
    }
    [nums[i], nums[j]] = [nums[j], nums[i]];
  }

  // 反转i+1到末尾的部分
  let left = i + 1;
  let right = nums.length - 1;
  while (left < right) {
    [nums[left], nums[right]] = [nums[right], nums[left]];
    left++;
    right--;
  }
}

/**
 * 寻找旋转排序数组中的最小值
 * @param nums 旋转排序数组
 * @returns 最小值
 */
function findMin(nums: number[]): number {
  let left = 0;
  let right = nums.length - 1;

  while (left < right) {
    const mid = Math.floor((left + right) / 2);

    if (nums[mid] > nums[right]) {
      // 最小值在右半部分
      left = mid + 1;
    } else {
      // 最小值在左半部分（包括mid）
      right = mid;
    }
  }

  return nums[left];
}
```

### 2. 字符串题目

```typescript
/**
 * 字符串转换整数 (atoi)
 * @param s 字符串
 * @returns 整数
 */
function myAtoi(s: string): number {
  const INT_MAX = 2 ** 31 - 1;
  const INT_MIN = -(2 ** 31);

  let index = 0;
  let sign = 1;
  let result = 0;

  // 跳过空格
  while (index < s.length && s[index] === " ") {
    index++;
  }

  // 处理符号
  if (index < s.length && (s[index] === "+" || s[index] === "-")) {
    sign = s[index] === "+" ? 1 : -1;
    index++;
  }

  // 转换数字
  while (index < s.length && /\d/.test(s[index])) {
    const digit = parseInt(s[index]);

    // 检查溢出
    if (
      result > Math.floor(INT_MAX / 10) ||
      (result === Math.floor(INT_MAX / 10) && digit > INT_MAX % 10)
    ) {
      return sign === 1 ? INT_MAX : INT_MIN;
    }

    result = result * 10 + digit;
    index++;
  }

  return result * sign;
}

/**
 * 最长公共前缀
 * @param strs 字符串数组
 * @returns 最长公共前缀
 */
function longestCommonPrefix(strs: string[]): string {
  if (!strs.length) return "";

  let prefix = strs[0];

  for (let i = 1; i < strs.length; i++) {
    while (!strs[i].startsWith(prefix)) {
      prefix = prefix.slice(0, -1);
      if (!prefix) return "";
    }
  }

  return prefix;
}

/**
 * 有效的括号
 * @param s 字符串
 * @returns 是否有效
 */
function isValid(s: string): boolean {
  const stack: string[] = [];
  const map = new Map([
    [")", "("],
    ["}", "{"],
    ["]", "["],
  ]);

  for (const char of s) {
    if (map.has(char)) {
      // 右括号
      if (stack.length === 0 || stack.pop() !== map.get(char)) {
        return false;
      }
    } else {
      // 左括号
      stack.push(char);
    }
  }

  return stack.length === 0;
}
```

## 📊 复杂度分析

### 时间复杂度对比

| 操作 | 数组 | 动态数组  | 字符串 |
| ---- | ---- | --------- | ------ |
| 访问 | O(1) | O(1)      | O(1)   |
| 查找 | O(n) | O(n)      | O(n)   |
| 插入 | O(n) | O(1) 摊销 | O(n)   |
| 删除 | O(n) | O(1) 摊销 | O(n)   |

### 算法复杂度

```typescript
/**
 * 各种算法的时间复杂度分析
 */
interface AlgorithmComplexity {
  name: string;
  timeComplexity: string;
  spaceComplexity: string;
  description: string;
}

const algorithmComplexities: AlgorithmComplexity[] = [
  {
    name: "双指针",
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    description: "线性时间，常数空间",
  },
  {
    name: "滑动窗口",
    timeComplexity: "O(n)",
    spaceComplexity: "O(k)",
    description: "k为窗口中不同元素数量",
  },
  {
    name: "前缀和",
    timeComplexity: "O(n) 预处理, O(1) 查询",
    spaceComplexity: "O(n)",
    description: "空间换时间",
  },
  {
    name: "KMP算法",
    timeComplexity: "O(m + n)",
    spaceComplexity: "O(m)",
    description: "m为模式串长度，n为文本长度",
  },
  {
    name: "马拉车算法",
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
    description: "线性时间找最长回文",
  },
];
```

## 🎓 总结与建议

### 学习要点

1. **掌握双指针三种模式**：对撞指针、快慢指针、滑动窗口
2. **理解前缀和思想**：用空间换时间，适用于区间查询
3. **熟练字符串算法**：KMP、马拉车等高效算法
4. **注意边界条件**：空数组、单元素、越界等情况

### 刷题建议

```typescript
/**
 * 推荐的练习顺序
 */
const practiceOrder = [
  "两数之和系列",
  "回文判断系列",
  "滑动窗口系列",
  "前缀和系列",
  "字符串匹配系列",
  "数组变换系列",
];

/**
 * 常见陷阱
 */
const commonPitfalls = [
  "边界条件处理不当",
  "整数溢出",
  "字符串索引越界",
  "空指针异常",
  "时间复杂度分析错误",
];
```

### 面试技巧

1. **先暴力再优化**：从简单解法开始，逐步优化
2. **画图辅助思考**：特别是双指针和滑动窗口问题
3. **考虑边界情况**：空输入、单元素、特殊值等
4. **分析复杂度**：时间和空间复杂度都要考虑
5. **代码规范**：变量命名清晰，逻辑结构清楚

---

🎯 **继续学习**：掌握了数组和字符串的基础操作后，可以继续学习链表、树等更复杂的数据结构！
