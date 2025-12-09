# Code Audit – Unused & Orphaned Files

## 1. Summary

- **Date**: 2025-12-09
- **Scope**: Routes, Components, Features, Services, i18n
- **Reference**: `docs/ARCHITECTURE.md` (Official)

| Category | Count | Description |
| :--- | :--- | :--- |
| **High Confidence Unused** | 8 items | Files/Folders safe to delete immediately. |
| **Docs Out-of-Sync** | 3 areas | Features used in code but missing from Architecture docs. |
| **Review Required** | 1 item | Code that mentions non-existent routes. |

---

## 2. Candidate Unused – High Confidence

These files/folders have **no imports**, are **not in documentation**, and have names indicating temporary/backup status.

| Type | Path | Reason | Recommendation |
| :--- | :--- | :--- | :--- |
| **Route** | `app/[locale]/test-import/` | Folder contains a test page not linked anywhere. | **DELETE** |
| **Folder** | `messages_backup/` | Contains `en.json.bak` etc. Legacy backups. | **DELETE** |
| **File** | `proxy.ts` | Not imported by app. Likely legacy dev proxy script. | **DELETE** |
| **File** | `proxy.ts.bak` | Backup file. | **DELETE** |
| **File** | `auth-debug.log` | Log file. Should not be in repo. | **DELETE** |
| **File** | `smtp-debug.log` | Log file. Should not be in repo. | **DELETE** |
| **File** | `generate_test_excel.js` | Root script. Likely for generating seed data. | **MOVE to `scripts/` or DELETE** |
| **File** | `test_inventory_import.xlsx` | Binary Excel file in root. | **DELETE** |

---

## 3. Docs Out-of-Sync (Active but Not Documented)

These features/components are **active** (imported and used) but **missing** from `docs/ARCHITECTURE.md`.

| Category | Path / Name | Where it belongs in Docs |
| :--- | :--- | :--- |
| **Feature** | `features/opnames/*` | Should be added to **Inventory** domain section. Used by `inventory-opname-section.tsx`. |
| **Feature** | `features/categories/*` | Should be added to **Inventory** domain section. Used by `category-create-modal.tsx`. |
| **Component** | `components/domain/categories/*` | Should be listed under **Inventory** or **Settings** (depending on where it's managed). |

---

## 4. Logical Inconsistencies (Review Required)

| Item | Observation | Risk |
| :--- | :--- | :--- |
| **Category Actions** | `features/categories/actions.ts` uses `revalidatePath('/categories')`. | **Route `/categories` does not exist.** It will likely not revalidate the actual page where categories are shown (e.g. `/inventory`). |

---

## 5. Suggested Next Steps

1.  **Cleanup**: Execute the deletion of "High Confidence" items.
2.  **Fix Logic**: Update `revalidatePath` in `features/categories/actions.ts` to point to `/inventory` (or wherever categories are listed).
3.  **Update Docs**: Add `StockOpname` and `Category` features to `ARCHITECTURE.md`.

---

## 6. Execution Status (2025-12-09)

- [x] Removed `app/[locale]/test-import/`
- [x] Removed `messages_backup/` and log/legacy files (`proxy.ts`, etc.)
- [x] Handled `generate_test_excel.js` (Moved to `scripts/generate-test-excel.js`)
- [x] Removed `test_inventory_import.xlsx`
- [x] Fixed `revalidatePath` in `features/categories/actions.ts` (Pointed to `/inventory`)
- [x] Fixed `revalidatePath` in `features/inventory/actions.ts` (Removed call to non-existent `/inventory/[id]`)
- [x] Fixed `revalidatePath` in `features/opnames/import-actions.ts` (Pointed to `/inventory`)
- [x] Updated `ARCHITECTURE.md` with Opnames & Categories subsections in Inventory
- [x] Verified `DATABASE.md` (Already consistent with Opname/Category models)

## 7. Build Verification Fixes (Executed)

During the final build verification, several type errors were identified and fixed:

1.  **Missing Type**: Added `SerializedCategory` export to `types/serialized.ts`.
2.  **DataTable Options**: Removed invalid `autoResetFilters`, `autoResetPageIndex`, `autoResetAll` from `DataTable` (incompatible with installed `tanstack/react-table` version).
3.  **Animation Types**: Fixed `ScrollAnimation` variant type error by asserting `ease: "easeOut" as const`.
4.  **Inventory Actions**:
    *   Added non-null assertion (`!`) to `session.user.organizationId` in `createProduct` to satisfy Prisma types.
    *   Removed `organizationId` field from `InventoryMovement` creation (field does not exist in schema).
5.  **Warehouse Import**: Removed `description` field from import logic (field does not exist in `Warehouse` model).

