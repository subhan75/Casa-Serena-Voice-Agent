// Edge function: schedule_tour
// Books a tour for a prospect and returns a confirmation

import { supabase, generateId, handleError } from "../shared/db.ts";
import type {
  ScheduleTourRequest,
  ScheduleTourResponse,
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

    const body: ScheduleTourRequest = await req.json();

    // Validate request
    if (!body.name || !body.phone || !body.unit_number || !body.tour_time) {
      return new Response(
        JSON.stringify({
          error:
            "Missing required parameters: name, phone, unit_number, tour_time",
        } as ErrorResponse),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Generate confirmation ID
    const confirmationId = generateId("TOUR");

    // Insert tour booking
    const { data, error } = await supabase
      .from("tours")
      .insert({
        confirmation_id: confirmationId,
        name: body.name,
        phone: body.phone,
        unit_number: body.unit_number,
        tour_time: body.tour_time,
      })
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return new Response(
        JSON.stringify({
          error: "Failed to schedule tour",
          details: error.message,
        } as ErrorResponse),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const response: ScheduleTourResponse = {
      confirmation_id: confirmationId,
      tour_time: body.tour_time,
      status: "booked",
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
