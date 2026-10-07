# Google SEO deployment checklist

The app now emits canonical metadata, Open Graph/Twitter cards, organization and person structured data, `robots.txt`, and a database-backed `sitemap.xml`.

## Required before production

1. Set `NEXT_PUBLIC_SITE_URL` in the production environment to the site's real, preferred HTTPS origin, for example `https://www.your-domain.example` (replace with the actual domain). Keep the same host variant everywhere and redirect the other variant (such as `www` versus non-`www`) to it.
2. Apply the additive SQL migrations under `src/db/migrations/` to the production database before deploying code that queries those columns. Do not run them against the wrong database.
3. Deploy, then open `https://<your-domain>/robots.txt` and `https://<your-domain>/sitemap.xml` to confirm both return successfully.
4. Verify the domain in Google Search Console (DNS verification is recommended), submit `/sitemap.xml`, and use URL Inspection for the homepage, important achievement pages, and member profiles.
5. Add only verified official social links, public contact details, and any Google verification token. Do not invent business details or stuff keywords into page copy.

Vercel's production URL is used as a fallback when available. For the current Netlify deployment, the production fallback is `https://science-club.netlify.app`; override `NEXT_PUBLIC_SITE_URL` if you use a custom domain. Self-hosted deployments must set `NEXT_PUBLIC_SITE_URL`. The local development fallback is `http://localhost:3000` and must not be used as the production canonical URL.

Technical SEO cannot guarantee a first-page or top ranking. Rankings also depend on the real domain, original useful content, trusted inbound links, crawlability, performance, and ongoing Search Console monitoring. Keep achievement, project, member, and certificate titles/descriptions accurate and specific.
