# 上下文注入模板

```markdown
# 当前小说上下文

## 书籍信息
- 书名：{{book_title}}
- 类型：{{genre}}
- 文风：{{tone}}

## 当前写作进度
- 当前章节：第 {{chapter_number}} 章
- 当前卷：{{volume_name}}
- 总字数：约 {{total_word_count}} 字

## 世界观关键设定
{{world_rules_summary}}

## 主角设定
{{protagonist_summary}}

## 重要配角
{{supporting_chars_summary}}

## 前文承接
{{previous_content_summary}}

## 本章任务
{{current_chapter_task}}
```

使用方法：
1. 替换所有 `{{variable}}` 为实际内容
2. 每次写作前注入上下文
3. 确保上下文简洁，突出关键信息
