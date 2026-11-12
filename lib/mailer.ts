import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import type { EnquiryInput } from "./validation";

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const oneLine = (s: string) => s.replace(/[\r\n]+/g, " ").slice(0, 120);

export function mailConfigured() {
  return Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD && process.env.CONTACT_EMAIL);
}

const SMTP_PORT = Number(process.env.SMTP_PORT) || 465;

let transporter: Transporter | null = null;
function getTransporter() {
  transporter ??= nodemailer.createTransport({
    // Gmail by default; SMTP_HOST / SMTP_PORT let you point at another server.
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });
  return transporter;
}

/** Sends the enquiry to CONTACT_EMAIL via Gmail SMTP. Throws on failure. */
export async function sendEnquiryEmail(e: EnquiryInput, id: string) {
  if (!mailConfigured()) throw new Error("Email is not configured (GMAIL_USER / GMAIL_APP_PASSWORD / CONTACT_EMAIL)");
  const rows: [string, string][] = [
    ["Name", e.name],
    ["Email", e.email],
    ["Business / project", e.business_name || "—"],
    ["Wants to build", e.service_interest],
    ["Approx. budget", e.approximate_budget],
    ["Preferred contact", e.preferred_contact_method],
  ];
  const text = [...rows.map(([k, v]) => `${k}: ${v}`), "", e.project_description, "", `Enquiry ID: ${id}`].join("\n");
  const html = `<div style="font-family:Arial,sans-serif;color:#101A35;max-width:560px">
<h2 style="margin:0 0 12px">New idea from ${esc(e.name)}</h2>
<table style="border-collapse:collapse;width:100%">${rows
    .map(([k, v]) => `<tr><td style="padding:6px 12px 6px 0;color:#5a6785;white-space:nowrap">${esc(k)}</td><td style="padding:6px 0"><b>${esc(v)}</b></td></tr>`)
    .join("")}</table>
<p style="white-space:pre-wrap;background:#DCE6FF;border-radius:12px;padding:16px;margin:16px 0">${esc(e.project_description)}</p>
<p style="color:#5a6785;font-size:12px">Enquiry ID ${esc(id)} · Reply directly to this email to answer ${esc(e.name)}.</p></div>`;
  await getTransporter().sendMail({
    from: `"youdecide.studio" <${process.env.GMAIL_USER}>`,
    to: process.env.CONTACT_EMAIL,
    replyTo: `"${oneLine(e.name).replace(/"/g, "")}" <${e.email}>`,
    subject: `New enquiry: ${oneLine(e.service_interest)} — ${oneLine(e.name)}`,
    text,
    html,
  });
}
