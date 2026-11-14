import fs from 'node:fs';
import path from 'node:path';

const origin = 'https://calvento.thekittycorp.com';
const dist = path.resolve('dist');
const templatePath = path.join(dist, 'index.html');
if (!fs.existsSync(templatePath)) throw new Error('Vite output not found at dist/index.html');
const template = fs.readFileSync(templatePath, 'utf8');

const products = [
  ['sovereign-wool-overcoat','Sovereign Wool Overcoat','Apparel','Relaxed tailored outerwear with a considered wool-blend finish.','https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=1200&q=90'],
  ['cashmere-crewneck-knit','Cashmere Crewneck Knit','Apparel','A soft-touch knit layer designed as an elevated everyday essential.','/products/calvento-cashmere-crewneck.svg'],
  ['atelier-leather-tote','Atelier Leather Tote','Accessories','A structured everyday carry piece with a clean, considered silhouette.','https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=90'],
  ['serein-leather-loafer','Serein Leather Loafer','Accessories','Understated contemporary footwear with polished lines.','https://images.unsplash.com/photo-1531310197839-ccf54634509e?auto=format&fit=crop&w=1200&q=90'],
  ['forma-ceramic-table-lamp','Forma Ceramic Table Lamp','Living','Sculptural lighting designed to bring warm ambience to living spaces.','https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1200&q=90'],
  ['no-08-eau-de-parfum','No. 08 Eau de Parfum','Objects','A woody floral fragrance profile with cedar, iris and musk notes.','https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1200&q=90'],
  ['arc-stainless-timepiece','Arc Stainless Timepiece','Accessories','A minimal everyday timepiece with a brushed stainless-steel look.','https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=90'],
  ['the-riviera-linen-shirt','The Riviera Linen Shirt','Apparel','A relaxed warm-weather shirt with an easy, timeless profile.','https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1200&q=90'],
  ['after-hours-satin-dress','After Hours Satin Dress','Apparel','Fluid eveningwear with an understated, occasion-ready silhouette.','https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1200&q=90'],
  ['the-form-tailored-blazer','The Form Tailored Blazer','Apparel','Modern single-breasted tailoring with a clean shoulder line.','https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=1200&q=90'],
  ['studio-ribbed-polo','Studio Ribbed Polo','Apparel','A fine-rib knit polo designed as an elevated everyday essential.','https://images.unsplash.com/photo-1711355249709-1733df63e028?auto=format&fit=crop&w=1200&q=90'],
  ['the-weekend-co-ord','The Weekend Co-ord','Apparel','A relaxed two-piece set with effortless proportions.','https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=90'],
  ['nocturne-sculpted-mini-dress','Nocturne Sculpted Mini Dress','Apparel','A sculpted neckline and confident evening silhouette.','https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1200&q=90'],
  ['rouge-bias-cut-evening-dress','Rouge Bias-Cut Evening Dress','Apparel','Fluid satin drape for considered occasion dressing.','https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=90'],
  ['the-after-hours-tailored-set','The After Hours Tailored Set','Apparel','Relaxed contemporary tailoring for modern evening dressing.','https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=1200&q=90'],
  ['second-skin-ribbed-top','Second Skin Ribbed Top','Apparel','A soft stretch-rib essential with a clean square neckline.','https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1200&q=90']
];

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const setMeta = (html, selector, replacement) => html.replace(selector, replacement);
const today = new Date().toISOString().slice(0,10);
const staticPageStyle = '<style>.seo-static{max-width:1040px;margin:0 auto;padding:48px 6vw 80px;color:#25231f;font:16px/1.7 Arial,sans-serif}.seo-static a{color:#65532b}.seo-static header{display:flex;justify-content:space-between;gap:20px;align-items:center;border-bottom:1px solid #ddd;padding-bottom:18px;margin-bottom:38px}.seo-static header a{font:22px Georgia,serif;letter-spacing:.18em;text-decoration:none}.seo-static .eyebrow{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#766c58}.seo-static h1{font:clamp(38px,7vw,68px)/1.05 Georgia,serif;letter-spacing:-.04em;margin:16px 0}.seo-static h2{font:30px Georgia,serif;margin-top:42px}.seo-static .product-image{width:min(100%,520px);max-height:620px;object-fit:cover;display:block;margin:24px 0}.seo-static li{margin:8px 0}.seo-static footer{margin-top:55px;border-top:1px solid #ddd;padding-top:18px;font-size:13px;color:#6c675e}</style>';

function makePage(product) {
  const [slug,name,category,description,image] = product;
  const url = origin + '/products/' + slug;
  const imageUrl = image.startsWith('http') ? image : origin + image;
  let html = template;
  html = html.replace(/<title>[^<]*<\/title>/, '<title>' + escapeHtml(name) + ' | CALVENTO</title>');
  html = html.replace(/<link rel="canonical" href="[^"]*"\s*\/>/, '<link rel="canonical" href="' + url + '" />');
  html = html.replace(/<meta name="description" content="[^"]*"\s*\/>/, '<meta name="description" content="' + escapeHtml(description + ' Explore ' + name + ' in the CALVENTO ' + category.toLowerCase() + ' collection.') + '" />');
  html = html.replace(/<meta property="og:type" content="[^"]*"\s*\/>/, '<meta property="og:type" content="product" />');
  html = html.replace(/<meta property="og:url" content="[^"]*"\s*\/>/, '<meta property="og:url" content="' + url + '" />');
  html = html.replace(/<meta property="og:title" content="[^"]*"\s*\/>/, '<meta property="og:title" content="' + escapeHtml(name + ' | CALVENTO') + '" />');
  html = html.replace(/<meta property="og:description" content="[^"]*"\s*\/>/, '<meta property="og:description" content="' + escapeHtml(description) + '" />');
  html = html.replace(/<meta property="og:image" content="[^"]*"\s*\/>/, '<meta property="og:image" content="' + imageUrl + '" />');
  html = html.replace(/<meta property="og:image:secure_url" content="[^"]*"\s*\/>/, '<meta property="og:image:secure_url" content="' + imageUrl + '" />');
  html = html.replace(/<meta name="twitter:title" content="[^"]*"\s*\/>/, '<meta name="twitter:title" content="' + escapeHtml(name + ' | CALVENTO') + '" />');
  html = html.replace(/<meta name="twitter:description" content="[^"]*"\s*\/>/, '<meta name="twitter:description" content="' + escapeHtml(description) + '" />');
  html = html.replace(/<meta name="twitter:image" content="[^"]*"\s*\/>/, '<meta name="twitter:image" content="' + imageUrl + '" />');
  const baseSchemaStart = html.indexOf('<script type="application/ld+json">');
  if (baseSchemaStart >= 0) {
    const jsonStart = baseSchemaStart + '<script type="application/ld+json">'.length;
    const jsonEnd = html.indexOf('</script>', jsonStart);
    const baseGraph = JSON.parse(html.slice(jsonStart, jsonEnd));
    baseGraph['@graph'] = baseGraph['@graph'].filter(item => item['@type'] !== 'FAQPage');
    html = html.slice(0, jsonStart) + JSON.stringify(baseGraph) + html.slice(jsonEnd);
  }
  const schema = {'@context':'https://schema.org','@type':'Product','name':name,'description':description,'category':category,'image':[imageUrl],'brand':{'@type':'Brand','name':'CALVENTO'},'url':url};
  const schemaTag = '<script type="application/ld+json" id="calvento-static-product-schema">' + JSON.stringify(schema).replace(/</g,'\\u003c') + '</script>';
  html = html.replace('</head>', schemaTag + '\n</head>');
  const body = '<main class="seo-static"><header><a href="/">CALVENTO®</a><span class="eyebrow">A KITTY CORP ENTERPRISE</span></header><p class="eyebrow">' + escapeHtml(category) + ' / CALVENTO COLLECTION</p><h1>' + escapeHtml(name) + '</h1><p>' + escapeHtml(description) + '</p><img class="product-image" src="' + escapeHtml(imageUrl) + '" alt="' + escapeHtml(name + ' from CALVENTO') + '" fetchpriority="high"><p>Discover this piece as part of the CALVENTO edit of contemporary fashion, accessories and considered living objects. Final product details and availability are presented through the store as launch integrations are completed.</p><p><a href="/">Explore the full CALVENTO collection</a> · <a href="/contact">Contact customer care</a></p><footer>CALVENTO — Contemporary form, considered. An enterprise of KITTY CORP · <a href="mailto:support@thekittycorp.com">support@thekittycorp.com</a></footer></main>';
  html = html.replace(/<div id="root">[\s\S]*?<\/div>/, '<div id="root">' + staticPageStyle + body + '</div>');
  return html;
}

for (const product of products) {
  const folder = path.join(dist, 'products', product[0]);
  fs.mkdirSync(folder, {recursive:true});
  fs.writeFileSync(path.join(folder,'index.html'), makePage(product));
}

const legalPaths = ['privacy-policy','terms-and-conditions','shipping-returns','refund-cancellation','contact'];
const urls = [
  ['/',1.0,'weekly'],
  ...legalPaths.map(p=>['/'+p,0.4,'monthly']),
  ...products.map(p=>['/products/'+p[0],0.8,'weekly'])
];
const sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls.map(([loc,priority,change])=>'  <url><loc>'+origin+loc+'</loc><lastmod>'+today+'</lastmod><changefreq>'+change+'</changefreq><priority>'+priority.toFixed(1)+'</priority></url>').join('\n') + '\n</urlset>\n';
fs.writeFileSync(path.join(dist,'sitemap.xml'),sitemap);
console.log('Prerendered homepage assets, ' + products.length + ' product pages and sitemap.');
