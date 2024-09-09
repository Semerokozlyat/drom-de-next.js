'use server';

import { z } from 'zod';  // type validation library
import { Invoice } from '@/app/lib/definitions';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// We create schema for the form action that fully complies our Invoice type, defined in the definitions.ts
const FormSchema = z.object({
    id: z.string(),
    customerId: z.string(),
    amount: z.coerce.number(),  // course means read string and set number
    status: z.enum(['pending', 'paid']),
    date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });

export async function createInvoice(formData: FormData) {
    const rawFormData = {
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    };
    const { customerId, amount, status } = CreateInvoice.parse(rawFormData);
    const amountInCents = amount * 100;
    const date = new Date().toISOString().split('T')[0];
    // TODO: Create it in real backend API
    const invoiceObj: Invoice = {amount: amountInCents, customer_id: customerId, date: date, id: "123", status: status};

    try{
        const postResp = await fetch("http://localhost:8000/invoices",
            {
                method: "POST",
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(invoiceObj),
            },
        );
        const _ = await postResp.json();
    } catch (error) {
        return {message: 'Backend API Error: failed to create invoice'};
    }

    revalidatePath('/dashboard/invoices');  // means clear the client cache on this path to render newly added invoices.
    redirect('/dashboard/invoices');
}

// Use Zod to update the expected types
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export async function updateInvoice(id: string, formData: FormData) {
    const { customerId, amount, status } = UpdateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });

    // TODO: here should be API request to backend API like:
    // PUT /dashboard/invoices ....
    // TODO: implement with real backend
    try {

    } catch (error) {
        return {message: 'Backend API Error: failed to update invoice'};
    }

    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
    // throw new Error('Failed to delete invoice!');
    try {
        const delResp = await fetch("http://localhost:8000/invoices/",
            {
                method: "DELETE",
            },
        );
        const _ = await delResp.json();
    } catch (error) {
        return {message: 'Backend API Error: failed to delete invoice'};
    }

    revalidatePath('/dashboard/invoices');
}