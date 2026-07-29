// Edge function: create_maintenance_ticket
// Creates a maintenance or complaint ticket for a resident

import { supabase, generateId, handleError } from "../shared/db.ts";
import type {
  CreateMaintenanceTicketRequest,
  CreateMaintenanceTicketResponse,
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

    const body: CreateMaintenanceTicketRequest = await req.json();

    // Validate request
    if (
      !body.resident_id ||
      !body.category ||
      !body.issue_description ||
      !body.urgency
    ) {
      return new Response(
        JSON.stringify({
          error:
            "Missing required parameters: resident_id, category, issue_description, urgency",
        } as ErrorResponse),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Validate category
    if (!["maintenance", "complaint"].includes(body.category)) {
      return new Response(
        JSON.stringify({
          error: 'category must be "maintenance" or "complaint"',
        } as ErrorResponse),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Validate urgency
    if (!["LOW", "MEDIUM", "HIGH"].includes(body.urgency)) {
      return new Response(
        JSON.stringify({
          error: 'urgency must be "LOW", "MEDIUM", or "HIGH"',
        } as ErrorResponse),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Generate ticket ID
    const ticketId = generateId("TKT");

    // Insert maintenance ticket
    const { data, error } = await supabase
      .from("maintenance_tickets")
      .insert({
        ticket_id: ticketId,
        resident_id: body.resident_id,
        category: body.category,
        issue_description: body.issue_description,
        urgency: body.urgency,
      })
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return new Response(
        JSON.stringify({
          error: "Failed to create maintenance ticket",
          details: error.message,
        } as ErrorResponse),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const response: CreateMaintenanceTicketResponse = {
      ticket_id: ticketId,
      status: "created",
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
