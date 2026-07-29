// Edge function: check_unit_availability
// Returns up to 3 available units matching the specified bedrooms and move-in date

import { supabase, handleError } from "../shared/db.ts";
import type {
  CheckUnitAvailabilityRequest,
  CheckUnitAvailabilityResponse,
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

    const body: CheckUnitAvailabilityRequest = await req.json();

    // Validate request
    if (!body.bedrooms || !body.move_in_date) {
      return new Response(
        JSON.stringify({
          error: "Missing required parameters: bedrooms, move_in_date",
        } as ErrorResponse),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Query for available units
    const { data, error } = await supabase
      .from("units")
      .select("unit_number, bedrooms, price, available_date")
      .eq("bedrooms", body.bedrooms)
      .lte("available_date", body.move_in_date)
      .eq("is_available", true)
      .order("price", { ascending: true })
      .limit(3);

    if (error) {
      console.error("Supabase error:", error);
      return new Response(
        JSON.stringify({
          error: "Failed to query available units",
          details: error.message,
        } as ErrorResponse),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const response: CheckUnitAvailabilityResponse = {
      units: data?.map((unit) => ({
        unit_number: unit.unit_number,
        bedrooms: unit.bedrooms,
        price: Number(unit.price),
        available_date: unit.available_date,
      })) || [],
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
