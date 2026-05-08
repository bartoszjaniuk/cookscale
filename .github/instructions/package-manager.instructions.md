---
name: Package Manager
description: This project uses bun as its package manager. Use bun commands instead of npm, yarn, or pnpm for installing dependencies, running scripts, and managing packages.
applyTo: "**"
---

# Package Manager — bun

This project uses **bun** as its package manager. Never use `npm`, `yarn`, or `pnpm`.

## Commands

| Instead of             | Use                |
| ---------------------- | ------------------ |
| `npm install`          | `bun install`      |
| `npm run <script>`     | `bun run <script>` |
| `npm install <pkg>`    | `bun add <pkg>`    |
| `npm install -D <pkg>` | `bun add -d <pkg>` |
| `npm uninstall <pkg>`  | `bun remove <pkg>` |
| `npx <cmd>`            | `bunx <cmd>`       |

## Lockfile

- The lockfile is `bun.lockb` — never generate or reference `package-lock.json`, `yarn.lock`, or `pnpm-lock.yaml`.
