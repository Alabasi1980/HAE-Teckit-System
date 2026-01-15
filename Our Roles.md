# Gemini App — Development Rules & Guidelines

This document serves as the official guide for the development of **Gemini App**. Its purpose is to ensure consistency, maintainability, and high quality throughout the project's lifecycle. All new development must adhere to these rules.

---

## 1. Folder Structure (System-Based Architecture)

To ensure a scalable and maintainable codebase, the project follows a **System-Based** (Feature-Based) architecture. All code is organized by its functional domain (“system”) rather than by its type (e.g., components, services).

### Core Principles

- **High Cohesion:** All files related to a single feature/domain should reside within the same system folder.
- **Low Coupling:** Systems should be as independent as possible, interacting through well-defined service APIs rather than direct component dependencies.

### Directory Layout

```txt
src
├── systems/
│   ├── auth/               // Login, registration, sessions, permissions
│   │   ├── components/
│   │   ├── services/
│   │   └── index.ts        // Public API (exports)
│   ├── profile/            // User profile, preferences, account data
│   │   ├── components/
│   │   ├── services/
│   │   └── index.ts
│   ├── content/            // Main content domain (lists, details, workflows)
│   │   ├── components/
│   │   ├── services/
│   │   └── index.ts
│   ├── settings/           // Settings pages and configuration UI
│   │   ├── components/
│   │   ├── services/
│   │   └── index.ts
│   ├── notifications/      // Inbox, toasts, push notifications
│   │   ├── components/
│   │   ├── services/
│   │   └── index.ts
│   └── app-shell/          // Layout, navigation, guards, shell UI
│       ├── components/
│       ├── services/
│       └── index.ts
│
├── shared/
│   ├── services/           // Cross-system services (ApiClient, CacheService, etc.)
│   ├── components/         // Reusable UI components (used by 2+ systems)
│   └── types/              // Global types/contracts (app.types.ts)
│
├── styles/
│   ├── auth/
│   ├── profile/
│   ├── content/
│   ├── ...                 // Other system-specific styles
│   ├── shared.css          // Styles shared across multiple systems
│   └── styles.css          // Main CSS entry point importing all others
│
└── app.component.ts        // Root component: layout + top-level navigation
```

### Rules

1. **New Features:** When adding a new major feature/domain, create a new folder under `src/systems/`.
2. **Shared Code:** If logic, types, or UI components are needed by **more than two** systems, move them to `src/shared/`. Avoid premature abstraction.
3. **Cross-System Communication:** Systems may interact by injecting services across systems. This must be done through stable service APIs.
4. **Public API Only:** Each system must expose what it shares via `src/systems/<system>/index.ts`. Do not import from another system’s internal paths (“deep imports”).

---

## 2. Styling (Centralized CSS)

To maintain a consistent look and simplify theme management, all custom CSS is centralized under `src/styles`.

### Core Principles

- **Single Source of Truth:** All non-framework CSS lives in `src/styles`.
- **Global Scope:** All styles are global. Use specific selectors to avoid side effects.
- **Mirrored Organization:** Style folders mirror the `systems` structure.

### Rules

1. **NO Component-Scoped Styles:** Do NOT use `styles` or `styleUrls` in `@Component`.
2. **NO Inline `<style>` Blocks:** Do NOT write `<style>` blocks in templates.
3. **File Location:**
   - System-specific styles go under `src/styles/<system>/`.
   - Shared styles go in `src/styles/shared.css`.
4. **Main Import File:** All new CSS files must be imported into `src/styles/styles.css`.

---

## 3. State Management (Signals)

Angular Signals are the primary tool for state management to ensure a reactive, performant, and maintainable application.

### Core Principles

- **Single Source of Truth:** State lives in signals within services (shared/global) or components (local UI). Avoid duplication.
- **Reactivity:** UI must react to state changes automatically. Avoid manual syncing.

### Rules

1. **Use `signal()` for State:** All mutable state must be stored in `signal()`.
2. **Use `computed()` for Derived Data:** Any derivable state must be computed, not stored separately.
3. **Use `effect()` for Side Effects:** Use effects for logging, network triggers, and integrations. Keep effects minimal and prefer services.
4. **Immutability:** When updating arrays/objects in signals, always return a new instance. Never mutate in place.

---

## 4. Data, API, and Models

To keep the application adaptable and maintainable, data flow and contracts must be explicit and consistent.

### Rules

1. **Clear Separation:**
   - **API DTOs** (transport contracts)
   - **Domain Models** (business rules)
   - **View Models** (UI-specific shaping)
2. **Central API Client:** Use a shared `ApiClient` (and related network utilities) in `src/shared/services/`.
3. **Consistent Error Handling:** Use a consistent approach for mapping API errors into user-facing messages and recoverable states.
4. **Caching Strategy:** Apply caching deliberately (where needed) using shared utilities and clear invalidation rules.

---

## 5. Data-Driven Pages Rule (DB-Backed Dynamic Values)

To avoid code changes for routine value/content updates, the application must be data-driven where appropriate.

### Rules

1. **DB as Source of Truth:** Any page that relies on values expected to change (text, labels, pricing, limits, ordering, display rules, options, messages, configuration) must read these values from an API backed by a database.
2. **Persist Changes via API:** Updates to these values must be persisted via API into the database. Do not require code changes for routine adjustments.
3. **No Hardcoding:** Do not hardcode change-prone values in the UI or services. Only allow **defaults/fallbacks** for safe degradation.
4. **Separate Config from UI Logic:** Keep UI behavior and rendering logic in code; store content/configuration in the database.
5. **Explicit Contracts:** Define clear DTO contracts (and versioning when needed) for each page’s configuration/content payload.

---

## 6. RxJS Usage Policy

Signals are primary, but RxJS may be used for streams and HTTP flows.

### Rules

1. **Prefer Services for Subscriptions:** Keep subscriptions inside services/facades where possible.
2. **Avoid `subscribe()` in Components:** If necessary, use `takeUntilDestroyed()` and keep it UI-local and short-lived.
3. **Bridge Streams to Signals:** Convert streams to signals when appropriate (e.g., `toSignal`) or consolidate stream orchestration inside a facade.

---

## 7. Facade/Store per System

Each system should provide a single orchestration layer for state and operations.

### Rules

1. **Single Entry Point:** Provide `XStore` or `XFacade` for coordinating signals, derived state, and commands.
2. **Pages Use the Facade:** Smart components should primarily depend on the system facade/store, not multiple low-level services.

---

## 8. Component Design

Components should be small, efficient, and single-purpose.

### Rules

1. **`OnPush` Everywhere:** All components must use `ChangeDetectionStrategy.OnPush`.
2. **Use `input()` and `output()` APIs:** Prefer modern `input()` / `output()` over decorators where possible.
3. **Single Responsibility:** Split large components into smaller ones.
4. **Smart vs. Dumb Components:**
   - **Smart (Pages):** Inject facades/services, coordinate data.
   - **Dumb (UI):** Receive data via inputs and emit events via outputs. No direct domain service injection.
5. **No Logic in Templates:** Keep templates simple. Use computed signals and class methods for logic.

---

## 9. Routing & Navigation

Routing must remain structured and scalable.

### Rules

1. **System Routes:** Each system owns its routing definitions (e.g., `routes.ts`).
2. **Lazy Loading by Default:** Use lazy loading for large systems and route groups.
3. **Guards/Resolvers Placement:** Keep them in the owning system or in `app-shell` if cross-cutting.

---

## 10. Error Handling, Logging, and Observability

The app must be diagnosable in development and production.

### Rules

1. **Central Error Handling:** Use a global error handling strategy and consistent error-to-message mapping.
2. **Logging Policy:** Structured logging is allowed; never log sensitive data.
3. **Analytics Isolation:** Track events through a dedicated analytics system/service with clear event contracts.

---

## 11. Security & Privacy

Security is a default requirement.

### Rules

1. **Token/Storage Policy:** Define where tokens can be stored and how they are refreshed/invalidated.
2. **No PII in Logs/Analytics:** Prevent sensitive data exposure.
3. **Sanitization:** Sanitize/validate user-controlled content (HTML/URLs) when applicable.

---

## 12. Testing & Quality Gates

Quality must be enforced continuously.

### Rules

1. **Minimum Coverage Expectations:**
   - Unit tests for services, stores, and computed logic.
   - Component tests for critical UI.
   - E2E tests for core user journeys.
2. **CI Enforcement:** Lint + tests + build must pass before merging.

---

## 13. Performance Standards

Performance must be proactive and measurable.

### Rules

1. **No Heavy Work in `computed()`/`effect()`:** Avoid expensive loops and repeated parsing.
2. **List Rendering Best Practices:** Use `trackBy` and avoid unnecessary re-renders.
3. **Caching for Expensive Transforms:** Cache repeated transformations when appropriate.
4. **Lazy Load Heavy Modules/Assets:** Default to lazy strategies for scale.

---

## 14. Feature Flags & Configuration

Feature rollout must be controlled and safe.

### Rules

1. **Central Feature Flags:** Use a `FeatureFlagsService` as the single source of truth.
2. **Environment Configuration:** Keep environment-specific configuration centralized. Avoid scattered `if (env)` logic.

---

## 15. Versioning & Migrations

Change must be managed safely across releases.

### Rules

1. **Config/Data Versioning:** Version DB-backed configs and local storage structures when needed.
2. **Migration Strategy:** Provide explicit migrations for schema/contract changes.

---

## 16. Documentation (Including ADR)

Documentation must reflect reality.

### Rules

1. **Keep Docs Updated:** Update `src/docs/` with any architectural, system, or data-flow changes.
2. **Use ADRs for Major Decisions:** Record major architecture decisions under `src/docs/adr/` (short, structured entries).
