// This file contains type definitions for your data.
// It describes the shape of the data, and what data type each property should accept.
// For simplicity of teaching, we're manually defining these types.
// However, these types are generated automatically if you're using an ORM such as Prisma.
export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  image_url: string;
};

export type Invoice = {
  id: string;
  customer_id: string;
  amount: number;
  date: string;
  // In TypeScript, this is called a string union type.
  // It means that the "status" property can only be one of the two strings: 'pending' or 'paid'.
  status: 'pending' | 'paid';
};


export interface Transcript {
  language: string;
  segments: Segment[];
  num_speakers: number;
}

export interface Segment {
  end: string;
  text: string;
  start: string;
  speaker: string;
}

export interface Appointment {
  audio_url: string | null;
  clinic: string | null;
  combined_text: string | null;
  created_at?: string;
  date: string;
  description: string | null;
  feedback: string;
  id: string;
  patient: string;
  provider: string | null;
  summary: string;
  temp_audio_url: string | null;
  title: string | null;
  transcript: Transcript;
  appts_search: string | null;
}


export interface Context {
  id: string;
  patient: string;
  date: string;
  clinic: string;
  provider: string;
  title: string;
  similarity: number;
}



export type Revenue = {
  month: string;
  revenue: number;
};

export type LatestInvoice = {
  id: string;
  name: string;
  image_url: string;
  email: string;
  amount: string;
};

// The database returns a number for amount, but we later format it to a string with the formatCurrency function
export type LatestInvoiceRaw = Omit<LatestInvoice, 'amount'> & {
  amount: number;
};

export type InvoicesTable = {
  id: string;
  customer_id: string;
  name: string;
  email: string;
  image_url: string;
  date: string;
  amount: number;
  status: 'pending' | 'paid';
};

export type AppointmentTable = {
  id: string;
  title: string;
  description: string;
  provider: string;
  clinic: string;
  appointment_date: string;
  amount: number;
  audio_path: string | null;
  patient_id: string | null;
  speakers: number | null;
  transcript?: string | null;
  summary?: string | null;
  feedback?: string | null;
};

export type AppointmentForm = {
  id: string;
  title: string;
  description: string;
  provider: string;
  clinic: string;
  appointment_date: string;
  amount: number;
  audio_path: string | null;
  patient_id: string | null;
  speakers: number | null;
  transcript?: string | null;
  summary?: string | null;
  feedback?: string | null;
};

export type CustomersTableType = {
  id: string;
  name: string;
  email: string;
  image_url: string;
  total_invoices: number;
  total_pending: number;
  total_paid: number;
};

export type FormattedCustomersTable = {
  id: string;
  name: string;
  email: string;
  image_url: string;
  total_invoices: number;
  total_pending: string;
  total_paid: string;
};

export type CustomerField = {
  id: string;
  name: string;
};


export type ProviderField = {
  id: string;
  name: string;
};


export type InvoiceForm = {
  id: string;
  customer_id: string;
  amount: number;
  status: 'pending' | 'paid';
};
