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

const legalPages = [
  {slug:'privacy-policy',title:'Privacy policy',description:'How CALVENTO handles contact information, website data and service-provider integrations during its online-store launch.',intro:'This notice explains how CALVENTO handles information as the website and its shopping services are being developed and integrated. We will update this policy before enabling new data-collection or transaction features.',sections:[
    ['Who operates this site','CALVENTO is a fashion and lifestyle brand associated with KITTY CORP. The website and its commerce features are in active development. The public-facing brand contact is support@thekittycorp.com.'],
    ['Information you provide','If you contact us, we process the contact details and message you choose to provide so we can respond. As newsletter, customer-account and shopping features are integrated, the information requested and its purpose will be explained at the point of collection.'],
    ['Store systems and service providers','The website is being prepared to use service providers for catalogue management, customer accounts, order handling, payment processing and image storage. The relevant providers and data flows will be described in this policy before those features are enabled.'],
    ['Local browser data','The website may use essential browser storage to remember shopping and interface preferences as those features are introduced. Any non-essential analytics or advertising technologies will be explained and managed in accordance with applicable requirements.'],
    ['Data minimisation','We aim to collect only information needed to provide the features you choose to use. Information about new data uses will be provided when those features are introduced.'],
    ['Hosting and security','Our hosting and technology providers may process technical information such as IP address, browser type and request logs to deliver, secure and maintain the website. Relevant service providers will be identified in this policy as integrations are finalised.'],
    ['Your choices','You may contact us to request access, correction or deletion of personal information, or to raise a privacy concern, subject to applicable law and identity verification.'],
    ['Contact','Privacy enquiries: support@thekittycorp.com. We will publish any additional grievance and entity details required by applicable law before the store launches.']
  ]},
  {slug:'terms-and-conditions',title:'Terms & conditions',description:'Terms for using the CALVENTO website as its online shopping experience is prepared for launch.',intro:'CALVENTO is actively developing and integrating its online shopping experience. These terms apply to your use of the website and will be updated as new services are introduced.',sections:[
    ['Store development','Product names, images, prices, materials, sizing and availability may be updated as the collection and commerce services are finalised. Final details will be presented before an order is placed.'],
    ['Shopping and orders','Shopping, account, checkout and payment features are being integrated. A purchase will only be formed when the relevant order flow is made available and you receive an order confirmation. Product details and availability will be shown during that process.'],
    ['Product information','Display colours and appearance can vary by screen. Final composition, origin, care, fit and availability will be shown with the product information before purchase.'],
    ['Intellectual property','CALVENTO and its original brand materials are presented for the CALVENTO project. You may not copy, reproduce or commercially exploit site content without permission, except where permitted by law.'],
    ['Acceptable use','Do not attempt to disrupt the site, bypass access controls, probe administrative endpoints or upload malicious content. The administration route is restricted to authorised personnel.'],
    ['Third-party services','The site may rely on hosting, font, image, catalogue and payment service providers as integrations are completed. Their applicable terms and privacy notices will be linked where relevant.'],
    ['Changes and contact','We may update these terms as the store develops. Questions: support@thekittycorp.com.']
  ]},
  {slug:'shipping-returns',title:'Shipping & returns',description:'CALVENTO delivery, shipping, return and exchange information for the upcoming online-store launch.',intro:'CALVENTO is preparing its shipping and returns programme as the online store moves towards launch. The final service terms will be published before orders are accepted.',sections:[
    ['Shipping','Delivery destinations, carrier partners, dispatch estimates, shipping fees and tracking arrangements are being finalised and will be published before orders open.'],
    ['Returns and exchanges','The return and exchange window, eligibility conditions, process and timelines are being finalised and will be published before sales begin.'],
    ['Product condition','For any future order, keep original packaging and tags until you have reviewed the item. The final policy will explain exceptions for damaged, defective or incorrectly supplied goods.'],
    ['Need help?','Contact support@thekittycorp.com for product or launch enquiries.']
  ]},
  {slug:'refund-cancellation',title:'Refunds & cancellations',description:'CALVENTO refund, payment reversal and cancellation information ahead of online-store launch.',intro:'CALVENTO is integrating its checkout and order-management services. The final refund and cancellation process will be published before the store begins accepting orders.',sections:[
    ['Payments','Payment methods, refund eligibility, timelines and cancellation cut-offs will be clearly displayed before a customer completes a purchase.'],
    ['Refund process','This page will be updated with refund eligibility, timelines, payment reversal methods, cancellation cut-offs and escalation details before checkout is activated.'],
    ['Enquiries','For questions about the store launch, contact support@thekittycorp.com.']
  ]},
  {slug:'contact',title:'Contact CALVENTO',description:'Contact CALVENTO customer care for product, launch, privacy and accessibility enquiries.',intro:'For product questions, privacy requests, accessibility feedback or general enquiries, reach the CALVENTO team through KITTY CORP.',sections:[
    ['Customer care','Email: support@thekittycorp.com'],
    ['Brand association','CALVENTO — A KITTY CORP enterprise. Founder contact: Virat Anand, Founder & CEO, KITTY CORP.'],
    ['Grievance contact','Virat Anand · support@thekittycorp.com. Please include a clear description of your concern and any relevant correspondence.'],
    ['Accessibility','If you encounter a barrier using this website, email us with the page URL and a description of the issue.']
  ]}
];

function makeLegalPage(page) {
  const url = origin + '/' + page.slug;
  let html = template;
  html = html.replace('<title>CALVENTO — Premium Fashion, Accessories & Objects</title>', '<title>' + escapeHtml(page.title) + ' | CALVENTO</title>');
  html = html.replace('<link rel="canonical" href="https://calvento.thekittycorp.com/" />', '<link rel="canonical" href="' + url + '" />');
  html = html.replace('<meta name="description" content="Explore CALVENTO, a contemporary fashion and lifestyle brand from India. Discover considered apparel, modern tailoring, eveningwear, accessories, home objects and personal essentials." />', '<meta name="description" content="' + escapeHtml(page.description) + '" />');
  html = html.replace('<meta property="og:url" content="https://calvento.thekittycorp.com/" />', '<meta property="og:url" content="' + url + '" />');
  html = html.replace('<meta property="og:title" content="CALVENTO — Premium Fashion, Accessories & Living" />', '<meta property="og:title" content="' + escapeHtml(page.title + ' | CALVENTO') + '" />');
  html = html.replace('<meta property="og:description" content="Discover contemporary fashion, modern tailoring, eveningwear, accessories and considered living objects from CALVENTO, a contemporary fashion and lifestyle brand." />', '<meta property="og:description" content="' + escapeHtml(page.description) + '" />');
  const schemaStart = html.indexOf('<script type="application/ld+json">');
  if (schemaStart >= 0) {
    const jsonStart = schemaStart + '<script type="application/ld+json">'.length;
    const jsonEnd = html.indexOf('</script>', jsonStart);
    const baseGraph = JSON.parse(html.slice(jsonStart, jsonEnd));
    baseGraph['@graph'] = baseGraph['@graph'].filter(item => item['@type'] !== 'FAQPage');
    baseGraph['@graph'].push({'@type':'WebPage','name':page.title + ' | CALVENTO','description':page.description,'url':url,'inLanguage':'en-IN'});
    html = html.slice(0, jsonStart) + JSON.stringify(baseGraph) + html.slice(jsonEnd);
  }
  const sections = page.sections.map(([heading,body])=>'<section><h2>' + escapeHtml(heading) + '</h2><p>' + escapeHtml(body) + '</p></section>').join('');
  const body = '<main class="seo-static"><header><a href="/">CALVENTO®</a><span class="eyebrow">A KITTY CORP ENTERPRISE</span></header><p class="eyebrow">CALVENTO / CUSTOMER INFORMATION</p><h1>' + escapeHtml(page.title) + '</h1><p>' + escapeHtml(page.intro) + '</p>' + sections + '<footer>CALVENTO · <a href="mailto:support@thekittycorp.com">support@thekittycorp.com</a> · <a href="/">Return to the CALVENTO house</a></footer></main>';
  const rootStart = html.indexOf('<div id="root">');
  const rootEnd = html.indexOf('</div>', rootStart) + 6;
  html = html.slice(0, rootStart) + '<div id="root">' + staticPageStyle + body + '</div>' + html.slice(rootEnd);
  return html;
}

for (const page of legalPages) {
  const folder = path.join(dist, page.slug);
  fs.mkdirSync(folder, {recursive:true});
  fs.writeFileSync(path.join(folder,'index.html'), makeLegalPage(page));
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
