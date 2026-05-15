# 链表操作详解 - 动态数据结构的核心

## 链表概述

链表是一种线性数据结构，其中元素存储在节点中，每个节点包含数据和指向下一个节点的指针。与数组不同，链表的元素在内存中不是连续存储的，这使得插入和删除操作更加高效。

### 链表类型

- **单向链表**：每个节点只有一个指向下一个节点的指针
- **双向链表**：每个节点有两个指针，分别指向前一个和下一个节点
- **循环链表**：最后一个节点指向第一个节点，形成环形结构

## 🎯 链表节点定义

```typescript
/**
 * 单向链表节点
 */
class ListNode {
  val: number;
  next: ListNode | null;

  constructor(val?: number, next?: ListNode | null) {
    this.val = val === undefined ? 0 : val;
    this.next = next === undefined ? null : next;
  }
}

/**
 * 双向链表节点
 */
class DoublyListNode {
  val: number;
  prev: DoublyListNode | null;
  next: DoublyListNode | null;

  constructor(
    val?: number,
    prev?: DoublyListNode | null,
    next?: DoublyListNode | null
  ) {
    this.val = val === undefined ? 0 : val;
    this.prev = prev === undefined ? null : prev;
    this.next = next === undefined ? null : next;
  }
}

/**
 * 带随机指针的链表节点
 */
class RandomListNode {
  val: number;
  next: RandomListNode | null;
  random: RandomListNode | null;

  constructor(
    val?: number,
    next?: RandomListNode | null,
    random?: RandomListNode | null
  ) {
    this.val = val === undefined ? 0 : val;
    this.next = next === undefined ? null : next;
    this.random = random === undefined ? null : random;
  }
}
```

## 🔧 基础操作实现

### 1. 链表基本操作

```typescript
/**
 * 单向链表实现
 */
class LinkedList {
  private head: ListNode | null;
  private size: number;

  constructor() {
    this.head = null;
    this.size = 0;
  }

  /**
   * 在指定位置插入元素
   */
  insert(index: number, val: number): boolean {
    if (index < 0 || index > this.size) return false;

    if (index === 0) {
      this.head = new ListNode(val, this.head);
    } else {
      const prev = this.getNode(index - 1);
      if (!prev) return false;
      prev.next = new ListNode(val, prev.next);
    }

    this.size++;
    return true;
  }

  /**
   * 删除指定位置的元素
   */
  delete(index: number): boolean {
    if (index < 0 || index >= this.size) return false;

    if (index === 0) {
      this.head = this.head!.next;
    } else {
      const prev = this.getNode(index - 1);
      if (!prev || !prev.next) return false;
      prev.next = prev.next.next;
    }

    this.size--;
    return true;
  }

  /**
   * 获取指定位置的元素值
   */
  get(index: number): number | null {
    const node = this.getNode(index);
    return node ? node.val : null;
  }

  /**
   * 获取指定位置的节点
   */
  private getNode(index: number): ListNode | null {
    if (index < 0 || index >= this.size) return null;

    let current = this.head;
    for (let i = 0; i < index; i++) {
      current = current!.next;
    }
    return current;
  }

  /**
   * 查找元素
   */
  find(val: number): number {
    let current = this.head;
    let index = 0;

    while (current) {
      if (current.val === val) return index;
      current = current.next;
      index++;
    }

    return -1;
  }

  /**
   * 获取链表长度
   */
  getSize(): number {
    return this.size;
  }

  /**
   * 转换为数组
   */
  toArray(): number[] {
    const result: number[] = [];
    let current = this.head;

    while (current) {
      result.push(current.val);
      current = current.next;
    }

    return result;
  }
}
```

### 2. 链表遍历

```typescript
/**
 * 链表遍历工具类
 */
class LinkedListTraversal {
  /**
   * 递归遍历
   */
  static traverseRecursive(
    head: ListNode | null,
    callback: (val: number) => void
  ): void {
    if (!head) return;

    callback(head.val);
    this.traverseRecursive(head.next, callback);
  }

  /**
   * 迭代遍历
   */
  static traverseIterative(
    head: ListNode | null,
    callback: (val: number) => void
  ): void {
    let current = head;
    while (current) {
      callback(current.val);
      current = current.next;
    }
  }

  /**
   * 反向遍历（递归实现）
   */
  static traverseReverse(
    head: ListNode | null,
    callback: (val: number) => void
  ): void {
    if (!head) return;

    this.traverseReverse(head.next, callback);
    callback(head.val);
  }

  /**
   * 反向遍历（栈实现）
   */
  static traverseReverseWithStack(
    head: ListNode | null,
    callback: (val: number) => void
  ): void {
    const stack: number[] = [];
    let current = head;

    // 将所有值压入栈
    while (current) {
      stack.push(current.val);
      current = current.next;
    }

    // 从栈中弹出并处理
    while (stack.length > 0) {
      callback(stack.pop()!);
    }
  }
}
```

## 🔄 链表反转详解

链表反转是最经典的链表操作，有多种实现方法。

### 1. 迭代法反转

```typescript
/**
 * 反转整个链表（迭代法）
 * @param head 链表头节点
 * @returns 反转后的头节点
 */
function reverseList(head: ListNode | null): ListNode | null {
  let prev: ListNode | null = null;
  let current = head;

  while (current) {
    const next = current.next; // 保存下一个节点
    current.next = prev; // 反转当前节点的指针
    prev = current; // 移动prev指针
    current = next; // 移动current指针
  }

  return prev; // prev现在是新的头节点
}

/**
 * 反转链表的前N个节点
 * @param head 链表头节点
 * @param n 要反转的节点数
 * @returns 反转后的头节点
 */
function reverseN(head: ListNode | null, n: number): ListNode | null {
  if (!head || n <= 1) return head;

  let prev: ListNode | null = null;
  let current = head;
  let count = 0;

  // 反转前n个节点
  while (current && count < n) {
    const next = current.next;
    current.next = prev;
    prev = current;
    current = next;
    count++;
  }

  // 连接反转部分和剩余部分
  if (head) {
    head.next = current;
  }

  return prev;
}

/**
 * 反转链表的指定区间 [left, right]
 * @param head 链表头节点
 * @param left 起始位置（1-based）
 * @param right 结束位置（1-based）
 * @returns 反转后的头节点
 */
function reverseBetween(
  head: ListNode | null,
  left: number,
  right: number
): ListNode | null {
  if (!head || left === right) return head;

  // 创建虚拟头节点
  const dummy = new ListNode(0, head);
  let prev = dummy;

  // 找到反转区间的前一个节点
  for (let i = 1; i < left; i++) {
    prev = prev.next!;
  }

  // 反转区间内的节点
  let current = prev.next!;
  for (let i = 0; i < right - left; i++) {
    const next = current.next!;
    current.next = next.next;
    next.next = prev.next;
    prev.next = next;
  }

  return dummy.next;
}
```

### 2. 递归法反转

```typescript
/**
 * 递归反转整个链表
 * @param head 链表头节点
 * @returns 反转后的头节点
 */
function reverseListRecursive(head: ListNode | null): ListNode | null {
  // 基础情况
  if (!head || !head.next) return head;

  // 递归反转剩余部分
  const newHead = reverseListRecursive(head.next);

  // 反转当前连接
  head.next.next = head;
  head.next = null;

  return newHead;
}

/**
 * 递归反转前N个节点
 */
function reverseNRecursive(head: ListNode | null, n: number): ListNode | null {
  let successor: ListNode | null = null;

  function reverseFirstN(head: ListNode | null, n: number): ListNode | null {
    if (n === 1) {
      successor = head!.next;
      return head;
    }

    const last = reverseFirstN(head!.next, n - 1);
    head!.next.next = head;
    head!.next = successor;

    return last;
  }

  return reverseFirstN(head, n);
}
```

## 🎯 双指针技巧

双指针是解决链表问题的重要技巧，包括快慢指针和前后指针。

### 1. 快慢指针

```typescript
/**
 * 检测链表中是否有环
 * @param head 链表头节点
 * @returns 是否有环
 */
function hasCycle(head: ListNode | null): boolean {
  if (!head || !head.next) return false;

  let slow = head;
  let fast = head;

  while (fast && fast.next) {
    slow = slow.next!;
    fast = fast.next.next;

    if (slow === fast) return true;
  }

  return false;
}

/**
 * 找到环的起始节点
 * @param head 链表头节点
 * @returns 环的起始节点
 */
function detectCycle(head: ListNode | null): ListNode | null {
  if (!head || !head.next) return null;

  let slow = head;
  let fast = head;

  // 第一阶段：检测是否有环
  while (fast && fast.next) {
    slow = slow.next!;
    fast = fast.next.next;

    if (slow === fast) break;
  }

  // 没有环
  if (!fast || !fast.next) return null;

  // 第二阶段：找到环的起始点
  slow = head;
  while (slow !== fast) {
    slow = slow.next!;
    fast = fast.next!;
  }

  return slow;
}

/**
 * 找到链表的中点
 * @param head 链表头节点
 * @returns 中点节点
 */
function findMiddle(head: ListNode | null): ListNode | null {
  if (!head) return null;

  let slow = head;
  let fast = head;

  // 当链表长度为偶数时，返回第二个中点
  while (fast && fast.next) {
    slow = slow.next!;
    fast = fast.next.next;
  }

  return slow;
}

/**
 * 找到链表的中点（返回第一个中点）
 * @param head 链表头节点
 * @returns 中点节点
 */
function findMiddleFirst(head: ListNode | null): ListNode | null {
  if (!head) return null;

  let slow = head;
  let fast = head.next;

  while (fast && fast.next) {
    slow = slow.next!;
    fast = fast.next.next;
  }

  return slow;
}

/**
 * 找到倒数第K个节点
 * @param head 链表头节点
 * @param k 倒数第几个
 * @returns 倒数第K个节点
 */
function findKthFromEnd(head: ListNode | null, k: number): ListNode | null {
  if (!head || k <= 0) return null;

  let first = head;
  let second = head;

  // first指针先走k步
  for (let i = 0; i < k; i++) {
    if (!first) return null; // k大于链表长度
    first = first.next!;
  }

  // 两个指针同时移动
  while (first) {
    first = first.next!;
    second = second.next!;
  }

  return second;
}
```

### 2. 删除节点

```typescript
/**
 * 删除链表中的重复元素（保留一个）
 * @param head 有序链表头节点
 * @returns 处理后的头节点
 */
function deleteDuplicates(head: ListNode | null): ListNode | null {
  if (!head) return head;

  let current = head;

  while (current && current.next) {
    if (current.val === current.next.val) {
      current.next = current.next.next;
    } else {
      current = current.next;
    }
  }

  return head;
}

/**
 * 删除链表中的所有重复元素
 * @param head 有序链表头节点
 * @returns 处理后的头节点
 */
function deleteDuplicatesAll(head: ListNode | null): ListNode | null {
  const dummy = new ListNode(0, head);
  let prev = dummy;

  while (head) {
    if (head.next && head.val === head.next.val) {
      // 跳过所有重复的节点
      while (head.next && head.val === head.next.val) {
        head = head.next;
      }
      prev.next = head.next;
    } else {
      prev = prev.next!;
    }
    head = head.next;
  }

  return dummy.next;
}

/**
 * 删除指定值的所有节点
 * @param head 链表头节点
 * @param val 要删除的值
 * @returns 处理后的头节点
 */
function removeElements(head: ListNode | null, val: number): ListNode | null {
  const dummy = new ListNode(0, head);
  let current = dummy;

  while (current.next) {
    if (current.next.val === val) {
      current.next = current.next.next;
    } else {
      current = current.next;
    }
  }

  return dummy.next;
}

/**
 * 删除倒数第N个节点
 * @param head 链表头节点
 * @param n 倒数第几个
 * @returns 处理后的头节点
 */
function removeNthFromEnd(head: ListNode | null, n: number): ListNode | null {
  const dummy = new ListNode(0, head);
  let first = dummy;
  let second = dummy;

  // first指针先走n+1步
  for (let i = 0; i <= n; i++) {
    first = first.next!;
  }

  // 两个指针同时移动
  while (first) {
    first = first.next!;
    second = second.next!;
  }

  // 删除节点
  second.next = second.next!.next;

  return dummy.next;
}
```

## 🔗 链表合并操作

### 1. 合并两个有序链表

```typescript
/**
 * 合并两个有序链表（迭代法）
 * @param list1 有序链表1
 * @param list2 有序链表2
 * @returns 合并后的有序链表
 */
function mergeTwoLists(
  list1: ListNode | null,
  list2: ListNode | null
): ListNode | null {
  const dummy = new ListNode(0);
  let current = dummy;

  while (list1 && list2) {
    if (list1.val <= list2.val) {
      current.next = list1;
      list1 = list1.next;
    } else {
      current.next = list2;
      list2 = list2.next;
    }
    current = current.next;
  }

  // 连接剩余部分
  current.next = list1 || list2;

  return dummy.next;
}

/**
 * 合并两个有序链表（递归法）
 * @param list1 有序链表1
 * @param list2 有序链表2
 * @returns 合并后的有序链表
 */
function mergeTwoListsRecursive(
  list1: ListNode | null,
  list2: ListNode | null
): ListNode | null {
  if (!list1) return list2;
  if (!list2) return list1;

  if (list1.val <= list2.val) {
    list1.next = mergeTwoListsRecursive(list1.next, list2);
    return list1;
  } else {
    list2.next = mergeTwoListsRecursive(list1, list2.next);
    return list2;
  }
}

/**
 * 合并K个有序链表
 * @param lists 有序链表数组
 * @returns 合并后的有序链表
 */
function mergeKLists(lists: Array<ListNode | null>): ListNode | null {
  if (!lists.length) return null;

  while (lists.length > 1) {
    const mergedLists: Array<ListNode | null> = [];

    // 两两合并
    for (let i = 0; i < lists.length; i += 2) {
      const list1 = lists[i];
      const list2 = i + 1 < lists.length ? lists[i + 1] : null;
      mergedLists.push(mergeTwoLists(list1, list2));
    }

    lists = mergedLists;
  }

  return lists[0];
}

/**
 * 使用最小堆合并K个有序链表
 */
class MinHeap {
  private heap: ListNode[];

  constructor() {
    this.heap = [];
  }

  push(node: ListNode): void {
    this.heap.push(node);
    this.heapifyUp(this.heap.length - 1);
  }

  pop(): ListNode | null {
    if (this.heap.length === 0) return null;
    if (this.heap.length === 1) return this.heap.pop()!;

    const min = this.heap[0];
    this.heap[0] = this.heap.pop()!;
    this.heapifyDown(0);
    return min;
  }

  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  private heapifyUp(index: number): void {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.heap[parentIndex].val <= this.heap[index].val) break;

      [this.heap[parentIndex], this.heap[index]] = [
        this.heap[index],
        this.heap[parentIndex],
      ];
      index = parentIndex;
    }
  }

  private heapifyDown(index: number): void {
    while (true) {
      let minIndex = index;
      const leftChild = 2 * index + 1;
      const rightChild = 2 * index + 2;

      if (
        leftChild < this.heap.length &&
        this.heap[leftChild].val < this.heap[minIndex].val
      ) {
        minIndex = leftChild;
      }

      if (
        rightChild < this.heap.length &&
        this.heap[rightChild].val < this.heap[minIndex].val
      ) {
        minIndex = rightChild;
      }

      if (minIndex === index) break;

      [this.heap[index], this.heap[minIndex]] = [
        this.heap[minIndex],
        this.heap[index],
      ];
      index = minIndex;
    }
  }
}

function mergeKListsWithHeap(lists: Array<ListNode | null>): ListNode | null {
  const minHeap = new MinHeap();

  // 将每个链表的头节点加入堆
  for (const head of lists) {
    if (head) minHeap.push(head);
  }

  const dummy = new ListNode(0);
  let current = dummy;

  while (!minHeap.isEmpty()) {
    const node = minHeap.pop()!;
    current.next = node;
    current = current.next;

    if (node.next) {
      minHeap.push(node.next);
    }
  }

  return dummy.next;
}
```

## 🎭 复杂链表操作

### 1. 复制带随机指针的链表

```typescript
/**
 * 复制带随机指针的链表
 * @param head 原链表头节点
 * @returns 复制后的链表头节点
 */
function copyRandomList(head: RandomListNode | null): RandomListNode | null {
  if (!head) return null;

  const nodeMap = new Map<RandomListNode, RandomListNode>();

  // 第一遍：创建所有节点
  let current = head;
  while (current) {
    nodeMap.set(current, new RandomListNode(current.val));
    current = current.next;
  }

  // 第二遍：设置next和random指针
  current = head;
  while (current) {
    const copy = nodeMap.get(current)!;
    copy.next = current.next ? nodeMap.get(current.next)! : null;
    copy.random = current.random ? nodeMap.get(current.random)! : null;
    current = current.next;
  }

  return nodeMap.get(head)!;
}

/**
 * 复制带随机指针的链表（O(1)空间复杂度）
 */
function copyRandomListOptimal(
  head: RandomListNode | null
): RandomListNode | null {
  if (!head) return null;

  // 第一步：在每个原节点后面插入复制节点
  let current = head;
  while (current) {
    const copy = new RandomListNode(current.val);
    copy.next = current.next;
    current.next = copy;
    current = copy.next;
  }

  // 第二步：设置复制节点的random指针
  current = head;
  while (current) {
    if (current.random) {
      current.next!.random = current.random.next;
    }
    current = current.next!.next;
  }

  // 第三步：分离两个链表
  const dummy = new RandomListNode(0);
  let copyPrev = dummy;
  current = head;

  while (current) {
    const copy = current.next!;
    current.next = copy.next;
    copyPrev.next = copy;
    copyPrev = copy;
    current = current.next;
  }

  return dummy.next;
}
```

### 2. 链表排序

```typescript
/**
 * 链表排序（归并排序）
 * @param head 链表头节点
 * @returns 排序后的链表头节点
 */
function sortList(head: ListNode | null): ListNode | null {
  if (!head || !head.next) return head;

  // 找到中点并分割链表
  const mid = findMiddleAndSplit(head);

  // 递归排序两部分
  const left = sortList(head);
  const right = sortList(mid);

  // 合并两个有序链表
  return mergeTwoLists(left, right);
}

/**
 * 找到中点并分割链表
 */
function findMiddleAndSplit(head: ListNode): ListNode {
  let slow = head;
  let fast = head;
  let prev: ListNode | null = null;

  while (fast && fast.next) {
    prev = slow;
    slow = slow.next!;
    fast = fast.next.next;
  }

  // 断开连接
  prev!.next = null;
  return slow;
}

/**
 * 链表插入排序
 * @param head 链表头节点
 * @returns 排序后的链表头节点
 */
function insertionSortList(head: ListNode | null): ListNode | null {
  const dummy = new ListNode(0);
  let current = head;

  while (current) {
    const next = current.next;

    // 在已排序部分找到插入位置
    let prev = dummy;
    while (prev.next && prev.next.val < current.val) {
      prev = prev.next;
    }

    // 插入节点
    current.next = prev.next;
    prev.next = current;

    current = next;
  }

  return dummy.next;
}
```

### 3. 链表重排

```typescript
/**
 * 重排链表 L0→L1→…→Ln-1→Ln 变为 L0→Ln→L1→Ln-1→L2→Ln-2→…
 * @param head 链表头节点
 */
function reorderList(head: ListNode | null): void {
  if (!head || !head.next) return;

  // 1. 找到中点
  let slow = head;
  let fast = head;
  while (fast.next && fast.next.next) {
    slow = slow.next!;
    fast = fast.next.next;
  }

  // 2. 反转后半部分
  let secondHalf = slow.next;
  slow.next = null;
  secondHalf = reverseList(secondHalf);

  // 3. 交替合并两部分
  let first = head;
  let second = secondHalf;

  while (second) {
    const temp1 = first.next;
    const temp2 = second.next;

    first.next = second;
    second.next = temp1;

    first = temp1!;
    second = temp2;
  }
}

/**
 * 旋转链表
 * @param head 链表头节点
 * @param k 旋转位数
 * @returns 旋转后的头节点
 */
function rotateRight(head: ListNode | null, k: number): ListNode | null {
  if (!head || !head.next || k === 0) return head;

  // 计算链表长度并形成环
  let length = 1;
  let tail = head;
  while (tail.next) {
    tail = tail.next;
    length++;
  }
  tail.next = head; // 形成环

  // 计算实际旋转步数
  k = k % length;
  const stepsToNewHead = length - k;

  // 找到新的头节点
  let newTail = head;
  for (let i = 1; i < stepsToNewHead; i++) {
    newTail = newTail.next!;
  }

  const newHead = newTail.next!;
  newTail.next = null; // 断开环

  return newHead;
}
```

## 🔄 双向链表实现

```typescript
/**
 * 双向链表实现
 */
class DoublyLinkedList {
  private head: DoublyListNode | null;
  private tail: DoublyListNode | null;
  private size: number;

  constructor() {
    this.head = null;
    this.tail = null;
    this.size = 0;
  }

  /**
   * 在头部插入
   */
  addFirst(val: number): void {
    const newNode = new DoublyListNode(val);

    if (!this.head) {
      this.head = this.tail = newNode;
    } else {
      newNode.next = this.head;
      this.head.prev = newNode;
      this.head = newNode;
    }

    this.size++;
  }

  /**
   * 在尾部插入
   */
  addLast(val: number): void {
    const newNode = new DoublyListNode(val);

    if (!this.tail) {
      this.head = this.tail = newNode;
    } else {
      this.tail.next = newNode;
      newNode.prev = this.tail;
      this.tail = newNode;
    }

    this.size++;
  }

  /**
   * 删除头节点
   */
  removeFirst(): number | null {
    if (!this.head) return null;

    const val = this.head.val;

    if (this.head === this.tail) {
      this.head = this.tail = null;
    } else {
      this.head = this.head.next!;
      this.head.prev = null;
    }

    this.size--;
    return val;
  }

  /**
   * 删除尾节点
   */
  removeLast(): number | null {
    if (!this.tail) return null;

    const val = this.tail.val;

    if (this.head === this.tail) {
      this.head = this.tail = null;
    } else {
      this.tail = this.tail.prev!;
      this.tail.next = null;
    }

    this.size--;
    return val;
  }

  /**
   * 获取链表长度
   */
  getSize(): number {
    return this.size;
  }
}

/**
 * LRU缓存实现（基于双向链表 + 哈希表）
 */
class LRUCache {
  private capacity: number;
  private cache: Map<number, DoublyListNode>;
  private head: DoublyListNode;
  private tail: DoublyListNode;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.cache = new Map();

    // 创建虚拟头尾节点
    this.head = new DoublyListNode(0, null, null);
    this.tail = new DoublyListNode(0, null, null);
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  get(key: number): number {
    const node = this.cache.get(key);
    if (!node) return -1;

    // 移动到头部
    this.moveToHead(node);
    return node.val;
  }

  put(key: number, value: number): void {
    const node = this.cache.get(key);

    if (node) {
      // 更新现有节点
      node.val = value;
      this.moveToHead(node);
    } else {
      // 添加新节点
      const newNode = new DoublyListNode(value);

      if (this.cache.size >= this.capacity) {
        // 删除尾部节点
        const tail = this.removeTail();
        this.cache.delete(tail.val);
      }

      this.cache.set(key, newNode);
      this.addToHead(newNode);
    }
  }

  private addToHead(node: DoublyListNode): void {
    node.prev = this.head;
    node.next = this.head.next;
    this.head.next!.prev = node;
    this.head.next = node;
  }

  private removeNode(node: DoublyListNode): void {
    node.prev!.next = node.next;
    node.next!.prev = node.prev;
  }

  private moveToHead(node: DoublyListNode): void {
    this.removeNode(node);
    this.addToHead(node);
  }

  private removeTail(): DoublyListNode {
    const last = this.tail.prev!;
    this.removeNode(last);
    return last;
  }
}
```

## 🎯 高频面试题

### 1. 链表相交

```typescript
/**
 * 相交链表
 * @param headA 链表A头节点
 * @param headB 链表B头节点
 * @returns 相交节点
 */
function getIntersectionNode(
  headA: ListNode | null,
  headB: ListNode | null
): ListNode | null {
  if (!headA || !headB) return null;

  let pA = headA;
  let pB = headB;

  // 当两个指针相遇时，要么在相交点，要么都为null
  while (pA !== pB) {
    pA = pA ? pA.next : headB;
    pB = pB ? pB.next : headA;
  }

  return pA;
}
```

### 2. 回文链表

```typescript
/**
 * 回文链表
 * @param head 链表头节点
 * @returns 是否为回文
 */
function isPalindromeList(head: ListNode | null): boolean {
  if (!head || !head.next) return true;

  // 找到中点
  let slow = head;
  let fast = head;
  while (fast.next && fast.next.next) {
    slow = slow.next!;
    fast = fast.next.next;
  }

  // 反转后半部分
  let secondHalf = reverseList(slow.next);
  slow.next = null;

  // 比较两部分
  let p1 = head;
  let p2 = secondHalf;
  let result = true;

  while (result && p2) {
    if (p1!.val !== p2.val) {
      result = false;
    }
    p1 = p1!.next;
    p2 = p2.next;
  }

  // 恢复链表（可选）
  slow.next = reverseList(secondHalf);

  return result;
}
```

### 3. 链表加法

```typescript
/**
 * 两数相加
 * @param l1 链表1（逆序存储）
 * @param l2 链表2（逆序存储）
 * @returns 和（逆序存储）
 */
function addTwoNumbers(
  l1: ListNode | null,
  l2: ListNode | null
): ListNode | null {
  const dummy = new ListNode(0);
  let current = dummy;
  let carry = 0;

  while (l1 || l2 || carry) {
    const sum = (l1?.val || 0) + (l2?.val || 0) + carry;
    carry = Math.floor(sum / 10);

    current.next = new ListNode(sum % 10);
    current = current.next;

    l1 = l1?.next || null;
    l2 = l2?.next || null;
  }

  return dummy.next;
}

/**
 * 两数相加II（正序存储）
 * @param l1 链表1（正序存储）
 * @param l2 链表2（正序存储）
 * @returns 和（正序存储）
 */
function addTwoNumbersII(
  l1: ListNode | null,
  l2: ListNode | null
): ListNode | null {
  const stack1: number[] = [];
  const stack2: number[] = [];

  // 将数字压入栈
  while (l1) {
    stack1.push(l1.val);
    l1 = l1.next;
  }

  while (l2) {
    stack2.push(l2.val);
    l2 = l2.next;
  }

  let carry = 0;
  let result: ListNode | null = null;

  while (stack1.length || stack2.length || carry) {
    const sum = (stack1.pop() || 0) + (stack2.pop() || 0) + carry;
    carry = Math.floor(sum / 10);

    const newNode = new ListNode(sum % 10);
    newNode.next = result;
    result = newNode;
  }

  return result;
}
```

## 📊 复杂度分析

### 操作复杂度对比

| 操作         | 数组 | 单向链表 | 双向链表 |
| ------------ | ---- | -------- | -------- |
| 访问         | O(1) | O(n)     | O(n)     |
| 查找         | O(n) | O(n)     | O(n)     |
| 插入（头部） | O(n) | O(1)     | O(1)     |
| 插入（尾部） | O(1) | O(n)     | O(1)     |
| 删除（头部） | O(n) | O(1)     | O(1)     |
| 删除（尾部） | O(1) | O(n)     | O(1)     |

### 空间复杂度

```typescript
/**
 * 链表操作的空间复杂度分析
 */
interface ComplexityAnalysis {
  operation: string;
  timeComplexity: string;
  spaceComplexity: string;
  notes: string;
}

const linkedListComplexities: ComplexityAnalysis[] = [
  {
    operation: "反转链表（迭代）",
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    notes: "只需要常数个指针",
  },
  {
    operation: "反转链表（递归）",
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
    notes: "递归栈深度为n",
  },
  {
    operation: "合并两个有序链表",
    timeComplexity: "O(m + n)",
    spaceComplexity: "O(1)",
    notes: "迭代方法",
  },
  {
    operation: "检测环",
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    notes: "Floyd判圈算法",
  },
  {
    operation: "复制随机链表",
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
    notes: "哈希表方法",
  },
];
```

## 🎓 总结与建议

### 核心技巧

1. **虚拟头节点**：简化边界条件处理
2. **双指针技巧**：快慢指针、前后指针
3. **递归思维**：将复杂问题分解为子问题
4. **画图辅助**：理解指针操作的关键

### 常见陷阱

```typescript
/**
 * 链表操作常见错误
 */
const commonMistakes = [
  "空指针异常：未检查节点是否为null",
  "内存泄漏：删除节点后未断开连接",
  "环形链表：无限循环",
  "边界条件：空链表、单节点链表",
  "指针丢失：修改指针前未保存",
];

/**
 * 最佳实践
 */
const bestPractices = [
  "使用虚拟头节点简化操作",
  "先画图再编码",
  "注意指针操作的顺序",
  "及时检查边界条件",
  "递归时考虑栈溢出",
];
```

### 学习路径

1. **基础操作**：插入、删除、遍历
2. **双指针技巧**：快慢指针、环检测
3. **链表反转**：迭代和递归方法
4. **合并排序**：链表排序算法
5. **复杂应用**：LRU 缓存、复制随机链表

---

🔗 **继续学习**：掌握了链表操作后，可以继续学习树和图等更复杂的数据结构！
