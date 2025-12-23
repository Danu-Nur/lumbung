# Neo-Brutalism Toast Notifications - Lumbung

## Overview
Toast notifications telah diupdate dengan Neo-Brutalism design style yang bold, vibrant, dan eye-catching.

## Design Characteristics

### Visual Style
- **Bold Borders:** 2px solid black (light mode) atau white (dark mode)
- **Strong Shadows:** 4px 4px 0px offset shadow (neo-brutalism signature)
- **Sharp Corners:** No border-radius (rounded-none)
- **Vibrant Colors:** High-contrast, bold color palette
- **Bold Typography:** Uppercase, bold, small tracking

---

## Color Palette

### Success Toast
- **Color:** `#00FFA3` (Neo Green)
- **Text:** Black
- **Use Case:** Berhasil save, create, update, complete
- **Example:** "Data berhasil disimpan!"

### Error Toast
- **Color:** `#FF5C00` (Neo Orange)
- **Text:** White
- **Use Case:** Error, failed actions, validation errors
- **Example:** "Gagal menyimpan data"

### Info Toast
- **Color:** `#334EFF` (Neo Blue)
- **Text:** White
- **Use Case:** Information, updates, notices
- **Example:** "Stock akan segera diperbarui"

### Warning Toast
- **Color:** `#FFDE00` (Neo Yellow)
- **Text:** Black
- **Use Case:** Warnings, cautions
- **Example:** "Stock hampir habis!"

---

## Usage Examples

### Success Toast
```typescript
import { toast } from "sonner";

// Simple success
toast.success("Data berhasil disimpan!");

// With description
toast.success("Berhasil!", {
  description: "Produk telah ditambahkan ke inventory"
});
```

### Error Toast
```typescript
import { toast } from "sonner";

// Simple error
toast.error("Gagal menyimpan data");

// With description
toast.error("Error!", {
  description: "Koneksi ke server terputus"
});
```

### Info Toast
```typescript
import { toast } from "sonner";

// Simple info
toast.info("Stock akan diperbarui");

// With description
toast.info("Update Tersedia", {
  description: "Versi baru aplikasi sudah tersedia"
});
```

### Warning Toast
```typescript
import { toast } from "sonner";

// Warning
toast.warning("Stock hampir habis!", {
  description: "Hanya tersisa 5 unit"
});
```

### Custom Toast dengan Action
```typescript
import { toast } from "sonner";

toast("Item akan dihapus", {
  description: "Tindakan ini tidak dapat dibatalkan",
  action: {
    label: "Hapus",
    onClick: () => console.log("Deleted"),
  },
  cancel: {
    label: "Batal",
    onClick: () => console.log("Cancelled"),
  },
});
```

---

## Technical Implementation

### File Modified
`frontend/src/components/ui/sonner.tsx`

### Key Features

#### 1. Neo-Brutalism Shadows
```typescript
// Light mode
shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]

// Dark mode
dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]
```

#### 2. Typography
```typescript
title: "font-bold text-xs uppercase tracking-wide"
description: "text-xs font-medium mt-1"
```

#### 3. Colors
```typescript
success:  "!bg-[#00FFA3] !text-black"
error:    "!bg-[#FF5C00] !text-white"
info:     "!bg-[#334EFF] !text-white"
warning:  "!bg-[#FFDE00] !text-black"
```

#### 4. Buttons
```typescript
// Action button
bg-black dark:bg-white
text-white dark:text-black
border-2 border-black dark:border-white
shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
hover:translate-x-[1px] hover:translate-y-[1px]
hover:shadow-none

// Close button
border-2 border-black dark:border-white
hover:bg-black dark:hover:bg-white
hover:text-white dark:hover:text-black
```

---

## Animation

### Slide In
- Toast slides in from right
- Smooth transition with opacity fade
- Default Sonner animation

### Slide Out
- Auto-dismiss after 3-4 seconds
- Slides out to right
- Can be dismissed manually with close button

---

## Best Practices

### Message Length
- **Title:** Maximum 4-5 words
- **Description:** Maximum 2 lines (60-80 characters)
- Keep it concise and scannable

### Usage Guidelines
1. **Success:** Use for completed actions
2. **Error:** Use for failures that need user attention
3. **Info:** Use for neutral information
4. **Warning:** Use for actions that need caution

### Tone
- **Formal:** "Data berhasil disimpan"
- **Friendly:** "Berhasil! Produk sudah ditambahkan"
- **Technical:** "Database connection error"

Choose tone based on context and audience.

---

## Examples in Lumbung

### Product Actions
```typescript
// Create product
toast.success("Produk berhasil ditambahkan!");

// Update product
toast.success("Produk berhasil diperbarui!");

// Delete product
toast.error("Gagal menghapus produk", {
  description: "Produk masih memiliki stock aktif"
});
```

### Purchase Order Actions
```typescript
// Send to supplier
toast.info("Pesanan berhasil dikirim ke pemasok");

// Receive items
toast.success("Barang berhasil diterima!", {
  description: "Stock telah diperbarui"
});

// Cancel order
toast.warning("Pesanan dibatalkan");
```

### Inventory Actions
```typescript
// Stock adjustment
toast.info("Stock adjustment berhasil", {
  description: "Inventory telah diperbarui"
});

// Low stock warning
toast.warning("Stock hampir habis!", {
  description: "Oli Yamalube: 5 liter tersisa"
});

// Transfer complete
toast.success("Transfer berhasil!", {
  description: "Dari Gudang Utama ke Gudang Cabang"
});
```

---

## Comparison

### Before (Default Shadcn)
- Subtle shadows
- Rounded corners
- Muted colors
- Standard typography

### After (Neo-Brutalism)
- ✅ Bold 4px offset shadows
- ✅ Sharp corners (no radius)
- ✅ Vibrant, high-contrast colors
- ✅ Bold uppercase typography
- ✅ 2px solid borders
- ✅ Interactive hover states

---

## Dark Mode Support

All toast styles fully support dark mode:
- **Borders:** Black → White
- **Shadows:** Black → White
- **Backgrounds:** Maintained vibrant colors
- **Text:** Adjusted for contrast
- **Buttons:** Inverted colors

---

## Browser Compatibility

✅ Chrome/Edge (latest)
✅ Firefox (latest)
✅ Safari (latest)
✅ Mobile browsers

---

## Performance

- **Bundle size:** Minimal increase (CSS only)
- **Render performance:** Excellent (Sonner optimized)
- **Animation:** Hardware-accelerated transforms
- **Accessibility:** ARIA labels maintained

---

## Accessibility

- ✅ Screen reader announcements
- ✅ Keyboard dismissible (Escape key)
- ✅ High contrast ratios
- ✅ Focus indicators
- ✅ ARIA live regions

---

## Future Enhancements

Potential additions:
1. Sound effects for different toast types
2. Custom icons per toast type
3. Progress bar for long operations
4. Stacking animation for multiple toasts
5. Position variants (top-left, bottom-right, etc)

---

## Maintenance

When updating:
1. Maintain color consistency with neo-brutalism palette
2. Keep shadows at 4px/2px offsets
3. Preserve bold typography
4. Test dark mode thoroughly
5. Ensure accessibility standards

---

## Summary

**Neo-Brutalism toast notifications provide:**
- 🎨 Bold, distinctive visual identity
- ⚡ Instant visual feedback
- 🌓 Perfect dark mode support
- ♿ Full accessibility
- 📱 Responsive on all devices
- ✨ Delightful user experience

**Perfect for modern, bold applications like Lumbung!** 🚀
