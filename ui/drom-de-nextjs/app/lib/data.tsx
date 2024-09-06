import { sql } from '@vercel/postgres';
import {
  CustomerField,
  CustomersTableType,
  InvoiceForm,
  InvoicesTable,
  LatestInvoice,
  Revenue,
} from './definitions';
import { formatCurrency } from './utils';

export async function fetchRevenue() {
  'use server';

  try {
    // Artificially delay a response for demo purposes.
    // Don't do this in production :)

    console.log('Fetching revenue data...');
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // TODO: now this data is fetched from mocked (local) json-server.
    // TODO: Need to use real backend API endpoint from Go app.
    // TODO: use TanStack here for API requests.
    const response = await fetch("http://localhost:8000/revenue",
        {
          method: "GET",
          headers: {},
          body: null,
        }
    );

    console.log('Data fetch completed after 3 seconds.');

    const data = await response.json();
    const revenueData = data.map( (dataItem: Revenue) => (
        {month: dataItem.month, revenue: dataItem.revenue}
    ));
    return revenueData;
  } catch (error) {
    console.error('Backend API request error:', error);
    throw new Error('Failed to fetch revenue data from backend API.');
  }
}

export async function fetchLatestInvoices()  {
  try {
    // TODO: now this data is fetched from mocked (local) json-server.
    // TODO: Need to use real backend API endpoint from Go app.
    // TODO: use TanStack here for API requests.
    const invoicesResp = await fetch("http://localhost:8000/invoices",
        {method: "GET"},
    );
    const invoicesData = await invoicesResp.json();
    const customersResp = await fetch("http://localhost:8000/customers",
        {method: "GET"},
    );
    const customersData = await customersResp.json();

    const latestInvoices: LatestInvoice[] = customersData.map( (customer: CustomersTableType) => (
        {id: "123",name: customer.name, image_url: customer.image_url, email: customer.email, amount: "55Euro"}
    ));
    return latestInvoices;
  } catch (error) {
    console.error('Backend API request error:', error);
    throw new Error('Failed to fetch latest invoices data from backend API.');
  }
}

export async function fetchCardData() {
  try {
    const invoicesResp = await fetch("http://localhost:8000/invoices",
        {method: "GET"},
    );
    const invoicesData = await invoicesResp.json();

    const customersResp = await fetch("http://localhost:8000/customers",
        {method: "GET"},
    );
    const customersData = await customersResp.json();

    const numberOfInvoices = Number(12 ?? '0');
    const numberOfCustomers = Number(11 ?? '0');
    const totalPaidInvoices = formatCurrency(17625 ?? '0');  // normally should be requested from backend API with filter
    const totalPendingInvoices = formatCurrency(6753 ?? '0');  // normally should be requested from backend API with filter

    return {
      numberOfCustomers,
      numberOfInvoices,
      totalPaidInvoices,
      totalPendingInvoices,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
  }
}

const ITEMS_PER_PAGE = 6;
export async function fetchFilteredInvoices(
  query: string,
  currentPage: number,
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;  // here page number form the pagination is converted to the offset API argument

  try {
    // TODO: the "query" and "currentPage" must be sent to backend API as query parameters to support filtering on the server side

    // TODO: now this data is fetched from mocked (local) json-server.
    // TODO: Need to use real backend API endpoint from Go app.
    // TODO: use TanStack here for API requests.
    const invoicesResp = await fetch("http://localhost:8000/invoices",
        {method: "GET"},
    );
    const invoicesData = await invoicesResp.json();
    const customersResp = await fetch("http://localhost:8000/customers",
        {method: "GET"},
    );
    const customersData = await customersResp.json();

    const filteredInvoices: InvoicesTable[] = customersData.map( (customer: CustomersTableType) => (
        {id: "123",name: customer.name, image_url: customer.image_url, email: customer.email, status: "paid", date: invoicesData[1].date, amount: 775}
    ));
    return filteredInvoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoices.');
  }
}

export async function fetchInvoicesPages(query: string) {
  try {
    const totalCount = 30;  // normally this number is received from backend API by "query" filter provided in the argument.
    const totalPages = Math.ceil(Number(totalCount) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of invoices.');
  }
}

export async function fetchInvoiceById(id: string) {
  try {
    const data = await sql<InvoiceForm>`
      SELECT
        invoices.id,
        invoices.customer_id,
        invoices.amount,
        invoices.status
      FROM invoices
      WHERE invoices.id = ${id};
    `;

    const invoice = data.rows.map((invoice) => ({
      ...invoice,
      // Convert amount from cents to dollars
      amount: invoice.amount / 100,
    }));

    return invoice[0];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoice.');
  }
}

export async function fetchCustomers() {
  try {
    const data = await sql<CustomerField>`
      SELECT
        id,
        name
      FROM customers
      ORDER BY name ASC
    `;

    const customers = data.rows;
    return customers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch all customers.');
  }
}

export async function fetchFilteredCustomers(query: string) {
  try {
    const data = await sql<CustomersTableType>`
		SELECT
		  customers.id,
		  customers.name,
		  customers.email,
		  customers.image_url,
		  COUNT(invoices.id) AS total_invoices,
		  SUM(CASE WHEN invoices.status = 'pending' THEN invoices.amount ELSE 0 END) AS total_pending,
		  SUM(CASE WHEN invoices.status = 'paid' THEN invoices.amount ELSE 0 END) AS total_paid
		FROM customers
		LEFT JOIN invoices ON customers.id = invoices.customer_id
		WHERE
		  customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`}
		GROUP BY customers.id, customers.name, customers.email, customers.image_url
		ORDER BY customers.name ASC
	  `;

    const customers = data.rows.map((customer) => ({
      ...customer,
      total_pending: formatCurrency(customer.total_pending),
      total_paid: formatCurrency(customer.total_paid),
    }));

    return customers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch customer table.');
  }
}
