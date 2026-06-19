# Expo Template Agent Guide

## Project Context

This is an Expo managed workflow template created from the blank TypeScript starter. It is intended for product apps that should move quickly without committing generated native Android and iOS projects.

## Development Rules

- Use Chinese for user-facing explanations unless the task explicitly asks for another language.
- Use pnpm for dependency management.
- Keep application code in TypeScript.
- Stay inside the Expo managed workflow by default. Only run prebuild or add native project files when the task requires native customization.
- Check the versioned Expo SDK docs before changing Expo APIs: https://docs.expo.dev/versions/v56.0.0/
- Run `pnpm check` before handing work off.

## Commands

```bash
pnpm install
pnpm start
pnpm android
pnpm ios
pnpm web
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
