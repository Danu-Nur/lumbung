
import { redirect } from 'next/navigation';

export default function CustomersPage() {
    redirect('/sales-orders?view=customers');
}
