# 贪心算法详解 - 局部最优到全局最优的策略

## 贪心算法概述

贪心算法（Greedy Algorithm）是一种在每一步选择中都采取在当前状态下最好或最优（即最有利）的选择，从而希望导致结果是最好或最优的算法。贪心算法在有最优子结构的问题中尤为有效。

### 核心思想

贪心算法遵循一种近似解决问题的技术，期盼通过每个阶段的局部最优选择，从而达到全局的最优。但贪心算法并不总是能够得到最优解，这是因为它不会为了整体的最优而放弃局部的最优。

## 🎯 核心概念深入

### 1. 贪心选择性质 (Greedy Choice Property)

贪心选择性质是指：一个全局最优解可以通过局部最优（贪心）选择来达到。

```python
def demonstrate_greedy_choice_property():
    """演示贪心选择性质"""

    # 活动选择问题示例
    def activity_selection(activities):
        """
        活动选择问题：选择最多的不冲突活动
        贪心策略：按结束时间排序，优先选择结束早的活动
        """
        # 按结束时间排序
        activities.sort(key=lambda x: x[1])

        selected = [activities[0]]  # 选择第一个活动
        last_end_time = activities[0][1]

        for i in range(1, len(activities)):
            # 如果当前活动的开始时间不早于上一个活动的结束时间
            if activities[i][0] >= last_end_time:
                selected.append(activities[i])
                last_end_time = activities[i][1]

        return selected

    # 测试数据：(开始时间, 结束时间)
    activities = [(1, 4), (3, 5), (0, 6), (5, 7), (3, 9), (5, 9), (6, 10), (8, 11), (8, 12), (2, 14), (12, 16)]
    result = activity_selection(activities)
    print("选择的活动:", result)

    return result

# 证明贪心选择的正确性
def prove_greedy_choice():
    """
    证明活动选择问题贪心策略的正确性：

    定理：按结束时间排序并优先选择结束早的活动是最优的。

    证明（交换论证法）：
    1. 设最优解OPT和贪心解GREEDY
    2. 假设OPT的第一个活动a1不是结束最早的活动g1
    3. 由于g1结束最早，g1.end <= a1.end
    4. 将OPT中的a1替换为g1，不会与后续活动冲突
    5. 因此贪心选择不会让解变差，贪心策略是正确的
    """
    pass
```

### 2. 最优子结构 (Optimal Substructure)

最优子结构是指：问题的最优解包含子问题的最优解。

```python
def demonstrate_optimal_substructure():
    """演示最优子结构性质"""

    def fractional_knapsack(items, capacity):
        """
        分数背包问题：可以取物品的一部分
        贪心策略：按单位重量价值排序，优先选择性价比高的物品
        """
        # 计算单位重量价值并排序
        items_with_ratio = [(value/weight, weight, value) for weight, value in items]
        items_with_ratio.sort(reverse=True)  # 按性价比降序

        total_value = 0
        remaining_capacity = capacity
        selected_items = []

        for ratio, weight, value in items_with_ratio:
            if remaining_capacity >= weight:
                # 完全取这个物品
                total_value += value
                remaining_capacity -= weight
                selected_items.append((weight, value, 1.0))  # 取100%
            else:
                # 部分取这个物品
                fraction = remaining_capacity / weight
                total_value += value * fraction
                selected_items.append((weight, value, fraction))
                break

        return total_value, selected_items

    # 测试：(重量, 价值)
    items = [(10, 60), (20, 100), (30, 120)]
    capacity = 50

    max_value, selection = fractional_knapsack(items, capacity)
    print(f"最大价值: {max_value}")
    print("选择的物品:", selection)

    return max_value, selection
```

### 3. 贪心策略的设计

设计贪心策略需要找到合适的"贪心标准"。

```python
class GreedyStrategyDesign:
    """贪心策略设计示例"""

    @staticmethod
    def huffman_coding(frequencies):
        """哈夫曼编码：构造最优前缀码"""
        import heapq

        # 构建最小堆
        heap = [[freq, [[char, ""]]] for char, freq in frequencies.items()]
        heapq.heapify(heap)

        while len(heap) > 1:
            # 取出频率最小的两个节点
            lo = heapq.heappop(heap)
            hi = heapq.heappop(heap)

            # 为左子树的所有字符编码前加"0"
            for pair in lo[1]:
                pair[1] = "0" + pair[1]

            # 为右子树的所有字符编码前加"1"
            for pair in hi[1]:
                pair[1] = "1" + pair[1]

            # 合并两个节点
            merged = [lo[0] + hi[0], lo[1] + hi[1]]
            heapq.heappush(heap, merged)

        return heap[0][1]

    @staticmethod
    def job_scheduling(jobs):
        """作业调度：最小化平均完成时间"""
        # 贪心策略：按处理时间升序排序（最短作业优先）
        jobs.sort(key=lambda x: x[1])  # 按处理时间排序

        current_time = 0
        total_completion_time = 0
        schedule = []

        for job_id, processing_time in jobs:
            current_time += processing_time
            total_completion_time += current_time
            schedule.append((job_id, current_time))

        average_completion_time = total_completion_time / len(jobs)
        return schedule, average_completion_time

    @staticmethod
    def coin_change_greedy(coins, amount):
        """硬币找零（贪心策略，不一定最优）"""
        coins.sort(reverse=True)  # 按面值降序排序
        result = []

        for coin in coins:
            count = amount // coin
            if count > 0:
                result.extend([coin] * count)
                amount -= coin * count
                if amount == 0:
                    break

        return result if amount == 0 else None
```

## 🔧 贪心算法设计模式

### 1. 排序贪心

```python
class SortingGreedy:
    """基于排序的贪心算法"""

    @staticmethod
    def meeting_rooms(intervals):
        """会议室安排：判断是否能安排所有会议"""
        if not intervals:
            return True

        # 按开始时间排序
        intervals.sort(key=lambda x: x[0])

        for i in range(1, len(intervals)):
            # 如果当前会议的开始时间早于前一个会议的结束时间
            if intervals[i][0] < intervals[i-1][1]:
                return False

        return True

    @staticmethod
    def meeting_rooms_ii(intervals):
        """会议室II：计算需要的最少会议室数量"""
        if not intervals:
            return 0

        # 分别创建开始时间和结束时间的数组
        starts = sorted([interval[0] for interval in intervals])
        ends = sorted([interval[1] for interval in intervals])

        rooms_needed = 0
        max_rooms = 0
        start_ptr = end_ptr = 0

        while start_ptr < len(starts):
            # 如果有会议开始
            if starts[start_ptr] < ends[end_ptr]:
                rooms_needed += 1
                max_rooms = max(max_rooms, rooms_needed)
                start_ptr += 1
            else:
                # 有会议结束
                rooms_needed -= 1
                end_ptr += 1

        return max_rooms

    @staticmethod
    def non_overlapping_intervals(intervals):
        """移除最少区间使其不重叠"""
        if not intervals:
            return 0

        # 按结束时间排序
        intervals.sort(key=lambda x: x[1])

        count = 0
        end = intervals[0][1]

        for i in range(1, len(intervals)):
            if intervals[i][0] < end:
                # 重叠，需要移除
                count += 1
            else:
                # 不重叠，更新结束时间
                end = intervals[i][1]

        return count
```

### 2. 堆贪心

```python
import heapq

class HeapGreedy:
    """基于堆的贪心算法"""

    @staticmethod
    def merge_stones(stones, K):
        """合并石头：每次合并K堆，求最小代价"""
        if (len(stones) - 1) % (K - 1) != 0:
            return -1

        # 使用最小堆存储石头堆的重量
        heap = stones[:]
        heapq.heapify(heap)
        total_cost = 0

        while len(heap) > 1:
            # 取出K个最小的堆
            current_merge = []
            for _ in range(min(K, len(heap))):
                if heap:
                    current_merge.append(heapq.heappop(heap))

            # 计算合并代价
            merge_cost = sum(current_merge)
            total_cost += merge_cost

            # 将合并后的堆放回
            heapq.heappush(heap, merge_cost)

        return total_cost

    @staticmethod
    def task_scheduler(tasks, n):
        """任务调度器：相同任务间至少间隔n个时间单位"""
        from collections import Counter

        # 统计每个任务的频次
        task_counts = Counter(tasks)

        # 使用最大堆（Python用负数模拟）
        max_heap = [-count for count in task_counts.values()]
        heapq.heapify(max_heap)

        time = 0

        while max_heap:
            temp = []

            # 在一个周期内安排任务
            for _ in range(n + 1):
                if max_heap:
                    temp.append(heapq.heappop(max_heap))

            # 更新任务计数
            for count in temp:
                if count < -1:  # 还有剩余任务
                    heapq.heappush(max_heap, count + 1)

            # 计算时间
            if max_heap:
                time += n + 1
            else:
                time += len(temp)

        return time

    @staticmethod
    def smallest_range_covering_elements(nums):
        """覆盖所有列表元素的最小区间"""
        # 使用最小堆存储 (值, 列表索引, 元素索引)
        min_heap = []
        max_val = float('-inf')

        # 初始化堆，每个列表的第一个元素
        for i, lst in enumerate(nums):
            heapq.heappush(min_heap, (lst[0], i, 0))
            max_val = max(max_val, lst[0])

        min_range = float('inf')
        result_range = [0, 0]

        while min_heap:
            min_val, list_idx, elem_idx = heapq.heappop(min_heap)

            # 更新最小区间
            if max_val - min_val < min_range:
                min_range = max_val - min_val
                result_range = [min_val, max_val]

            # 如果当前列表还有下一个元素
            if elem_idx + 1 < len(nums[list_idx]):
                next_val = nums[list_idx][elem_idx + 1]
                heapq.heappush(min_heap, (next_val, list_idx, elem_idx + 1))
                max_val = max(max_val, next_val)
            else:
                # 无法继续覆盖所有列表
                break

        return result_range
```

### 3. 双指针贪心

```python
class TwoPointerGreedy:
    """基于双指针的贪心算法"""

    @staticmethod
    def assign_cookies(children, cookies):
        """分发饼干：满足最多的孩子"""
        children.sort()  # 胃口排序
        cookies.sort()   # 饼干大小排序

        child_idx = cookie_idx = 0

        while child_idx < len(children) and cookie_idx < len(cookies):
            # 如果当前饼干能满足当前孩子
            if cookies[cookie_idx] >= children[child_idx]:
                child_idx += 1
            cookie_idx += 1

        return child_idx

    @staticmethod
    def two_city_scheduling(costs):
        """两城调度：将2n个人平均分配到两个城市，最小化成本"""
        # 按去A城和去B城的成本差排序
        costs.sort(key=lambda x: x[0] - x[1])

        total_cost = 0
        n = len(costs) // 2

        # 前n个人去A城，后n个人去B城
        for i in range(len(costs)):
            if i < n:
                total_cost += costs[i][0]  # 去A城
            else:
                total_cost += costs[i][1]  # 去B城

        return total_cost

    @staticmethod
    def partition_labels(s):
        """分割标签：将字符串分割成尽可能多的片段"""
        # 记录每个字符最后出现的位置
        last_occurrence = {char: i for i, char in enumerate(s)}

        result = []
        start = 0
        end = 0

        for i, char in enumerate(s):
            end = max(end, last_occurrence[char])

            # 如果当前位置就是片段的结束位置
            if i == end:
                result.append(end - start + 1)
                start = i + 1

        return result
```

## 🎮 经典问题详解

### 1. 区间调度问题

```python
class IntervalScheduling:
    """区间调度问题集合"""

    @staticmethod
    def activity_selection_detailed(activities):
        """详细的活动选择问题解析"""
        print("活动选择问题详解:")
        print("输入活动:", activities)

        # 按结束时间排序
        activities.sort(key=lambda x: x[1])
        print("按结束时间排序:", activities)

        selected = []
        last_end_time = -1

        for i, (start, end) in enumerate(activities):
            print(f"考虑活动 {i+1}: ({start}, {end})")

            if start >= last_end_time:
                selected.append((start, end))
                last_end_time = end
                print(f"  选择活动 {i+1}，更新结束时间为 {end}")
            else:
                print(f"  跳过活动 {i+1}（与之前活动冲突）")

        print("最终选择的活动:", selected)
        return selected

    @staticmethod
    def minimum_arrows(points):
        """用最少的箭射破所有气球"""
        if not points:
            return 0

        # 按结束位置排序
        points.sort(key=lambda x: x[1])

        arrows = 1
        arrow_pos = points[0][1]

        for start, end in points[1:]:
            # 如果当前气球的开始位置超过了箭的位置
            if start > arrow_pos:
                arrows += 1
                arrow_pos = end

        return arrows

    @staticmethod
    def merge_intervals(intervals):
        """合并重叠区间"""
        if not intervals:
            return []

        # 按开始时间排序
        intervals.sort(key=lambda x: x[0])

        merged = [intervals[0]]

        for current in intervals[1:]:
            last = merged[-1]

            # 如果当前区间与上一个区间重叠
            if current[0] <= last[1]:
                # 合并区间
                merged[-1] = [last[0], max(last[1], current[1])]
            else:
                # 不重叠，添加新区间
                merged.append(current)

        return merged
```

### 2. 跳跃游戏系列

```python
class JumpGame:
    """跳跃游戏系列问题"""

    @staticmethod
    def can_jump_detailed(nums):
        """跳跃游戏I：详细解析"""
        print("跳跃游戏I详解:")
        print("数组:", nums)

        max_reach = 0

        for i, jump_length in enumerate(nums):
            print(f"位置 {i}, 可跳跃长度: {jump_length}")

            if i > max_reach:
                print(f"  位置 {i} 无法到达！")
                return False

            new_reach = i + jump_length
            if new_reach > max_reach:
                max_reach = new_reach
                print(f"  更新最远到达位置: {max_reach}")

            if max_reach >= len(nums) - 1:
                print(f"  已能到达终点！")
                return True

        return max_reach >= len(nums) - 1

    @staticmethod
    def jump_minimum_steps(nums):
        """跳跃游戏II：最少跳跃次数"""
        if len(nums) <= 1:
            return 0

        jumps = 0
        current_end = 0      # 当前跳跃能到达的边界
        farthest = 0         # 在当前跳跃范围内能到达的最远位置

        for i in range(len(nums) - 1):
            # 更新在当前跳跃范围内能到达的最远位置
            farthest = max(farthest, i + nums[i])

            # 到达当前跳跃的边界
            if i == current_end:
                jumps += 1
                current_end = farthest

                # 如果已经能到达终点
                if current_end >= len(nums) - 1:
                    break

        return jumps

    @staticmethod
    def jump_game_vii(nums, min_jump, max_jump):
        """跳跃游戏VII：在限定跳跃范围内能否到达终点"""
        n = len(nums)
        if nums[0] == 1 or nums[n-1] == 1:
            return False

        # dp[i] 表示是否能到达位置i
        dp = [False] * n
        dp[0] = True

        # 使用前缀和优化
        prefix_sum = 0  # 在跳跃范围内可达位置的数量

        for i in range(1, n):
            # 更新前缀和：加入新的可跳跃位置
            if i >= min_jump:
                if dp[i - min_jump]:
                    prefix_sum += 1

            # 更新前缀和：移除超出跳跃范围的位置
            if i > max_jump:
                if dp[i - max_jump - 1]:
                    prefix_sum -= 1

            # 如果当前位置是0且在跳跃范围内有可达位置
            if nums[i] == 0 and prefix_sum > 0:
                dp[i] = True

        return dp[n-1]
```

### 3. 股票买卖问题

```python
class StockTrading:
    """股票买卖问题系列"""

    @staticmethod
    def max_profit_one_transaction(prices):
        """买卖股票的最佳时机I：只能交易一次"""
        if not prices:
            return 0

        min_price = prices[0]
        max_profit = 0

        for price in prices[1:]:
            # 更新最低价格
            min_price = min(min_price, price)
            # 更新最大利润
            max_profit = max(max_profit, price - min_price)

        return max_profit

    @staticmethod
    def max_profit_unlimited_transactions(prices):
        """买卖股票的最佳时机II：可以进行多次交易"""
        if not prices:
            return 0

        total_profit = 0

        # 贪心策略：只要后一天价格高于前一天，就进行交易
        for i in range(1, len(prices)):
            if prices[i] > prices[i-1]:
                total_profit += prices[i] - prices[i-1]

        return total_profit

    @staticmethod
    def max_profit_with_fee(prices, fee):
        """买卖股票的最佳时机含手续费"""
        if not prices:
            return 0

        # 贪心策略：维护最小买入价格
        buy_price = prices[0]
        profit = 0

        for price in prices[1:]:
            if price < buy_price:
                # 找到更低的买入价格
                buy_price = price
            elif price > buy_price + fee:
                # 可以获得利润，进行交易
                profit += price - buy_price - fee
                # 更新买入价格（考虑可能的连续上涨）
                buy_price = price - fee

        return profit

    @staticmethod
    def max_profit_with_cooldown(prices):
        """买卖股票的最佳时机含冷冻期"""
        if len(prices) <= 1:
            return 0

        # 状态定义
        hold = -prices[0]    # 持有股票
        sold = 0             # 刚卖出股票（冷冻期）
        rest = 0             # 不持有股票且不在冷冻期

        for price in prices[1:]:
            prev_hold, prev_sold, prev_rest = hold, sold, rest

            hold = max(prev_hold, prev_rest - price)  # 继续持有 or 买入
            sold = prev_hold + price                  # 卖出
            rest = max(prev_rest, prev_sold)          # 休息

        return max(sold, rest)
```

### 4. 分配问题

```python
class AllocationProblems:
    """分配问题集合"""

    @staticmethod
    def candy_distribution(ratings):
        """分糖果：相邻孩子评分高的要多分糖果"""
        n = len(ratings)
        if n == 0:
            return 0

        candies = [1] * n

        # 从左到右遍历
        for i in range(1, n):
            if ratings[i] > ratings[i-1]:
                candies[i] = candies[i-1] + 1

        # 从右到左遍历
        for i in range(n-2, -1, -1):
            if ratings[i] > ratings[i+1]:
                candies[i] = max(candies[i], candies[i+1] + 1)

        return sum(candies)

    @staticmethod
    def gas_station(gas, cost):
        """加油站：判断能否绕一圈"""
        total_gas = sum(gas)
        total_cost = sum(cost)

        # 如果总油量小于总消耗，无法完成
        if total_gas < total_cost:
            return -1

        current_gas = 0
        start_station = 0

        for i in range(len(gas)):
            current_gas += gas[i] - cost[i]

            # 如果当前油量不够到下一站
            if current_gas < 0:
                # 从下一站重新开始
                start_station = i + 1
                current_gas = 0

        return start_station

    @staticmethod
    def queue_reconstruction(people):
        """队列重建：按身高和前面更高的人数重建队列"""
        # 按身高降序，k升序排序
        people.sort(key=lambda x: (-x[0], x[1]))

        result = []
        for height, k in people:
            # 在位置k插入当前人
            result.insert(k, [height, k])

        return result

    @staticmethod
    def wiggle_subsequence(nums):
        """摆动序列：找最长摆动子序列"""
        if len(nums) < 2:
            return len(nums)

        # 贪心策略：记录上升和下降的长度
        up = down = 1

        for i in range(1, len(nums)):
            if nums[i] > nums[i-1]:
                up = down + 1
            elif nums[i] < nums[i-1]:
                down = up + 1

        return max(up, down)
```

## 🚀 高级应用

### 1. 最小生成树算法

```python
class MinimumSpanningTree:
    """最小生成树算法"""

    def __init__(self):
        self.parent = {}
        self.rank = {}

    def make_set(self, v):
        """创建单元素集合"""
        self.parent[v] = v
        self.rank[v] = 0

    def find(self, v):
        """查找元素所在集合的代表元素（带路径压缩）"""
        if self.parent[v] != v:
            self.parent[v] = self.find(self.parent[v])
        return self.parent[v]

    def union(self, u, v):
        """合并两个集合（按秩合并）"""
        root_u = self.find(u)
        root_v = self.find(v)

        if root_u != root_v:
            if self.rank[root_u] < self.rank[root_v]:
                self.parent[root_u] = root_v
            elif self.rank[root_u] > self.rank[root_v]:
                self.parent[root_v] = root_u
            else:
                self.parent[root_v] = root_u
                self.rank[root_u] += 1
            return True
        return False

    def kruskal(self, edges, vertices):
        """Kruskal算法求最小生成树"""
        # 初始化并查集
        for v in vertices:
            self.make_set(v)

        # 按权重排序边
        edges.sort(key=lambda x: x[2])

        mst = []
        total_weight = 0

        for u, v, weight in edges:
            # 如果不会形成环，则加入MST
            if self.union(u, v):
                mst.append((u, v, weight))
                total_weight += weight

                # 如果已经有n-1条边，MST完成
                if len(mst) == len(vertices) - 1:
                    break

        return mst, total_weight

    def prim(self, graph, start):
        """Prim算法求最小生成树"""
        import heapq

        mst = []
        visited = set([start])
        edges = [(weight, start, neighbor) for neighbor, weight in graph[start]]
        heapq.heapify(edges)

        while edges and len(visited) < len(graph):
            weight, u, v = heapq.heappop(edges)

            if v not in visited:
                visited.add(v)
                mst.append((u, v, weight))

                # 添加新顶点的所有边
                for neighbor, edge_weight in graph[v]:
                    if neighbor not in visited:
                        heapq.heappush(edges, (edge_weight, v, neighbor))

        return mst
```

### 2. 最短路径算法

```python
class ShortestPath:
    """最短路径算法"""

    @staticmethod
    def dijkstra(graph, start):
        """Dijkstra算法求单源最短路径"""
        import heapq

        # 初始化距离
        distances = {vertex: float('inf') for vertex in graph}
        distances[start] = 0

        # 优先队列：(距离, 顶点)
        pq = [(0, start)]
        visited = set()

        while pq:
            current_distance, current_vertex = heapq.heappop(pq)

            if current_vertex in visited:
                continue

            visited.add(current_vertex)

            # 检查所有邻居
            for neighbor, weight in graph[current_vertex]:
                distance = current_distance + weight

                # 如果找到更短路径
                if distance < distances[neighbor]:
                    distances[neighbor] = distance
                    heapq.heappush(pq, (distance, neighbor))

        return distances

    @staticmethod
    def bellman_ford(graph, start):
        """Bellman-Ford算法（可处理负权边）"""
        # 初始化距离
        distances = {vertex: float('inf') for vertex in graph}
        distances[start] = 0

        # 获取所有边
        edges = []
        for u in graph:
            for v, weight in graph[u]:
                edges.append((u, v, weight))

        # 松弛操作（重复V-1次）
        for _ in range(len(graph) - 1):
            for u, v, weight in edges:
                if distances[u] != float('inf') and distances[u] + weight < distances[v]:
                    distances[v] = distances[u] + weight

        # 检查负权环
        for u, v, weight in edges:
            if distances[u] != float('inf') and distances[u] + weight < distances[v]:
                raise ValueError("图中存在负权环")

        return distances
```

### 3. 拓扑排序

```python
def topological_sort(graph):
    """拓扑排序：贪心策略是优先选择入度为0的顶点"""
    from collections import deque, defaultdict

    # 计算入度
    in_degree = defaultdict(int)
    for u in graph:
        for v in graph[u]:
            in_degree[v] += 1

    # 找到所有入度为0的顶点
    queue = deque([v for v in graph if in_degree[v] == 0])
    result = []

    while queue:
        # 贪心选择：选择入度为0的顶点
        current = queue.popleft()
        result.append(current)

        # 移除当前顶点，更新邻居的入度
        for neighbor in graph[current]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)

    # 检查是否存在环
    if len(result) != len(graph):
        raise ValueError("图中存在环，无法进行拓扑排序")

    return result

def course_schedule(num_courses, prerequisites):
    """课程调度：判断是否能完成所有课程"""
    from collections import defaultdict, deque

    # 构建图和入度数组
    graph = defaultdict(list)
    in_degree = [0] * num_courses

    for course, prereq in prerequisites:
        graph[prereq].append(course)
        in_degree[course] += 1

    # 找到所有入度为0的课程
    queue = deque([i for i in range(num_courses) if in_degree[i] == 0])
    completed = 0

    while queue:
        current_course = queue.popleft()
        completed += 1

        # 完成当前课程后，更新后续课程的入度
        for next_course in graph[current_course]:
            in_degree[next_course] -= 1
            if in_degree[next_course] == 0:
                queue.append(next_course)

    return completed == num_courses
```

## 📊 正确性证明方法

### 1. 交换论证法 (Exchange Argument)

```python
def exchange_argument_proof():
    """
    交换论证法证明示例：活动选择问题

    定理：按结束时间排序并贪心选择是最优的

    证明：
    1. 设贪心算法选择活动集合G = {g1, g2, ..., gk}
    2. 设最优解为O = {o1, o2, ..., om}
    3. 假设G不是最优解，即k < m
    4. 设j是G和O第一个不同的位置
    5. 由于gj按结束时间最早选择，有gj.end <= oj.end
    6. 将O中的oj替换为gj，不会影响后续活动的选择
    7. 重复此过程，可将O转换为G且不减少活动数量
    8. 矛盾，因此G是最优解
    """

    def activity_selection_proof_visualization(activities):
        """可视化证明过程"""
        print("交换论证法可视化:")
        activities.sort(key=lambda x: x[1])

        print("按结束时间排序的活动:", activities)

        # 贪心选择
        greedy_selection = []
        last_end = -1

        for start, end in activities:
            if start >= last_end:
                greedy_selection.append((start, end))
                last_end = end

        print("贪心选择:", greedy_selection)

        # 假设存在其他最优解
        print("\n假设存在其他最优解，通过交换论证证明贪心解也是最优的...")

        return greedy_selection
```

### 2. 归纳法证明

```python
def induction_proof():
    """
    归纳法证明示例：分数背包问题

    定理：按单位重量价值贪心选择是最优的

    证明：
    1. 基础情况：只有一个物品时，贪心策略显然最优
    2. 归纳假设：对于前k个物品，贪心策略最优
    3. 归纳步骤：考虑第k+1个物品
       - 如果按贪心策略选择，得到最优解
       - 如果不按贪心策略，可以通过调整得到更好的解
    4. 因此贪心策略对所有情况都是最优的
    """

    def fractional_knapsack_proof(items, capacity):
        """分数背包问题的证明过程"""
        print("分数背包问题归纳法证明:")

        # 计算单位价值并排序
        items_with_ratio = []
        for i, (weight, value) in enumerate(items):
            ratio = value / weight
            items_with_ratio.append((ratio, weight, value, i))

        items_with_ratio.sort(reverse=True)
        print("按单位价值排序:", [(f"item{i}", f"ratio={ratio:.2f}")
                              for ratio, _, _, i in items_with_ratio])

        total_value = 0
        remaining_capacity = capacity

        for ratio, weight, value, item_id in items_with_ratio:
            if remaining_capacity >= weight:
                total_value += value
                remaining_capacity -= weight
                print(f"完全取物品{item_id}，获得价值{value}")
            else:
                fraction = remaining_capacity / weight
                partial_value = value * fraction
                total_value += partial_value
                print(f"部分取物品{item_id}，比例={fraction:.2f}，获得价值{partial_value:.2f}")
                break

        print(f"总价值: {total_value}")
        return total_value
```

### 3. 剪切粘贴论证

```python
def cut_and_paste_argument():
    """
    剪切粘贴论证示例：最短路径问题

    定理：Dijkstra算法找到的是最短路径

    证明：
    1. 假设存在更短的路径P从源点到某个顶点v
    2. 设P上第一个不在已确定最短路径集合中的顶点为u
    3. 由于Dijkstra总是选择距离最小的顶点，d[u] <= d[v]
    4. 但P是更短路径，所以d[v] < d[u]，矛盾
    5. 因此Dijkstra找到的路径是最短的
    """
    pass
```

## 🎯 算法选择指南

### 何时使用贪心算法

```python
def when_to_use_greedy():
    """
    贪心算法适用条件：

    1. 贪心选择性质：局部最优选择能导致全局最优解
    2. 最优子结构：问题的最优解包含子问题的最优解
    3. 无后效性：当前选择不会影响之前的选择

    适用问题类型：
    - 活动选择问题
    - 分数背包问题
    - 哈夫曼编码
    - 最小生成树
    - 单源最短路径（非负权重）
    - 区间调度问题

    不适用问题：
    - 0-1背包问题（需要动态规划）
    - 最长公共子序列（需要动态规划）
    - 旅行商问题（NP-hard问题）
    """

    # 判断问题是否适合贪心算法的检查清单
    checklist = {
        "局部最优能导致全局最优": "检查贪心选择性质",
        "子问题最优解构成原问题最优解": "检查最优子结构",
        "选择顺序不影响结果": "检查无后效性",
        "可以证明贪心策略正确性": "使用交换论证等方法"
    }

    return checklist

def greedy_vs_dp():
    """
    贪心算法 vs 动态规划：

    贪心算法：
    - 时间复杂度通常较低
    - 空间复杂度较低
    - 实现相对简单
    - 不总是得到最优解

    动态规划：
    - 时间复杂度可能较高
    - 空间复杂度较高（可优化）
    - 实现相对复杂
    - 能保证得到最优解

    选择原则：
    1. 如果贪心算法能得到最优解，优先选择贪心
    2. 如果贪心算法不能保证最优解，考虑动态规划
    3. 对于NP-hard问题，贪心算法可能是好的近似解
    """
    pass
```

## 🏆 性能优化

### 1. 时间复杂度优化

```python
class GreedyOptimization:
    """贪心算法性能优化技巧"""

    @staticmethod
    def optimized_interval_scheduling():
        """优化的区间调度"""
        def schedule_intervals_optimized(intervals):
            # 使用自定义排序键避免重复计算
            intervals.sort(key=lambda x: x[1])  # 只排序一次

            selected = []
            last_end = float('-inf')

            for start, end in intervals:
                if start >= last_end:
                    selected.append((start, end))
                    last_end = end

            return selected

    @staticmethod
    def heap_based_optimization():
        """基于堆的优化"""
        import heapq

        def merge_k_sorted_lists(lists):
            """合并K个有序链表的优化版本"""
            heap = []
            result = []

            # 初始化堆
            for i, lst in enumerate(lists):
                if lst:
                    heapq.heappush(heap, (lst[0], i, 0))

            while heap:
                val, list_idx, elem_idx = heapq.heappop(heap)
                result.append(val)

                # 如果当前列表还有下一个元素
                if elem_idx + 1 < len(lists[list_idx]):
                    next_val = lists[list_idx][elem_idx + 1]
                    heapq.heappush(heap, (next_val, list_idx, elem_idx + 1))

            return result

    @staticmethod
    def early_termination_optimization():
        """提前终止优化"""
        def optimized_coin_change(coins, amount):
            coins.sort(reverse=True)  # 大面额优先

            def backtrack(index, remaining, count, min_count):
                if remaining == 0:
                    return count

                if index >= len(coins) or count >= min_count[0]:
                    return float('inf')

                # 剪枝：如果剩余金额用当前面额都无法更优，直接返回
                if count + (remaining + coins[index] - 1) // coins[index] >= min_count[0]:
                    return float('inf')

                result = float('inf')
                max_use = remaining // coins[index]

                for use in range(max_use, -1, -1):
                    sub_result = backtrack(index + 1, remaining - use * coins[index],
                                         count + use, min_count)
                    if sub_result < result:
                        result = sub_result
                        min_count[0] = min(min_count[0], result)

                return result

            min_count = [float('inf')]
            result = backtrack(0, amount, 0, min_count)
            return result if result != float('inf') else -1
```

## 🎓 总结

贪心算法是一种简单而强大的算法设计策略，其核心思想是在每一步都做出在当前看来最好的选择。掌握贪心算法需要：

### 关键要点

1. **理解贪心选择性质**：局部最优能否导致全局最优
2. **掌握证明方法**：交换论证、归纳法、剪切粘贴论证
3. **识别适用场景**：排序、区间调度、图算法等
4. **学会优化技巧**：堆、双指针、提前终止等

### 常见误区

1. **盲目应用**：不是所有问题都适合贪心算法
2. **忽略证明**：必须证明贪心策略的正确性
3. **策略选择**：同一问题可能有多种贪心策略
4. **边界处理**：注意处理特殊情况和边界条件

### 学习建议

1. **从经典问题入手**：活动选择、分数背包等
2. **理解证明过程**：不仅要会用，还要知道为什么对
3. **对比其他算法**：了解贪心与动态规划的区别
4. **实践应用**：在实际项目中寻找贪心算法的应用场景

贪心算法虽然不能解决所有问题，但在其适用的领域内，它提供了简洁高效的解决方案。通过深入理解其原理和应用场景，可以在算法设计中发挥重要作用。

---

🎯 **继续学习**：掌握了贪心算法后，建议继续学习动态规划，两者结合可以解决更广泛的优化问题！
