# Refactoring Notes

## Overview
This document outlines the changes made during the codebase refactoring process (December 2025). The goal was to improve code organization, enforce DRY principles, and prepare the application for scalability.

## Key Changes

### 1. Directory Structure
We adopted a more domain-centric structure for components:

- **`components/domain/`**: Contains business-specific UI components grouped by domain (e.g., `inventory`, `customers`, `suppliers`).
- **`components/shared/`**: Contains reusable business-agnostic components (e.g., `DataTable`, `PageHeader`, `FormShell`).
- **`components/ui/`**: Contains primitive UI components (shadcn/ui).
- **`components/layout/`**: Contains global layout components (e.g., `Sidebar`, `Topbar`).

### 2. Type Definitions
Type definitions have been centralized to avoid circular dependencies and improve discoverability:

- **`types/domain.ts`**: Contains shared domain types (`CreateProductParams`, `Customer`, etc.) that were previously scattered across service files.

### 3. Service Layer vs Server Actions
- **`lib/services/`**: Contains pure business logic and database interactions. These functions should **not** import `next/navigation` or `next/cache`.
- **`features/*/actions.ts`**: Contains Server Actions that handle form submissions, authentication checks, and revalidation. These call the service layer.

### 4. Performance Optimizations
- **Server Components**: `Login` and `Register` pages were refactored to be Server Components, with interactive form logic extracted to client-side form components.
- **Tree Shaking**: Verified `lucide-react` imports to ensure efficient bundling.

## Guidelines for Future Development

1.  **New Components**:
    - If it's specific to a feature (e.g., "ProductCard"), put it in `components/domain/<feature>/`.
    - If it's a generic UI element (e.g., "DatePicker"), put it in `components/ui/` or `components/shared/`.

2.  **State Management**:
    - Prefer Server Components for data fetching.
    - Use Client Components only for interactive elements (forms, dialogs, dynamic UI).

3.  **Types**:
    - Define shared types in `types/domain.ts`.
    - Component-specific props can remain in the component file.

4.  **Imports**:
    - Use absolute imports (`@/components/...`) instead of relative paths.

## Removed/Deprecated
- Unused shadcn/ui components were removed.
- Unused hooks and utility functions were cleaned up.
- Legacy `features/auth` and `features/dashboard` directories (which contained UI) were removed.
