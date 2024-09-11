'use server';

import { z } from 'zod';  // type validation library
import { Invoice } from '@/app/lib/definitions';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

// State object represents the state of the form - to be preserved for validation.
export type State = {
    errors?: {
        customerId?: string[];
        amount?: string[];
        status?: string[];
    };
    message?: string | null;
};

// We create schema for the form action that fully complies our Invoice type, defined in the definitions.ts
const FormSchema = z.object({
    id: z.string(),
    customerId: z.string({
        invalid_type_error: 'Please select a customer.',  // error message for the form validation
    }),
    amount: z.coerce.number().gt(0, { message: 'Please enter an amount greater than $0.' }),  // course means read string and set number + form validation constraint: .gt
    status: z.enum(['pending', 'paid'], {
        invalid_type_error: 'Please select an invoice status.',    // error message for the form validation
    }),
    date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });

export async function createInvoice(prevState: State, formData: FormData) {
    const rawFormData = {
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    };
    const validatedFields = CreateInvoice.safeParse(rawFormData);  // "safeParse" is used to enable fields validation as per defined constraints.
    // If form validation fails, return errors early. Otherwise, continue.
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Create Invoice.',
        };
    }

    // Prepare data for sending to the Backend API
    const { customerId, amount, status } = validatedFields.data;
    const amountInCents = amount * 100;
    const date = new Date().toISOString().split('T')[0];
    // TODO: Send create (POST) request to the real backend API
    const invoiceObj: Invoice = {
        amount: amountInCents,
        customer_id: customerId,
        date: date,
        id: "123",
        status: status,
    };

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
    // TODO: add form validation via safeParse as it is done for "createInvoice" action and "create-form.tsx"
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


export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        await signIn('credentials', formData);
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Invalid credentials.';
                default:
                    return 'Something went wrong.';
            }
        }
        throw error;
    }
}