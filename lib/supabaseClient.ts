import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase credentials. Check .env file for VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY"
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Query helpers for Phase 2 webhook routes

export async function getAvailableUnits(
  bedrooms: number,
  moveInDate: string
) {
  const { data, error } = await supabase
    .from("units")
    .select("unit_number, bedrooms, price, available_date")
    .eq("bedrooms", bedrooms)
    .lte("available_date", moveInDate)
    .eq("is_available", true)
    .order("price", { ascending: true })
    .limit(3);

  if (error) throw error;
  return data || [];
}

export async function scheduleTour(
  confirmationId: string,
  name: string,
  phone: string,
  unitNumber: string,
  tourTime: string
) {
  const { data, error } = await supabase
    .from("tours")
    .insert({
      confirmation_id: confirmationId,
      name,
      phone,
      unit_number: unitNumber,
      tour_time: tourTime,
    })
    .select();

  if (error) throw error;
  return data?.[0] || null;
}

export async function lookupResident(name: string, unitNumber: string) {
  // Uses RPC function "lookup_resident" which is exposed via Supabase
  // This function is server-side secure and doesn't expose all resident data
  const { data, error } = await supabase.rpc("lookup_resident", {
    p_name: name,
    p_unit_number: unitNumber,
  });

  if (error) {
    if (error.message.includes("no rows")) return null;
    throw error;
  }
  return data?.[0] || null;
}

export async function getFaqAnswer(question: string) {
  // Simple keyword/similarity matching against FAQ questions
  // In production, this could use pg_trgm extension or embeddings
  // For MVP, a simple ILIKE search is sufficient

  const { data, error } = await supabase
    .from("faqs")
    .select("answer, audience")
    .ilike("question", `%${question}%`)
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data || null;
}

export async function createMaintenanceTicket(
  ticketId: string,
  residentId: string,
  category: "maintenance" | "complaint",
  issueDescription: string,
  urgency: "LOW" | "MEDIUM" | "HIGH"
) {
  const { data, error } = await supabase
    .from("maintenance_tickets")
    .insert({
      ticket_id: ticketId,
      resident_id: residentId,
      category,
      issue_description: issueDescription,
      urgency,
    })
    .select();

  if (error) throw error;
  return data?.[0] || null;
}

export async function logCallSummary(
  logId: string,
  callerType: "PROSPECT" | "RESIDENT",
  outcome: string,
  summary: string
) {
  const { data, error } = await supabase
    .from("call_logs")
    .insert({
      log_id: logId,
      caller_type: callerType,
      outcome,
      summary,
    })
    .select();

  if (error) throw error;
  return data?.[0] || null;
}

// Utility: Get all data for the product page dashboard
export async function getDashboardData() {
  const [tours, tickets, logs] = await Promise.all([
    supabase.from("tours").select("*").order("created_at", { ascending: false }),
    supabase
      .from("maintenance_tickets")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
      .from("call_logs")
      .select("*")
      .order("created_at", { ascending: false }),
  ]);

  return {
    tours: tours.data || [],
    tickets: tickets.data || [],
    logs: logs.data || [],
  };
}

// Utility: Get all units for the product page listings
export async function getAllUnits() {
  const { data, error } = await supabase
    .from("units")
    .select("unit_number, bedrooms, price, available_date, is_available")
    .order("unit_number");

  if (error) throw error;
  return data || [];
}

// Utility: Get all FAQs for the product page
export async function getAllFaqs() {
  const { data, error } = await supabase
    .from("faqs")
    .select("faq_id, question, answer, audience")
    .order("faq_id");

  if (error) throw error;
  return data || [];
}
