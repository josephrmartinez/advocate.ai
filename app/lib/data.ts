'use server'

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers'
import { Database } from '@/app/database.types';
import { unstable_noStore as noStore } from 'next/cache';
import { Appointment, Context } from './definitions';
import { embed } from './embed'



// const supabase = createServerComponentClient<Database>({ cookies })


const ITEMS_PER_PAGE = 6;


export const fetchUserSession = async () => {
  try {
    const supabase = createServerComponentClient<Database>({ cookies })
    const { data: { session } } = await supabase.auth.getSession();
    console.log("session user id:", session?.user.id);
    return session;
  } catch (error) {
    console.error('Supabase Error:', error);
    throw new Error('Failed to fetch user session.');
  }
};


export async function fetchFilteredAppointments(query: string, currentPage: number) {
  try {
    
    const offset = (currentPage - 1) * ITEMS_PER_PAGE;

    const supabase = createServerComponentClient({ cookies })
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select(
        'id, patient, date, title, description, provider, clinic, summary, feedback'
      )
      .ilike('combined_text', `%${query}%`)
      .order('date', { ascending: false })
      .range(offset, offset + ITEMS_PER_PAGE - 1);

    if (error) {
      console.error('Supabase Error:', error);
      throw new Error('Failed to fetch appointments data.');
    }

    return appointments;
  } catch (error) {
    console.error('Supabase Error:', error);
    throw new Error('Failed to fetch appointments data.');
  }
}

// IN PROGRESS
export async function fetchSimilarApptsWithEmbedding(query: string, currentPage: number) {
  try {
    // console.log("query input", query)
    // const offset = (currentPage - 1) * ITEMS_PER_PAGE;

    const supabase = createServerComponentClient({ cookies })

    // CREATE EMBEDDING OF QUERY USING API CALL TO text-embedding-3-small	
    const embedding = await embed(query);

    // RUN SUPABASE EDGE FUNCTION 'MATCH_DOCUMENTS'
    const { data: documents, error } = await supabase.rpc('match_documents', {
      query_embedding: embedding, // Pass the embedding you want to compare
      match_threshold: 0.2, // Choose an appropriate threshold for your data
      match_count: 6, // Choose the max number of matches
    })

    if (error) {
      console.error('Supabase Error:', error);
      throw new Error('Failed to fetch appointments data.');
    }
    return documents;
  } catch (error) {
    console.error('Supabase Error:', error);
    throw new Error('Failed to fetch appointments data.');
  }
}


export const getContext = async (
  message: string,
): Promise<Context[]> => {
  // Get the embeddings of the input message
  const embedding = await embed(message);

  const supabase = createServerComponentClient({ cookies })


  // RUN SUPABASE EDGE FUNCTION 'MATCH_DOCUMENTS'
  const { data: documents, error } = await supabase.rpc('match_appointments_advocatechat', {
    query_embedding: embedding, // Pass the embedding you want to compare
    match_threshold: 0.36, // Choose an appropriate threshold for your data
    match_count: 3, // Choose the max number of matches
  })
  
  return documents;
};



export async function fetchApptsPages(query: string) {
  try {
    const supabase = createServerComponentClient<Database>({ cookies })
     const { data, count, error } = await supabase
       .from('appointments')
       .select('*', { count: 'exact', head: true })
       .ilike('combined_text', `%${query}%`)
 
     if (error) {
       console.error('Supabase Error:', error);
       throw new Error('Failed to fetch appointments count.');
     }
 
     
     
     let totalPages = 1
     if (count) {
      totalPages = Math.ceil(count / ITEMS_PER_PAGE)
    }
    
      return totalPages;
  } catch (error) {
     console.error('Supabase Error:', error);
     throw new Error('Failed to fetch appointments count.');
  }
 }


export async function fetchAppointmentById(id: string) {
  // EXPERIMENTAL. noStore() allows for immediate re-render of changed appointment data, but may lead to slower load times.
  noStore()
  try {
    const supabase = createServerComponentClient({ cookies })
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', id);

    if (error) {
      console.error('Supabase Error:', error);
      throw new Error('Failed to fetch appointment data.');
    }

    const appointment = appointments ? appointments[0] : null;
    return appointment as Appointment;
  } catch (error) {
    console.error('Supabase Error:', error);
    throw new Error('Failed to fetch appointment data.');
  }
}

export async function getSignedAudioUrl(patient: string, audio_url:string) {
  // return (`url path: ${patient}/${audio_url}`)
  try {
    const supabase = createServerComponentClient<Database>({ cookies })
    const { data, error } = await supabase
      .storage
      .from('apptrecordings')
      .createSignedUrl(`${patient}/${audio_url}`, 3600);

    if (error) {
      console.error('Supabase Storage Error:', error);
      throw new Error('Failed to get signed audio URL.');
    }

    // Assuming data is an object containing the signed URL
    const signedUrl = data?.signedUrl;

    return signedUrl;
  } catch (error) {
    console.error('Supabase Error:', error);
    throw new Error('Failed to get signed audio URL.');
  }
}

// export async function fetchApptsPages(query: string) {
//   try {
//      const { data, count, error } = await supabase
//        .from('appointments')
//        .select('id', { count: 'exact', head: true })
//        .ilike('combined_text', `%${query}%`)
       
 
//      if (error) {
//        console.error('Supabase Error:', error);
//        throw new Error('Failed to fetch appointments count.');
//      }
 
//      console.log("number of matching rows:", data.count)
//     //  const totalPages = Math.ceil(Number(count[0].count) / ITEMS_PER_PAGE);
//     // return totalPages;
//   } catch (error) {
//      console.error('Supabase Error:', error);
//      throw new Error('Failed to fetch appointments count.');
//   }
//  }

// export async function fetchApptsPages(query: string) {

//   try {

//     const { data: appointments, error } = await supabase
//        .from('appointments')
//        .select(
//          'id, patient, date, title, description, provider, clinic, summary, feedback'
//        )
//        .textSearch('summary', `%${query}%`)

//     const count = await sql`SELECT COUNT(*)
//     FROM invoices
//     JOIN customers ON invoices.customer_id = customers.id
//     WHERE
//       customers.name ILIKE ${`%${query}%`} OR
//       customers.email ILIKE ${`%${query}%`} OR
//       invoices.amount::text ILIKE ${`%${query}%`} OR
//       invoices.date::text ILIKE ${`%${query}%`} OR
//       invoices.status ILIKE ${`%${query}%`}
//   `;

//     const totalPages = Math.ceil(Number(count.rows[0].count) / ITEMS_PER_PAGE);
//     return totalPages;
//   } catch (error) {
//     console.error('Database Error:', error);
//     throw new Error('Failed to fetch total number of invoices.');
//   }
// }



// import { sql } from '@vercel/postgres';
// import {
//   CustomerField,
//   CustomersTableType,
//   InvoiceForm,
//   InvoicesTable,
//   LatestInvoiceRaw,
//   User,
//   Revenue,
//   AppointmentTable,
//   AppointmentForm
// } from './definitions';
// import { formatCurrency } from './utils';
// import { unstable_noStore as noStore } from 'next/cache';


// export async function fetchAppointmentById(id: string) {
//   noStore();

//   try {
//     const data = await sql<AppointmentForm>`
//       SELECT
//         appointments.id,
//         appointments.appointment_date,
//         appointments.clinic,
//         appointments.provider,
//         appointments.title,
//         appointments.amount,
//         appointments.description
//       FROM appointments
//       WHERE appointments.id = ${id};
//     `;

//     const appointment = data.rows.map((appointment) => ({
//       ...appointment,
//       // Convert amount from cents to dollars
//       amount: appointment.amount / 100,
//     }));

//     return appointment[0];
//   } catch (error) {
//     console.error('Database Error:', error);
//     throw new Error('Failed to fetch appointment.');
//   }
// }




// export async function fetchFilteredAppointments(
//   query: string,
//   currentPage: number,
// ) {
//   noStore();
//   const offset = (currentPage - 1) * ITEMS_PER_PAGE;

//   try {
//     const appointments = await sql<AppointmentTable>`
//       SELECT
//         appointments.id,
//         appointments.appointment_date,
//         appointments.title,
//         appointments.provider,
//         appointments.clinic,
//       FROM appointments
//       WHERE
//         appointments.title ILIKE ${`%${query}%`} OR
//         appointments.provider ILIKE ${`%${query}%`} OR
//         appointments.summary ILIKE ${`%${query}%`} OR
//         appointments.clinic ILIKE ${`%${query}%`}
//       ORDER BY appointments.appointment_date DESC
//       LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
//     `;
//     return appointments.rows;
//   } catch (error) {
//     console.error('Database Error:', error);
//     throw new Error('Failed to fetch appointments.');
//   }
// }

// export async function fetchRevenue() {
//   noStore();
//   // This is equivalent to in fetch(..., {cache: 'no-store'}).

//   try {
//     // Artificially delay a response for demo purposes.
//     // Don't do this in production :)
//     // console.log('Fetching revenue data...');
//     // await new Promise((resolve) => setTimeout(resolve, 3000));

//     const data = await sql<Revenue>`SELECT * FROM revenue`;

//     // console.log('Data fetch completed after 3 seconds.');

//     return data.rows;
//   } catch (error) {
//     console.error('Database Error:', error);
//     throw new Error('Failed to fetch revenue data.');
//   }
// }

// export async function fetchLatestInvoices() {
//   noStore();
//   try {
//     const data = await sql<LatestInvoiceRaw>`
//       SELECT invoices.amount, customers.name, customers.image_url, customers.email, invoices.id
//       FROM invoices
//       JOIN customers ON invoices.customer_id = customers.id
//       ORDER BY invoices.date DESC
//       LIMIT 5`;

//     const latestInvoices = data.rows.map((invoice) => ({
//       ...invoice,
//       amount: formatCurrency(invoice.amount),
//     }));
//     return latestInvoices;
//   } catch (error) {
//     console.error('Database Error:', error);
//     throw new Error('Failed to fetch the latest invoices.');
//   }
// }

// export async function fetchCardData() {
//   noStore();
//   try {
//     // You can probably combine these into a single SQL query
//     // However, we are intentionally splitting them to demonstrate
//     // how to initialize multiple queries in parallel with JS.
//     const invoiceCountPromise = sql`SELECT COUNT(*) FROM invoices`;
//     const customerCountPromise = sql`SELECT COUNT(*) FROM customers`;
//     const invoiceStatusPromise = sql`SELECT
//          SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS "paid",
//          SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS "pending"
//          FROM invoices`;

//     const data = await Promise.all([
//       invoiceCountPromise,
//       customerCountPromise,
//       invoiceStatusPromise,
//     ]);

//     const numberOfInvoices = Number(data[0].rows[0].count ?? '0');
//     const numberOfCustomers = Number(data[1].rows[0].count ?? '0');
//     const totalPaidInvoices = formatCurrency(data[2].rows[0].paid ?? '0');
//     const totalPendingInvoices = formatCurrency(data[2].rows[0].pending ?? '0');

//     return {
//       numberOfCustomers,
//       numberOfInvoices,
//       totalPaidInvoices,
//       totalPendingInvoices,
//     };
//   } catch (error) {
//     console.error('Database Error:', error);
//     throw new Error('Failed to fetch card data.');
//   }
// }


// export async function fetchFilteredInvoices(
//   query: string,
//   currentPage: number,
// ) {
//   noStore();
//   const offset = (currentPage - 1) * ITEMS_PER_PAGE;

//   try {
//     const invoices = await sql<InvoicesTable>`
//       SELECT
//         invoices.id,
//         invoices.amount,
//         invoices.date,
//         invoices.status,
//         customers.name,
//         customers.email,
//         customers.image_url
//       FROM invoices
//       JOIN customers ON invoices.customer_id = customers.id
//       WHERE
//         customers.name ILIKE ${`%${query}%`} OR
//         customers.email ILIKE ${`%${query}%`} OR
//         invoices.amount::text ILIKE ${`%${query}%`} OR
//         invoices.date::text ILIKE ${`%${query}%`} OR
//         invoices.status ILIKE ${`%${query}%`}
//       ORDER BY invoices.date DESC
//       LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
//     `;

//     return invoices.rows;
//   } catch (error) {
//     console.error('Database Error:', error);
//     throw new Error('Failed to fetch invoices.');
//   }
// }



// export async function fetchInvoicesPages(query: string) {
//   noStore();

//   try {
//     const count = await sql`SELECT COUNT(*)
//     FROM invoices
//     JOIN customers ON invoices.customer_id = customers.id
//     WHERE
//       customers.name ILIKE ${`%${query}%`} OR
//       customers.email ILIKE ${`%${query}%`} OR
//       invoices.amount::text ILIKE ${`%${query}%`} OR
//       invoices.date::text ILIKE ${`%${query}%`} OR
//       invoices.status ILIKE ${`%${query}%`}
//   `;

//     const totalPages = Math.ceil(Number(count.rows[0].count) / ITEMS_PER_PAGE);
//     return totalPages;
//   } catch (error) {
//     console.error('Database Error:', error);
//     throw new Error('Failed to fetch total number of invoices.');
//   }
// }

// export async function fetchInvoiceById(id: string) {
//   noStore();

//   try {
//     const data = await sql<InvoiceForm>`
//       SELECT
//         invoices.id,
//         invoices.customer_id,
//         invoices.amount,
//         invoices.status
//       FROM invoices
//       WHERE invoices.id = ${id};
//     `;

//     const invoice = data.rows.map((invoice) => ({
//       ...invoice,
//       // Convert amount from cents to dollars
//       amount: invoice.amount / 100,
//     }));

//     return invoice[0];
//   } catch (error) {
//     console.error('Database Error:', error);
//     throw new Error('Failed to fetch invoice.');
//   }
// }





// export async function fetchCustomers() {
//   try {
//     const data = await sql<CustomerField>`
//       SELECT
//         id,
//         name
//       FROM customers
//       ORDER BY name ASC
//     `;

//     const customers = data.rows;
//     return customers;
//   } catch (err) {
//     console.error('Database Error:', err);
//     throw new Error('Failed to fetch all customers.');
//   }
// }

// export async function fetchCustomerById(customerId: string) {
//   try {
//     const data = await sql<CustomerField>`
//       SELECT
//         id,
//         name,
//         email,
//         image_url
//       FROM customers
//       WHERE id = ${customerId}
//     `;

//     const customer = data.rows[0];
//     return customer;
//   } catch (err) {
//     console.error('Database Error:', err);
//     throw new Error(`Failed to fetch customer with ID ${customerId}.`);
//   }
// }


// export async function fetchFilteredCustomers(query: string) {
//   noStore();

//   try {
//     const data = await sql<CustomersTableType>`
// 		SELECT
// 		  customers.id,
// 		  customers.name,
// 		  customers.email,
// 		  customers.image_url,
// 		  COUNT(invoices.id) AS total_invoices,
// 		  SUM(CASE WHEN invoices.status = 'pending' THEN invoices.amount ELSE 0 END) AS total_pending,
// 		  SUM(CASE WHEN invoices.status = 'paid' THEN invoices.amount ELSE 0 END) AS total_paid
// 		FROM customers
// 		LEFT JOIN invoices ON customers.id = invoices.customer_id
// 		WHERE
// 		  customers.name ILIKE ${`%${query}%`} OR
//         customers.email ILIKE ${`%${query}%`}
// 		GROUP BY customers.id, customers.name, customers.email, customers.image_url
// 		ORDER BY customers.name ASC
// 	  `;

//     const customers = data.rows.map((customer) => ({
//       ...customer,
//       total_pending: formatCurrency(customer.total_pending),
//       total_paid: formatCurrency(customer.total_paid),
//     }));

//     return customers;
//   } catch (err) {
//     console.error('Database Error:', err);
//     throw new Error('Failed to fetch customer table.');
//   }
// }

// export async function getUser(email: string) {
//   try {
//     const user = await sql`SELECT * FROM users WHERE email=${email}`;
//     return user.rows[0] as User;
//   } catch (error) {
//     console.error('Failed to fetch user:', error);
//     throw new Error('Failed to fetch user.');
//   }
// }
