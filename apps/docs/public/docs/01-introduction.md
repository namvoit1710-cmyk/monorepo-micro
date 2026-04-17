# Introduction

Welcome to **LDC Frontend** — a modern, production-grade micro frontend platform built for scalability, developer experience, and long-term maintainability.

## What is LDC Frontend?

LDC Frontend is a **monorepo-based micro frontend system** that powers a suite of enterprise applications including:

- **AI Assistants & Agent** — Conversational AI with workflow execution
- **Workflow Editor** — Visual node-based workflow builder
- **Dashboard** — Analytics and reporting
- **User & Feature Management** — RBAC-ready admin features

The platform is designed around the principle of **independent deployability** — each application (called a *remote*) can be developed, built, and deployed separately, while sharing a unified design system, component library, and infrastructure layer.

---

## Key Design Principles

### 🧩 Micro Frontend Architecture
Apps are isolated via **Module Federation v2**. The `shell` app acts as the host, loading remote apps (e.g., `dashboard`) at runtime without tight coupling.

### 📦 Monorepo with Shared Packages
All apps share packages for UI, data fetching, i18n, form handling, and more — managed via **Bun Workspaces** and **Turborepo**.

### 🔒 Type Safety End-to-End
The entire codebase is written in **TypeScript 5.x** with strict mode enabled. API contracts are validated with **Zod** schemas.

### ⚡ Performance First
- **Rsbuild** (Rspack-based) for near-instant builds
- **TanStack Query** for smart server-state caching
- **Lazy loading** across all routes and remote apps

### 🌐 Internationalization Ready
Built-in i18n support via `@ldc/i18n` (`i18next` + `react-i18next`), shared as a singleton across all remotes.

---

## Who Is This For?

| Audience | What you'll find |
|---|---|
| **Frontend Developers** | Component APIs, feature patterns, coding conventions |
| **New Team Members** | Installation guide, project structure, key concepts |
| **Architects** | System design, Module Federation topology, data flow |
| **DevOps / Platform** | Build pipeline, Turborepo tasks, deployment targets |

---

## Repository Overview

```
@ldc-fe/root
├── apps/           # Deployable applications (shell, dashboard, ...)
├── packages/       # Shared libraries (@ldc/ui, @ldc/api-sdk, ...)
├── tooling/        # Shared configs (eslint, prettier, tailwind, tsconfig)
└── turbo.json      # Turborepo task pipeline
```

> **Package Manager:** `bun@1.3.11`  
> **Build Orchestrator:** `turbo@2.x`

---

## Quick Links

- [Installation Guide](./installation)
- [Project Structure](./structure)
- [Tech Stack](./tech-stack)
- [Packages & APIs](./packages-and-apis)
