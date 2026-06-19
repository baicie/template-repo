# React Native Template Agent Guide

## Project Context

This is a native React Native template created with React Native CLI. It keeps the generated Android and iOS projects in the repository so platform-specific changes can be made directly when needed.

## Development Rules

- Use Chinese for user-facing explanations unless the task explicitly asks for another language.
- Use pnpm for dependency management.
- Keep application code in TypeScript.
- Treat `android/` and `ios/` as generated platform projects. Edit them only for native capability, build, signing, or platform configuration work.
- Prefer small, testable changes. Run `pnpm check` before handing work off.

## Commands

```bash
pnpm install
pnpm start
pnpm android
pnpm ios
pnpm type-check
pnpm lint
pnpm format
pnpm test
pnpm check
```

## AI Skills

- Project-level skills live in `.agents/skills`.
- `skills-lock.json` records the external skill sources expected by this template.
- Run the repository-level `node scripts/install-skills.js` from the template repository root after adding this template to refresh project-level skills.

## Git Workflow

- Branch names should use `feat/*`, `fix/*`, `docs/*`, `refactor/*`, `test/*`, `ci/*`, or `chore/*`.
- Commit messages must follow Conventional Commits, for example `feat(app): add onboarding`.
- The pre-commit hook runs lint-staged and TypeScript checks.
