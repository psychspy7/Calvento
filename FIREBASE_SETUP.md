# CALVENTO Firebase setup

Intended Firebase project: `calvento-commerce` (web app: `CALVENTO Store`).

## Web app configuration

In Firebase Console → Project settings → General → Your apps → CALVENTO Store, copy the web app config into the Vercel **Production** environment:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_ADMIN_EMAIL` — email of the authorised Firebase admin account

The first six values are browser app configuration, not service-account secrets. Never put a service-account JSON/private key into Vite variables or browser code.

## Enable services

1. Authentication → Sign-in method → enable Email/Password.
2. Create a Firestore database.
3. Enable the default Firebase Storage bucket.

## Admin permission

The admin account must have the custom claim `admin: true`. Assign it only from a trusted server/Admin SDK environment. Never grant admin claims from browser code.

## Deploy rules

From a trusted machine with Firebase CLI authenticated to this project:

```bash
firebase use calvento-commerce
firebase deploy --only firestore:rules,storage
```

Rules are provided in `firestore.rules` and `storage.rules`.

## Finish deployment

Add all seven Vercel environment variables to Production and redeploy the latest `main` commit. Admin route: `/authabcd`.

The storefront reads active catalogue products. Only a signed-in account with the admin custom claim can create, edit, delete products or upload product images.
