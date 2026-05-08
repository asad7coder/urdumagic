# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

[0.2.0]: https://github.com/muhammadasad/urdumagic/releases/tag/v0.2.0
[0.1.0]: https://github.com/muhammadasad/urdumagic/releases/tag/v0.1.0

