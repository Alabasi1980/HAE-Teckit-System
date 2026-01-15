# Enjaz One - Development Rules & Guidelines

## 1. Data Layer Architecture (The Switcher Pattern)

Enjaz One uses a decoupled data layer that allows the frontend to operate in two modes: `local` (LocalStorage/Mock) and `api` (Remote HTTP).

### How to use Data:
1. **Repository Access**: Never import `workItemsRepo` or `db` directly into components.
2. **Hook Usage**: Use `useData()` from `DataContext` to access repositories. 
   - Example: `const data = useData(); data.workItems.getAll();`
3. **Mappers**: All data passing through the `HttpApiProvider` is mapped from `DTO` to `Domain Model`. 
   - **DTO**: Represents the raw database/API shape (usually snake_case).
   - **Domain Model**: Represents the clean TypeScript objects used in the UI.

### Configuration (`.env`):
- `VITE_DATA_SOURCE`: Set to `local` for offline development or `api` for staging/production.
- `VITE_API_BASE_URL`: The URL of the backend API.

## 2. Component Design (Single Responsibility)

Components should be small, focused, and efficient...
[Remainder of doc stays same]
