export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";
export type BookingPaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface NewBookingDoc {
  user_id: string;
  service_id: string;
  scheduled_at: string;
  notes?: string | null;
}

export interface UpdateBookingDoc {
  id: string;
  user_id: string;
  scheduled_at?: string;
  notes?: string | null;
  status?: BookingStatus;
  payment_status?: BookingPaymentStatus;
}
