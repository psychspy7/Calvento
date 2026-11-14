# CALVENTO — Luxury commerce

React + Vite storefront with INR pricing and Firebase commerce foundations.

## Firebase setup
1. Create a Firebase project and register a Web App in https://console.firebase.google.com/.
2. Copy the Web App config into a root `.env` file using the keys in `.env.example`.
3. Enable Email/Password in Firebase Authentication.
4. Create a Cloud Firestore database and enable Firebase Storage.
5. Deploy `firestore.rules` and `storage.rules` with Firebase CLI: `firebase deploy --only firestore:rules,storage`.
6. Create an admin user and assign the boolean custom claim `admin: true` from a trusted Admin SDK environment. Never commit service-account credentials or expose them in browser code.
7. Add the same VITE_FIREBASE variables to Vercel and redeploy.

## Admin
Visit `/admin`. Firebase mode supports email/password sign-in, live Firestore product updates, create/edit/delete, publish/unpublish, INR prices, stock, SKU, and image uploads to Firebase Storage. Rules require the custom admin claim for writes. Do not weaken the rules to bypass authorization.

## Data model
`products/{id}`: name, category, type, price (integer INR), description, image, sku, stock, status, createdAt, updatedAt.

Order rules are only a starting point. Checkout, stock reservation, tax, shipping, order validation and payment processing are not implemented. Production orders must be created by trusted backend/Cloud Functions after server-side price and stock validation.

Without Firebase env vars, the app uses browser localStorage preview data only. This is not shared between devices.

## Local development
`npm install && npm run dev`
`npm run build`

## SEO foundation
- India-focused English metadata, descriptive page title and meta description
- Open Graph and X/Twitter sharing metadata
- Organization, WebSite and Store structured data
- Crawler directives, favicon and web app manifest
- Admin route excluded from crawling via robots.txt

Before production SEO submission, set the permanent domain and add it to Search Console. Then publish a sitemap with absolute canonical URLs, verify canonical/redirect behaviour, and connect Search Console analytics. A temporary preview URL is intentionally not used as the canonical domain.
