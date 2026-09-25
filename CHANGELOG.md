# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.0] - 2026-09-25

### Added
- **Missing-Word Collector**: Built-in, privacy-preserving tracking of untranslated words with `getMissingWords()`, `exportMissingWords()`, `clearMissingWords()`, and `removeMissingWord()`.
- **Dynamic Dictionary Extension**: Added `extendDictionary()` to inject custom words, brand names, and vocabulary at runtime with automatic listener notification and cache invalidation.
- **Official React Integration**: Exported `useUrduMagic`, `UrduMagicProvider`, and `useUrduMagicContext` via `urdumagic/react`.
- **SSR & Next.js Support**: Added `UrduMagic.renderToString()` for Node.js HTML translation, Next.js middleware, and `urdumagic/server` / `urdumagic/next` subpath exports.
- **Admin Dashboard**: Added admin view on documentation portal for reviewing and exporting collected missing words.

### Improved
- Memory leak prevention: Added unsubscribe cleanup mechanism to dictionary listeners on instance destruction.
- Robust monorepo / Next.js bundling support with modern Webpack and TypeScript aliases.

## [0.3.0] - 2026-07-15

### Added
- **Server-Side Rendering (SSR) Engine**: High-performance HTML string parser using `node-html-parser` for pre-rendering translated pages on the server.
- **Subpath Package Exports**: Support for modular imports (`urdumagic`, `urdumagic/react`, `urdumagic/server`, `urdumagic/next`).
- **Bidirectional Script Isolation**: Added bidi isolation and automatic `dir="rtl"` layout injection.

## [0.2.0] - 2026-05-06

### Added
- **Major Architectural Refactor**: Modularized engine into `application`, `core`, and `infrastructure` layers.
- **Enterprise Middleware Pipeline**: 5-layer translation chain (Security → Cache → Routing → Execution → Persistence).
- **10,000+ Entry Dictionary**: Massive upgrade to the offline dictionary engine for $O(1)$ local lookups.
- **High-Performance DOM Scanning**: Replaced recursive traversal with native `TreeWalker` and batched processing (`requestIdleCallback`).
- **Security Hardening**: XSS sanitization, HTML entity encoding, and prototype pollution protection.
- **Distributed Cache Manager**: Smart LRU eviction and localStorage quota management.
- **Fallback Manager**: Robust multi-provider failover strategy.
- **Performance Monitoring**: Granular ID-based async timing for all pipeline operations.
- `UrduMagic.fromEnglish(text)` API method for instant offline conversion.
- Confidence scoring: `'full'` \| `'partial'` \| `'none'`.

### Improved  
- Hero demo on documentation portal now 100% offline for all three languages
- Removed internet dependency for core English → Urdu conversion tasks

[0.4.0]: https://github.com/muhammadasad/urdumagic/releases/tag/v0.4.0
[0.3.0]: https://github.com/muhammadasad/urdumagic/releases/tag/v0.3.0
[0.2.0]: https://github.com/muhammadasad/urdumagic/releases/tag/v0.2.0
[0.1.0]: https://github.com/muhammadasad/urdumagic/releases/tag/v0.1.0


