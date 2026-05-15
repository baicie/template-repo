# 包管理最佳实践 - npm、yarn、pnpm 深度对比

## 包管理器生态概览

现代前端开发中，包管理器不仅仅是依赖管理工具，更是整个开发工作流的核心组件，影响着项目的构建速度、磁盘占用、安全性和团队协作效率。

### 核心价值

- **依赖管理**：精确控制项目依赖版本
- **性能优化**：提升安装和构建速度
- **安全保障**：依赖安全扫描和漏洞修复
- **团队协作**：统一的开发环境和工作流

## 1. 包管理器深度对比 📊

### npm - 官方标准

```json
{
  "name": "my-project",
  "version": "1.0.0",
  "description": "A modern web application",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "lint": "eslint src --ext .js,.jsx,.ts,.tsx",
    "lint:fix": "eslint src --ext .js,.jsx,.ts,.tsx --fix",
    "type-check": "tsc --noEmit",
    "prepare": "husky install",
    "preinstall": "npx only-allow npm"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0",
    "axios": "^1.3.0",
    "styled-components": "^5.3.6"
  },
  "devDependencies": {
    "@types/react": "^18.0.27",
    "@types/react-dom": "^18.0.10",
    "@types/styled-components": "^5.1.26",
    "@typescript-eslint/eslint-plugin": "^5.52.0",
    "@typescript-eslint/parser": "^5.52.0",
    "@vitejs/plugin-react": "^3.1.0",
    "eslint": "^8.34.0",
    "eslint-plugin-react": "^7.32.2",
    "eslint-plugin-react-hooks": "^4.6.0",
    "husky": "^8.0.3",
    "typescript": "^4.9.5",
    "vite": "^4.1.0",
    "vitest": "^0.28.5"
  },
  "engines": {
    "node": ">=16.0.0",
    "npm": ">=8.0.0"
  },
  "browserslist": {
    "production": [">0.2%", "not dead", "not op_mini all"],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  },
  "overrides": {
    "semver": "^7.3.8"
  }
}
```

### Yarn - 性能和功能增强

```json
{
  "name": "my-project",
  "version": "1.0.0",
  "packageManager": "yarn@3.4.1",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "workspace:build": "yarn workspaces foreach -A run build",
    "workspace:test": "yarn workspaces foreach -A run test",
    "dlx": "yarn dlx create-react-app my-app"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.0.27",
    "typescript": "^4.9.5",
    "vite": "^4.1.0"
  },
  "workspaces": ["packages/*", "apps/*"],
  "resolutions": {
    "lodash": "^4.17.21"
  }
}
```

```yaml
# .yarnrc.yml - Yarn 配置
nodeLinker: node-modules
yarnPath: .yarn/releases/yarn-3.4.1.cjs

enableGlobalCache: true
enableMirror: false
enableNetwork: true

compressionLevel: mixed

npmRegistryServer: "https://registry.npmjs.org"
npmAuthToken: "${NPM_AUTH_TOKEN}"

plugins:
  - path: .yarn/plugins/@yarnpkg/plugin-interactive-tools.cjs
    spec: "@yarnpkg/plugin-interactive-tools"
  - path: .yarn/plugins/@yarnpkg/plugin-workspace-tools.cjs
    spec: "@yarnpkg/plugin-workspace-tools"

yarnPath: .yarn/releases/yarn-3.4.1.cjs
```

### pnpm - 高性能选择

```json
{
  "name": "my-project",
  "version": "1.0.0",
  "packageManager": "pnpm@7.27.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "build:all": "pnpm -r build",
    "test:all": "pnpm -r test",
    "clean": "pnpm -r clean"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.0.27",
    "typescript": "^4.9.5",
    "vite": "^4.1.0"
  },
  "pnpm": {
    "overrides": {
      "lodash": "^4.17.21"
    },
    "peerDependencyRules": {
      "ignoreMissing": ["@babel/core"],
      "allowedVersions": {
        "react": "18"
      }
    }
  }
}
```

```yaml
# .npmrc - pnpm 配置
registry=https://registry.npmjs.org/
store-dir=~/.pnpm-store
cache-dir=~/.pnpm-cache
state-dir=~/.pnpm-state

# 严格的 peer dependencies
strict-peer-dependencies=true
auto-install-peers=true

# 提升设置
shamefully-hoist=false
public-hoist-pattern[]=*eslint*
public-hoist-pattern[]=*prettier*

# 网络设置
network-timeout=60000
fetch-retries=3
fetch-retry-factor=2
fetch-retry-mintimeout=10000
fetch-retry-maxtimeout=60000

# 安全设置
audit-level=moderate
fund=false
```

### 性能对比分析

```javascript
// benchmark/install-performance.js
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

class PackageManagerBenchmark {
  constructor() {
    this.results = new Map();
    this.testProject = path.join(__dirname, "test-project");
  }

  // 准备测试项目
  setupTestProject() {
    if (fs.existsSync(this.testProject)) {
      fs.rmSync(this.testProject, { recursive: true });
    }

    fs.mkdirSync(this.testProject);

    const packageJson = {
      name: "benchmark-test",
      version: "1.0.0",
      dependencies: {
        react: "^18.2.0",
        "react-dom": "^18.2.0",
        lodash: "^4.17.21",
        axios: "^1.3.0",
        "styled-components": "^5.3.6",
        "react-router-dom": "^6.8.0",
        "@emotion/react": "^11.10.5",
        "@emotion/styled": "^11.10.5",
        "date-fns": "^2.29.3",
        uuid: "^9.0.0",
      },
      devDependencies: {
        "@types/react": "^18.0.27",
        "@types/react-dom": "^18.0.10",
        "@types/lodash": "^4.14.191",
        "@types/uuid": "^9.0.0",
        typescript: "^4.9.5",
        vite: "^4.1.0",
        vitest: "^0.28.5",
        eslint: "^8.34.0",
        "@typescript-eslint/parser": "^5.52.0",
        "@typescript-eslint/eslint-plugin": "^5.52.0",
      },
    };

    fs.writeFileSync(
      path.join(this.testProject, "package.json"),
      JSON.stringify(packageJson, null, 2)
    );
  }

  // 测试安装性能
  async benchmarkInstall(packageManager) {
    console.log(`Testing ${packageManager}...`);

    const startTime = process.hrtime.bigint();

    try {
      switch (packageManager) {
        case "npm":
          execSync("npm ci", {
            cwd: this.testProject,
            stdio: "pipe",
            timeout: 300000,
          });
          break;

        case "yarn":
          execSync("yarn install --frozen-lockfile", {
            cwd: this.testProject,
            stdio: "pipe",
            timeout: 300000,
          });
          break;

        case "pnpm":
          execSync("pnpm install --frozen-lockfile", {
            cwd: this.testProject,
            stdio: "pipe",
            timeout: 300000,
          });
          break;
      }

      const endTime = process.hrtime.bigint();
      const duration = Number(endTime - startTime) / 1000000; // 转换为毫秒

      // 获取磁盘占用
      const nodeModulesSize = this.getDirectorySize(
        path.join(this.testProject, "node_modules")
      );

      this.results.set(packageManager, {
        installTime: duration,
        diskUsage: nodeModulesSize,
        success: true,
      });
    } catch (error) {
      this.results.set(packageManager, {
        installTime: -1,
        diskUsage: -1,
        success: false,
        error: error.message,
      });
    }

    // 清理
    this.cleanup();
  }

  // 获取目录大小
  getDirectorySize(dirPath) {
    if (!fs.existsSync(dirPath)) return 0;

    let size = 0;
    const files = fs.readdirSync(dirPath);

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);

      if (stats.isDirectory()) {
        size += this.getDirectorySize(filePath);
      } else {
        size += stats.size;
      }
    }

    return size;
  }

  // 清理测试文件
  cleanup() {
    const cleanupPaths = [
      "node_modules",
      "package-lock.json",
      "yarn.lock",
      "pnpm-lock.yaml",
      ".yarn",
      ".pnpm",
    ];

    cleanupPaths.forEach((p) => {
      const fullPath = path.join(this.testProject, p);
      if (fs.existsSync(fullPath)) {
        fs.rmSync(fullPath, { recursive: true, force: true });
      }
    });
  }

  // 运行基准测试
  async run() {
    console.log("Starting package manager benchmark...");

    const packageManagers = ["npm", "yarn", "pnpm"];

    for (const pm of packageManagers) {
      this.setupTestProject();
      await this.benchmarkInstall(pm);
    }

    this.printResults();
  }

  // 打印结果
  printResults() {
    console.log("\n📊 Benchmark Results:");
    console.log("=====================================");

    const results = Array.from(this.results.entries()).map(([name, data]) => ({
      name,
      ...data,
      installTimeFormatted: data.success
        ? `${(data.installTime / 1000).toFixed(2)}s`
        : "Failed",
      diskUsageFormatted: data.success
        ? `${(data.diskUsage / 1024 / 1024).toFixed(2)}MB`
        : "N/A",
    }));

    // 按安装时间排序
    results.sort((a, b) => {
      if (!a.success) return 1;
      if (!b.success) return -1;
      return a.installTime - b.installTime;
    });

    console.table(
      results.map((r) => ({
        "Package Manager": r.name,
        "Install Time": r.installTimeFormatted,
        "Disk Usage": r.diskUsageFormatted,
        Status: r.success ? "✅ Success" : "❌ Failed",
      }))
    );

    // 性能分析
    const successfulResults = results.filter((r) => r.success);
    if (successfulResults.length > 0) {
      const fastest = successfulResults[0];
      const smallest = successfulResults.reduce((min, current) =>
        current.diskUsage < min.diskUsage ? current : min
      );

      console.log(
        `\n🏆 Fastest: ${fastest.name} (${fastest.installTimeFormatted})`
      );
      console.log(
        `💾 Smallest: ${smallest.name} (${smallest.diskUsageFormatted})`
      );
    }
  }
}

// 运行基准测试
if (require.main === module) {
  const benchmark = new PackageManagerBenchmark();
  benchmark.run().catch(console.error);
}

module.exports = PackageManagerBenchmark;
```

## 2. Monorepo 管理策略 🏗️

### Lerna 经典方案

```json
{
  "name": "my-monorepo",
  "private": true,
  "workspaces": ["packages/*", "apps/*"],
  "scripts": {
    "bootstrap": "lerna bootstrap",
    "build": "lerna run build",
    "test": "lerna run test",
    "publish": "lerna publish",
    "version": "lerna version",
    "clean": "lerna clean",
    "link": "lerna link"
  },
  "devDependencies": {
    "lerna": "^6.4.1",
    "@commitlint/cli": "^17.4.2",
    "@commitlint/config-conventional": "^17.4.2",
    "husky": "^8.0.3",
    "lint-staged": "^13.1.0"
  }
}
```

```json
// lerna.json
{
  "version": "independent",
  "npmClient": "npm",
  "command": {
    "publish": {
      "conventionalCommits": true,
      "message": "chore(release): publish",
      "registry": "https://registry.npmjs.org/",
      "allowBranch": ["main", "release/*"],
      "ignoreChanges": [
        "*.md",
        "*.spec.js",
        "*.test.js",
        "__tests__/**",
        "**/*.stories.js"
      ]
    },
    "version": {
      "allowBranch": ["main", "release/*"],
      "conventionalCommits": true,
      "createRelease": "github",
      "push": true,
      "yes": false
    },
    "bootstrap": {
      "ignore": "component-*",
      "npmClientArgs": ["--no-package-lock"]
    }
  },
  "packages": ["packages/*", "apps/*"],
  "useNx": true,
  "granularPathspec": false
}
```

### Nx 现代化方案

```json
// nx.json
{
  "extends": "nx/presets/npm.json",
  "tasksRunnerOptions": {
    "default": {
      "runner": "nx/tasks-runners/default",
      "options": {
        "cacheableOperations": ["build", "lint", "test", "e2e"],
        "parallel": 3
      }
    }
  },
  "targetDefaults": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": ["production", "^production"],
      "outputs": ["{projectRoot}/dist"]
    },
    "test": {
      "inputs": ["default", "^production", "{workspaceRoot}/jest.preset.js"]
    },
    "e2e": {
      "inputs": ["default", "^production"]
    },
    "lint": {
      "inputs": ["default", "{workspaceRoot}/.eslintrc.json"]
    }
  },
  "namedInputs": {
    "default": ["{projectRoot}/**/*", "sharedGlobals"],
    "production": [
      "default",
      "!{projectRoot}/**/?(*.)+(spec|test).[jt]s?(x)?(.snap)",
      "!{projectRoot}/tsconfig.spec.json",
      "!{projectRoot}/jest.config.[jt]s",
      "!{projectRoot}/.eslintrc.json"
    ],
    "sharedGlobals": []
  },
  "generators": {
    "@nx/react": {
      "application": {
        "style": "styled-components",
        "linter": "eslint",
        "bundler": "vite",
        "unitTestRunner": "vitest",
        "e2eTestRunner": "cypress"
      },
      "component": {
        "style": "styled-components"
      },
      "library": {
        "style": "styled-components",
        "linter": "eslint",
        "unitTestRunner": "vitest"
      }
    }
  }
}
```

```typescript
// tools/workspace-plugin/src/generators/component/index.ts
import {
  Tree,
  formatFiles,
  installPackagesTask,
  generateFiles,
  names,
  getWorkspaceLayout,
} from "@nx/devkit";
import { libraryGenerator } from "@nx/react";
import * as path from "path";

interface ComponentGeneratorSchema {
  name: string;
  project: string;
  directory?: string;
  export?: boolean;
  classComponent?: boolean;
  routing?: boolean;
  skipTests?: boolean;
  globalCss?: boolean;
}

export default async function (tree: Tree, options: ComponentGeneratorSchema) {
  const normalizedOptions = normalizeOptions(tree, options);

  // 生成组件库
  await libraryGenerator(tree, {
    name: normalizedOptions.projectName,
    directory: normalizedOptions.projectDirectory,
    tags: `scope:${normalizedOptions.projectName},type:ui`,
    style: "styled-components",
    unitTestRunner: "vitest",
    buildable: true,
    publishable: true,
    importPath: `@myorg/${normalizedOptions.projectName}`,
  });

  // 添加自定义文件
  generateFiles(
    tree,
    path.join(__dirname, "files"),
    normalizedOptions.projectRoot,
    {
      ...normalizedOptions,
      ...names(normalizedOptions.name),
      tmpl: "",
    }
  );

  await formatFiles(tree);
  return () => {
    installPackagesTask(tree);
  };
}

function normalizeOptions(tree: Tree, options: ComponentGeneratorSchema) {
  const name = names(options.name).fileName;
  const projectDirectory = options.directory
    ? `${names(options.directory).fileName}/${name}`
    : name;
  const projectName = projectDirectory.replace(new RegExp("/", "g"), "-");
  const projectRoot = `${getWorkspaceLayout(tree).libsDir}/${projectDirectory}`;

  return {
    ...options,
    projectName,
    projectRoot,
    projectDirectory,
    parsedTags: [],
  };
}
```

### Turborepo 高性能方案

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**", "build/**"]
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"],
      "inputs": ["src/**/*.tsx", "src/**/*.ts", "test/**/*.ts", "test/**/*.tsx"]
    },
    "lint": {
      "outputs": []
    },
    "type-check": {
      "dependsOn": ["^build"],
      "outputs": []
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "clean": {
      "cache": false
    }
  }
}
```

```json
// package.json - Turborepo 项目根目录
{
  "name": "turborepo-example",
  "private": true,
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "type-check": "turbo run type-check",
    "clean": "turbo run clean",
    "format": "prettier --write \"**/*.{ts,tsx,md}\"",
    "changeset": "changeset",
    "version-packages": "changeset version",
    "release": "turbo run build --filter=./packages/* && changeset publish"
  },
  "devDependencies": {
    "@changesets/cli": "^2.26.0",
    "eslint": "^8.34.0",
    "prettier": "^2.8.4",
    "turbo": "^1.8.3",
    "typescript": "^4.9.5"
  },
  "workspaces": ["apps/*", "packages/*"],
  "packageManager": "pnpm@7.27.0"
}
```

## 3. 依赖版本管理 🔒

### 语义化版本控制

```javascript
// scripts/version-check.js
const semver = require("semver");
const fs = require("fs");
const path = require("path");

class VersionManager {
  constructor(rootDir = process.cwd()) {
    this.rootDir = rootDir;
    this.packageJson = this.loadPackageJson();
  }

  loadPackageJson() {
    const packagePath = path.join(this.rootDir, "package.json");
    return JSON.parse(fs.readFileSync(packagePath, "utf8"));
  }

  // 检查依赖版本兼容性
  checkCompatibility() {
    const issues = [];
    const dependencies = {
      ...this.packageJson.dependencies,
      ...this.packageJson.devDependencies,
    };

    // 检查 React 生态兼容性
    if (dependencies.react && dependencies["react-dom"]) {
      const reactVersion = semver.minVersion(dependencies.react);
      const reactDomVersion = semver.minVersion(dependencies["react-dom"]);

      if (!semver.satisfies(reactDomVersion, dependencies.react)) {
        issues.push({
          type: "compatibility",
          message: `React and ReactDOM versions may be incompatible: react@${dependencies.react}, react-dom@${dependencies["react-dom"]}`,
          severity: "error",
        });
      }
    }

    // 检查 TypeScript 相关兼容性
    if (dependencies.typescript && dependencies["@types/react"]) {
      const tsVersion = semver.minVersion(dependencies.typescript);

      if (
        semver.lt(tsVersion, "4.1.0") &&
        dependencies["@types/react"].includes("^18")
      ) {
        issues.push({
          type: "compatibility",
          message: "TypeScript version may be too old for React 18 types",
          severity: "warning",
        });
      }
    }

    return issues;
  }

  // 检查过时的依赖
  async checkOutdated() {
    const { execSync } = require("child_process");

    try {
      const output = execSync("npm outdated --json", {
        cwd: this.rootDir,
        encoding: "utf8",
      });

      const outdated = JSON.parse(output);
      const issues = [];

      Object.entries(outdated).forEach(([name, info]) => {
        const currentMajor = semver.major(info.current);
        const wantedMajor = semver.major(info.wanted);
        const latestMajor = semver.major(info.latest);

        if (latestMajor > currentMajor) {
          issues.push({
            type: "outdated",
            package: name,
            current: info.current,
            wanted: info.wanted,
            latest: info.latest,
            severity: latestMajor - currentMajor > 1 ? "error" : "warning",
            message: `${name} is ${
              latestMajor - currentMajor
            } major version(s) behind`,
          });
        }
      });

      return issues;
    } catch (error) {
      console.warn("Could not check outdated packages:", error.message);
      return [];
    }
  }

  // 检查安全漏洞
  async checkSecurity() {
    const { execSync } = require("child_process");

    try {
      const output = execSync("npm audit --json", {
        cwd: this.rootDir,
        encoding: "utf8",
      });

      const audit = JSON.parse(output);
      const issues = [];

      Object.entries(audit.vulnerabilities || {}).forEach(([name, vuln]) => {
        issues.push({
          type: "security",
          package: name,
          severity: vuln.severity,
          title: vuln.title,
          url: vuln.url,
          fixAvailable: vuln.fixAvailable,
          message: `Security vulnerability in ${name}: ${vuln.title}`,
        });
      });

      return issues;
    } catch (error) {
      console.warn("Could not check security vulnerabilities:", error.message);
      return [];
    }
  }

  // 生成依赖报告
  async generateReport() {
    console.log("🔍 Analyzing dependencies...\n");

    const [compatibility, outdated, security] = await Promise.all([
      this.checkCompatibility(),
      this.checkOutdated(),
      this.checkSecurity(),
    ]);

    const allIssues = [...compatibility, ...outdated, ...security];

    // 按严重程度分组
    const groupedIssues = allIssues.reduce((groups, issue) => {
      const severity = issue.severity || "info";
      if (!groups[severity]) groups[severity] = [];
      groups[severity].push(issue);
      return groups;
    }, {});

    // 打印报告
    console.log("📊 Dependency Analysis Report");
    console.log("================================\n");

    const severityOrder = ["error", "warning", "info"];
    const severityIcons = { error: "❌", warning: "⚠️", info: "ℹ️" };

    severityOrder.forEach((severity) => {
      if (groupedIssues[severity]) {
        console.log(
          `${severityIcons[severity]} ${severity.toUpperCase()} (${
            groupedIssues[severity].length
          })`
        );
        groupedIssues[severity].forEach((issue) => {
          console.log(`  • ${issue.message}`);
          if (issue.fixAvailable) {
            console.log(`    Fix: npm audit fix`);
          }
        });
        console.log("");
      }
    });

    if (allIssues.length === 0) {
      console.log("✅ No issues found!");
    }

    return allIssues;
  }

  // 自动修复建议
  generateFixSuggestions(issues) {
    const suggestions = [];

    issues.forEach((issue) => {
      switch (issue.type) {
        case "outdated":
          if (issue.severity === "error") {
            suggestions.push(`npm install ${issue.package}@latest`);
          } else {
            suggestions.push(`npm update ${issue.package}`);
          }
          break;

        case "security":
          if (issue.fixAvailable) {
            suggestions.push("npm audit fix");
          } else {
            suggestions.push(`# Manual review required for ${issue.package}`);
          }
          break;

        case "compatibility":
          suggestions.push(`# Review compatibility: ${issue.message}`);
          break;
      }
    });

    return [...new Set(suggestions)]; // 去重
  }
}

// CLI 使用
if (require.main === module) {
  const manager = new VersionManager();

  manager
    .generateReport()
    .then((issues) => {
      if (issues.length > 0) {
        console.log("\n🔧 Suggested fixes:");
        const suggestions = manager.generateFixSuggestions(issues);
        suggestions.forEach((suggestion) => {
          console.log(`  ${suggestion}`);
        });
      }

      process.exit(
        issues.filter((i) => i.severity === "error").length > 0 ? 1 : 0
      );
    })
    .catch(console.error);
}

module.exports = VersionManager;
```

### 依赖锁定策略

```javascript
// scripts/lockfile-analyzer.js
const fs = require("fs");
const crypto = require("crypto");
const path = require("path");

class LockfileAnalyzer {
  constructor() {
    this.supportedLockfiles = {
      "package-lock.json": this.analyzeNpmLock.bind(this),
      "yarn.lock": this.analyzeYarnLock.bind(this),
      "pnpm-lock.yaml": this.analyzePnpmLock.bind(this),
    };
  }

  // 分析项目锁文件
  analyze(projectPath = process.cwd()) {
    const results = {
      lockfiles: [],
      issues: [],
      recommendations: [],
    };

    Object.keys(this.supportedLockfiles).forEach((filename) => {
      const lockfilePath = path.join(projectPath, filename);

      if (fs.existsSync(lockfilePath)) {
        const content = fs.readFileSync(lockfilePath, "utf8");
        const analysis = this.supportedLockfiles[filename](
          content,
          lockfilePath
        );

        results.lockfiles.push({
          type: filename,
          path: lockfilePath,
          ...analysis,
        });
      }
    });

    // 检查多重锁文件
    if (results.lockfiles.length > 1) {
      results.issues.push({
        type: "multiple-lockfiles",
        severity: "warning",
        message: "Multiple lockfiles detected. This can cause inconsistencies.",
        files: results.lockfiles.map((l) => l.type),
      });
    }

    // 检查锁文件完整性
    results.lockfiles.forEach((lockfile) => {
      if (lockfile.integrity && !lockfile.integrity.valid) {
        results.issues.push({
          type: "integrity",
          severity: "error",
          message: `Lockfile integrity check failed: ${lockfile.type}`,
          details: lockfile.integrity.issues,
        });
      }
    });

    return results;
  }

  // 分析 npm lockfile
  analyzeNpmLock(content, filePath) {
    try {
      const lockData = JSON.parse(content);
      const stats = this.calculateStats(lockData.packages || {});

      return {
        version: lockData.lockfileVersion,
        nodeVersion: lockData.requires,
        packageCount: Object.keys(lockData.packages || {}).length,
        stats,
        integrity: this.checkNpmIntegrity(lockData),
        size: Buffer.byteLength(content, "utf8"),
      };
    } catch (error) {
      return {
        error: `Failed to parse npm lockfile: ${error.message}`,
        size: Buffer.byteLength(content, "utf8"),
      };
    }
  }

  // 分析 Yarn lockfile
  analyzeYarnLock(content, filePath) {
    const lines = content.split("\n");
    const packages = new Map();
    let currentPackage = null;

    lines.forEach((line) => {
      const trimmed = line.trim();

      if (trimmed.startsWith('"') && trimmed.includes("@")) {
        // 包声明行
        currentPackage = trimmed.split("@")[0].replace(/"/g, "");
        packages.set(currentPackage, {});
      } else if (currentPackage && trimmed.includes("version")) {
        const version = trimmed.split("version ")[1]?.replace(/"/g, "");
        if (version) {
          packages.get(currentPackage).version = version;
        }
      }
    });

    return {
      packageCount: packages.size,
      stats: this.calculateStatsFromMap(packages),
      size: Buffer.byteLength(content, "utf8"),
      integrity: this.checkYarnIntegrity(content),
    };
  }

  // 分析 pnpm lockfile
  analyzePnpmLock(content, filePath) {
    const yaml = require("js-yaml");

    try {
      const lockData = yaml.load(content);
      const packages = lockData.packages || {};

      return {
        version: lockData.lockfileVersion,
        packageCount: Object.keys(packages).length,
        stats: this.calculateStats(packages),
        size: Buffer.byteLength(content, "utf8"),
        integrity: this.checkPnpmIntegrity(lockData),
      };
    } catch (error) {
      return {
        error: `Failed to parse pnpm lockfile: ${error.message}`,
        size: Buffer.byteLength(content, "utf8"),
      };
    }
  }

  // 计算统计信息
  calculateStats(packages) {
    const stats = {
      totalSize: 0,
      duplicates: new Map(),
      outdated: [],
      security: [],
    };

    Object.entries(packages).forEach(([name, info]) => {
      // 检查重复包
      const packageName = name.split("@")[0];
      if (!stats.duplicates.has(packageName)) {
        stats.duplicates.set(packageName, []);
      }
      stats.duplicates.get(packageName).push(info.version || "unknown");
    });

    // 过滤出真正的重复包
    stats.duplicates = new Map(
      Array.from(stats.duplicates.entries()).filter(
        ([name, versions]) => new Set(versions).size > 1
      )
    );

    return stats;
  }

  calculateStatsFromMap(packages) {
    const duplicates = new Map();

    packages.forEach((info, name) => {
      if (!duplicates.has(name)) {
        duplicates.set(name, []);
      }
      duplicates.get(name).push(info.version || "unknown");
    });

    return {
      duplicates: new Map(
        Array.from(duplicates.entries()).filter(
          ([name, versions]) => new Set(versions).size > 1
        )
      ),
    };
  }

  // 检查 npm 锁文件完整性
  checkNpmIntegrity(lockData) {
    const issues = [];

    // 检查必需字段
    if (!lockData.lockfileVersion) {
      issues.push("Missing lockfileVersion");
    }

    if (!lockData.packages) {
      issues.push("Missing packages section");
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }

  // 检查 Yarn 锁文件完整性
  checkYarnIntegrity(content) {
    const issues = [];

    if (!content.includes("# yarn lockfile v1")) {
      issues.push("Missing yarn lockfile header");
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }

  // 检查 pnpm 锁文件完整性
  checkPnpmIntegrity(lockData) {
    const issues = [];

    if (!lockData.lockfileVersion) {
      issues.push("Missing lockfileVersion");
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }

  // 生成报告
  generateReport(analysis) {
    console.log("🔒 Lockfile Analysis Report");
    console.log("============================\n");

    if (analysis.lockfiles.length === 0) {
      console.log("❌ No lockfiles found!");
      console.log(
        "Run npm install, yarn install, or pnpm install to generate a lockfile.\n"
      );
      return;
    }

    analysis.lockfiles.forEach((lockfile) => {
      console.log(`📄 ${lockfile.type}`);
      console.log(`   Size: ${(lockfile.size / 1024).toFixed(2)} KB`);
      console.log(`   Packages: ${lockfile.packageCount}`);

      if (lockfile.stats?.duplicates.size > 0) {
        console.log(`   Duplicates: ${lockfile.stats.duplicates.size}`);
        Array.from(lockfile.stats.duplicates.entries())
          .slice(0, 5)
          .forEach(([name, versions]) => {
            console.log(`     • ${name}: ${versions.join(", ")}`);
          });
      }

      console.log("");
    });

    if (analysis.issues.length > 0) {
      console.log("⚠️  Issues Found:");
      analysis.issues.forEach((issue) => {
        console.log(`   • ${issue.message}`);
      });
      console.log("");
    }

    // 推荐
    console.log("💡 Recommendations:");
    if (analysis.lockfiles.length > 1) {
      console.log("   • Choose one package manager and remove other lockfiles");
    }
    console.log("   • Commit lockfiles to version control");
    console.log(
      "   • Use npm ci, yarn install --frozen-lockfile, or pnpm install --frozen-lockfile in CI"
    );
  }
}

// CLI 使用
if (require.main === module) {
  const analyzer = new LockfileAnalyzer();
  const analysis = analyzer.analyze();
  analyzer.generateReport(analysis);
}

module.exports = LockfileAnalyzer;
```

## 4. 私有仓库管理 🏢

### Verdaccio 私有仓库搭建

```yaml
# docker-compose.yml - Verdaccio 部署
version: "3.8"

services:
  verdaccio:
    image: verdaccio/verdaccio:5
    container_name: verdaccio
    restart: unless-stopped
    ports:
      - "4873:4873"
    volumes:
      - verdaccio-storage:/verdaccio/storage
      - verdaccio-plugins:/verdaccio/plugins
      - ./verdaccio-config.yaml:/verdaccio/conf/config.yaml
      - ./htpasswd:/verdaccio/conf/htpasswd
    environment:
      - VERDACCIO_USER_NAME=admin
      - VERDACCIO_USER_PWD=admin123
    networks:
      - verdaccio-network

  # Nginx 反向代理
  nginx:
    image: nginx:alpine
    container_name: verdaccio-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - verdaccio
    networks:
      - verdaccio-network

volumes:
  verdaccio-storage:
  verdaccio-plugins:

networks:
  verdaccio-network:
    driver: bridge
```

```yaml
# verdaccio-config.yaml
storage: /verdaccio/storage/data
plugins: /verdaccio/plugins

# Web UI 配置
web:
  title: My Private Registry
  gravatar: true
  scope: "@mycompany"
  sort_packages: asc

# 认证配置
auth:
  htpasswd:
    file: /verdaccio/conf/htpasswd
    max_users: 1000
    algorithm: bcrypt
    rounds: 10

# 上游链接
uplinks:
  npmjs:
    url: https://registry.npmjs.org/
    cache: true
    timeout: 30s
    maxage: 2m
    max_fails: 2
    fail_timeout: 5m

# 包访问控制
packages:
  "@mycompany/*":
    access: $authenticated
    publish: $authenticated
    unpublish: $authenticated
    proxy: npmjs

  "@*/*":
    access: $all
    publish: $authenticated
    unpublish: $authenticated
    proxy: npmjs

  "**":
    access: $all
    publish: $authenticated
    unpublish: $authenticated
    proxy: npmjs

# 服务器配置
server:
  keepAliveTimeout: 60

# 中间件
middlewares:
  audit:
    enabled: true

# 日志配置
logs:
  - { type: stdout, format: pretty, level: http }
  - { type: file, path: /verdaccio/storage/verdaccio.log, level: info }

# 监听配置
listen:
  - 0.0.0.0:4873

# 最大包体大小
max_body_size: 10mb

# 通知配置
notify:
  method: POST
  headers: [{ "Content-Type": "application/json" }]
  endpoint: https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
  content: '{"text":"Package {{ name }} published by {{ publisher.name }}"}'
```

### 包发布自动化

```javascript
// scripts/publish-package.js
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const semver = require("semver");

class PackagePublisher {
  constructor(options = {}) {
    this.dryRun = options.dryRun || false;
    this.registry = options.registry || "https://registry.npmjs.org/";
    this.tag = options.tag || "latest";
    this.skipTests = options.skipTests || false;
    this.skipBuild = options.skipBuild || false;
  }

  // 发布包
  async publish(packagePath = process.cwd()) {
    console.log(`📦 Publishing package from ${packagePath}...`);

    const packageJson = this.loadPackageJson(packagePath);

    // 预检查
    await this.prePublishChecks(packagePath, packageJson);

    // 构建
    if (!this.skipBuild) {
      await this.buildPackage(packagePath);
    }

    // 测试
    if (!this.skipTests) {
      await this.runTests(packagePath);
    }

    // 发布
    await this.publishPackage(packagePath, packageJson);

    // 后处理
    await this.postPublish(packagePath, packageJson);

    console.log(
      `✅ Successfully published ${packageJson.name}@${packageJson.version}`
    );
  }

  loadPackageJson(packagePath) {
    const packageJsonPath = path.join(packagePath, "package.json");

    if (!fs.existsSync(packageJsonPath)) {
      throw new Error("package.json not found");
    }

    return JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  }

  // 发布前检查
  async prePublishChecks(packagePath, packageJson) {
    console.log("🔍 Running pre-publish checks...");

    // 检查必需字段
    const requiredFields = ["name", "version", "main"];
    const missingFields = requiredFields.filter((field) => !packageJson[field]);

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
    }

    // 检查版本格式
    if (!semver.valid(packageJson.version)) {
      throw new Error(`Invalid version: ${packageJson.version}`);
    }

    // 检查是否已发布
    if (!this.dryRun) {
      try {
        const existingVersion = execSync(
          `npm view ${packageJson.name} version --registry=${this.registry}`,
          { encoding: "utf8", stdio: "pipe" }
        ).trim();

        if (semver.gte(existingVersion, packageJson.version)) {
          throw new Error(
            `Version ${packageJson.version} already exists or is lower than published version ${existingVersion}`
          );
        }
      } catch (error) {
        if (!error.message.includes("404")) {
          throw error;
        }
        // 包不存在，可以发布
      }
    }

    // 检查 Git 状态
    try {
      const gitStatus = execSync("git status --porcelain", {
        cwd: packagePath,
        encoding: "utf8",
        stdio: "pipe",
      });

      if (gitStatus.trim()) {
        console.warn("⚠️  Warning: Working directory is not clean");
        if (!this.dryRun) {
          throw new Error("Working directory must be clean before publishing");
        }
      }
    } catch (error) {
      console.warn("⚠️  Warning: Not a Git repository or Git not available");
    }

    // 检查文件
    const files = packageJson.files;
    if (files) {
      const missingFiles = files.filter(
        (file) => !fs.existsSync(path.join(packagePath, file))
      );

      if (missingFiles.length > 0) {
        throw new Error(
          `Files specified in package.json not found: ${missingFiles.join(
            ", "
          )}`
        );
      }
    }

    console.log("✅ Pre-publish checks passed");
  }

  // 构建包
  async buildPackage(packagePath) {
    console.log("🔨 Building package...");

    const packageJson = this.loadPackageJson(packagePath);

    if (packageJson.scripts?.build) {
      try {
        execSync("npm run build", {
          cwd: packagePath,
          stdio: "inherit",
        });
        console.log("✅ Build completed");
      } catch (error) {
        throw new Error(`Build failed: ${error.message}`);
      }
    } else {
      console.log("ℹ️  No build script found, skipping build");
    }
  }

  // 运行测试
  async runTests(packagePath) {
    console.log("🧪 Running tests...");

    const packageJson = this.loadPackageJson(packagePath);

    if (packageJson.scripts?.test) {
      try {
        execSync("npm test", {
          cwd: packagePath,
          stdio: "inherit",
          env: { ...process.env, CI: "true" },
        });
        console.log("✅ Tests passed");
      } catch (error) {
        throw new Error(`Tests failed: ${error.message}`);
      }
    } else {
      console.log("ℹ️  No test script found, skipping tests");
    }
  }

  // 发布包
  async publishPackage(packagePath, packageJson) {
    console.log("🚀 Publishing to registry...");

    const publishCommand = [
      "npm publish",
      `--registry=${this.registry}`,
      `--tag=${this.tag}`,
      this.dryRun ? "--dry-run" : "",
    ]
      .filter(Boolean)
      .join(" ");

    try {
      const output = execSync(publishCommand, {
        cwd: packagePath,
        encoding: "utf8",
        stdio: "pipe",
      });

      console.log(output);

      if (!this.dryRun) {
        console.log(
          `✅ Published ${packageJson.name}@${packageJson.version} to ${this.registry}`
        );
      } else {
        console.log(
          `✅ Dry run completed for ${packageJson.name}@${packageJson.version}`
        );
      }
    } catch (error) {
      throw new Error(`Publish failed: ${error.message}`);
    }
  }

  // 发布后处理
  async postPublish(packagePath, packageJson) {
    if (this.dryRun) return;

    console.log("📋 Running post-publish tasks...");

    // 创建 Git 标签
    try {
      const tagName = `v${packageJson.version}`;
      execSync(`git tag ${tagName}`, { cwd: packagePath });
      execSync(`git push origin ${tagName}`, { cwd: packagePath });
      console.log(`✅ Created and pushed Git tag: ${tagName}`);
    } catch (error) {
      console.warn(`⚠️  Warning: Could not create Git tag: ${error.message}`);
    }

    // 发送通知
    await this.sendNotification(packageJson);
  }

  // 发送通知
  async sendNotification(packageJson) {
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;

    if (!webhookUrl) {
      console.log("ℹ️  No webhook URL configured, skipping notification");
      return;
    }

    const message = {
      text: `📦 Package published: ${packageJson.name}@${packageJson.version}`,
      attachments: [
        {
          color: "good",
          fields: [
            {
              title: "Package",
              value: packageJson.name,
              short: true,
            },
            {
              title: "Version",
              value: packageJson.version,
              short: true,
            },
            {
              title: "Registry",
              value: this.registry,
              short: true,
            },
          ],
        },
      ],
    };

    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      });

      if (response.ok) {
        console.log("✅ Notification sent");
      } else {
        console.warn("⚠️  Warning: Failed to send notification");
      }
    } catch (error) {
      console.warn(
        `⚠️  Warning: Could not send notification: ${error.message}`
      );
    }
  }
}

// CLI 使用
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {};

  // 解析命令行参数
  args.forEach((arg) => {
    if (arg === "--dry-run") options.dryRun = true;
    if (arg === "--skip-tests") options.skipTests = true;
    if (arg === "--skip-build") options.skipBuild = true;
    if (arg.startsWith("--registry=")) options.registry = arg.split("=")[1];
    if (arg.startsWith("--tag=")) options.tag = arg.split("=")[1];
  });

  const publisher = new PackagePublisher(options);

  publisher.publish().catch((error) => {
    console.error("❌ Publish failed:", error.message);
    process.exit(1);
  });
}

module.exports = PackagePublisher;
```

## 5. 工作流优化 ⚡

### 开发环境统一

```json
{
  "scripts": {
    "preinstall": "npx check-node-version --node $(cat .nvmrc) --npm $(cat .npm-version)",
    "postinstall": "patch-package && husky install",
    "dev": "concurrently \"npm:dev:*\"",
    "dev:web": "vite",
    "dev:api": "nodemon server.js",
    "dev:storybook": "storybook dev -p 6006",
    "build": "npm run build:clean && npm run build:web && npm run build:api",
    "build:clean": "rimraf dist",
    "build:web": "vite build",
    "build:api": "tsc -p tsconfig.server.json",
    "test": "npm run test:unit && npm run test:integration && npm run test:e2e",
    "test:unit": "vitest run",
    "test:integration": "vitest run --config vitest.integration.config.ts",
    "test:e2e": "playwright test",
    "lint": "npm run lint:js && npm run lint:css && npm run lint:md",
    "lint:js": "eslint src --ext .js,.jsx,.ts,.tsx",
    "lint:css": "stylelint src/**/*.{css,scss,styled.ts}",
    "lint:md": "markdownlint README.md docs/**/*.md",
    "format": "prettier --write .",
    "type-check": "tsc --noEmit",
    "deps:check": "npm-check-updates",
    "deps:update": "npm-check-updates -u && npm install",
    "security:audit": "npm audit",
    "security:fix": "npm audit fix",
    "clean": "npm run clean:deps && npm run clean:cache && npm run clean:dist",
    "clean:deps": "rimraf node_modules package-lock.json",
    "clean:cache": "rimraf .cache .parcel-cache .vite",
    "clean:dist": "rimraf dist build",
    "reset": "npm run clean && npm install"
  }
}
```

```bash
#!/bin/bash
# scripts/setup-dev.sh - 开发环境设置脚本

set -e

echo "🚀 Setting up development environment..."

# 检查 Node.js 版本
if [ -f .nvmrc ]; then
  REQUIRED_NODE=$(cat .nvmrc)
  CURRENT_NODE=$(node -v)

  if [ "$CURRENT_NODE" != "$REQUIRED_NODE" ]; then
    echo "⚠️  Node.js version mismatch!"
    echo "   Required: $REQUIRED_NODE"
    echo "   Current:  $CURRENT_NODE"

    if command -v nvm &> /dev/null; then
      echo "📦 Installing and using required Node.js version..."
      nvm install $REQUIRED_NODE
      nvm use $REQUIRED_NODE
    else
      echo "❌ Please install Node.js $REQUIRED_NODE or install nvm"
      exit 1
    fi
  fi
fi

# 检查包管理器
if [ -f pnpm-lock.yaml ]; then
  PACKAGE_MANAGER="pnpm"
elif [ -f yarn.lock ]; then
  PACKAGE_MANAGER="yarn"
else
  PACKAGE_MANAGER="npm"
fi

echo "📦 Using package manager: $PACKAGE_MANAGER"

# 安装依赖
echo "📥 Installing dependencies..."
case $PACKAGE_MANAGER in
  "pnpm")
    pnpm install
    ;;
  "yarn")
    yarn install --frozen-lockfile
    ;;
  "npm")
    npm ci
    ;;
esac

# 设置 Git hooks
if [ -d .git ]; then
  echo "🪝 Setting up Git hooks..."
  npx husky install
fi

# 创建环境配置文件
if [ ! -f .env.local ]; then
  echo "📝 Creating local environment file..."
  cp .env.example .env.local
  echo "✏️  Please edit .env.local with your local settings"
fi

# 验证设置
echo "✅ Running verification checks..."
npm run type-check
npm run lint
npm run test -- --run

echo "🎉 Development environment setup complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Edit .env.local with your settings"
echo "   2. Run 'npm run dev' to start development"
echo "   3. Open http://localhost:3000 in your browser"
```

## 面试常见问题解答

### Q1: npm、yarn、pnpm 的主要区别是什么？

**核心区别：**

| 特性     | npm               | yarn      | pnpm           |
| -------- | ----------------- | --------- | -------------- |
| 安装速度 | 中等              | 快        | 最快           |
| 磁盘占用 | 高                | 中等      | 最低           |
| 锁文件   | package-lock.json | yarn.lock | pnpm-lock.yaml |
| Monorepo | 基础支持          | 强大支持  | 原生支持       |
| 兼容性   | 最好              | 好        | 好             |

### Q2: 如何解决依赖冲突问题？

**解决策略：**

1. **版本锁定**：使用确切版本号
2. **依赖提升**：使用 resolutions/overrides
3. **Peer Dependencies**：正确配置对等依赖
4. **依赖分析**：使用工具检查冲突
5. **渐进升级**：逐步升级依赖版本

### Q3: Monorepo 的优缺点是什么？

**优点：**

- 代码共享和复用
- 统一的依赖管理
- 原子性提交
- 简化 CI/CD 流程

**缺点：**

- 仓库体积大
- 构建时间长
- 权限控制复杂
- 工具链复杂度高

### Q4: 如何选择合适的包管理器？

**选择标准：**

1. **项目规模**：大型项目选 pnpm
2. **团队熟悉度**：团队经验和偏好
3. **性能要求**：高性能选 pnpm
4. **兼容性**：最大兼容性选 npm
5. **特殊需求**：Yarn 的 PnP 等特性
