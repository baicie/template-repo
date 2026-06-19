# Expo Template

Expo managed workflow template with TypeScript, pnpm, ESLint, Prettier, Jest, Git hooks, GitHub Actions, and project-level AI agent conventions.

## Quick Start

```bash
pnpm install
pnpm start
```

Run on a target:

```bash
pnpm android
pnpm ios
pnpm web
```

## Quality Commands

```bash
pnpm type-check
pnpm lint
pnpm format
pnpm test
pnpm check
```

## Project Structure

```text
expo-template/
|-- .agents/skills/          # Project-level AI skills
|-- .github/workflows/ci.yml # Template CI
|-- assets/                  # Expo assets
|-- scripts/                 # Local automation
|-- __tests__/               # Jest tests
|-- AGENTS.md                # AI collaboration guide
|-- App.tsx                  # App root
|-- app.json                 # Expo app config
|-- eslint.config.js         # ESLint flat config
`-- package.json
```

## Notes

- This template targets Expo SDK 56.
- Keep native code out of the repository unless the app intentionally moves away from the managed workflow.
- Run the root repository `node scripts/install-skills.js` when project-level skills need to be refreshed.
