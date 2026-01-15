# Enjaz One - Development Rules & Guidelines

This document serves as the official guide for the development of **Enjaz One**. Its purpose is to ensure consistency, maintainability, and high quality throughout the project's lifecycle. All new development should adhere to these rules.

---

## 1. Folder Structure (Modular Architecture)

To ensure a scalable and maintainable codebase, the project follows a **Domain-Driven Modular Architecture**. Code is organized by its functional domain (Business Feature) rather than technical type.

### Directory Layout:

```
src/
├── modules/              // Business Logic & Features
│   ├── core/             // App shell, Auth, Layouts, Dashboard
│   │   ├── components/   // UI Components specific to Core
│   │   └── services/     // Services specific to Core
│   ├── operations/       // Work Items, Approvals, Kanban
│   ├── assets/           // Registry, Custody, Inventory
│   ├── projects/         // Projects management
│   ├── documents/        // Document Library
│   ├── knowledge/        // Knowledge Base
│   └── field-ops/        // Mobile-first field reporting
│
├── shared/               // Reusable code across modules
│   ├── ui/               // Dumb UI components (Buttons, Cards, Inputs)
│   ├── hooks/            // Shared React Hooks
│   ├── types/            // Global types (types.ts)
│   └── utils/            // Helper functions
│
├── services/             // API/Database repositories (gradually moved to modules if specific)
└── App.tsx               // Main Entry & Routing
```

### Rules:

1.  **High Cohesion:** Everything related to a feature (e.g., "Assets") stays in `modules/assets`.
2.  **Public Interface:** Modules should ideally expose a main component or page, keeping internal sub-components private.
3.  **Shared Components:** If a component is used in **two or more** modules, move it to `src/shared/ui`.

---

## 2. Component Design (Single Responsibility)

Components should be small, focused, and efficient.

### Rules:

1.  **Split Huge Components:** If a component exceeds 200 lines, check if it can be split.
    *   *Example:* `WorkItemDetail` should be split into `ApprovalChain`, `CommentSection`, `SubtaskList`.
2.  **Smart vs. Dumb:**
    *   **Smart Components (Pages/Containers):** Handle logic, data fetching, and state.
    *   **Dumb Components (UI):** Receive data via props and render UI. They don't know about the "API" or "Database".
3.  **No Inline Styles:** Use Tailwind CSS utility classes. Avoid `style={{...}}` unless for dynamic values (like progress bars).

---

## 3. State Management

We currently use **React State & Props Drilling** (lifting state up to App.tsx).
*Goal:* Move towards **Custom Hooks** and **Context API** per module.

### Rules:

1.  **Custom Hooks:** encapsualte logic. Instead of writing `fetch` logic inside `useEffect` in a component, create `useWorkItems()`.
2.  **Immutability:** Always create new copies of arrays/objects when updating state (`[...prev, newItem]`).

---

## 4. Naming Conventions

*   **Files:** PascalCase for React Components (`WorkItemDetail.tsx`), camelCase for logic/hooks (`useAuth.ts`, `apiService.ts`).
*   **Interfaces:** PascalCase (`WorkItem`, `User`). Do not prefix with `I` (e.g., `IUser` is bad).
*   **Enums:** UPPER_SNAKE_CASE keys (`WorkItemType.SERVICE_REQUEST`).

---

## 5. Development Workflow

1.  **Plan First:** Before writing code for a new feature, define the data structure in `types.ts`.
2.  **UI Implementation:** Build the dumb UI components first.
3.  **Logic Integration:** Connect the UI to services/mock data.
4.  **Refactor:** Clean up imports and extract sub-components if needed.
