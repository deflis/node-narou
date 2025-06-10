# CLAUDE.md

返答が必要な場合は、日本語で回答してください。

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

### Building and Development
- `pnpm run build` - Build the TypeScript project using tsup
- `pnpm run build:tsc` - Run TypeScript compiler directly
- `pnpm run check` - Run all checks (lint, build, test)
- `pnpm run check:lint` - Run ESLint on source and test files
- `pnpm run check:build` - Type check without emitting files
- `pnpm run format` - Auto-fix linting issues with ESLint

### Testing
- `pnpm run test` - Run tests with Vitest
- `pnpm vitest run` - Run tests directly with Vitest

### Documentation
- `pnpm run docs` - Generate TypeDoc documentation
- `pnpm run docs:clean` - Clean documentation directory
- `pnpm run docs:typedoc` - Generate documentation with TypeDoc

### Package Management
- `pnpm install` - Install dependencies (pnpm >= 8 required)
- `pnpm dlx <command>` - Execute packages directly (used in docs generation)

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

- **tsup** - Primary build tool configured to output both CJS and ESM formats
- **TypeScript** - Targets ES2020 with strict mode enabled
- **ESLint** - Uses TypeScript ESLint configuration with Prettier integration
- **Package Manager** - Uses pnpm (required >= 8)