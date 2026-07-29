// Edge function: get_faq_answer
// Returns an FAQ answer matching the caller's question

import { supabase, handleError } from "../shared/db.ts";
import type {
  GetFaqAnswerRequest,
  GetFaqAnswerResponse,
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

    const body: GetFaqAnswerRequest = await req.json();

    // Validate request
    if (!body.question) {
      return new Response(
        JSON.stringify({
          error: "Missing required parameter: question",
        } as ErrorResponse),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Search for matching FAQ using simple keyword matching
    // The query uses ILIKE for case-insensitive substring matching
    const { data, error } = await supabase
      .from("faqs")
      .select("answer, audience")
      .ilike("question", `%${body.question}%`)
      .limit(1);

    if (error) {
      console.error("Supabase error:", error);
      return new Response(
        JSON.stringify({
          error: "Failed to search FAQs",
          details: error.message,
        } as ErrorResponse),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Check if FAQ was found
    if (!data || data.length === 0) {
      const response: GetFaqAnswerResponse = { found: false };
      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // FAQ found
    const faq = data[0];
    const response: GetFaqAnswerResponse = {
      found: true,
      answer: faq.answer,
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
