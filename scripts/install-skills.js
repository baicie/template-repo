#!/usr/bin/env node
/**
 * Install mattpocock/skills into all template projects (Cursor project-level)
 * Writes skill files directly by reading from GitHub raw URLs.
 */
"use strict";
const fs = require("fs");
const path = require("path");
const https = require("https");

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetch(res.headers.location).then(resolve).catch(reject);
      }
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve(data));
    }).on("error", reject);
  });
}

const repoRoot = "d:\\workspace\\git-code\\template-repo";
const templates = [
  "api-server", "default", "electron-app", "full-monorepo",
  "expo-template", "godot-template", "interview", "micro-frontend-starter", "monorepo",
  "node-typescript", "novel-ai", "plasmo", "shadcn-app",
  "react-native-template", "shadcn-standalone", "simple-node-ts",
  "taro-default-template", "universal-agent", "vue3"
];

const GITHUB_RAW = "https://raw.githubusercontent.com/mattpocock/skills/main";

const skillDefs = [
  { name: "caveman", files: [{ dest: "SKILL.md", src: `${GITHUB_RAW}/skills/productivity/caveman/SKILL.md` }] },
  { name: "diagnose", files: [
    { dest: "SKILL.md", src: `${GITHUB_RAW}/skills/engineering/diagnose/SKILL.md` },
    { dest: "references/hitl-loop.template.sh", src: `${GITHUB_RAW}/skills/engineering/diagnose/scripts/hitl-loop.template.sh` },
  ]},
  { name: "grill-me", files: [{ dest: "SKILL.md", src: `${GITHUB_RAW}/skills/productivity/grill-me/SKILL.md` }] },
  { name: "grill-with-docs", files: [
    { dest: "SKILL.md", src: `${GITHUB_RAW}/skills/engineering/grill-with-docs/SKILL.md` },
    { dest: "references/ADR-FORMAT.md", src: `${GITHUB_RAW}/skills/engineering/grill-with-docs/ADR-FORMAT.md` },
    { dest: "references/CONTEXT-FORMAT.md", src: `${GITHUB_RAW}/skills/engineering/grill-with-docs/CONTEXT-FORMAT.md` },
  ]},
  { name: "handoff", files: [{ dest: "SKILL.md", src: `${GITHUB_RAW}/skills/productivity/handoff/SKILL.md` }] },
  { name: "improve-codebase-architecture", files: [
    { dest: "SKILL.md", src: `${GITHUB_RAW}/skills/engineering/improve-codebase-architecture/SKILL.md` },
    { dest: "references/LANGUAGE.md", src: `${GITHUB_RAW}/skills/engineering/improve-codebase-architecture/LANGUAGE.md` },
    { dest: "references/INTERFACE-DESIGN.md", src: `${GITHUB_RAW}/skills/engineering/improve-codebase-architecture/INTERFACE-DESIGN.md` },
    { dest: "references/DEEPENING.md", src: `${GITHUB_RAW}/skills/engineering/improve-codebase-architecture/DEEPENING.md` },
  ]},
  { name: "prototype", files: [
    { dest: "SKILL.md", src: `${GITHUB_RAW}/skills/engineering/prototype/SKILL.md` },
    { dest: "references/LOGIC.md", src: `${GITHUB_RAW}/skills/engineering/prototype/LOGIC.md` },
    { dest: "references/UI.md", src: `${GITHUB_RAW}/skills/engineering/prototype/UI.md` },
  ]},
  { name: "setup-matt-pocock-skills", files: [
    { dest: "SKILL.md", src: `${GITHUB_RAW}/skills/engineering/setup-matt-pocock-skills/SKILL.md` },
    { dest: "references/domain.md", src: `${GITHUB_RAW}/skills/engineering/setup-matt-pocock-skills/domain.md` },
    { dest: "references/issue-tracker-github.md", src: `${GITHUB_RAW}/skills/engineering/setup-matt-pocock-skills/issue-tracker-github.md` },
    { dest: "references/issue-tracker-gitlab.md", src: `${GITHUB_RAW}/skills/engineering/setup-matt-pocock-skills/issue-tracker-gitlab.md` },
    { dest: "references/issue-tracker-local.md", src: `${GITHUB_RAW}/skills/engineering/setup-matt-pocock-skills/issue-tracker-local.md` },
    { dest: "references/triage-labels.md", src: `${GITHUB_RAW}/skills/engineering/setup-matt-pocock-skills/triage-labels.md` },
  ]},
  { name: "tdd", files: [
    { dest: "SKILL.md", src: `${GITHUB_RAW}/skills/engineering/tdd/SKILL.md` },
    { dest: "references/deep-modules.md", src: `${GITHUB_RAW}/skills/engineering/tdd/deep-modules.md` },
    { dest: "references/interface-design.md", src: `${GITHUB_RAW}/skills/engineering/tdd/interface-design.md` },
    { dest: "references/mocking.md", src: `${GITHUB_RAW}/skills/engineering/tdd/mocking.md` },
    { dest: "references/refactoring.md", src: `${GITHUB_RAW}/skills/engineering/tdd/refactoring.md` },
    { dest: "references/tests.md", src: `${GITHUB_RAW}/skills/engineering/tdd/tests.md` },
  ]},
  { name: "to-issues", files: [{ dest: "SKILL.md", src: `${GITHUB_RAW}/skills/engineering/to-issues/SKILL.md` }] },
  { name: "to-prd", files: [{ dest: "SKILL.md", src: `${GITHUB_RAW}/skills/engineering/to-prd/SKILL.md` }] },
  { name: "triage", files: [
    { dest: "SKILL.md", src: `${GITHUB_RAW}/skills/engineering/triage/SKILL.md` },
    { dest: "references/AGENT-BRIEF.md", src: `${GITHUB_RAW}/skills/engineering/triage/AGENT-BRIEF.md` },
    { dest: "references/OUT-OF-SCOPE.md", src: `${GITHUB_RAW}/skills/engineering/triage/OUT-OF-SCOPE.md` },
  ]},
  { name: "write-a-skill", files: [{ dest: "SKILL.md", src: `${GITHUB_RAW}/skills/productivity/write-a-skill/SKILL.md` }] },
  { name: "zoom-out", files: [{ dest: "SKILL.md", src: `${GITHUB_RAW}/skills/engineering/zoom-out/SKILL.md` }] },
  { name: "git-guardrails-claude-code", files: [
    { dest: "SKILL.md", src: `${GITHUB_RAW}/skills/misc/git-guardrails-claude-code/SKILL.md` },
    { dest: "scripts/block-dangerous-git.sh", src: `${GITHUB_RAW}/skills/misc/git-guardrails-claude-code/scripts/block-dangerous-git.sh` },
  ]},
  { name: "migrate-to-shoehorn", files: [{ dest: "SKILL.md", src: `${GITHUB_RAW}/skills/misc/migrate-to-shoehorn/SKILL.md` }] },
  { name: "scaffold-exercises", files: [{ dest: "SKILL.md", src: `${GITHUB_RAW}/skills/misc/scaffold-exercises/SKILL.md` }] },
  { name: "setup-pre-commit", files: [{ dest: "SKILL.md", src: `${GITHUB_RAW}/skills/misc/setup-pre-commit/SKILL.md` }] },
];

// skill name -> frontmatter description (for skills.json)
const skillDescriptions = {
  caveman: "Ultra-compressed communication mode. Cuts token usage ~75% by dropping filler, articles, and pleasantries while keeping full technical accuracy. Use when user says \"caveman mode\", \"talk like caveman\", \"use caveman\", \"less tokens\", \"be brief\", or invokes /caveman.",
  diagnose: "Disciplined diagnosis loop for hard bugs and performance regressions. Reproduce \u2192 minimise \u2192 hypothesise \u2192 instrument \u2192 fix \u2192 regression-test. Use when user says \"diagnose this\" / \"debug this\", reports a bug, says something is broken/throwing/failing, or describes a performance regression.",
  "grill-me": "Interview the user relentlessly about a plan or design until reaching shared understanding, resolving each branch of the decision tree. Use when user wants to stress-test a plan, get grilled on their design, or mentions \"grill me\".",
  "grill-with-docs": "Grilling session that challenges your plan against the existing domain model, sharpens terminology, and updates documentation (CONTEXT.md, ADRs) inline as decisions crystallise. Use when user wants to stress-test a plan against their project's language and documented decisions.",
  handoff: "Compact the current conversation into a handoff document for another agent to pick up. Use when user wants to hand off to another agent or session.",
  "improve-codebase-architecture": "Find deepening opportunities in a codebase, informed by the domain language in CONTEXT.md and the decisions in docs/adr/. Use when the user wants to improve architecture, find refactoring opportunities, consolidate tightly-coupled modules, or make a codebase more testable and AI-navigable.",
  prototype: "Build a throwaway prototype to flesh out a design before committing to it. Routes between two branches \u2014 a runnable terminal app for state/business-logic questions, or several radically different UI variations toggleable from one route. Use when the user wants to prototype, sanity-check a data model or state machine, mock up a UI, explore design options, or says \"prototype this\", \"let me play with it\", \"try a few designs\".",
  "setup-matt-pocock-skills": "Sets up an Agent skills block in AGENTS.md/CLAUDE.md and docs/agents/ so the engineering skills know this repo's issue tracker (GitHub or local markdown), triage label vocabulary, and domain doc layout. Run before first use of to-issues, to-prd, triage, diagnose, tdd, improve-codebase-architecture, or zoom-out.",
  tdd: "Test-driven development with red-green-refactor loop. Use when user wants to build features or fix bugs using TDD, mentions \"red-green-refactor\", wants integration tests, or asks for test-first development.",
  "to-issues": "Break a plan, spec, or PRD into independently-grabbable issues on the project issue tracker using tracer-bullet vertical slices. Use when user wants to convert a plan into issues, create implementation tickets, or break down work into issues.",
  "to-prd": "Turn the current conversation context into a PRD and publish it to the project issue tracker. Use when user wants to create a PRD from the current context.",
  triage: "Triage issues through a state machine driven by triage roles. Use when user wants to create an issue, triage issues, review incoming bugs or feature requests, prepare issues for an AFK agent, or manage issue workflow.",
  "write-a-skill": "Create new agent skills with proper structure, progressive disclosure, and bundled resources. Use when user wants to create, write, or build a new skill.",
  "zoom-out": "Tell the agent to zoom out and give broader context or a higher-level perspective. Use when you're unfamiliar with a section of code or need to understand how it fits into the bigger picture.",
  "git-guardrails-claude-code": "Set up Claude Code hooks to block dangerous git commands (push, reset --hard, clean, branch -D, etc.) before they execute. Use when user wants to prevent destructive git operations, add git safety hooks, or block git push/reset in Claude Code.",
  "migrate-to-shoehorn": "Migrate test files from `as` type assertions to @total-typescript/shoehorn. Use when user mentions shoehorn, wants to replace `as` in tests, or needs partial test data.",
  "scaffold-exercises": "Create exercise directory structures with sections, problems, solutions, and explainers that pass linting. Use when user wants to scaffold exercises, create exercise stubs, or set up a new course section.",
  "setup-pre-commit": "Set up Husky pre-commit hooks with lint-staged (Prettier), type checking, and tests in the current repo. Use when user wants to add pre-commit hooks, set up Husky, configure lint-staged, or add commit-time formatting/typechecking/testing.",
};

async function main() {
  // Fetch all files once
  console.log("Fetching skill files from GitHub...");
  const allFiles = [];
  for (const def of skillDefs) {
    for (const f of def.files) {
      try {
        const content = await fetch(f.src);
        allFiles.push({ skill: def.name, dest: f.dest, content });
      } catch (e) {
        console.error(`  FAIL: ${f.src} - ${e.message}`);
      }
    }
  }
  console.log(`Fetched ${allFiles.length} files.\n`);

  // Install into each template
  let totalFiles = 0;
  for (const template of templates) {
    const skillsDir = path.join(repoRoot, template, ".agents", "skills");
    fs.mkdirSync(skillsDir, { recursive: true });

    for (const { skill, dest, content } of allFiles) {
      const skillDir = path.join(skillsDir, skill);
      fs.mkdirSync(skillDir, { recursive: true });
      const filePath = path.join(skillDir, dest);
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, content, "utf8");
      totalFiles++;
    }

    // Write skills.json
    const skillsJson = { version: 1, skills: {} };
    for (const def of skillDefs) {
      skillsJson.skills[def.name] = {
        source: "mattpocock/skills",
        sourceType: "github",
        description: skillDescriptions[def.name],
      };
    }
    fs.writeFileSync(
      path.join(skillsDir, "skills.json"),
      JSON.stringify(skillsJson, null, 2),
      "utf8"
    );

    console.log(`[${template}] Installed ${skillDefs.length} skills (${allFiles.length} files)`);
  }

  console.log(`\nDone! ${totalFiles} skill files + ${templates.length} skills.json written across ${templates.length} templates.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
