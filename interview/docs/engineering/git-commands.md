# Git 常用命令大全

## 📋 目录

- [基础配置](#基础配置)
- [仓库初始化](#仓库初始化)
- [文件操作](#文件操作)
- [提交管理](#提交管理)
- [分支操作](#分支操作)
- [远程仓库](#远程仓库)
- [版本回退](#版本回退)
- [标签管理](#标签管理)
- [查看信息](#查看信息)
- [高级操作](#高级操作)
- [常用工作流](#常用工作流)

## 🔧 基础配置

### 全局配置

```bash
# 设置用户名和邮箱
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# 查看配置
git config --list
git config user.name
git config user.email

# 设置默认编辑器
git config --global core.editor "code --wait"  # VS Code
git config --global core.editor "vim"          # Vim

# 设置默认分支名
git config --global init.defaultBranch main

# 启用颜色输出
git config --global color.ui auto

# 设置换行符处理
git config --global core.autocrlf true   # Windows
git config --global core.autocrlf input  # macOS/Linux
```

### 本地配置（仅对当前仓库生效）

```bash
# 去掉 --global 参数
git config user.name "Project Specific Name"
git config user.email "project@example.com"
```

## 🆕 仓库初始化

### 创建新仓库

```bash
# 在当前目录初始化 Git 仓库
git init

# 在指定目录创建新仓库
git init project-name
cd project-name

# 创建裸仓库（用于服务器）
git init --bare
```

### 克隆现有仓库

```bash
# 克隆远程仓库
git clone https://github.com/user/repo.git
git clone git@github.com:user/repo.git

# 克隆到指定目录
git clone https://github.com/user/repo.git my-project

# 克隆指定分支
git clone -b branch-name https://github.com/user/repo.git

# 浅克隆（只获取最近的提交）
git clone --depth 1 https://github.com/user/repo.git
```

## 📁 文件操作

### 添加文件到暂存区

```bash
# 添加单个文件
git add filename.txt

# 添加多个文件
git add file1.txt file2.txt

# 添加所有文件
git add .
git add -A

# 添加所有 .js 文件
git add "*.js"

# 交互式添加
git add -i

# 添加部分文件内容
git add -p
```

### 查看文件状态

```bash
# 查看工作区状态
git status

# 简洁输出
git status -s
git status --short

# 查看被忽略的文件
git status --ignored
```

### 移除文件

```bash
# 从暂存区和工作区删除文件
git rm filename.txt

# 只从暂存区删除，保留工作区文件
git rm --cached filename.txt

# 删除目录
git rm -r directory/

# 强制删除（忽略未保存的修改）
git rm -f filename.txt
```

### 移动/重命名文件

```bash
# 重命名文件
git mv old-name.txt new-name.txt

# 移动文件到目录
git mv filename.txt directory/
```

## 💾 提交管理

### 提交更改

```bash
# 提交暂存区的文件
git commit -m "Commit message"

# 提交所有已跟踪文件的更改（跳过 git add）
git commit -am "Commit message"

# 修改最后一次提交
git commit --amend -m "New commit message"

# 空提交（用于触发 CI/CD）
git commit --allow-empty -m "Empty commit"

# 提交时显示详细信息
git commit -v
```

### 提交信息规范

```bash
# 常用提交类型
git commit -m "feat: 添加新功能"
git commit -m "fix: 修复bug"
git commit -m "docs: 更新文档"
git commit -m "style: 代码格式调整"
git commit -m "refactor: 重构代码"
git commit -m "test: 添加测试"
git commit -m "chore: 构建过程或辅助工具的变动"
```

## 🌿 分支操作

### 查看分支

```bash
# 查看本地分支
git branch

# 查看所有分支（包括远程）
git branch -a

# 查看远程分支
git branch -r

# 查看分支详细信息
git branch -v
git branch -vv  # 显示跟踪关系
```

### 创建分支

```bash
# 创建新分支
git branch feature-branch

# 创建并切换到新分支
git checkout -b feature-branch
git switch -c feature-branch  # 新语法

# 基于指定提交创建分支
git branch feature-branch commit-hash
git checkout -b feature-branch commit-hash
```

### 切换分支

```bash
# 切换分支
git checkout branch-name
git switch branch-name  # 新语法

# 切换到上一个分支
git checkout -
git switch -

# 强制切换（丢弃未保存的更改）
git checkout -f branch-name
```

### 合并分支

```bash
# 合并指定分支到当前分支
git merge feature-branch

# 不使用快进合并
git merge --no-ff feature-branch

# 压缩合并（将多个提交压缩为一个）
git merge --squash feature-branch

# 中止合并
git merge --abort
```

### 删除分支

```bash
# 删除已合并的分支
git branch -d feature-branch

# 强制删除分支
git branch -D feature-branch

# 删除远程分支
git push origin --delete feature-branch
git push origin :feature-branch  # 旧语法
```

## 🌐 远程仓库

### 查看远程仓库

```bash
# 查看远程仓库
git remote

# 查看远程仓库详细信息
git remote -v

# 查看指定远程仓库信息
git remote show origin
```

### 添加远程仓库

```bash
# 添加远程仓库
git remote add origin https://github.com/user/repo.git

# 添加多个远程仓库
git remote add upstream https://github.com/original/repo.git
```

### 修改远程仓库

```bash
# 修改远程仓库 URL
git remote set-url origin https://github.com/user/new-repo.git

# 重命名远程仓库
git remote rename origin new-origin

# 删除远程仓库
git remote remove origin
```

### 推送和拉取

```bash
# 推送到远程仓库
git push origin main

# 首次推送并设置上游分支
git push -u origin main
git push --set-upstream origin main

# 推送所有分支
git push --all origin

# 推送标签
git push --tags origin

# 强制推送（危险操作）
git push -f origin main
git push --force-with-lease origin main  # 更安全的强制推送

# 拉取远程更改
git pull origin main

# 拉取但不合并
git fetch origin

# 拉取所有远程分支
git fetch --all

# 拉取并变基
git pull --rebase origin main
```

## ⏪ 版本回退

### 查看提交历史

```bash
# 查看提交历史
git log

# 简洁显示
git log --oneline

# 图形化显示分支
git log --graph --oneline --all

# 查看指定文件的提交历史
git log filename.txt

# 查看指定作者的提交
git log --author="Author Name"

# 查看指定时间范围的提交
git log --since="2023-01-01" --until="2023-12-31"
```

### 重置提交

```bash
# 软重置（保留工作区和暂存区的更改）
git reset --soft HEAD~1

# 混合重置（保留工作区的更改，清空暂存区）
git reset --mixed HEAD~1
git reset HEAD~1  # 默认是 mixed

# 硬重置（丢弃所有更改）
git reset --hard HEAD~1

# 重置到指定提交
git reset --hard commit-hash
```

### 撤销更改

```bash
# 撤销工作区的更改
git checkout -- filename.txt
git restore filename.txt  # 新语法

# 撤销暂存区的更改
git reset HEAD filename.txt
git restore --staged filename.txt  # 新语法

# 撤销指定提交（创建新的撤销提交）
git revert commit-hash

# 撤销合并提交
git revert -m 1 merge-commit-hash
```

## 🏷️ 标签管理

### 创建标签

```bash
# 创建轻量标签
git tag v1.0.0

# 创建附注标签
git tag -a v1.0.0 -m "Version 1.0.0"

# 为指定提交创建标签
git tag -a v1.0.0 commit-hash -m "Version 1.0.0"
```

### 查看标签

```bash
# 查看所有标签
git tag

# 查看标签信息
git show v1.0.0

# 按模式查看标签
git tag -l "v1.*"
```

### 推送和删除标签

```bash
# 推送单个标签
git push origin v1.0.0

# 推送所有标签
git push origin --tags

# 删除本地标签
git tag -d v1.0.0

# 删除远程标签
git push origin --delete v1.0.0
git push origin :refs/tags/v1.0.0  # 旧语法
```

## 🔍 查看信息

### 查看差异

```bash
# 查看工作区与暂存区的差异
git diff

# 查看暂存区与最后提交的差异
git diff --cached
git diff --staged

# 查看工作区与最后提交的差异
git diff HEAD

# 查看两个提交之间的差异
git diff commit1..commit2

# 查看指定文件的差异
git diff filename.txt

# 查看分支间的差异
git diff branch1..branch2
```

### 查看文件内容

```bash
# 查看指定版本的文件内容
git show HEAD:filename.txt
git show commit-hash:filename.txt

# 查看文件的每一行是谁修改的
git blame filename.txt

# 查看文件的修改历史
git log -p filename.txt
```

### 搜索内容

```bash
# 在工作区搜索
git grep "search-term"

# 在指定提交中搜索
git grep "search-term" commit-hash

# 搜索并显示行号
git grep -n "search-term"
```

## 🚀 高级操作

### 变基操作

```bash
# 变基到指定分支
git rebase main

# 交互式变基（修改提交历史）
git rebase -i HEAD~3

# 变基时解决冲突后继续
git rebase --continue

# 中止变基
git rebase --abort

# 跳过当前提交
git rebase --skip
```

### 储藏更改

```bash
# 储藏当前更改
git stash
git stash save "Work in progress"

# 查看储藏列表
git stash list

# 应用最新的储藏
git stash apply
git stash pop  # 应用并删除储藏

# 应用指定的储藏
git stash apply stash@{2}

# 删除储藏
git stash drop stash@{0}

# 清空所有储藏
git stash clear
```

### 挑选提交

```bash
# 将指定提交应用到当前分支
git cherry-pick commit-hash

# 挑选多个提交
git cherry-pick commit1 commit2

# 挑选提交范围
git cherry-pick commit1..commit2
```

### 清理操作

```bash
# 删除未跟踪的文件
git clean -f

# 删除未跟踪的文件和目录
git clean -fd

# 预览将要删除的文件
git clean -n

# 交互式清理
git clean -i

# 清理忽略的文件
git clean -fX
```

## 📋 常用工作流

### Feature Branch 工作流

```bash
# 1. 从主分支创建功能分支
git checkout main
git pull origin main
git checkout -b feature/new-feature

# 2. 开发功能
# ... 编写代码 ...
git add .
git commit -m "feat: 添加新功能"

# 3. 推送功能分支
git push -u origin feature/new-feature

# 4. 创建 Pull Request/Merge Request

# 5. 合并后清理
git checkout main
git pull origin main
git branch -d feature/new-feature
```

### Gitflow 工作流

```bash
# 安装 git-flow
# macOS: brew install git-flow
# Ubuntu: sudo apt-get install git-flow

# 初始化 gitflow
git flow init

# 开始新功能
git flow feature start new-feature

# 完成功能
git flow feature finish new-feature

# 开始发布
git flow release start 1.0.0

# 完成发布
git flow release finish 1.0.0

# 开始热修复
git flow hotfix start critical-fix

# 完成热修复
git flow hotfix finish critical-fix
```

### 解决冲突

```bash
# 1. 拉取最新代码时出现冲突
git pull origin main
# Auto-merging file.txt
# CONFLICT (content): Merge conflict in file.txt

# 2. 查看冲突文件
git status

# 3. 手动编辑冲突文件，解决冲突标记
# <<<<<<< HEAD
# 当前分支的内容
# =======
# 远程分支的内容
# >>>>>>> commit-hash

# 4. 标记冲突已解决
git add file.txt

# 5. 完成合并
git commit -m "解决合并冲突"
```

### 紧急修复工作流

```bash
# 1. 从主分支创建热修复分支
git checkout main
git checkout -b hotfix/critical-bug

# 2. 修复问题
git add .
git commit -m "fix: 修复关键bug"

# 3. 推送并创建 PR
git push -u origin hotfix/critical-bug

# 4. 合并到主分支和开发分支
git checkout main
git merge hotfix/critical-bug
git push origin main

git checkout develop
git merge hotfix/critical-bug
git push origin develop

# 5. 删除热修复分支
git branch -d hotfix/critical-bug
git push origin --delete hotfix/critical-bug
```

## 🛠️ 实用技巧

### 别名设置

```bash
# 设置常用别名
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.unstage 'reset HEAD --'
git config --global alias.last 'log -1 HEAD'
git config --global alias.visual '!gitk'

# 复杂别名
git config --global alias.lg "log --color --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit"
```

### .gitignore 文件

```bash
# 创建 .gitignore 文件
echo "node_modules/" > .gitignore
echo "*.log" >> .gitignore
echo ".env" >> .gitignore

# 常用忽略模式
# 依赖目录
node_modules/
vendor/

# 日志文件
*.log
logs/

# 环境配置
.env
.env.local

# IDE 配置
.vscode/
.idea/
*.swp
*.swo

# 操作系统文件
.DS_Store
Thumbs.db

# 构建产物
dist/
build/
*.min.js
*.min.css
```

### 钩子脚本示例

```bash
# pre-commit 钩子（.git/hooks/pre-commit）
#!/bin/sh
# 运行代码检查
npm run lint
if [ $? -ne 0 ]; then
    echo "代码检查失败，请修复后再提交"
    exit 1
fi

# commit-msg 钩子（.git/hooks/commit-msg）
#!/bin/sh
# 检查提交信息格式
commit_regex='^(feat|fix|docs|style|refactor|test|chore)(\(.+\))?: .{1,50}'
if ! grep -qE "$commit_regex" "$1"; then
    echo "提交信息格式不正确"
    echo "格式：type(scope): description"
    echo "例如：feat(auth): 添加用户登录功能"
    exit 1
fi
```

## 📚 参考资源

### 官方文档

- [Git 官方文档](https://git-scm.com/doc)
- [Pro Git 书籍](https://git-scm.com/book)

### 在线工具

- [Git 命令速查](https://gitsheet.wtf/)
- [Learn Git Branching](https://learngitbranching.js.org/)
- [Git 可视化工具](https://git-school.github.io/visualizing-git/)

### GUI 工具

- **SourceTree** - 免费的 Git GUI 客户端
- **GitKraken** - 功能强大的 Git GUI
- **GitHub Desktop** - GitHub 官方客户端
- **VS Code** - 内置 Git 支持的编辑器

---

💡 **提示**：Git 命令很多，建议从基础命令开始学习，逐步掌握高级功能。多练习是掌握 Git 的关键！
