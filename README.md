# Template Repository

This repository contains local starter projects and a curated catalog of upstream templates.

## Upstream Templates

The catalog keeps an upstream repository, the branch it follows, and a pinned commit. Creating a project always checks out the pinned commit, so the result is reproducible. Custom content belongs in an overlay, not in a fork of the upstream project.

```bash
npm run templates:list
npm run templates:create -- shadcn-admin-ai ./my-admin
```

The generated project includes `.template-origin.json`, which records its upstream revision and applied overlay.

To inspect available upstream updates without modifying files:

```bash
npm run templates:sync
```

To update pinned revisions after review:

```bash
npm run templates:sync -- --write
```

`shadcn-admin-ai` starts from the MIT-licensed `satnaing/shadcn-admin` repository and overlays AI collaboration guidance in `overlays/shadcn-admin-ai`. Add a new curated upstream by adding an entry to `catalog/templates.json` and, when needed, an overlay directory. Do not edit the cloned upstream tree directly.

## Verification

```bash
npm run templates:verify
npm run test:catalog
npm run templates:smoke
```

The metadata smoke tier copies and validates every local template. The core tier performs real dependency installation and builds for representative Node templates:

```bash
node scripts/smoke-templates.mjs --tier core --run
```

GitHub Actions runs the metadata tier for every pull request, runs real core installs and builds, checks the AI overlay against its pinned upstream, and opens a reviewable PR when an upstream revision changes. Dependabot owns dependency update PRs; the scheduled dependency workflow is report-only.
