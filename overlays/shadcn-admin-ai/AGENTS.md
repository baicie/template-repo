# AI Collaboration Rules

- Preserve the upstream project structure unless the task requires a change.
- Reuse existing shadcn/ui components and design tokens before adding dependencies.
- Keep server-only code, secrets, and environment variables outside client components.
- Add focused tests when changing behavior and run the narrowest relevant checks.
- Do not commit generated output, credentials, or local environment files.
