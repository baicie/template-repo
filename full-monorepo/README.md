# Full Stack Monorepo Template

This is a comprehensive monorepo template supporting multiple platforms.

## Structure

- **apps/**
  - `web`: Web Application (Vite + React + TS)
  - `desktop`: Desktop Application (Electron + React + TS)
  - `backend`: Backend Application (NestJS + Docker)
  - `mobile`: Mobile Application (React Native + Expo)
  - `miniprogram`: Mini Program (Taro + React)
  - `vscode-ext`: VSCode Extension
  - `browser-ext`: Browser Extension (Manifest V3)

- **packages/**
  - `ui`: Shared React UI Components
  - `utils`: Shared Utility Functions
  - `tsconfig`: Shared TypeScript Configuration

## Getting Started

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Run development servers:
   ```bash
   pnpm dev
   ```

## Deployment

### Docker

To deploy the Web App and Backend using Docker:

```bash
./deploy.sh
```

Or manually:

```bash
docker-compose up -d --build
```

- Web App: http://localhost:8080
- Backend: http://localhost:3001

## Features

- **Monorepo**: Managed by pnpm workspaces.
- **Shared Code**: UI components and utility functions shared across web, mobile, and extensions.
- **Docker Ready**: Backend and Web apps are containerized.
- **Cross-Platform**: Covers Web, Desktop (Electron), Mobile, Mini Program, VSCode, and Browser Extensions.
