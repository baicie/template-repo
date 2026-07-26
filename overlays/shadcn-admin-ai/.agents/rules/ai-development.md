# Project Rules

## Scope

- Make small, reviewable changes that preserve the dashboard's existing conventions.
- Prefer composition of existing components over one-off UI primitives.
- Keep accessibility attributes and keyboard behavior intact when changing UI.

## Validation

- Run formatting, type checking, and the smallest relevant test command before completion.
- State any validation that could not run and why.

## Safety

- Do not expose secrets in browser code or commit local environment files.
- Treat API response data as untrusted and validate it at application boundaries.
