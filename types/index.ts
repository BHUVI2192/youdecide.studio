/** A row of the masked `public_leaderboard` view (safe to send to the browser). */
export type PublicEntry = {
  id: string;
  display_name: string;
  project_name: string;
  service_type: string;
  amount: number;
  link_url: string;
  created_at: string;
  /** Fictional preview row; always badged DEMO in the UI. */
  demo?: boolean;
};

/** Full contribution row as seen by an admin, with its private details. */
export type AdminContribution = {
  id: string;
  customer_display_name: string;
  project_name: string;
  service_type: string;
  amount: number;
  currency: string;
  link_url: string;
  is_anonymous: boolean;
  consent_to_public_display: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  contribution_private: { contact_name: string; contact_email: string; notes: string } | null;
};

export type EmailDeliveryStatus = "pending" | "sent" | "failed";

export type AdminEnquiry = {
  id: string;
  name: string;
  email: string;
  business_name: string;
  service_interest: string;
  project_description: string;
  approximate_budget: string;
  preferred_contact_method: string;
  status: string;
  internal_notes: string;
  email_delivery_status: EmailDeliveryStatus;
  email_delivery_error: string | null;
  created_at: string;
};
