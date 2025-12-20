# Neobrutalism Utility Classes

Utility classes untuk membuat komponen dengan style neobrutalism yang konsisten di seluruh aplikasi.

## Card Classes

### `.neo-card`
Base class untuk card dengan style neobrutalism.

**Features:**
- Border hitam 2px
- Background putih
- Shadow 4px x 4px hitam
- Hover effect: shadow 6px x 6px
- Dark mode support

**Usage:**
```tsx
<Card className="neo-card">
  <CardContent>
    Your content here
  </CardContent>
</Card>
```

## Stat Card Classes

### `.neo-stat-card`
Card khusus untuk menampilkan statistik/metrics dengan layout yang sudah ditentukan.

**Structure:**
```tsx
<Card className="neo-stat-card">
  <CardContent className="stat-content">
    <div className="stat-layout">
      <div className="stat-info">
        <p className="stat-label">Label Text</p>
        <h3 className="stat-value">123</h3>
      </div>
      <div className="stat-icon neo-icon-indigo">
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </CardContent>
</Card>
```

**Child Classes:**
- `.stat-content` - Padding 6 (p-6)
- `.stat-layout` - Flex layout dengan justify-between
- `.stat-info` - Container untuk label dan value
- `.stat-label` - Label text (small, bold, uppercase)
- `.stat-value` - Value text (3xl, black, bold)
- `.stat-icon` - Icon container dengan border dan padding

## Icon Color Variants

Gunakan class berikut untuk icon background:

- `.neo-icon-indigo` - Indigo 500
- `.neo-icon-red` - Red 500
- `.neo-icon-amber` - Amber 500
- `.neo-icon-emerald` - Emerald 500
- `.neo-icon-blue` - Blue 500
- `.neo-icon-purple` - Purple 500
- `.neo-icon-pink` - Pink 500
- `.neo-icon-cyan` - Cyan 500

## Complete Example

```tsx
import { Card, CardContent } from '@/components/ui/card';
import { Package } from 'lucide-react';

export function StatsCard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Total Products */}
      <Card className="neo-stat-card">
        <CardContent className="stat-content">
          <div className="stat-layout">
            <div className="stat-info">
              <p className="stat-label">Total Products</p>
              <h3 className="stat-value">1,234</h3>
            </div>
            <div className="stat-icon neo-icon-indigo">
              <Package className="w-6 h-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add more cards... */}
    </div>
  );
}
```

## Dark Mode

Semua classes sudah support dark mode secara otomatis:
- Border berubah menjadi putih
- Background menjadi gray-900
- Shadow menjadi putih
- Label text menjadi gray-400
- Value text menjadi putih

## Benefits

✅ **Konsisten** - Semua stat cards terlihat sama di seluruh aplikasi  
✅ **Maintainable** - Update style di satu tempat (globals.css)  
✅ **Reusable** - Tinggal copy-paste structure  
✅ **Dark Mode Ready** - Support dark mode otomatis  
✅ **Clean Code** - Tidak perlu menulis class panjang berulang-ulang
