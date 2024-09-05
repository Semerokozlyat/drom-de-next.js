import DashboardSkeleton from '@/app/ui/skeletons';


// The "(overview) folder is required to apply loading.tsx to the /dashboard page only,
// excluding the /dashboard/customers and /dashboard/invoices".
// In Next.js it is called "Route Groups"
export default function Loading() {
    return (
        <DashboardSkeleton />
    );
}