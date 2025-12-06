import { redirect } from 'next/navigation';

export default function AdjustmentsPage() {
    redirect('/inventory?view=adjustments');
}
