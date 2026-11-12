import { z } from "zod";
import { BUDGET_OPTIONS, CONTACT_METHODS, ENQUIRY_STATUSES, SERVICE_TYPES } from "./config";

const clean = (s: string) => s.replace(/\u0000/g, "").trim();
const text = (min: number, max: number, label: string) =>
  z
    .string({ error: `${label} is required` })
    .transform(clean)
    .pipe(z.string().min(min, `${label} is too short`).max(max, `${label} is too long`));

export const enquirySchema = z.object({
  name: text(2, 80, "Name"),
  email: z
    .string({ error: "Email is required" })
    .transform(clean)
    .pipe(z.email("Enter a valid email address").max(254)),
  business_name: z.string().transform(clean).pipe(z.string().max(120)).optional().default(""),
  service_interest: z.enum(SERVICE_TYPES, { error: "Choose what you want to build" }),
  project_description: text(20, 3000, "Description"),
  approximate_budget: z.enum(BUDGET_OPTIONS).optional().default("Not sure yet"),
  preferred_contact_method: z.enum(CONTACT_METHODS, { error: "Choose a contact method" }),
  // Honeypot: must stay empty. Real users never see or fill it.
  website: z.string().optional().default(""),
});
export type EnquiryInput = z.infer<typeof enquirySchema>;

const optionalUrl = z
  .string()
  .transform(clean)
  .pipe(
    z
      .string()
      .max(300)
      .refine((v) => v === "" || /^https?:\/\/[^\s]+$/i.test(v), "Link must start with http:// or https://"),
  )
  .optional()
  .default("");

export const contributionSchema = z
  .object({
    customer_display_name: text(1, 120, "Display name"),
    project_name: z.string().transform(clean).pipe(z.string().max(160)).optional().default(""),
    service_type: text(1, 120, "Service"),
    amount: z.coerce.number({ error: "Amount must be a number" }).int("Whole rupees only").min(0).max(100_000_000),
    link_url: optionalUrl,
    is_anonymous: z.boolean().default(false),
    consent_to_public_display: z.boolean().default(false),
    is_published: z.boolean().default(false),
    private_contact_name: z.string().transform(clean).pipe(z.string().max(120)).optional().default(""),
    private_contact_email: z.string().transform(clean).pipe(z.string().max(254)).optional().default(""),
    private_notes: z.string().transform(clean).pipe(z.string().max(2000)).optional().default(""),
  })
  .refine((v) => !v.is_published || v.consent_to_public_display, {
    message: "Cannot publish without recorded consent",
    path: ["is_published"],
  });
export type ContributionInput = z.infer<typeof contributionSchema>;

export const enquiryPatchSchema = z.object({
  status: z.enum(ENQUIRY_STATUSES).optional(),
  internal_notes: z.string().max(5000).optional(),
});
