# QuoteFlow AI — React + Vercel edition

This is a React/Vite conversion of the supplied QuoteFlow AI public website. The existing HTML page bodies and original CSS, logo, app screenshot, favicon, and site copy are preserved rather than redesigned. React loads each original page body into the application and reinitializes the existing interactions (mobile menu, reveal animation, current year, enquiry form and internal navigation).

This is the **public marketing website only**. It does not replace or modify the QuoteFlow AI application.

## Requirements

- Node.js 20 or newer (current LTS recommended)
- npm
- A Vercel account
- A GitHub repository for deployment

## Run locally

From the extracted project folder:

```powershell
npm install
npm run dev
```

Open the local URL printed by Vite, normally `http://localhost:5173`.

Build and preview the production bundle:

```powershell
npm run build
npm run preview
```

## Deploy to Vercel

1. Upload the contents of this folder to a new GitHub repository. Do not upload `.env` files or credentials.
2. In Vercel, choose **Add New → Project**, import the repository.
3. Vercel detects Vite. Use:
   - Framework preset: **Vite**
   - Build command: `npm run build`
   - Output directory: `dist`
   - Install command: `npm install`
4. Add environment variables (below) in **Project → Settings → Environment Variables**.
5. Deploy. Test the generated `vercel.app` URL before adding the custom domain.
6. In **Settings → Domains**, add `quoteflowai.sparrownexus.in`; follow Vercel's exact DNS instructions at your DNS provider.

## Environment variables

The contact form sends email from a Vercel Function at `/api/enquiry`. Set these in Vercel, then redeploy:

- `SMTP_HOST` — SMTP server hostname from your email provider
- `SMTP_PORT` — usually `587` for STARTTLS or `465` for implicit TLS
- `SMTP_USER` — SMTP username
- `SMTP_PASSWORD` — SMTP password or provider-specific app password
- `SMTP_FROM` — optional sender address accepted by your provider; defaults to `SMTP_USER`
- `CONTACT_EMAIL` — destination inbox, for example `quoteflowai@gmail.com`
- `VITE_APP_URL` — optional URL of the actual QuoteFlow AI application. If set, `/login` redirects there. If unset, the existing “login unavailable” page is shown.

Never put SMTP credentials in variables prefixed with `VITE_`: Vite exposes those values to client-side code. Do not put credentials in source files or commit them to GitHub.

The contact form intentionally reports that it is not configured until valid SMTP values are supplied. Test a real enquiry after configuring them.

## Routing and page content

The original page bodies are preserved in `public/pages/`. The shared stylesheet and image assets remain in `public/assets/`. Vercel rewrites ordinary page routes to the React app; the React app maps them to the original page content. The API route is implemented separately in `api/enquiry.js`.

Routes include `/`, `/features`, `/how-it-works`, `/solutions`, `/about`, `/contact`, `/login`, `/terms`, `/privacy`, `/software-license`, `/refunds`, `/intellectual-property`, `/customer-exit`, `/security`, and `/accessibility`.

## Important production notes

- The provided HTML includes canonical URLs using `https://YOUR-DOMAIN.example`. Update those canonical and structured-data URLs to `https://quoteflowai.sparrownexus.in` before launch. Also update `public/sitemap.xml` and `public/robots.txt` if they contain the placeholder domain.
- The contact API validates input and uses a honeypot. Vercel Functions are stateless; an in-memory rate limiter would not be reliable across instances, so this conversion does not pretend to provide a durable rate limit. Before high-traffic production use, add a shared rate-limit store or a managed anti-abuse service.
- Review the legal pages and final licensing terms with an appropriate professional before publishing.
- Verify email delivery, the app URL, DNS and HTTPS after deployment.
- The existing website does not claim a live payment/checkout flow and this conversion does not add one.
- This project is designed for Vercel's Node.js Functions and static output. It does not run the original persistent `server.py` HTTP server on Vercel.

## Project structure

- `src/main.jsx` — React routing shell and original page interaction initializers
- `public/pages/` — supplied page HTML, retained as content
- `public/assets/` — supplied CSS, logo, screenshot, favicon
- `api/enquiry.js` — Vercel serverless enquiry endpoint
- `vercel.json` — Vercel API and SPA rewrite configuration
- `vite.config.js` — Vite configuration

## Project structure checks

Run `py -3 -m unittest discover -s tests -v` to verify the required React, Vercel, content-page, and asset files are present. This is not a substitute for `npm install`, `npm run build`, and a live deployment test.
