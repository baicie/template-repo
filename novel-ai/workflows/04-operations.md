# 日常运维手册

## 项目结构检查

每本书应包含以下目录和文件：

```
books/{书名}/
├── constitution.md              ✅ 创作宪法
├── meta.md                    ✅ 作品信息
├── 00-context.md             ✅ 写作上下文
├── 00-characters.md          ✅ 角色档案
├── 00-world.md               ✅ 世界观设定
├── 00-outline.md              ✅ 总大纲
├── 00-glossary.md            ✅ 术语表
├── tracking/                  ✅ 追踪数据
│   ├── plot-tracker.json    ✅ 情节追踪
│   ├── character-state.json  ✅ 角色状态
│   ├── relationships.json    ✅ 关系网络
│   ├── timeline.json        ✅ 时间线
│   ├── hooks.json           ✅ 钩子追踪
│   └── debts.json           ✅ 债务追踪
├── chapters/                ✅ 章节正文
│   └── v01-ch01.md
└── drafts/                  ✅ 废弃草稿
```

## 日常写作流程

```
1. 【写前】检查 tracking/*.json
   - 确认角色当前状态
   - 确认情节进度
   - 确认债务到期情况

2. 【写作】按查询协议读取上下文
   - constitution.md → 00-context.md → tracking/*.json

3. 【写后】更新 tracking/*.json
   - 更新情节节点
   - 更新角色状态
   - 更新时间线
   - 更新钩子/债务

4. 【检查】快速复核
   - boring-detect：检测流水账
   - 一致性：检查设定矛盾
```

## 追踪文件更新规则

### 每章必更新

- `plot-tracker.json`：情节节点 +已完成/待完成
- `timeline.json`：本章事件
- `00-context.md`：章节上下文

### 有变化时更新

- `character-state.json`：角色境界/状态/物品变化
- `relationships.json`：关系变化

### 新增时记录

- `hooks.json`：新的钩子
- `debts.json`：新的伏笔/承诺

## 字数统计

每周检查总字数：

```bash
# 统计 chapters/ 下所有 md 文件字数
find chapters/ -name "*.md" -exec wc -c {} + | tail -1
```

## 备份建议

建议定期备份以下文件：
- `tracking/*.json`（所有追踪数据）
- `00-context.md`（当前上下文）
- `chapters/`（所有章节）

## 常见问题处理

### Q：发现前后矛盾怎么办？

1. 立即标记问题位置
2. 判断哪个版本是正确的
3. 决定是修改前文还是调整后文
4. 更新 `00-context.md` 和 `tracking/*.json`

### Q：某章写崩了怎么办？

1. 将原文件移到 `drafts/`
2. 重新写新版本
3. 更新章节文件

### Q：大纲需要大改怎么办？

1. 备份原大纲
2. 修改 `00-outline.md`
3. 重新审视 `tracking/*.json`
4. 确认新大纲与已写章节兼容

### Q：长时间断更后如何恢复？

1. 读取 `00-context.md`
2. 读取所有 `tracking/*.json`
3. 读取最近 3 章
4. 重新熟悉设定和情节
5. 制定续写计划
6. 补齐期间缺失的钩子/债务

## 版本控制

建议使用 Git 管理项目：

```bash
# 初始化
git init

# 每次写完章节后提交
git add chapters/v01-ch01.md tracking/*.json
git commit -m "写完第1章"

# 查看历史
git log --oneline
```

## 追读力监控

每 10 章做一次追读力检查：

```
检查项：
1. 当前活跃钩子数量
2. 债务到期情况
3. 节奏红线状态
4. 爽点密度
5. 读者期待度

决策：
- 追读力强 → 继续当前节奏
- 追读力中 → 调整钩子分布
- 追读力弱 → 大改后续大纲
```
