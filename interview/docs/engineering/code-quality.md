# 代码质量管控 - ESLint、Prettier、Husky 完整配置

## 代码质量管控体系

现代前端开发中，代码质量管控不仅仅是工具配置，更是一套完整的开发规范和自动化流程。

### 核心目标

- **一致性**：统一的代码风格和规范
- **可维护性**：提高代码的可读性和可维护性
- **自动化**：减少人工审查成本，提升开发效率
- **质量保障**：在提交前发现并修复问题

## 1. ESLint 深度配置与实践 🔍

### 基础配置结构

```javascript
// .eslintrc.js
module.exports = {
  // 环境配置
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true,
  },

  // 继承配置
  extends: [
    "eslint:recommended",
    "@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:jsx-a11y/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "prettier", // 必须放在最后
  ],

  // 解析器配置
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: "latest",
    sourceType: "module",
    project: "./tsconfig.json",
  },

  // 插件配置
  plugins: [
    "react",
    "react-hooks",
    "@typescript-eslint",
    "jsx-a11y",
    "import",
    "unused-imports",
  ],

  // 规则配置
  rules: {
    // JavaScript 基础规则
    "no-console": ["warn", { allow: ["warn", "error"] }],
    "no-debugger": "error",
    "no-unused-vars": "off", // 由 @typescript-eslint 处理
    "no-var": "error",
    "prefer-const": "error",
    "no-duplicate-imports": "error",

    // TypeScript 规则
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
      },
    ],
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-non-null-assertion": "warn",
    "@typescript-eslint/prefer-optional-chain": "error",
    "@typescript-eslint/prefer-nullish-coalescing": "error",

    // React 规则
    "react/react-in-jsx-scope": "off", // React 17+ 不需要
    "react/prop-types": "off", // TypeScript 已处理
    "react/display-name": "off",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",

    // 导入规则
    "import/order": [
      "error",
      {
        groups: [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index",
        ],
        "newlines-between": "always",
        alphabetize: {
          order: "asc",
          caseInsensitive: true,
        },
      },
    ],
    "import/no-unresolved": "error",
    "import/no-cycle": "error",
    "unused-imports/no-unused-imports": "error",

    // 可访问性规则
    "jsx-a11y/alt-text": "error",
    "jsx-a11y/anchor-is-valid": "error",
    "jsx-a11y/click-events-have-key-events": "warn",
  },

  // 设置配置
  settings: {
    react: {
      version: "detect",
    },
    "import/resolver": {
      typescript: {
        alwaysTryTypes: true,
        project: "./tsconfig.json",
      },
    },
  },

  // 忽略模式
  ignorePatterns: ["dist", "build", "node_modules", "*.config.js"],

  // 覆盖配置
  overrides: [
    // 测试文件配置
    {
      files: ["**/__tests__/**/*", "**/*.test.*"],
      env: {
        jest: true,
      },
      rules: {
        "@typescript-eslint/no-non-null-assertion": "off",
      },
    },

    // 配置文件
    {
      files: ["*.config.js", "*.config.ts"],
      rules: {
        "@typescript-eslint/no-var-requires": "off",
      },
    },
  ],
};
```

### 自定义 ESLint 规则

```javascript
// rules/no-console-log.js - 自定义规则示例
module.exports = {
  meta: {
    type: "problem",
    docs: {
      description: "禁止使用 console.log",
      category: "Best Practices",
      recommended: false,
    },
    fixable: "code",
    schema: [
      {
        type: "object",
        properties: {
          allowInDevelopment: {
            type: "boolean",
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const options = context.options[0] || {};
    const allowInDevelopment = options.allowInDevelopment || false;

    return {
      CallExpression(node) {
        if (
          node.callee.type === "MemberExpression" &&
          node.callee.object.name === "console" &&
          node.callee.property.name === "log"
        ) {
          // 开发环境检查
          if (allowInDevelopment && process.env.NODE_ENV === "development") {
            return;
          }

          context.report({
            node,
            message: "不允许使用 console.log",
            fix(fixer) {
              return fixer.remove(node.parent);
            },
          });
        }
      },
    };
  },
};

// 使用自定义规则
module.exports = {
  rules: {
    "custom/no-console-log": ["error", { allowInDevelopment: true }],
  },
};
```

### 项目级别配置策略

```javascript
// eslint-config-company/index.js - 公司级别配置
module.exports = {
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended'
  ],

  rules: {
    // 公司特定规则
    'max-len': ['error', { code: 100 }],
    'no-magic-numbers': ['error', { ignore: [0, 1, -1] }],
    'prefer-template': 'error',
    'object-shorthand': 'error',

    // 命名规范
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: 'interface',
        format: ['PascalCase'],
        prefix: ['I']
      },
      {
        selector: 'typeAlias',
        format: ['PascalCase']
      },
      {
        selector: 'enum',
        format: ['PascalCase']
      }
    ]
  }
};

// package.json
{
  "devDependencies": {
    "eslint-config-company": "^1.0.0"
  },
  "eslintConfig": {
    "extends": ["eslint-config-company"]
  }
}
```

## 2. Prettier 代码格式化 🎨

### 完整配置

```javascript
// .prettierrc.js
module.exports = {
  // 基础配置
  printWidth: 80,           // 每行最大字符数
  tabWidth: 2,              // 缩进空格数
  useTabs: false,           // 使用空格而不是 tab
  semi: true,               // 语句末尾添加分号
  singleQuote: true,        // 使用单引号
  quoteProps: 'as-needed',  // 对象属性引号

  // JSX 配置
  jsxSingleQuote: true,     // JSX 中使用单引号
  jsxBracketSameLine: false, // JSX 标签换行

  // 其他配置
  trailingComma: 'es5',     // 尾随逗号
  bracketSpacing: true,     // 对象花括号内空格
  arrowParens: 'avoid',     // 箭头函数参数括号
  rangeStart: 0,            // 格式化范围开始
  rangeEnd: Infinity,       // 格式化范围结束

  // 文件类型配置
  overrides: [
    {
      files: '*.json',
      options: {
        printWidth: 200
      }
    },
    {
      files: '*.md',
      options: {
        proseWrap: 'always',
        printWidth: 70
      }
    },
    {
      files: '*.{css,scss,less}',
      options: {
        singleQuote: false
      }
    }
  ]
};

// .prettierignore
# 构建输出
dist/
build/
coverage/

# 依赖
node_modules/

# 自动生成文件
*.min.js
*.bundle.js

# 特殊格式文件
*.md
*.yml
*.yaml

# 第三方库
public/libs/
```

### 编辑器集成

```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },

  // 文件类型特定配置
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },

  // ESLint 配置
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "eslint.run": "onType"
}
```

## 3. Husky Git Hooks 自动化 🐕

### 完整配置流程

```bash
# 安装依赖
npm install --save-dev husky lint-staged @commitlint/cli @commitlint/config-conventional

# 初始化 Husky
npx husky install

# 添加到 package.json
npm pkg set scripts.prepare="husky install"
```

```json
// package.json
{
  "scripts": {
    "prepare": "husky install",
    "lint": "eslint src --ext .js,.jsx,.ts,.tsx",
    "lint:fix": "eslint src --ext .js,.jsx,.ts,.tsx --fix",
    "format": "prettier --write src/**/*.{js,jsx,ts,tsx,json,css,md}",
    "type-check": "tsc --noEmit"
  },

  "lint-staged": {
    "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,css,md}": ["prettier --write"],
    "*.{ts,tsx}": ["tsc-files --noEmit"]
  }
}
```

### Git Hooks 配置

```bash
# .husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🔍 Running pre-commit checks..."

# 运行 lint-staged
npx lint-staged

# 类型检查
echo "🔍 Type checking..."
npm run type-check

# 运行测试
echo "🧪 Running tests..."
npm test -- --watchAll=false --passWithNoTests

echo "✅ Pre-commit checks passed!"
```

```bash
# .husky/commit-msg
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🔍 Validating commit message..."
npx --no-install commitlint --edit "$1"
```

```bash
# .husky/pre-push
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🔍 Running pre-push checks..."

# 完整的代码检查
npm run lint

# 完整的测试套件
npm test -- --watchAll=false --coverage

# 构建检查
npm run build

echo "✅ Pre-push checks passed!"
```

### Commitlint 配置

```javascript
// commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],

  rules: {
    // 类型枚举
    'type-enum': [
      2,
      'always',
      [
        'feat',     // 新功能
        'fix',      // 修复
        'docs',     // 文档
        'style',    // 格式化
        'refactor', // 重构
        'perf',     // 性能优化
        'test',     // 测试
        'chore',    // 构建过程或辅助工具的变动
        'revert',   // 回滚
        'build',    // 构建系统
        'ci'        // CI 配置
      ]
    ],

    // 主题格式
    'subject-case': [2, 'never', ['start-case', 'pascal-case', 'upper-case']],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'subject-max-length': [2, 'always', 50],

    // 正文格式
    'body-leading-blank': [2, 'always'],
    'body-max-line-length': [2, 'always', 72],

    // 页脚格式
    'footer-leading-blank': [2, 'always'],
    'footer-max-line-length': [2, 'always', 72]
  },

  // 自定义解析器
  parserPreset: {
    parserOpts: {
      headerPattern: /^(\w*)(?:\((.*)\))?: (.*)$/,
      headerCorrespondence: ['type', 'scope', 'subject']
    }
  }
};

// .gitmessage - 提交模板
# <type>(<scope>): <subject>
#
# <body>
#
# <footer>

# type 类型:
# feat:     新功能
# fix:      修复bug
# docs:     文档更新
# style:    代码格式化
# refactor: 重构
# perf:     性能优化
# test:     测试相关
# chore:    构建过程或辅助工具的变动
```

## 4. TypeScript 集成配置 📘

### TSConfig 优化

```json
// tsconfig.json
{
  "compilerOptions": {
    // 基础选项
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["DOM", "DOM.Iterable", "ES6"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    // 严格模式选项
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noImplicitThis": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,

    // 路径映射
    "baseUrl": "src",
    "paths": {
      "@/*": ["*"],
      "@/components/*": ["components/*"],
      "@/utils/*": ["utils/*"],
      "@/types/*": ["types/*"]
    }
  },

  "include": ["src/**/*", "src/**/*.json"],

  "exclude": ["node_modules", "dist", "build"]
}
```

### 类型定义规范

```typescript
// types/common.ts - 通用类型定义
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
  total?: number;
}

export interface TableColumn<T = any> {
  key: keyof T;
  title: string;
  dataIndex?: keyof T;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  sorter?: boolean | ((a: T, b: T) => number);
  filters?: Array<{ text: string; value: any }>;
}

// 工具类型
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<
  T,
  Exclude<keyof T, Keys>
> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];

// 组件 Props 类型
export interface BaseComponentProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export interface ButtonProps extends BaseComponentProps {
  type?: "primary" | "secondary" | "danger";
  size?: "small" | "medium" | "large";
  loading?: boolean;
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}
```

## 5. 完整的工作流配置 🔄

### 项目初始化脚本

```bash
#!/bin/bash
# setup-project.sh

echo "🚀 Setting up project quality tools..."

# 安装依赖
npm install --save-dev \
  eslint \
  @typescript-eslint/parser \
  @typescript-eslint/eslint-plugin \
  eslint-plugin-react \
  eslint-plugin-react-hooks \
  eslint-plugin-jsx-a11y \
  eslint-plugin-import \
  eslint-plugin-unused-imports \
  eslint-config-prettier \
  prettier \
  husky \
  lint-staged \
  @commitlint/cli \
  @commitlint/config-conventional

# 初始化配置文件
echo "📝 Creating configuration files..."

# ESLint 配置
cat > .eslintrc.js << 'EOF'
module.exports = {
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'prettier'
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  rules: {
    'react/react-in-jsx-scope': 'off'
  },
  settings: {
    react: { version: 'detect' }
  }
};
EOF

# Prettier 配置
cat > .prettierrc.js << 'EOF'
module.exports = {
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  trailingComma: 'es5'
};
EOF

# Commitlint 配置
cat > commitlint.config.js << 'EOF'
module.exports = {
  extends: ['@commitlint/config-conventional']
};
EOF

# 初始化 Husky
npx husky install
npx husky add .husky/pre-commit "npx lint-staged"
npx husky add .husky/commit-msg "npx commitlint --edit \$1"

echo "✅ Project quality tools setup complete!"
echo "📖 Don't forget to update your package.json with lint-staged configuration"
```

### CI/CD 集成

```yaml
# .github/workflows/quality-check.yml
name: Code Quality Check

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main, develop]

jobs:
  quality-check:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Type check
        run: npm run type-check

      - name: Lint check
        run: npm run lint

      - name: Format check
        run: npx prettier --check .

      - name: Run tests
        run: npm test -- --coverage --watchAll=false

      - name: Build check
        run: npm run build

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
```

## 6. 高级配置和最佳实践 🎯

### 渐进式配置策略

```javascript
// eslint-config/base.js - 基础配置
module.exports = {
  extends: ["eslint:recommended"],
  rules: {
    "no-console": "warn",
    "no-debugger": "error",
  },
};

// eslint-config/typescript.js - TypeScript 配置
module.exports = {
  extends: ["./base.js", "@typescript-eslint/recommended"],
  rules: {
    "@typescript-eslint/no-unused-vars": "error",
  },
};

// eslint-config/react.js - React 配置
module.exports = {
  extends: ["./typescript.js", "plugin:react/recommended"],
  rules: {
    "react/prop-types": "off",
  },
};

// 项目中使用
module.exports = {
  extends: ["./config/react.js"],
};
```

### 团队规范文档

```markdown
# 代码质量规范

## 提交规范

### 提交信息格式
```

```
<type>(<scope>): <subject>

<body>

<footer>
```

```markdown
### 类型说明

- feat: 新功能
- fix: 修复 bug
- docs: 文档更新
- style: 代码格式化
- refactor: 重构
- test: 测试相关
- chore: 构建相关

### 示例
```

```
feat(auth): add login validation

Add email format validation and password strength check
for the login form component.

Closes #123
```

```markdown
## 代码规范

### 命名规范

- 组件: PascalCase (UserProfile)
- 函数: camelCase (getUserInfo)
- 常量: UPPER_SNAKE_CASE (API_BASE_URL)
- 文件: kebab-case (user-profile.tsx)

### 文件组织
```

src/
├── components/ # 可复用组件
├── pages/ # 页面组件
├── hooks/ # 自定义 Hooks
├── utils/ # 工具函数
├── types/ # 类型定义
└── constants/ # 常量定义

```

```

## 面试常见问题解答

### Q1: 如何在团队中推广代码质量工具？

**回答框架：**

1. **渐进式引入**：从基础规则开始，逐步完善
2. **工具化**：自动化检查，减少人工成本
3. **文档化**：提供清晰的规范文档
4. **培训**：团队培训和知识分享

### Q2: ESLint 和 Prettier 的冲突如何解决？

**解决方案：**

1. 使用 `eslint-config-prettier` 关闭冲突规则
2. 运行顺序：ESLint 先检查，Prettier 后格式化
3. 编辑器集成：保存时自动执行两个工具

### Q3: Git Hooks 失败时如何处理？

**处理策略：**

1. **bypass 选项**：紧急情况下使用 `--no-verify`
2. **错误提示**：清晰的错误信息和修复建议
3. **本地修复**：提供快速修复命令
4. **CI 兜底**：CI 环境再次检查

这样的代码质量管控体系能确保团队代码的一致性和可维护性！
