# CALVENTO — Luxury commerce storefront

Responsive editorial storefront and product-control interface built with React and Vite.

## Run locally
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
npm run preview
```

## Storefront
- Responsive editorial homepage, collections and journal
- Product category filters and live search
- Wishlist and shopping bag interactions
- Quantity controls and INR subtotal display
- Newsletter UI (not yet connected to a mailing service)

## Product administration
Open `/admin` to manage the local catalogue:
- Create, edit and delete products
- Set categories, collection labels, SKUs, image URLs and descriptions
- Set native INR prices and stock quantities
- Publish or unpublish catalogue entries
- Search and filter the catalogue
- Inventory value and low-stock overview

## Current implementation boundary
The admin catalogue currently persists in the browser's localStorage. This is a functional frontend management prototype, **not yet a shared production database**. Changes are visible in the same browser profile only. Connect the selected Supabase project and apply the database schema before using it as a live multi-user product system.

Checkout is not connected to a payment provider. No customer orders or payments are currently processed. Add real product photography with appropriate usage rights, shipping/tax rules, customer policies and payment integration before launch.

## Stack
React 18 · Vite 6 · Lucide React · CSS
