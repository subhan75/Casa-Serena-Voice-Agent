// Shared type definitions for all edge functions

export interface CheckUnitAvailabilityRequest {
  bedrooms: number;
  move_in_date: string; // ISO date format
}

export interface CheckUnitAvailabilityResponse {
  units: Array<{
    unit_number: string;
    bedrooms: number;
    price: number;
    available_date: string;
  }>;
}

export interface ScheduleTourRequest {
  name: string;
  phone: string;
  unit_number: string;
  tour_time: string; // ISO datetime format
}

export interface ScheduleTourResponse {
  confirmation_id: string;
  tour_time: string;
  status: string;
}

export interface LookupResidentRequest {
  name: string;
  unit_number: string;
}

export interface LookupResidentResponse {
  found: boolean;
  resident_id?: string;
  name?: string;
  unit_number?: string;
  lease_end_date?: string;
}

export interface GetFaqAnswerRequest {
  question: string;
}

export interface GetFaqAnswerResponse {
  found: boolean;
  answer?: string;
}

export interface CreateMaintenanceTicketRequest {
  resident_id: string;
  category: "maintenance" | "complaint";
  issue_description: string;
  urgency: "LOW" | "MEDIUM" | "HIGH";
}

export interface CreateMaintenanceTicketResponse {
  ticket_id: string;
  status: string;
}

export interface LogCallSummaryRequest {
  caller_type: "PROSPECT" | "RESIDENT";
  outcome: string;
  summary: string;
}

export interface LogCallSummaryResponse {
  log_id: string;
}

export interface ErrorResponse {
  error: string;
  details?: string;
}
