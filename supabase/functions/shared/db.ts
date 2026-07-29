// Shared database utilities for all edge functions
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase credentials in environment: SUPABASE_URL and SUPABASE_ANON_KEY"
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Generate a unique ID for records
export function generateId(prefix: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `${prefix}-${timestamp}-${random}`;
}

// Safe error handler
export interface ErrorDetails {
  status: number;
  message: string;
  details?: string;
}

export function handleError(error: unknown): ErrorDetails {
  if (error instanceof Error) {
    return {
      status: 500,
      message: "Database operation failed",
      details: error.message,
    };
  }
  return {
    status: 500,
    message: "An unexpected error occurred",
  };
}
