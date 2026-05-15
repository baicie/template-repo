# 二叉树遍历 - 递归与非递归实现

## 二叉树概述

二叉树是一种重要的数据结构，每个节点最多有两个子节点，通常称为左子节点和右子节点。二叉树在计算机科学中有广泛应用，包括表达式解析、搜索算法、堆实现等。

### 二叉树特点

- **节点度数**：每个节点最多有两个子节点
- **层次结构**：具有明确的父子关系
- **递归结构**：每个子树也是一个二叉树
- **遍历方式**：前序、中序、后序、层次遍历

## 🎯 二叉树节点定义

```typescript
/**
 * 二叉树节点定义
 */
class TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;

  constructor(val?: number, left?: TreeNode | null, right?: TreeNode | null) {
    this.val = val === undefined ? 0 : val;
    this.left = left === undefined ? null : left;
    this.right = right === undefined ? null : right;
  }
}

/**
 * 带父指针的二叉树节点
 */
class TreeNodeWithParent {
  val: number;
  left: TreeNodeWithParent | null;
  right: TreeNodeWithParent | null;
  parent: TreeNodeWithParent | null;

  constructor(val?: number) {
    this.val = val === undefined ? 0 : val;
    this.left = null;
    this.right = null;
    this.parent = null;
  }
}

/**
 * N叉树节点
 */
class NTreeNode {
  val: number;
  children: NTreeNode[];

  constructor(val?: number, children?: NTreeNode[]) {
    this.val = val === undefined ? 0 : val;
    this.children = children === undefined ? [] : children;
  }
}
```

## 🔄 二叉树遍历详解

### 1. 深度优先遍历 (DFS)

#### 前序遍历 (Pre-order: Root → Left → Right)

```typescript
/**
 * 前序遍历 - 递归实现
 * @param root 根节点
 * @returns 遍历结果
 */
function preorderTraversal(root: TreeNode | null): number[] {
  const result: number[] = [];

  function traverse(node: TreeNode | null): void {
    if (!node) return;

    result.push(node.val); // 访问根节点
    traverse(node.left); // 遍历左子树
    traverse(node.right); // 遍历右子树
  }

  traverse(root);
  return result;
}

/**
 * 前序遍历 - 迭代实现（栈）
 * @param root 根节点
 * @returns 遍历结果
 */
function preorderTraversalIterative(root: TreeNode | null): number[] {
  if (!root) return [];

  const result: number[] = [];
  const stack: TreeNode[] = [root];

  while (stack.length > 0) {
    const node = stack.pop()!;
    result.push(node.val);

    // 先压入右子树，再压入左子树（因为栈是LIFO）
    if (node.right) stack.push(node.right);
    if (node.left) stack.push(node.left);
  }

  return result;
}

/**
 * 前序遍历 - Morris遍历（O(1)空间）
 * @param root 根节点
 * @returns 遍历结果
 */
function preorderTraversalMorris(root: TreeNode | null): number[] {
  const result: number[] = [];
  let current = root;

  while (current) {
    if (!current.left) {
      // 没有左子树，访问当前节点并移动到右子树
      result.push(current.val);
      current = current.right;
    } else {
      // 找到左子树的最右节点
      let predecessor = current.left;
      while (predecessor.right && predecessor.right !== current) {
        predecessor = predecessor.right;
      }

      if (!predecessor.right) {
        // 建立线索
        result.push(current.val);
        predecessor.right = current;
        current = current.left;
      } else {
        // 拆除线索
        predecessor.right = null;
        current = current.right;
      }
    }
  }

  return result;
}
```

#### 中序遍历 (In-order: Left → Root → Right)

```typescript
/**
 * 中序遍历 - 递归实现
 * @param root 根节点
 * @returns 遍历结果
 */
function inorderTraversal(root: TreeNode | null): number[] {
  const result: number[] = [];

  function traverse(node: TreeNode | null): void {
    if (!node) return;

    traverse(node.left); // 遍历左子树
    result.push(node.val); // 访问根节点
    traverse(node.right); // 遍历右子树
  }

  traverse(root);
  return result;
}

/**
 * 中序遍历 - 迭代实现
 * @param root 根节点
 * @returns 遍历结果
 */
function inorderTraversalIterative(root: TreeNode | null): number[] {
  const result: number[] = [];
  const stack: TreeNode[] = [];
  let current = root;

  while (current || stack.length > 0) {
    // 一直向左走到底
    while (current) {
      stack.push(current);
      current = current.left;
    }

    // 处理栈顶节点
    current = stack.pop()!;
    result.push(current.val);

    // 转向右子树
    current = current.right;
  }

  return result;
}

/**
 * 中序遍历 - Morris遍历
 * @param root 根节点
 * @returns 遍历结果
 */
function inorderTraversalMorris(root: TreeNode | null): number[] {
  const result: number[] = [];
  let current = root;

  while (current) {
    if (!current.left) {
      result.push(current.val);
      current = current.right;
    } else {
      let predecessor = current.left;
      while (predecessor.right && predecessor.right !== current) {
        predecessor = predecessor.right;
      }

      if (!predecessor.right) {
        predecessor.right = current;
        current = current.left;
      } else {
        predecessor.right = null;
        result.push(current.val);
        current = current.right;
      }
    }
  }

  return result;
}
```

#### 后序遍历 (Post-order: Left → Right → Root)

```typescript
/**
 * 后序遍历 - 递归实现
 * @param root 根节点
 * @returns 遍历结果
 */
function postorderTraversal(root: TreeNode | null): number[] {
  const result: number[] = [];

  function traverse(node: TreeNode | null): void {
    if (!node) return;

    traverse(node.left); // 遍历左子树
    traverse(node.right); // 遍历右子树
    result.push(node.val); // 访问根节点
  }

  traverse(root);
  return result;
}

/**
 * 后序遍历 - 迭代实现（双栈法）
 * @param root 根节点
 * @returns 遍历结果
 */
function postorderTraversalIterative(root: TreeNode | null): number[] {
  if (!root) return [];

  const result: number[] = [];
  const stack1: TreeNode[] = [root];
  const stack2: TreeNode[] = [];

  // 第一个栈用于遍历，第二个栈用于存储后序遍历的逆序
  while (stack1.length > 0) {
    const node = stack1.pop()!;
    stack2.push(node);

    if (node.left) stack1.push(node.left);
    if (node.right) stack1.push(node.right);
  }

  // 第二个栈的弹出顺序就是后序遍历的顺序
  while (stack2.length > 0) {
    result.push(stack2.pop()!.val);
  }

  return result;
}

/**
 * 后序遍历 - 单栈实现
 * @param root 根节点
 * @returns 遍历结果
 */
function postorderTraversalSingleStack(root: TreeNode | null): number[] {
  if (!root) return [];

  const result: number[] = [];
  const stack: TreeNode[] = [];
  let current = root;
  let lastVisited: TreeNode | null = null;

  while (current || stack.length > 0) {
    if (current) {
      stack.push(current);
      current = current.left;
    } else {
      const peekNode = stack[stack.length - 1];

      // 如果右子树存在且未被访问过
      if (peekNode.right && lastVisited !== peekNode.right) {
        current = peekNode.right;
      } else {
        result.push(peekNode.val);
        lastVisited = stack.pop()!;
      }
    }
  }

  return result;
}
```

### 2. 广度优先遍历 (BFS)

#### 层次遍历

```typescript
/**
 * 层次遍历 - 基本实现
 * @param root 根节点
 * @returns 遍历结果
 */
function levelOrder(root: TreeNode | null): number[] {
  if (!root) return [];

  const result: number[] = [];
  const queue: TreeNode[] = [root];

  while (queue.length > 0) {
    const node = queue.shift()!;
    result.push(node.val);

    if (node.left) queue.push(node.left);
    if (node.right) queue.push(node.right);
  }

  return result;
}

/**
 * 分层级的层次遍历
 * @param root 根节点
 * @returns 按层分组的遍历结果
 */
function levelOrderByLevels(root: TreeNode | null): number[][] {
  if (!root) return [];

  const result: number[][] = [];
  const queue: TreeNode[] = [root];

  while (queue.length > 0) {
    const levelSize = queue.length;
    const currentLevel: number[] = [];

    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift()!;
      currentLevel.push(node.val);

      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }

    result.push(currentLevel);
  }

  return result;
}

/**
 * 锯齿形层次遍历
 * @param root 根节点
 * @returns 锯齿形遍历结果
 */
function zigzagLevelOrder(root: TreeNode | null): number[][] {
  if (!root) return [];

  const result: number[][] = [];
  const queue: TreeNode[] = [root];
  let leftToRight = true;

  while (queue.length > 0) {
    const levelSize = queue.length;
    const currentLevel: number[] = [];

    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift()!;

      if (leftToRight) {
        currentLevel.push(node.val);
      } else {
        currentLevel.unshift(node.val);
      }

      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }

    result.push(currentLevel);
    leftToRight = !leftToRight;
  }

  return result;
}

/**
 * 垂直遍历
 * @param root 根节点
 * @returns 垂直遍历结果
 */
function verticalTraversal(root: TreeNode | null): number[][] {
  if (!root) return [];

  const columnMap = new Map<number, Array<[number, number]>>();

  function dfs(node: TreeNode | null, row: number, col: number): void {
    if (!node) return;

    if (!columnMap.has(col)) {
      columnMap.set(col, []);
    }
    columnMap.get(col)!.push([row, node.val]);

    dfs(node.left, row + 1, col - 1);
    dfs(node.right, row + 1, col + 1);
  }

  dfs(root, 0, 0);

  const result: number[][] = [];
  const sortedColumns = Array.from(columnMap.keys()).sort((a, b) => a - b);

  for (const col of sortedColumns) {
    const nodes = columnMap.get(col)!;
    nodes.sort((a, b) => {
      if (a[0] !== b[0]) return a[0] - b[0]; // 按行排序
      return a[1] - b[1]; // 同行按值排序
    });
    result.push(nodes.map((node) => node[1]));
  }

  return result;
}
```

## 🔍 二叉搜索树 (BST)

### 1. BST 基本操作

```typescript
/**
 * 二叉搜索树实现
 */
class BinarySearchTree {
  root: TreeNode | null;

  constructor() {
    this.root = null;
  }

  /**
   * 插入节点
   */
  insert(val: number): void {
    this.root = this.insertHelper(this.root, val);
  }

  private insertHelper(node: TreeNode | null, val: number): TreeNode {
    if (!node) return new TreeNode(val);

    if (val < node.val) {
      node.left = this.insertHelper(node.left, val);
    } else if (val > node.val) {
      node.right = this.insertHelper(node.right, val);
    }
    // 相等的情况不插入（避免重复）

    return node;
  }

  /**
   * 查找节点
   */
  search(val: number): boolean {
    return this.searchHelper(this.root, val);
  }

  private searchHelper(node: TreeNode | null, val: number): boolean {
    if (!node) return false;

    if (val === node.val) return true;
    if (val < node.val) return this.searchHelper(node.left, val);
    return this.searchHelper(node.right, val);
  }

  /**
   * 删除节点
   */
  delete(val: number): void {
    this.root = this.deleteHelper(this.root, val);
  }

  private deleteHelper(node: TreeNode | null, val: number): TreeNode | null {
    if (!node) return null;

    if (val < node.val) {
      node.left = this.deleteHelper(node.left, val);
    } else if (val > node.val) {
      node.right = this.deleteHelper(node.right, val);
    } else {
      // 找到要删除的节点
      if (!node.left) return node.right;
      if (!node.right) return node.left;

      // 节点有两个子节点：找到右子树的最小节点
      const minNode = this.findMin(node.right);
      node.val = minNode.val;
      node.right = this.deleteHelper(node.right, minNode.val);
    }

    return node;
  }

  /**
   * 找到最小节点
   */
  private findMin(node: TreeNode): TreeNode {
    while (node.left) {
      node = node.left;
    }
    return node;
  }

  /**
   * 找到最大节点
   */
  private findMax(node: TreeNode): TreeNode {
    while (node.right) {
      node = node.right;
    }
    return node;
  }

  /**
   * 验证是否为有效的BST
   */
  isValidBST(): boolean {
    return this.validateBST(this.root, null, null);
  }

  private validateBST(
    node: TreeNode | null,
    min: number | null,
    max: number | null
  ): boolean {
    if (!node) return true;

    if (
      (min !== null && node.val <= min) ||
      (max !== null && node.val >= max)
    ) {
      return false;
    }

    return (
      this.validateBST(node.left, min, node.val) &&
      this.validateBST(node.right, node.val, max)
    );
  }
}

/**
 * BST迭代器
 */
class BSTIterator {
  private stack: TreeNode[];

  constructor(root: TreeNode | null) {
    this.stack = [];
    this.pushLeft(root);
  }

  private pushLeft(node: TreeNode | null): void {
    while (node) {
      this.stack.push(node);
      node = node.left;
    }
  }

  next(): number {
    const node = this.stack.pop()!;
    this.pushLeft(node.right);
    return node.val;
  }

  hasNext(): boolean {
    return this.stack.length > 0;
  }
}
```

### 2. BST 高级操作

```typescript
/**
 * 将有序数组转换为平衡BST
 * @param nums 有序数组
 * @returns BST根节点
 */
function sortedArrayToBST(nums: number[]): TreeNode | null {
  if (nums.length === 0) return null;

  function build(left: number, right: number): TreeNode | null {
    if (left > right) return null;

    const mid = Math.floor((left + right) / 2);
    const root = new TreeNode(nums[mid]);

    root.left = build(left, mid - 1);
    root.right = build(mid + 1, right);

    return root;
  }

  return build(0, nums.length - 1);
}

/**
 * BST中第K小的元素
 * @param root BST根节点
 * @param k 第几小
 * @returns 第K小的元素
 */
function kthSmallest(root: TreeNode | null, k: number): number {
  let count = 0;
  let result = 0;

  function inorder(node: TreeNode | null): boolean {
    if (!node) return false;

    if (inorder(node.left)) return true;

    count++;
    if (count === k) {
      result = node.val;
      return true;
    }

    return inorder(node.right);
  }

  inorder(root);
  return result;
}

/**
 * 两个BST节点的最近公共祖先
 * @param root BST根节点
 * @param p 节点p
 * @param q 节点q
 * @returns 最近公共祖先
 */
function lowestCommonAncestorBST(
  root: TreeNode | null,
  p: TreeNode,
  q: TreeNode
): TreeNode | null {
  if (!root) return null;

  if (p.val < root.val && q.val < root.val) {
    return lowestCommonAncestorBST(root.left, p, q);
  }

  if (p.val > root.val && q.val > root.val) {
    return lowestCommonAncestorBST(root.right, p, q);
  }

  return root;
}
```

## 🌲 特殊二叉树

### 1. 平衡二叉树 (AVL Tree)

```typescript
/**
 * AVL树节点
 */
class AVLNode {
  val: number;
  left: AVLNode | null;
  right: AVLNode | null;
  height: number;

  constructor(val: number) {
    this.val = val;
    this.left = null;
    this.right = null;
    this.height = 1;
  }
}

/**
 * AVL树实现
 */
class AVLTree {
  private root: AVLNode | null;

  constructor() {
    this.root = null;
  }

  /**
   * 获取节点高度
   */
  private getHeight(node: AVLNode | null): number {
    return node ? node.height : 0;
  }

  /**
   * 获取平衡因子
   */
  private getBalance(node: AVLNode | null): number {
    return node ? this.getHeight(node.left) - this.getHeight(node.right) : 0;
  }

  /**
   * 右旋转
   */
  private rotateRight(y: AVLNode): AVLNode {
    const x = y.left!;
    const T2 = x.right;

    // 执行旋转
    x.right = y;
    y.left = T2;

    // 更新高度
    y.height = Math.max(this.getHeight(y.left), this.getHeight(y.right)) + 1;
    x.height = Math.max(this.getHeight(x.left), this.getHeight(x.right)) + 1;

    return x;
  }

  /**
   * 左旋转
   */
  private rotateLeft(x: AVLNode): AVLNode {
    const y = x.right!;
    const T2 = y.left;

    // 执行旋转
    y.left = x;
    x.right = T2;

    // 更新高度
    x.height = Math.max(this.getHeight(x.left), this.getHeight(x.right)) + 1;
    y.height = Math.max(this.getHeight(y.left), this.getHeight(y.right)) + 1;

    return y;
  }

  /**
   * 插入节点
   */
  insert(val: number): void {
    this.root = this.insertHelper(this.root, val);
  }

  private insertHelper(node: AVLNode | null, val: number): AVLNode {
    // 1. 执行标准BST插入
    if (!node) return new AVLNode(val);

    if (val < node.val) {
      node.left = this.insertHelper(node.left, val);
    } else if (val > node.val) {
      node.right = this.insertHelper(node.right, val);
    } else {
      return node; // 不允许重复值
    }

    // 2. 更新祖先节点的高度
    node.height =
      1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));

    // 3. 获取平衡因子
    const balance = this.getBalance(node);

    // 4. 如果不平衡，执行相应的旋转

    // 左左情况
    if (balance > 1 && val < node.left!.val) {
      return this.rotateRight(node);
    }

    // 右右情况
    if (balance < -1 && val > node.right!.val) {
      return this.rotateLeft(node);
    }

    // 左右情况
    if (balance > 1 && val > node.left!.val) {
      node.left = this.rotateLeft(node.left!);
      return this.rotateRight(node);
    }

    // 右左情况
    if (balance < -1 && val < node.right!.val) {
      node.right = this.rotateRight(node.right!);
      return this.rotateLeft(node);
    }

    return node;
  }

  /**
   * 判断是否为平衡二叉树
   */
  static isBalanced(root: TreeNode | null): boolean {
    function checkBalance(node: TreeNode | null): number {
      if (!node) return 0;

      const leftHeight = checkBalance(node.left);
      if (leftHeight === -1) return -1;

      const rightHeight = checkBalance(node.right);
      if (rightHeight === -1) return -1;

      if (Math.abs(leftHeight - rightHeight) > 1) return -1;

      return Math.max(leftHeight, rightHeight) + 1;
    }

    return checkBalance(root) !== -1;
  }
}
```

### 2. 堆 (Heap)

```typescript
/**
 * 最小堆实现
 */
class MinHeap {
  private heap: number[];

  constructor() {
    this.heap = [];
  }

  /**
   * 获取父节点索引
   */
  private parent(index: number): number {
    return Math.floor((index - 1) / 2);
  }

  /**
   * 获取左子节点索引
   */
  private leftChild(index: number): number {
    return 2 * index + 1;
  }

  /**
   * 获取右子节点索引
   */
  private rightChild(index: number): number {
    return 2 * index + 2;
  }

  /**
   * 交换两个元素
   */
  private swap(i: number, j: number): void {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }

  /**
   * 向上调整
   */
  private heapifyUp(index: number): void {
    while (index > 0 && this.heap[this.parent(index)] > this.heap[index]) {
      this.swap(index, this.parent(index));
      index = this.parent(index);
    }
  }

  /**
   * 向下调整
   */
  private heapifyDown(index: number): void {
    while (this.leftChild(index) < this.heap.length) {
      let minChildIndex = this.leftChild(index);

      if (
        this.rightChild(index) < this.heap.length &&
        this.heap[this.rightChild(index)] < this.heap[minChildIndex]
      ) {
        minChildIndex = this.rightChild(index);
      }

      if (this.heap[index] <= this.heap[minChildIndex]) break;

      this.swap(index, minChildIndex);
      index = minChildIndex;
    }
  }

  /**
   * 插入元素
   */
  insert(val: number): void {
    this.heap.push(val);
    this.heapifyUp(this.heap.length - 1);
  }

  /**
   * 提取最小值
   */
  extractMin(): number | null {
    if (this.heap.length === 0) return null;
    if (this.heap.length === 1) return this.heap.pop()!;

    const min = this.heap[0];
    this.heap[0] = this.heap.pop()!;
    this.heapifyDown(0);

    return min;
  }

  /**
   * 查看最小值
   */
  peek(): number | null {
    return this.heap.length > 0 ? this.heap[0] : null;
  }

  /**
   * 获取堆大小
   */
  size(): number {
    return this.heap.length;
  }

  /**
   * 判断是否为空
   */
  isEmpty(): boolean {
    return this.heap.length === 0;
  }
}

/**
 * 堆排序
 * @param nums 待排序数组
 * @returns 排序后的数组
 */
function heapSort(nums: number[]): number[] {
  const result = [...nums];

  // 构建最大堆
  for (let i = Math.floor(result.length / 2) - 1; i >= 0; i--) {
    heapifyDown(result, result.length, i);
  }

  // 逐个提取最大元素
  for (let i = result.length - 1; i > 0; i--) {
    [result[0], result[i]] = [result[i], result[0]];
    heapifyDown(result, i, 0);
  }

  return result;
}

function heapifyDown(arr: number[], heapSize: number, index: number): void {
  let largest = index;
  const left = 2 * index + 1;
  const right = 2 * index + 2;

  if (left < heapSize && arr[left] > arr[largest]) {
    largest = left;
  }

  if (right < heapSize && arr[right] > arr[largest]) {
    largest = right;
  }

  if (largest !== index) {
    [arr[index], arr[largest]] = [arr[largest], arr[index]];
    heapifyDown(arr, heapSize, largest);
  }
}
```

### 3. Trie 树 (前缀树)

```typescript
/**
 * Trie树节点
 */
class TrieNode {
  children: Map<string, TrieNode>;
  isEndOfWord: boolean;

  constructor() {
    this.children = new Map();
    this.isEndOfWord = false;
  }
}

/**
 * Trie树实现
 */
class Trie {
  private root: TrieNode;

  constructor() {
    this.root = new TrieNode();
  }

  /**
   * 插入单词
   */
  insert(word: string): void {
    let current = this.root;

    for (const char of word) {
      if (!current.children.has(char)) {
        current.children.set(char, new TrieNode());
      }
      current = current.children.get(char)!;
    }

    current.isEndOfWord = true;
  }

  /**
   * 搜索单词
   */
  search(word: string): boolean {
    let current = this.root;

    for (const char of word) {
      if (!current.children.has(char)) {
        return false;
      }
      current = current.children.get(char)!;
    }

    return current.isEndOfWord;
  }

  /**
   * 检查前缀是否存在
   */
  startsWith(prefix: string): boolean {
    let current = this.root;

    for (const char of prefix) {
      if (!current.children.has(char)) {
        return false;
      }
      current = current.children.get(char)!;
    }

    return true;
  }

  /**
   * 删除单词
   */
  delete(word: string): void {
    this.deleteHelper(this.root, word, 0);
  }

  private deleteHelper(node: TrieNode, word: string, index: number): boolean {
    if (index === word.length) {
      if (!node.isEndOfWord) return false;

      node.isEndOfWord = false;
      return node.children.size === 0;
    }

    const char = word[index];
    const childNode = node.children.get(char);

    if (!childNode) return false;

    const shouldDeleteChild = this.deleteHelper(childNode, word, index + 1);

    if (shouldDeleteChild) {
      node.children.delete(char);
      return node.children.size === 0 && !node.isEndOfWord;
    }

    return false;
  }

  /**
   * 获取所有以指定前缀开头的单词
   */
  getAllWordsWithPrefix(prefix: string): string[] {
    const result: string[] = [];
    let current = this.root;

    // 找到前缀节点
    for (const char of prefix) {
      if (!current.children.has(char)) {
        return result;
      }
      current = current.children.get(char)!;
    }

    // DFS收集所有单词
    this.dfsCollectWords(current, prefix, result);
    return result;
  }

  private dfsCollectWords(
    node: TrieNode,
    currentWord: string,
    result: string[]
  ): void {
    if (node.isEndOfWord) {
      result.push(currentWord);
    }

    for (const [char, childNode] of node.children) {
      this.dfsCollectWords(childNode, currentWord + char, result);
    }
  }
}

/**
 * 单词搜索 II - 使用Trie优化
 * @param board 字符网格
 * @param words 单词列表
 * @returns 找到的单词
 */
function findWords(board: string[][], words: string[]): string[] {
  const trie = new Trie();
  const result = new Set<string>();

  // 构建Trie
  for (const word of words) {
    trie.insert(word);
  }

  const rows = board.length;
  const cols = board[0].length;
  const directions = [
    [0, 1],
    [1, 0],
    [0, -1],
    [-1, 0],
  ];

  function dfs(row: number, col: number, node: TrieNode, path: string): void {
    if (row < 0 || row >= rows || col < 0 || col >= cols) return;

    const char = board[row][col];
    if (!node.children.has(char)) return;

    const nextNode = node.children.get(char)!;
    const newPath = path + char;

    if (nextNode.isEndOfWord) {
      result.add(newPath);
    }

    // 标记已访问
    board[row][col] = "#";

    // 探索四个方向
    for (const [dr, dc] of directions) {
      dfs(row + dr, col + dc, nextNode, newPath);
    }

    // 恢复状态
    board[row][col] = char;
  }

  // 从每个位置开始搜索
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      dfs(i, j, trie["root"], "");
    }
  }

  return Array.from(result);
}
```

## 🎯 二叉树经典问题

### 1. 路径问题

```typescript
/**
 * 二叉树的最大路径和
 * @param root 根节点
 * @returns 最大路径和
 */
function maxPathSum(root: TreeNode | null): number {
  let maxSum = -Infinity;

  function maxGain(node: TreeNode | null): number {
    if (!node) return 0;

    // 递归计算左右子树的最大贡献值
    const leftGain = Math.max(maxGain(node.left), 0);
    const rightGain = Math.max(maxGain(node.right), 0);

    // 当前节点的最大路径和
    const currentMaxPath = node.val + leftGain + rightGain;

    // 更新全局最大值
    maxSum = Math.max(maxSum, currentMaxPath);

    // 返回节点的最大贡献值
    return node.val + Math.max(leftGain, rightGain);
  }

  maxGain(root);
  return maxSum;
}

/**
 * 路径总和
 * @param root 根节点
 * @param targetSum 目标和
 * @returns 是否存在路径
 */
function hasPathSum(root: TreeNode | null, targetSum: number): boolean {
  if (!root) return false;

  // 叶子节点
  if (!root.left && !root.right) {
    return root.val === targetSum;
  }

  const remainingSum = targetSum - root.val;
  return (
    hasPathSum(root.left, remainingSum) || hasPathSum(root.right, remainingSum)
  );
}

/**
 * 路径总和 II
 * @param root 根节点
 * @param targetSum 目标和
 * @returns 所有路径
 */
function pathSum(root: TreeNode | null, targetSum: number): number[][] {
  const result: number[][] = [];

  function dfs(
    node: TreeNode | null,
    remainingSum: number,
    path: number[]
  ): void {
    if (!node) return;

    path.push(node.val);

    if (!node.left && !node.right && remainingSum === node.val) {
      result.push([...path]);
    } else {
      dfs(node.left, remainingSum - node.val, path);
      dfs(node.right, remainingSum - node.val, path);
    }

    path.pop(); // 回溯
  }

  dfs(root, targetSum, []);
  return result;
}

/**
 * 路径总和 III
 * @param root 根节点
 * @param targetSum 目标和
 * @returns 路径数量
 */
function pathSumIII(root: TreeNode | null, targetSum: number): number {
  const prefixSumCount = new Map<number, number>();
  prefixSumCount.set(0, 1);

  function dfs(node: TreeNode | null, currentSum: number): number {
    if (!node) return 0;

    currentSum += node.val;
    let count = prefixSumCount.get(currentSum - targetSum) || 0;

    prefixSumCount.set(currentSum, (prefixSumCount.get(currentSum) || 0) + 1);

    count += dfs(node.left, currentSum);
    count += dfs(node.right, currentSum);

    prefixSumCount.set(currentSum, prefixSumCount.get(currentSum)! - 1);

    return count;
  }

  return dfs(root, 0);
}
```

### 2. 构造问题

```typescript
/**
 * 从前序和中序遍历序列构造二叉树
 * @param preorder 前序遍历
 * @param inorder 中序遍历
 * @returns 构造的二叉树
 */
function buildTree(preorder: number[], inorder: number[]): TreeNode | null {
  if (preorder.length === 0) return null;

  const inorderMap = new Map<number, number>();
  for (let i = 0; i < inorder.length; i++) {
    inorderMap.set(inorder[i], i);
  }

  function build(
    preStart: number,
    preEnd: number,
    inStart: number,
    inEnd: number
  ): TreeNode | null {
    if (preStart > preEnd) return null;

    const rootVal = preorder[preStart];
    const root = new TreeNode(rootVal);
    const rootIndex = inorderMap.get(rootVal)!;

    const leftSize = rootIndex - inStart;

    root.left = build(
      preStart + 1,
      preStart + leftSize,
      inStart,
      rootIndex - 1
    );
    root.right = build(preStart + leftSize + 1, preEnd, rootIndex + 1, inEnd);

    return root;
  }

  return build(0, preorder.length - 1, 0, inorder.length - 1);
}

/**
 * 从中序和后序遍历序列构造二叉树
 * @param inorder 中序遍历
 * @param postorder 后序遍历
 * @returns 构造的二叉树
 */
function buildTreeFromInorderPostorder(
  inorder: number[],
  postorder: number[]
): TreeNode | null {
  if (inorder.length === 0) return null;

  const inorderMap = new Map<number, number>();
  for (let i = 0; i < inorder.length; i++) {
    inorderMap.set(inorder[i], i);
  }

  function build(
    inStart: number,
    inEnd: number,
    postStart: number,
    postEnd: number
  ): TreeNode | null {
    if (inStart > inEnd) return null;

    const rootVal = postorder[postEnd];
    const root = new TreeNode(rootVal);
    const rootIndex = inorderMap.get(rootVal)!;

    const leftSize = rootIndex - inStart;

    root.left = build(
      inStart,
      rootIndex - 1,
      postStart,
      postStart + leftSize - 1
    );
    root.right = build(rootIndex + 1, inEnd, postStart + leftSize, postEnd - 1);

    return root;
  }

  return build(0, inorder.length - 1, 0, postorder.length - 1);
}

/**
 * 最大二叉树
 * @param nums 数组
 * @returns 最大二叉树
 */
function constructMaximumBinaryTree(nums: number[]): TreeNode | null {
  if (nums.length === 0) return null;

  function build(left: number, right: number): TreeNode | null {
    if (left > right) return null;

    // 找到最大值的索引
    let maxIndex = left;
    for (let i = left + 1; i <= right; i++) {
      if (nums[i] > nums[maxIndex]) {
        maxIndex = i;
      }
    }

    const root = new TreeNode(nums[maxIndex]);
    root.left = build(left, maxIndex - 1);
    root.right = build(maxIndex + 1, right);

    return root;
  }

  return build(0, nums.length - 1);
}
```

### 3. 序列化和反序列化

```typescript
/**
 * 二叉树的序列化和反序列化
 */
class Codec {
  /**
   * 序列化二叉树
   */
  serialize(root: TreeNode | null): string {
    const result: string[] = [];

    function preorder(node: TreeNode | null): void {
      if (!node) {
        result.push("null");
        return;
      }

      result.push(node.val.toString());
      preorder(node.left);
      preorder(node.right);
    }

    preorder(root);
    return result.join(",");
  }

  /**
   * 反序列化二叉树
   */
  deserialize(data: string): TreeNode | null {
    const nodes = data.split(",");
    let index = 0;

    function buildTree(): TreeNode | null {
      if (index >= nodes.length || nodes[index] === "null") {
        index++;
        return null;
      }

      const root = new TreeNode(parseInt(nodes[index++]));
      root.left = buildTree();
      root.right = buildTree();

      return root;
    }

    return buildTree();
  }
}

/**
 * 层序遍历序列化
 */
function serializeLevelOrder(root: TreeNode | null): string {
  if (!root) return "";

  const result: string[] = [];
  const queue: (TreeNode | null)[] = [root];

  while (queue.length > 0) {
    const node = queue.shift()!;

    if (node) {
      result.push(node.val.toString());
      queue.push(node.left);
      queue.push(node.right);
    } else {
      result.push("null");
    }
  }

  // 去除尾部的null
  while (result.length > 0 && result[result.length - 1] === "null") {
    result.pop();
  }

  return result.join(",");
}

function deserializeLevelOrder(data: string): TreeNode | null {
  if (!data) return null;

  const nodes = data.split(",");
  const root = new TreeNode(parseInt(nodes[0]));
  const queue: TreeNode[] = [root];
  let i = 1;

  while (queue.length > 0 && i < nodes.length) {
    const node = queue.shift()!;

    if (i < nodes.length && nodes[i] !== "null") {
      node.left = new TreeNode(parseInt(nodes[i]));
      queue.push(node.left);
    }
    i++;

    if (i < nodes.length && nodes[i] !== "null") {
      node.right = new TreeNode(parseInt(nodes[i]));
      queue.push(node.right);
    }
    i++;
  }

  return root;
}
```

## 📊 复杂度分析

### 遍历算法复杂度

| 遍历方式    | 时间复杂度 | 空间复杂度 | 备注         |
| ----------- | ---------- | ---------- | ------------ |
| 递归遍历    | O(n)       | O(h)       | h 为树的高度 |
| 迭代遍历    | O(n)       | O(h)       | 栈空间       |
| Morris 遍历 | O(n)       | O(1)       | 常数空间     |
| 层次遍历    | O(n)       | O(w)       | w 为最大宽度 |

### 二叉搜索树操作复杂度

| 操作 | 平均情况 | 最坏情况 | 最好情况 |
| ---- | -------- | -------- | -------- |
| 搜索 | O(log n) | O(n)     | O(1)     |
| 插入 | O(log n) | O(n)     | O(1)     |
| 删除 | O(log n) | O(n)     | O(1)     |

## 🎓 总结与建议

### 学习要点

1. **掌握遍历方式**：递归、迭代、Morris 三种实现
2. **理解 BST 性质**：中序遍历得到有序序列
3. **熟练路径问题**：DFS + 回溯的经典应用
4. **掌握构造技巧**：分治思想的体现

### 常见模式

```typescript
/**
 * 二叉树问题的常见模式
 */
const treePatterns = [
  "遍历模式：前中后序、层次遍历",
  "分治模式：左右子树分别处理",
  "路径模式：DFS + 回溯",
  "构造模式：根据遍历序列构造",
  "修改模式：原地修改树结构",
];

/**
 * 解题技巧
 */
const solvingTips = [
  "递归三要素：终止条件、处理逻辑、递归调用",
  "善用辅助函数：传递额外参数",
  "注意边界条件：空节点、单节点",
  "理解题目要求：路径定义、遍历顺序",
  "画图辅助思考：可视化递归过程",
];
```

---

🌳 **继续学习**：掌握了二叉树后，可以继续学习图论算法，探索更复杂的数据结构关系！
