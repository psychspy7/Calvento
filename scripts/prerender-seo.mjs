import fs from 'node:fs';
import path from 'node:path';
import { wardrobeProducts } from '../src/wardrobeProducts.js';

const origin = 'https://calvento.thekittycorp.com';
const dist = path.resolve('dist');
const templatePath = path.join(dist, 'index.html');
if (!fs.existsSync(templatePath)) throw new Error('Vite output not found at dist/index.html');
const template = fs.readFileSync(templatePath, 'utf8');

const slugify = value => String(value || '')
  .toLowerCase()
  .normalize('NFKD')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)/g, '');

// Build comprehensive product list including named slugs and all 42 look slugs
const productPages = [];
const seenSlugs = new Set();

// 1. Add all 14 authentic wardrobe masterpieces
wardrobeProducts.forEach(p => {
  const namedSlug = slugify(p.name);
  if (!seenSlugs.has(namedSlug)) {
    seenSlugs.add(namedSlug);
    productPages.push({
      slug: namedSlug,
      name: p.name,
      category: p.category,
      description: p.description,
      image: p.image,
      price: p.price,
      sku: p.sku
    });
  }

  // Also register by product ID if not duplicate
  if (!seenSlugs.has(p.id)) {
    seenSlugs.add(p.id);
    productPages.push({
      slug: p.id,
      name: p.name,
      category: p.category,
      description: p.description,
      image: p.image,
      price: p.price,
      sku: p.sku
    });
  }
});

// 2. Add all 42 individual lookbook looks (calvento-look-00 to calvento-look-41)
for (let i = 0; i <= 41; i++) {
  const lookNumber = String(i).padStart(2, '0');
  const lookSlug = `calvento-look-${lookNumber}`;
  const imagePath = `/wardrobe/calvento-look-${lookNumber}.jpg`;

  if (!seenSlugs.has(lookSlug)) {
    seenSlugs.add(lookSlug);
    // Find matching parent piece
    const matchingPiece = wardrobeProducts.find(p =>
      p.image === imagePath || (p.images && p.images.includes(imagePath))
    ) || wardrobeProducts[0];

    productPages.push({
      slug: lookSlug,
      name: `${matchingPiece.name} — Look ${lookNumber}`,
      category: matchingPiece.category,
      description: `${matchingPiece.tagline || matchingPiece.description} · Haute Couture Look ${lookNumber} from the CALVENTO Autumn-Winter 2026 Collection.`,
      image: imagePath,
      price: matchingPiece.price,
      sku: `${matchingPiece.sku}-L${lookNumber}`
    });
  }
}

// 3. Preserve legacy product slugs for backwards-compatibility
const legacyProducts = [
  ['sovereign-wool-overcoat', 'Sovereign Wool Overcoat', 'Apparel', 'Relaxed tailored outerwear with a considered wool-blend finish.', '/wardrobe/calvento-look-29.jpg', 352000, 'CV-0001'],
  ['cashmere-crewneck-knit', 'Cashmere Crewneck Knit', 'Apparel', 'A soft-touch knit layer designed as an elevated everyday essential.', '/wardrobe/calvento-look-00.jpg', 82000, 'CV-0002'],
  ['atelier-leather-tote', 'Atelier Leather Tote', 'Accessories', 'A structured everyday carry piece with a clean, considered silhouette.', '/wardrobe/calvento-look-32.jpg', 239000, 'CV-0003'],
  ['serein-leather-loafer', 'Serein Leather Loafer', 'Accessories', 'Understated contemporary footwear with polished lines.', '/wardrobe/calvento-look-27.jpg', 121500, 'CV-0004'],
  ['forma-ceramic-table-lamp', 'Forma Ceramic Table Lamp', 'Living', 'Sculptural lighting designed to bring warm ambience to living spaces.', '/wardrobe/calvento-look-01.jpg', 40500, 'CV-0005'],
  ['no-08-eau-de-parfum', 'No. 08 Eau de Parfum', 'Objects', 'A woody floral fragrance profile with cedar, iris and musk notes.', '/wardrobe/calvento-look-01.jpg', 40500, 'CV-0006']
];

legacyProducts.forEach(([slug, name, category, description, image, price, sku]) => {
  if (!seenSlugs.has(slug)) {
    seenSlugs.add(slug);
    productPages.push({ slug, name, category, description, image, price, sku });
  }
});

const escapeHtml = value => String(value).replace(/[&<>"']/g, ch => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}[ch]));

const today = new Date().toISOString().slice(0, 10);
const staticPageStyle = `<style>
.seo-static{max-width:1080px;margin:0 auto;padding:48px 6vw 80px;color:#eeeae2;background:#0b0b0a;font:16px/1.7 'DM Sans',Arial,sans-serif}
.seo-static a{color:#c7ad57;text-decoration:none}
.seo-static a:hover{text-decoration:underline}
.seo-static header{display:flex;justify-content:space-between;gap:20px;align-items:center;border-bottom:1px solid rgba(232,226,214,.17);padding-bottom:18px;margin-bottom:38px}
.seo-static header a{font:24px 'Italiana',Georgia,serif;letter-spacing:.25em;color:#eeeae2}
.seo-static .eyebrow{font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#c7ad57}
.seo-static h1{font:clamp(38px,6vw,68px)/1.08 'Italiana',Georgia,serif;letter-spacing:-.03em;margin:16px 0;color:#eeeae2}
.seo-static .product-grid-static{display:grid;grid-template-columns:1fr 1fr;gap:40px;margin:30px 0}
@media(max-width:760px){.seo-static .product-grid-static{grid-template-columns:1fr}}
.seo-static .product-image{width:100%;max-height:640px;object-fit:cover;display:block;border:1px solid rgba(232,226,214,.17)}
.seo-static .price-tag{font:28px 'Italiana',Georgia,serif;color:#c7ad57;margin:15px 0}
.seo-static .bespoke-notice{background:rgba(199,173,87,.1);border:1px solid rgba(199,173,87,.3);padding:14px 18px;margin:24px 0;font-size:13px;line-height:1.6}
.seo-static footer{margin-top:60px;border-top:1px solid rgba(232,226,214,.17);padding-top:22px;font-size:12px;color:#898780}
</style>`;

function makePage(product) {
  const { slug, name, category, description, image, price, sku } = product;
  const url = `${origin}/products/${slug}`;
  const imageUrl = image.startsWith('http') ? image : `${origin}${image}`;
  let html = template;

  html = html.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(name)} | CALVENTO Haute Luxury</title>`);
  html = html.replace(/<link rel="canonical" href="[^"]*"\s*\/>/, `<link rel="canonical" href="${url}" />`);
  html = html.replace(/<meta name="description" content="[^"]*"\s*\/>/, `<meta name="description" content="${escapeHtml(description)} Commission bespoke luxury wardrobe at CALVENTO." />`);
  html = html.replace(/<meta property="og:type" content="[^"]*"\s*\/>/, `<meta property="og:type" content="product" />`);
  html = html.replace(/<meta property="og:url" content="[^"]*"\s*\/>/, `<meta property="og:url" content="${url}" />`);
  html = html.replace(/<meta property="og:title" content="[^"]*"\s*\/>/, `<meta property="og:title" content="${escapeHtml(name)} | CALVENTO" />`);
  html = html.replace(/<meta property="og:description" content="[^"]*"\s*\/>/, `<meta property="og:description" content="${escapeHtml(description)}" />`);
  html = html.replace(/<meta property="og:image" content="[^"]*"\s*\/>/, `<meta property="og:image" content="${imageUrl}" />`);
  html = html.replace(/<meta property="og:image:secure_url" content="[^"]*"\s*\/>/, `<meta property="og:image:secure_url" content="${imageUrl}" />`);
  html = html.replace(/<meta name="twitter:title" content="[^"]*"\s*\/>/, `<meta name="twitter:title" content="${escapeHtml(name)} | CALVENTO" />`);
  html = html.replace(/<meta name="twitter:description" content="[^"]*"\s*\/>/, `<meta name="twitter:description" content="${escapeHtml(description)}" />`);
  html = html.replace(/<meta name="twitter:image" content="[^"]*"\s*\/>/, `<meta name="twitter:image" content="${imageUrl}" />`);

  // Remove existing FAQPage schema if present in base template
  const baseSchemaStart = html.indexOf('<script type="application/ld+json">');
  if (baseSchemaStart >= 0) {
    const jsonStart = baseSchemaStart + '<script type="application/ld+json">'.length;
    const jsonEnd = html.indexOf('</script>', jsonStart);
    try {
      const baseGraph = JSON.parse(html.slice(jsonStart, jsonEnd));
      baseGraph['@graph'] = baseGraph['@graph'].filter(item => item['@type'] !== 'FAQPage');
      html = html.slice(0, jsonStart) + JSON.stringify(baseGraph) + html.slice(jsonEnd);
    } catch (e) {
      // ignore json parse error
    }
  }

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    'name': name,
    'description': description,
    'category': category,
    'sku': sku || 'CV-EDIT',
    'image': [imageUrl],
    'brand': { '@type': 'Brand', 'name': 'CALVENTO' },
    'offers': {
      '@type': 'Offer',
      'price': price || 40500,
      'priceCurrency': 'INR',
      'availability': 'https://schema.org/InStock',
      'url': url
    },
    'url': url
  };

  const schemaTag = `<script type="application/ld+json" id="calvento-static-product-schema">${JSON.stringify(schema).replace(/</g, '\\u003c')}</script>`;
  html = html.replace('</head>', `${schemaTag}\n</head>`);

  const formattedPrice = price ? `₹${price.toLocaleString('en-IN')}` : 'Price upon inquiry';

  const body = `<main class="seo-static">
    <header>
      <a href="/">CALVENTO®</a>
      <span class="eyebrow">A KITTY CORP ENTERPRISE</span>
    </header>
    <p class="eyebrow">${escapeHtml(category)} / CALVENTO AUTUMN-WINTER 2026</p>
    <h1>${escapeHtml(name)}</h1>
    <div class="product-grid-static">
      <div>
        <img class="product-image" src="${escapeHtml(imageUrl)}" alt="${escapeHtml(name)} — CALVENTO Haute Luxury" fetchpriority="high">
      </div>
      <div>
        <p class="price-tag">${formattedPrice}</p>
        <p>${escapeHtml(description)}</p>
        <div class="bespoke-notice">
          <strong>⚜️ MADE-TO-ORDER CRAFTSMANSHIP</strong><br/>
          Every CALVENTO piece is meticulously handcrafted upon commission. Orders and bespoke fittings are coordinated directly with our WhatsApp Concierge (+91 92416 19573).
        </div>
        <p>
          <a href="https://wa.me/919241619573?text=${encodeURIComponent(`Hello CALVENTO Concierge, I would like to inquire about commissioning ${name} (SKU: ${sku || 'CV-EDIT'}).`)}" target="_blank" rel="noopener">Inquire on WhatsApp Concierge (+91 92416 19573) →</a>
        </p>
        <p><a href="/">← Return to the full CALVENTO collection</a> · <a href="/contact">Client care</a></p>
      </div>
    </div>
    <footer>
      CALVENTO — Contemporary quiet luxury, consciously made. An enterprise of KITTY CORP · <a href="mailto:support@thekittycorp.com">support@thekittycorp.com</a>
    </footer>
  </main>`;

  html = html.replace(/<div id="root">[\s\S]*?<\/div>/, `<div id="root">${staticPageStyle}${body}</div>`);
  return html;
}

for (const product of productPages) {
  const folder = path.join(dist, 'products', product.slug);
  fs.mkdirSync(folder, { recursive: true });
  fs.writeFileSync(path.join(folder, 'index.html'), makePage(product));
}

// Legal and service pages
const legalPages = [
  {
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    description: 'How CALVENTO handles customer inquiries, bespoke commissions and service security.',
    intro: 'This notice outlines our strict privacy standards regarding client commissions, measurements, and concierge communication.',
    sections: [
      ['Who operates this house', 'CALVENTO is a bespoke fashion house operating as an enterprise of KITTY CORP. Inquiries and client concierge: support@thekittycorp.com / +91 92416 19573.'],
      ['Bespoke client data', 'We process only the personal details, sizing measurements, and contact information necessary to tailor your garments and fulfill delivery.'],
      ['Data sovereignty & security', 'We do not sell client data. Concierge conversations conducted via WhatsApp are protected by end-to-end encryption.'],
      ['Contact', 'Direct privacy inquiries to Virat Anand, Founder & CEO, KITTY CORP at support@thekittycorp.com.']
    ]
  },
  {
    slug: 'terms-and-conditions',
    title: 'Terms & Conditions',
    description: 'Bespoke commission conditions and terms for the CALVENTO luxury storefront.',
    intro: 'These terms apply to all bespoke tailoring commissions, inquiries, and orders placed with the House of CALVENTO.',
    sections: [
      ['Made-to-Order policy', 'All CALVENTO garments are produced to order upon commission confirmation. Dedicated craftsmanship timelines are communicated prior to tailoring initiation.'],
      ['Artisanal variation', 'Because our garments utilize natural Grade-A fibers (Mongolian Cashmere, Como Silk, French Linen, Italian Leathers), subtle natural fiber variations attest to authentic provenance.'],
      ['Intellectual property', 'All designs, imagery, typography, and trademarks remain the exclusive property of CALVENTO and KITTY CORP.']
    ]
  },
  {
    slug: 'shipping-returns',
    title: 'Shipping & White-Glove Delivery',
    description: 'Complimentary insured shipping and white-glove packaging for CALVENTO commissions.',
    intro: 'CALVENTO provides complimentary insured delivery on all commissions across India and internationally.',
    sections: [
      ['Signature packaging', 'Every commission arrives in our signature linen presentation box with gold-debossed ribbon and dust bags.'],
      ['Tailoring schedule', 'Garments require 5 to 10 working days of artisanal craftsmanship prior to dispatch.'],
      ['Returns on bespoke pieces', 'Due to the tailored nature of made-to-order garments, returns are accepted for tailoring adjustments or store credit within 14 days of receipt.']
    ]
  },
  {
    slug: 'refund-cancellation',
    title: 'Refunds & Cancellations',
    description: 'Policy regarding bespoke order adjustments, tailoring guarantees, and cancellations.',
    intro: 'We stand unconditionally behind the craftsmanship of every garment bearing the CALVENTO insignia.',
    sections: [
      ['Order modifications', 'Modifications to sizing or fabric requests can be made within 24 hours of commission confirmation via WhatsApp concierge.'],
      ['Craftsmanship guarantee', 'If any piece fails to match agreed bespoke specifications, our atelier provides complimentary adjustments or full reimbursement.']
    ]
  },
  {
    slug: 'contact',
    title: 'Contact CALVENTO Concierge',
    description: 'Private client appointments, concierge WhatsApp line, and executive contact.',
    intro: 'Connect with our private client concierge for bespoke commissions, sizing advice, or private viewing appointments.',
    sections: [
      ['WhatsApp Concierge', 'Direct Line: +91 92416 19573 (Instant response 9:00 AM – 9:00 PM IST)'],
      ['Email Concierge', 'support@thekittycorp.com'],
      ['Enterprise & Founder', 'Virat Anand, Founder & CEO, KITTY CORP. Website: thekittycorp.com']
    ]
  }
];

function makeLegalPage(page) {
  const url = `${origin}/${page.slug}`;
  let html = template;
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(page.title)} | CALVENTO</title>`);
  html = html.replace(/<link rel="canonical" href="[^"]*"\s*\/>/, `<link rel="canonical" href="${url}" />`);
  html = html.replace(/<meta name="description" content="[^"]*"\s*\/>/, `<meta name="description" content="${escapeHtml(page.description)}" />`);

  const sections = page.sections.map(([h, b]) => `<section><h2>${escapeHtml(h)}</h2><p>${escapeHtml(b)}</p></section>`).join('');
  const body = `<main class="seo-static">
    <header>
      <a href="/">CALVENTO®</a>
      <span class="eyebrow">A KITTY CORP ENTERPRISE</span>
    </header>
    <p class="eyebrow">CALVENTO / CLIENT INFORMATION</p>
    <h1>${escapeHtml(page.title)}</h1>
    <p>${escapeHtml(page.intro)}</p>
    ${sections}
    <footer>
      CALVENTO · <a href="mailto:support@thekittycorp.com">support@thekittycorp.com</a> · <a href="/">Return to storefront</a>
    </footer>
  </main>`;

  html = html.replace(/<div id="root">[\s\S]*?<\/div>/, `<div id="root">${staticPageStyle}${body}</div>`);
  return html;
}

for (const page of legalPages) {
  const folder = path.join(dist, page.slug);
  fs.mkdirSync(folder, { recursive: true });
  fs.writeFileSync(path.join(folder, 'index.html'), makeLegalPage(page));
}

// Generate sitemap.xml
const legalPaths = ['privacy-policy', 'terms-and-conditions', 'shipping-returns', 'refund-cancellation', 'contact'];
const urls = [
  ['/', 1.0, 'daily'],
  ...legalPaths.map(p => [`/${p}`, 0.5, 'monthly']),
  ...productPages.map(p => [`/products/${p.slug}`, 0.8, 'weekly'])
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(([loc, priority, change]) => `  <url>
    <loc>${origin}${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${change}</changefreq>
    <priority>${priority.toFixed(1)}</priority>
  </url>`).join('\n')}
</urlset>
`;

fs.writeFileSync(path.join(dist, 'sitemap.xml'), sitemap);
console.log(`Prerendered homepage, ${productPages.length} product/look routes, 5 legal pages and sitemap.xml.`);
