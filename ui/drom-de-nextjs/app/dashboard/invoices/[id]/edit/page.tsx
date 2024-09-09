import Form from '@/app/ui/invoices/edit-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { fetchInvoiceById, fetchCustomers } from '@/app/lib/data';
import { notFound } from 'next/navigation';

export default async function Page( {params}: { params: { id: string } } ) {
    const id = params.id;
    const [invoice, customers] = await Promise.all(   // Promise.all is used to fetch all data in parallel.
        [
            fetchInvoiceById(id),
            fetchCustomers(),
        ]
    );

    // Trigger the 404 Not Found status to catch it and render specific UI.
    // UI is set in the 'not-found.tsx' file.
    if (!invoice) {
        notFound();
    }

    return (
        <main>
            <Breadcrumbs
                breadcrumbs={[
                    { label: 'Invoices', href: '/dashboard/invoices' },
                    {
                        label: 'Edit Invoice',
                        href: `/dashboard/invoices/${id}/edit`,
                        active: true,
                    },
                ]}
            />
            <Form invoice={invoice} customers={customers} />
        </main>
    );
}