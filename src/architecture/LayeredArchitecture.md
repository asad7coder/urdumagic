# UrduMagic Layered Architecture

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   Public API    │  │   React Hooks   │  │   DOM Magic     │  │
│  │   UrduMagic     │  │   useUrduMagic  │  │   Auto-Translate│  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                         APPLICATION LAYER                        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │  Translation    │  │  Transliteration│  │  Script         │  │
│  │  Orchestrator   │  │  Engine         │  │  Detector       │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                          CORE ENGINE LAYER                        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │  Smart Router   │  │  Strategy       │  │  Fallback       │  │
│  │  (Intelligent   │  │  Registry       │  │  Manager        │  │
│  │  Selection)     │  │                 │  │                 │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                           STRATEGY LAYER                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │  LibreTranslate │  │  Google         │  │  Secure AI      │  │
│  │  Strategy       │  │  Translate      │  │  Strategy       │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │  Custom         │  │  Offline        │  │  Future         │  │
│  │  Strategies     │  │  Strategy       │  │  Strategies     │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        INFRASTRUCTURE LAYER                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │  Cache Manager  │  │  Security       │  │  Performance    │  │
│  │  (Multi-level)  │  │  Manager        │  │  Monitor        │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │  Event System  │  │  Rate Limiter   │  │  Health Check   │  │
│  │  (Type-safe)   │  │  (Per-user)     │  │  Service        │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                            DATA LAYER                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │  Memory Cache   │  │  Local Storage  │  │  IndexedDB      │  │
│  │  (LRU)          │  │  (Persistent)   │  │  (Large Data)   │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Layer Responsibilities

### 1. Presentation Layer
- **Public API**: Main UrduMagic interface
- **React Hooks**: React integration
- **DOM Magic**: Automatic page translation
- **UI Components**: Language switcher, status indicators

### 2. Application Layer
- **Translation Orchestrator**: Coordinates translation workflows
- **Transliteration Engine**: Roman Urdu ↔ Urdu conversion
- **Script Detector**: Identifies text scripts

### 3. Core Engine Layer
- **Smart Router**: Intelligent strategy selection
- **Strategy Registry**: Manages translation strategies
- **Fallback Manager**: Handles strategy failures

### 4. Strategy Layer
- **Translation Strategies**: Individual translation implementations
- **Custom Strategies**: User-defined translation methods
- **Offline Strategy**: Fallback transliteration

### 5. Infrastructure Layer
- **Cache Manager**: Multi-level caching system
- **Security Manager**: XSS prevention, input validation
- **Performance Monitor**: Metrics and analytics
- **Event System**: Type-safe event handling
- **Rate Limiter**: Per-user request limiting
- **Health Check**: Service availability monitoring

### 6. Data Layer
- **Memory Cache**: Fast in-memory storage
- **Local Storage**: Persistent browser storage
- **IndexedDB**: Large data storage

## Data Flow

```
User Request → Presentation Layer → Application Layer → Core Engine → Strategy Layer → Infrastructure → Data Layer
                                    ↑                                                      ↓
                                    └────────────────────── Response ←─────────────────────┘
```

## Dependency Rules

1. **Upper layers depend on lower layers**
2. **Lower layers are independent of upper layers**
3. **Cross-layer communication only through interfaces**
4. **No circular dependencies**
5. **Each layer has a single responsibility**

## Benefits

- **Maintainability**: Clear separation of concerns
- **Testability**: Each layer can be tested independently
- **Scalability**: Layers can be optimized independently
- **Flexibility**: Easy to replace or extend layers
- **Security**: Isolated security boundaries
- **Performance**: Optimized data flow

## Migration Path

1. **Phase 1**: Extract infrastructure components
2. **Phase 2**: Refactor core engine
3. **Phase 3**: Implement strategy layer
4. **Phase 4**: Update application layer
5. **Phase 5**: Migrate presentation layer
