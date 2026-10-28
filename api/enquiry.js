import nodemailer from "nodemailer";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TYPES = new Set(["Product enquiry", "Licence enquiry", "Request a demo", "Support", "Other"]);
const clean = (v, max) => typeof v === "string"
  ? [...v.trim()].filter(ch => ch === "\n" || ch === "\r" || ch === "\t" || ch.charCodeAt(0) >= 32).join("").slice(0, max)
  : "";

export default async function handler(req, res) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, message: "Method not allowed." });
  }
  try {
    const raw = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    if (!raw || typeof raw !== "object") return res.status(400).json({ ok: false, message: "Please submit a valid enquiry." });
    if (JSON.stringify(raw).length > 16000) return res.status(413).json({ ok: false, message: "The message is too large." });
    if (clean(raw.website, 200)) return res.status(200).json({ ok: true, message: "Thank you. Your enquiry has been received." });

    const name = clean(raw.name, 100);
    const email = clean(raw.email, 254);
    const company = clean(raw.company, 150);
    const type = clean(raw.type, 80);
    const phone = clean(raw.phone, 40);
    const message = clean(raw.message, 4000);
    const privacy = raw.privacy === true || raw.privacy === "true" || raw.privacy === "on";
    if (!name || !EMAIL_RE.test(email) || !company || !TYPES.has(type) || message.length < 10 || !privacy) {
      return res.status(400).json({ ok: false, message: "Please check the required fields and privacy acknowledgement." });
    }
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM, CONTACT_EMAIL } = process.env;
    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD || !CONTACT_EMAIL) {
      return res.status(503).json({ ok: false, message: "The enquiry form is not configured yet. Please email quoteflowai@gmail.com directly." });
    }
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST, port: Number(SMTP_PORT || 587),
      secure: Number(SMTP_PORT || 587) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
      connectionTimeout: 8000, greetingTimeout: 8000, socketTimeout: 10000
    });
    await transporter.sendMail({
      from: SMTP_FROM || SMTP_USER,
      to: CONTACT_EMAIL,
      replyTo: email,
      subject: `QuoteFlow AI website enquiry — ${type}`,
      text: `New QuoteFlow AI website enquiry\n\nName: ${name}\nBusiness email: ${email}\nCompany: ${company}\nEnquiry type: ${type}\nPhone: ${phone || "Not provided"}\n\nMessage:\n${message}\n`
    });
    return res.status(200).json({ ok: true, message: "Thank you. Your enquiry has been sent." });
  } catch {
    return res.status(502).json({ ok: false, message: "We could not send your enquiry right now. Please email quoteflowai@gmail.com directly." });
  }
}
