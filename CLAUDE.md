# CLAUDE.md

返答が必要な場合は、日本語で回答してください。

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

### Building and Development
- `pnpm run build` - Build the TypeScript project using tsdown
- `pnpm run build:tsc` - Build library bundles and declarations with tsdown
- `pnpm run check` - Run all checks (lint, types, tests)
- `pnpm run check:lint` - Run type-aware Oxlint on source and test files
- `pnpm run check:build` - Type check without emitting files
- `pnpm run format` - Auto-fix with Oxlint and format with Oxfmt

### Testing
- `pnpm run test` - Run tests with Vitest
- `pnpm vitest run` - Run tests directly with Vitest

### Documentation
- `pnpm run docs` - Generate TypeDoc documentation
- `pnpm run docs:clean` - Clean documentation directory
- `pnpm run docs:typedoc` - Generate documentation with TypeDoc

### Package Management
- `pnpm install` - Install dependencies (Node.js >= 24.11 and pnpm >= 12.16.1 required)
- Documentation tools are locked in the `tools/docs` workspace (TypeDoc with TypeScript 6); application checks use TypeScript 7.

## Code Architecture

This is a TypeScript library that provides a fluent interface wrapper for the Narou (小説家になろう) developer APIs. The library supports both Node.js (using fetch) and browser environments (using JSONP).

### Core Architecture Components

**Dual Environment Support:**
- `src/index.ts` - Node.js entry point using `NarouNovelFetch` (fetch-based)
- `src/index.browser.ts` - Browser entry point using `NarouNovelJsonp` (JSONP-based)
- Both share common builder patterns and types through `src/index.common.ts`

**Builder Pattern Implementation:**
- `SearchBuilderBase` - Abstract base class for all search builders
- `NovelSearchBuilderBase` - Base class for novel-specific search functionality
- `SearchBuilder` - Main novel search builder
- `SearchBuilderR18` - R18 novel search builder  
- `RankingBuilder` - Ranking API builder
- `UserSearchBuilder` - User search builder

**API Abstraction:**
- `NarouNovel` (abstract) - Base class defining API contract
- `NarouNovelFetch` - Node.js implementation using fetch
- `NarouNovelJsonp` - Browser implementation using JSONP

**API Endpoints Supported:**
- Novel Search API (`https://api.syosetu.com/novelapi/api/`)
- R18 Novel API (`https://api.syosetu.com/novel18api/api/`)
- Ranking API (`https://api.syosetu.com/rank/rankget/`)
- Ranking History API (`https://api.syosetu.com/rank/rankin/`)
- User Search API (`https://api.syosetu.com/userapi/api/`)

### Key Design Patterns

**Fluent Interface:** All builders use method chaining for parameter building (e.g., `search("word").genre(Genre.Fantasy).order(Order.New).execute()`)

**Type Safety:** Extensive use of TypeScript generics to ensure type-safe field selection and results

**Dual Export Strategy:** The package exports different entry points for different environments via package.json exports field

### Testing Strategy

Tests use Vitest with MSW (Mock Service Worker) for API mocking. Tests are organized by feature with corresponding `.test.ts` files in the `test/` directory.

## Build Configuration

- **tsdown** - Primary build tool configured to output both CJS and ESM formats
- **TypeScript** - Targets ES2020 with strict mode enabled
- **Oxlint / Oxfmt** - Type-aware linting and explicit formatting
- **Package Manager** - Uses pnpm (required >= 12.16.1)

Library runtime support is Node.js >= 16, separate from development tool requirements. Inject a fetch implementation on Node.js 16. Use `pnpm run test:runtime` to check the built ESM/CJS bundles without development dependencies. Avoid unrelated bulk formatting during dependency updates; Oxfmt runs explicitly through `pnpm run format`.
