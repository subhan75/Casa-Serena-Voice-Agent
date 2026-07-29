// Edge function: log_call_summary
// Records a summary of every call (prospect or resident, any outcome)

import { supabase, generateId, handleError } from "../shared/db.ts";
import type {
  LogCallSummaryRequest,
  LogCallSummaryResponse,
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

    const body: LogCallSummaryRequest = await req.json();

    // Validate request
    if (!body.caller_type || !body.outcome || !body.summary) {
      return new Response(
        JSON.stringify({
          error:
            "Missing required parameters: caller_type, outcome, summary",
        } as ErrorResponse),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Validate caller_type
    if (!["PROSPECT", "RESIDENT"].includes(body.caller_type)) {
      return new Response(
        JSON.stringify({
          error: 'caller_type must be "PROSPECT" or "RESIDENT"',
        } as ErrorResponse),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Generate log ID
    const logId = generateId("LOG");

    // Insert call log
    const { data, error } = await supabase
      .from("call_logs")
      .insert({
        log_id: logId,
        caller_type: body.caller_type,
        outcome: body.outcome,
        summary: body.summary,
      })
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return new Response(
        JSON.stringify({
          error: "Failed to log call summary",
          details: error.message,
        } as ErrorResponse),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const response: LogCallSummaryResponse = {
      log_id: logId,
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
