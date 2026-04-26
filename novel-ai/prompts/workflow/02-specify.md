# 故事规格

```markdown
# 故事规格

## 任务
为「{{book_title}}」建立像产品规格书一样的故事定义。

## 已有信息
- 书名：{{book_title}}
- 类型：{{genre}}

## 故事规格框架

### 一句话故事（电梯演讲）
{{one_line_story}}

### 目标读者画像
- **年龄**：{{target_age}}
- **性别**：{{target_gender}}
- **阅读习惯**：{{reading_habits}}
- **核心期待**：{{reader_expectations}}

### 核心卖点
1. **卖点 1**：{{selling_point_1}}
2. **卖点 2**：{{selling_point_2}}
3. **卖点 3**：{{selling_point_3}}

### 对标作品
- 参考 1：{{reference_1}}
- 参考 2：{{reference_2}}
- 差异化：{{differentiation}}

### 成功标准
- **字数目标**：{{word_count_target}} 字
- **更新频率**：{{update_frequency}}
- **读者评分目标**：{{rating_target}}

### 核心需求 [P0]
1. {{core_requirement_1}}
2. {{core_requirement_2}}

### 重要需求 [P1]
1. {{important_requirement_1}}
2. {{important_requirement_2}}

### 可选需求 [P2]
1. {{optional_requirement_1}}

### 约束条件
- **力量体系约束**：{{power_constraints}}
- **内容约束**：{{content_constraints}}
- **技术约束**：{{tech_constraints}}

### 关键决策点 [需要澄清]
{{decisions_to_clarify}}
```

## 输出
输出完整的故事规格，存入 `books/{书名}/specification.md`。
```
