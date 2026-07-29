// Edge function: lookup_resident
// Validates a resident by name and unit number using the secure RPC function

import { supabase, handleError } from "../shared/db.ts";
import type {
  LookupResidentRequest,
  LookupResidentResponse,
  ErrorResponse,
} from "../shared/types.ts";

Deno.serve(async (req) => {
  // CORS headers
  if (req.method === "OPTIONS") {
    return new Response("OK", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  try {
    // Only accept POST
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" } as ErrorResponse),
        {
          status: 405,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const body: LookupResidentRequest = await req.json();

    // Validate request
    if (!body.name || !body.unit_number) {
      return new Response(
        JSON.stringify({
          error: "Missing required parameters: name, unit_number",
        } as ErrorResponse),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Call the secure RPC function
    const { data, error } = await supabase.rpc("lookup_resident", {
      p_name: body.name,
      p_unit_number: body.unit_number,
    });

    if (error) {
      console.error("Supabase RPC error:", error);
      return new Response(
        JSON.stringify({
          error: "Failed to lookup resident",
          details: error.message,
        } as ErrorResponse),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Check if resident was found
    if (!data || data.length === 0) {
      const response: LookupResidentResponse = { found: false };
      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Resident found
    const resident = data[0];
    const response: LookupResidentResponse = {
      found: true,
      resident_id: resident.resident_id,
      name: resident.name,
      unit_number: resident.unit_number,
      lease_end_date: resident.lease_end_date,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const err = handleError(error);
    return new Response(JSON.stringify({ error: err.message }), {
      status: err.status,
      headers: { "Content-Type": "application/json" },
    });
  }
});
