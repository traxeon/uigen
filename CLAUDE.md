# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UIGen is an AI-powered React component generator with live preview. Users describe components in natural language, Claude generates them via tool calls, and the result is previewed in a sandboxed iframe using a virtual file system (no files written to disk).

## Commands

```bash
npm run setup        # Initial setup: install deps + Prisma generate + migrate
npm run dev          # Development server with Turbopack
npm run build        # Production build
npm run lint         # ESLint
npm run test         # Vitest (all tests)
npx vitest run src/path/to/file.test.ts  # Single test file
npm run db:reset     # Reset SQLite database (destructive)
```

Environment: copy `.env.example` to `.env` and set `ANTHROPIC_API_KEY`. Without it, a mock provider is used automatically.

## Architecture

### Request Flow

1. User types in `ChatInterface` → `ChatProvider` sends POST to `/api/chat` with file system state
2. `/api/chat/route.ts` calls Claude (Haiku 4.5) with two tools: `str_replace_editor` and `file_manager`
3. Claude responds with tool calls that create/modify files; tool results stream back to client
4. Client-side tool call handler in `ChatProvider` updates `FileSystemProvider` (in-memory VFS)
5. `PreviewFrame` detects file changes → Babel transpiles JSX → creates blob URL import map → renders in sandboxed iframe
6. On stream completion, if authenticated, project state (messages + VFS) is serialized and saved to SQLite via server action

### Key Modules

**`src/lib/file-system.ts`** — `VirtualFileSystem` class: in-memory tree, supports create/read/update/delete/rename, serializes to JSON for DB persistence.

**`src/lib/transform/jsx-transformer.ts`** — Babel standalone transpilation of JSX/TSX files, generates dynamic import maps with blob URLs for dependency resolution in the preview iframe.

**`src/lib/tools/`** — AI tool definitions:
- `str-replace.ts`: `str_replace_editor` tool (view, create, str_replace, insert operations on files)
- `file-manager.ts`: `file_manager` tool (rename, delete)

**`src/lib/provider.ts`** — Selects Anthropic provider or `MockLanguageModel` fallback based on `ANTHROPIC_API_KEY`.

**`src/lib/prompts/generation.tsx`** — System prompt for component generation. Uses Anthropic ephemeral cache control.

**`src/lib/contexts/`** — Two primary React contexts:
- `chat-context.tsx`: manages messages, streaming, tool call handling, project save logic
- `file-system-context.tsx`: wraps `VirtualFileSystem`, exposes file operations to components

**`src/app/api/chat/route.ts`** — Single API route; uses Vercel AI SDK `streamText` with tool calls.

**`src/actions/`** — Next.js server actions for auth and project CRUD (SQLite via Prisma).

**`src/middleware.ts`** — JWT session verification; protects project routes.

### Data Model

```
User: id, email, password (bcrypt), createdAt, updatedAt
Project: id, name, userId (optional — anonymous projects), messages (JSON), data (JSON VFS state)
```

### Preview Mechanism

`PreviewFrame` uses `@babel/standalone` (loaded via `node-compat.cjs` shim for Node.js compat in Next.js 15). Entry point detection order: `App.tsx` → `App.jsx` → `index.tsx` → `index.jsx`. All imports are resolved through a dynamic import map using blob URLs.

## Testing

Tests use Vitest + jsdom + React Testing Library. Test files are co-located in `__tests__/` directories next to source. The `@/*` path alias resolves to `src/*` (configured in `vitest.config.mts`).

## Tech Stack Notes

- **Next.js 15 App Router** with React 19 — use server components and server actions where possible
- **Tailwind CSS v4** — configuration is in CSS, not `tailwind.config.js`
- **Prisma** with SQLite (`prisma/dev.db`) — run `npx prisma generate` after schema changes; `prisma/schema.prisma` is the source of truth for database structure
- **shadcn/ui** (New York style, Lucide icons) — components in `src/components/ui/`
- **Vercel AI SDK** (`ai` package) — `streamText`, `tool`, message types
