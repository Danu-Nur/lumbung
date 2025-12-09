
import { redirect } from 'next/navigation';

export default function SuppliersPage() {
    redirect('/inventory?view=suppliers');
}
