# Ofera Deployment & Security Guide

## 1. Security First: The Frontend Reality
A malicious actor can **always** inspect the network traffic on a client-side application (like this React app). Therefore:
-   **Never** store private keys, database passwords, or admin secrets in the frontend code.
-   **Always** validate data on the backend.
-   **Obfuscation != Security**. Minifying code helps, but doesn't stop dedicated scrapers.

## 2. Environment Variables
We have moved the hardcoded API URL out of the code.
-   **Local Development**: The app reads from the `.env` file in the root directory.
    ```
    VITE_API_URL=https://your-api-url.com/api
    ```
-   **Production**: Set `VITE_API_URL` in your hosting provider's dashboard (e.g., Vercel, Netlify, AWS Amplify).

## 3. Recommended Deployment Architecture
To protect your data from scrapers and attacks:

### A. Hosting
Deploy the frontend to a static host with global CDN and free SSL.
-   **Vercel** (Recommended for React/Vite)
-   **Netlify**
-   **AWS Amplify**

### B. The "Cloudflare Shield" (Critical)
Put **Cloudflare** in front of both your Frontend and Backend.
1.  **DDoS Protection**: Stops brute force attacks.
2.  **Bot Fight Mode**: Actively blocks known scrapers and non-human traffic.
3.  **WAF (Web Application Firewall)**: Create rules to block suspicious patterns.
4.  **Geo-Blocking**: If you only serve a specific country (e.g., India), block traffic from all other countries to reduce attack surface.

### C. Backend Hardening (The Real Gatekeeper)
Your backend is the only place you can truly strictly enforce security.
-   **Rate Limiting**: Limit requests per IP (e.g., 100 req/min). If someone tries to scrape 1000 offers in a second, ban them.
-   **CORS**: Only allow requests from `https://your-frontend-domain.com`.
-   **Auth Tokens**: Ensure sensitive endpoints require a valid JWT token.

## 4. Build for Production
To create the optimized production build:
```bash
npm run build
```
This will output to the `dist/` folder. This folder is what you upload to your host.
