import React, { Suspense, lazy, useEffect, useMemo, useState, useRef } from 'react';
const Admin = lazy(() => import('./Admin.jsx'));
const Legal = lazy(() => import('./Legal.jsx'));
import { subscribeToProducts, subscribeToNewsletter, createOrder, getDefaultProducts } from './services/storeService.js';
import { getWhatsAppCartUrl, getWhatsAppProductUrl, WHATSAPP_DISPLAY_PHONE } from './whatsappCheckout.js';
import {
  ArrowRight, ArrowUpRight, Search, Heart, ShoppingBag,
  Menu, X, Plus, Minus, Check, Instagram, Linkedin,
  Clock, MessageCircle, Sparkles, ChevronLeft, ChevronRight,
  Grid3X3, LayoutGrid, ZoomIn, ShieldCheck, Gift
} from 'lucide-react';

const slugify = value => String(value || '')
  .toLowerCase()
  .normalize('NFKD')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)/g, '');

const money = n => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0
}).format(Number(n) || 0);

const moneyUSD = n => n ? new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0
}).format(Number(n)) : '';

// Hero Campaign Lookbook slides featuring authentic wardrobe looks
const heroCampaignSlides = [
  {
    lookId: 'cv-w-14',
    image: '/wardrobe/calvento-look-00.jpg',
    campaign: 'CAMPAIGN No. 01 · ICONIC KNITWEAR',
    season: 'AUTUMN—WINTER 2026',
    title: 'Form & essence.',
    subtitle: 'The St. Moritz Cashmere',
    tagline: '100% Grade-A Mongolian Cashmere · 4-Ply Knit · Unisex Capsule',
    lede: 'Spun from spring underfleece with saddle raglan shoulders for an effortless anatomical drape across all genders.'
  },
  {
    lookId: 'cv-w-10',
    image: '/wardrobe/calvento-look-30.jpg',
    campaign: 'CAMPAIGN No. 02 · BESPOKE TAILORING',
    season: 'EVENING COMMISSION',
    title: 'Midnight & gold.',
    subtitle: 'The Aurelius Tuxedo',
    tagline: 'Super 160s Tasmanian Wool · Silk Duchesse Lapels · 24K Ingot Bar',
    lede: 'Full floating natural horsehair canvas double-breasted dinner jacket tailored in Naples, finished with a solid gold pocket bar.'
  },
  {
    lookId: 'cv-w-04',
    image: '/wardrobe/calvento-look-13.jpg',
    campaign: 'CAMPAIGN No. 03 · HAUTE COUTURE',
    season: 'RUNWAY EDIT',
    title: 'Liquid emerald.',
    subtitle: 'The Smeraldo Gown',
    tagline: '30-Momme Silk Charmeuse · True Bias Cut · 24K Gold Clasp',
    lede: 'Cut on the 45-degree bias in Como silk that drapes like mercury, anchored by a solid brass 24K gold shoulder cuff.'
  },
  {
    lookId: 'cv-w-01',
    image: '/wardrobe/calvento-look-01.jpg',
    campaign: 'CAMPAIGN No. 04 · HAUTE PARFUMERIE',
    season: 'OBJECTS OF DESIRE',
    title: 'Obsidian & oud.',
    subtitle: 'Calvento Noir Extrait',
    tagline: '30% Extrait Concentration · Cambodian Oud · 24K Gold Stopper',
    lede: 'Formulated in Grasse bastions with nocturnal black rose, smoked frankincense, and rare aged Cambodian oud.'
  }
];

function App() {
  const [products, setProducts] = useState(getDefaultProducts);
  const [category, setCategory] = useState('All');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'lookbook'
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [zoomActive, setZoomActive] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [cart, setCart] = useState([]);
  const [giftBox, setGiftBox] = useState(true);
  const [saved, setSaved] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [heroSlide, setHeroSlide] = useState(0);
  const [isHeroHovered, setIsHeroHovered] = useState(false);

  // Subscribe to products via StoreService
  useEffect(() => {
    const unsub = subscribeToProducts(items => {
      if (Array.isArray(items) && items.length > 0) {
        setProducts(items);
      }
    });
    return unsub;
  }, []);

  // Hero carousel auto-timer
  useEffect(() => {
    if (isHeroHovered) return;
    const interval = setInterval(() => {
      setHeroSlide(prev => (prev + 1) % heroCampaignSlides.length);
    }, 6500);
    return () => clearInterval(interval);
  }, [isHeroHovered]);

  const visible = useMemo(() => {
    return products.filter(p =>
      p.status !== 'draft' &&
      (category === 'All' || p.category === category) &&
      (!query ||
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase()) ||
        (p.tagline && p.tagline.toLowerCase().includes(query.toLowerCase())) ||
        (p.tags && p.tags.some(t => t.toLowerCase().includes(query.toLowerCase()))))
    );
  }, [products, category, query]);

  const count = cart.reduce((s, p) => s + p.qty, 0);
  const total = cart.reduce((s, p) => s + (p.price || 0) * p.qty, 0);

  // Handle routing for /admin, /authabcd, and legal pages
  const pathname = window.location.pathname;
  if (pathname === '/admin' || pathname === '/authabcd') {
    return (
      <Suspense fallback={<div className="admin-loading">CALVENTO / STORE ADMINISTRATION</div>}>
        <Admin />
      </Suspense>
    );
  }

  if (['/privacy-policy', '/terms-and-conditions', '/shipping-returns', '/refund-cancellation', '/contact'].includes(pathname)) {
    return (
      <Suspense fallback={<div className="admin-loading">CALVENTO / THE HOUSE</div>}>
        <Legal />
      </Suspense>
    );
  }

  const openProduct = p => {
    setSelectedProduct(p);
    setSelectedImage(0);
    setSelectedSize(p.sizes && p.sizes.length ? p.sizes[0] : '');
    setZoomActive(false);
    window.history.pushState({}, '', '/products/' + slugify(p.name));
  };

  const closeProduct = () => {
    setSelectedProduct(null);
    setZoomActive(false);
    window.history.replaceState({}, '', '/');
  };

  // URL synchronization
  useEffect(() => {
    const syncProductFromUrl = () => {
      const parts = window.location.pathname.split('/').filter(Boolean);
      const slug = parts[0] === 'products' ? parts[1] : null;
      if (slug) {
        const found = products.find(p => slugify(p.name) === slug || String(p.id) === slug);
        if (found) {
          setSelectedProduct(found);
          setSelectedImage(0);
          setSelectedSize(found.sizes && found.sizes.length ? found.sizes[0] : '');
        }
      }
    };
    syncProductFromUrl();
    window.addEventListener('popstate', syncProductFromUrl);
    return () => window.removeEventListener('popstate', syncProductFromUrl);
  }, [products]);

  // SEO metadata & canonical sync
  useEffect(() => {
    const title = selectedProduct
      ? `${selectedProduct.name} | CALVENTO Haute Luxury`
      : 'CALVENTO — Bespoke Fashion, Haute Horlogerie & Living Objects';
    document.title = title;

    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.href = selectedProduct ? window.location.href : 'https://calvento.thekittycorp.com/';

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', title);

    const desc = document.querySelector('meta[name="description"]');
    if (desc) {
      desc.setAttribute('content', selectedProduct
        ? `${selectedProduct.name}. ${selectedProduct.tagline || selectedProduct.description} Handcrafted bespoke luxury at CALVENTO.`
        : 'Explore CALVENTO, an elite contemporary fashion house from India. Discover bespoke tailoring, Mongolian cashmere, Como silk gowns and fine leather goods.');
    }
  }, [selectedProduct]);

  const flash = msg => {
    setNotice(msg);
    window.clearTimeout(window.__calventoToast);
    window.__calventoToast = window.setTimeout(() => setNotice(''), 2600);
  };

  const add = (product, size = '') => {
    if (product.stock !== undefined && product.stock <= 0) {
      flash('This commission is currently fully booked.');
      return;
    }
    const chosenSize = size || (product.sizes && product.sizes.length ? product.sizes[0] : '');
    const key = `${product.id}-${chosenSize}`;
    setCart(old => {
      const found = old.find(p => p.cartKey === key);
      return found
        ? old.map(p => p.cartKey === key ? { ...p, qty: p.qty + 1 } : p)
        : [...old, { ...product, cartKey: key, selectedSize: chosenSize, qty: 1 }];
    });
    flash(`Added ${product.name} to your selection`);
  };

  const updateQty = (key, delta) => {
    setCart(old => old.map(p =>
      (p.cartKey || p.id) === key ? { ...p, qty: p.qty + delta } : p
    ).filter(p => p.qty > 0));
  };

  const toggleSave = id => {
    setSaved(old => old.includes(id) ? old.filter(x => x !== id) : [...old, id]);
  };

  const jump = id => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileOpen(false);
  };

  const handleNewsletter = async e => {
    e.preventDefault();
    const res = await subscribeToNewsletter(email);
    if (res.success) {
      setSubscribed(true);
      setEmail('');
      flash('Welcome to the private CALVENTO correspondence.');
    } else {
      flash(res.message);
    }
  };

  const handleOrderArchive = () => {
    if (cart.length > 0) {
      createOrder({
        items: cart.map(i => ({
          id: i.id,
          name: i.name,
          sku: i.sku,
          price: i.price,
          qty: i.qty,
          selectedSize: i.selectedSize
        })),
        total,
        giftPackaging: giftBox,
        placedVia: 'whatsapp_concierge'
      });
    }
  };

  // Zoom Loupe mouse movement
  const handleImageMouseMove = e => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  };

  // "Complete the Look" recommended pairings
  const pairedProducts = useMemo(() => {
    if (!selectedProduct) return [];
    if (selectedProduct.pairingIds && selectedProduct.pairingIds.length) {
      return selectedProduct.pairingIds
        .map(id => products.find(p => p.id === id))
        .filter(Boolean)
        .slice(0, 3);
    }
    // Fallback: pick products in different categories
    return products
      .filter(p => p.id !== selectedProduct.id && p.category !== selectedProduct.category)
      .slice(0, 3);
  }, [selectedProduct, products]);

  const activeSlide = heroCampaignSlides[heroSlide];
  const activeDetailImg = selectedProduct
    ? ((selectedProduct.images && selectedProduct.images.length > 0)
      ? selectedProduct.images[selectedImage] || selectedProduct.image
      : selectedProduct.image)
    : '';

  return (
    <div className="site-shell">
      {/* Top Luxury Announcement Bar */}
      <div className="announcement">
        <span>COMPLIMENTARY WHITE-GLOVE SHIPPING ON ALL BESPOKE COMMISSIONS ACROSS INDIA</span>
        <span className="announce-right">
          MADE-TO-ORDER · HANDCRAFTED WITH DEVOTION <i>✳</i>
        </span>
      </div>

      {/* Main Luxury Header */}
      <header className="header">
        <button
          className="icon-btn mobile-menu"
          aria-label="Open menu"
          onClick={() => setMobileOpen(true)}
        >
          <Menu size={22} />
        </button>

        <nav className="desktop-nav">
          <button onClick={() => jump('collection')}>THE WARDROBE</button>
          <button onClick={() => jump('philosophy')}>THE HOUSE</button>
          <button onClick={() => jump('journal')}>JOURNAL</button>
        </nav>

        <a
          className="wordmark"
          href="#"
          onClick={e => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          CALVENTO<span>®</span>
        </a>

        <div className="header-actions">
          <button
            className="icon-btn"
            aria-label="Search collection"
            onClick={() => setSearchOpen(true)}
          >
            <Search size={19} />
          </button>

          <button
            className="icon-btn saved-action"
            aria-label="Saved pieces"
            onClick={() => {
              setCategory('All');
              jump('collection');
              flash(saved.length ? `${saved.length} saved masterpieces` : 'Your private curation is empty');
            }}
          >
            <Heart size={19} fill={saved.length > 0 ? '#c7ad57' : 'none'} color={saved.length > 0 ? '#c7ad57' : 'currentColor'} />
            {saved.length > 0 && <b className="tiny-count">{saved.length}</b>}
          </button>

          <button
            className="icon-btn bag-action"
            aria-label="Private shopping bag"
            onClick={() => setCartOpen(true)}
          >
            <ShoppingBag size={19} />
            <b className="bag-count">{count}</b>
          </button>
        </div>
      </header>

      {/* Full-screen Mobile Menu */}
      {mobileOpen && (
        <div className="mobile-menu-panel">
          <div className="mobile-menu-top">
            <span className="wordmark">CALVENTO<span>®</span></span>
            <button className="icon-btn" onClick={() => setMobileOpen(false)}><X size={22}/></button>
          </div>
          <button onClick={() => jump('collection')}>The Wardrobe Edit <ArrowUpRight /></button>
          <button onClick={() => jump('philosophy')}>Atelier & Philosophy <ArrowUpRight /></button>
          <button onClick={() => jump('journal')}>The Journal <ArrowUpRight /></button>
          <a
            href="https://wa.me/919241619573"
            target="_blank"
            rel="noopener noreferrer"
            className="mobile-concierge-link"
          >
            <MessageCircle size={16}/> WhatsApp Concierge (+91 92416 19573)
          </a>
          <small>AUTUMN—WINTER 2026 · HAUTE SUR MESURE</small>
        </div>
      )}

      <main>
        {/* Editorial Campaign Hero Carousel */}
        <section
          className="hero"
          onMouseEnter={() => setIsHeroHovered(true)}
          onMouseLeave={() => setIsHeroHovered(false)}
        >
          <div className="hero-image">
            <img
              key={activeSlide.image}
              src={activeSlide.image}
              alt={activeSlide.subtitle}
              fetchPriority="high"
              decoding="async"
              className="hero-fade-in"
            />
            <div className="image-index">
              {activeSlide.campaign} <span>{activeSlide.season}</span>
            </div>
            <div className="hero-carousel-nav">
              <button
                className="hero-nav-arrow"
                aria-label="Previous look"
                onClick={() => setHeroSlide((heroSlide - 1 + heroCampaignSlides.length) % heroCampaignSlides.length)}
              >
                <ChevronLeft size={18} />
              </button>
              <div className="hero-indicators">
                {heroCampaignSlides.map((s, idx) => (
                  <button
                    key={s.lookId}
                    className={`hero-dot ${heroSlide === idx ? 'active' : ''}`}
                    onClick={() => setHeroSlide(idx)}
                    aria-label={`Look ${idx + 1}`}
                  >
                    0{idx + 1}
                  </button>
                ))}
              </div>
              <button
                className="hero-nav-arrow"
                aria-label="Next look"
                onClick={() => setHeroSlide((heroSlide + 1) % heroCampaignSlides.length)}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className="hero-copy">
            <div className="eyebrow">
              <span className="gold-dot"></span> CALVENTO / {activeSlide.season}
            </div>
            <h1>{activeSlide.title.split(' ')[0]}<br/><em>{activeSlide.title.split(' ').slice(1).join(' ')}</em></h1>
            <p className="hero-lede">{activeSlide.lede}</p>
            <div className="hero-tagline-badge">
              <Sparkles size={13} /> {activeSlide.tagline}
            </div>
            <div className="hero-links">
              <button
                className="gold-button"
                onClick={() => {
                  const target = products.find(p => p.id === activeSlide.lookId);
                  if (target) openProduct(target);
                  else jump('collection');
                }}
              >
                EXPLORE THIS LOOK <ArrowUpRight size={15}/>
              </button>
              <button className="text-link" onClick={() => jump('philosophy')}>
                OUR CRAFTSMANSHIP <ArrowUpRight size={14}/>
              </button>
            </div>
            <div className="hero-foot">
              <span>0{heroSlide + 1} / 0{heroCampaignSlides.length} — {activeSlide.subtitle.toUpperCase()}</span>
              <span>TAILORED TO COMMISSION<br/>NOT MASS PRODUCED.</span>
            </div>
            <div className="hero-ornament">C.</div>
          </div>
        </section>

        {/* Manifesto & Bespoke Storytelling */}
        <section className="manifesto" id="philosophy">
          <div className="section-kicker">
            <span>01 / THE CALVENTO STANDARD</span>
            <span>INTENTIONAL TAILORING</span>
          </div>
          <div className="manifesto-grid">
            <h2>Luxury is<br/><em>not hurried.</em></h2>
            <div className="manifesto-copy">
              <p>
                True quiet luxury demands patience. Every garment in the CALVENTO wardrobe is handcrafted to order by heritage artisans across Como, Biella, Naples, and Grasse. We do not maintain warehouses of deadstock. When you commission a piece, it is cut, draped, and stitched exclusively for you over time.
              </p>
              <div className="bespoke-ethos-row">
                <div>
                  <Clock size={16} />
                  <b>5–7 DAYS CRAFTSMANSHIP</b>
                  <span>Meticulously tailored upon commission confirmation</span>
                </div>
                <div>
                  <ShieldCheck size={16} />
                  <b>CERTIFIED PROVENANCE</b>
                  <span>Mongolian Cashmere, Como Silk & French Chantilly</span>
                </div>
              </div>
              <a onClick={() => jump('collection')}>
                DISCOVER THE 14 MASTERPIECES <ArrowUpRight size={14}/>
              </a>
            </div>
          </div>
        </section>

        {/* The Wardrobe Catalog with Dual-View Toggle */}
        <section className="collection-section" id="collection">
          <div className="collection-heading">
            <div>
              <div className="section-kicker">
                <span>02 / THE HAUTE WARDROBE</span>
                <span>14 PIECES · 42 LOOKS</span>
              </div>
              <h2>Objects of <em>intention.</em></h2>
            </div>
            <p>
              An authentic capsule spanning sartorial tailoring, cashmere knitwear,<br className="desktop-only"/>
              pure silk eveningwear and haute parfumerie.
            </p>
          </div>

          <div className="collection-toolbar">
            <div className="filters">
              {['All', 'Apparel', 'Accessories', 'Living', 'Objects'].map(c => (
                <button
                  key={c}
                  className={category === c ? 'active' : ''}
                  onClick={() => setCategory(c)}
                >
                  {c}
                </button>
              ))}
            </div>

            <div className="toolbar-controls">
              <div className="view-mode-toggle">
                <button
                  className={viewMode === 'grid' ? 'active' : ''}
                  onClick={() => setViewMode('grid')}
                  title="Precision Grid (4 Columns)"
                >
                  <Grid3X3 size={14} /> GRID
                </button>
                <button
                  className={viewMode === 'lookbook' ? 'active' : ''}
                  onClick={() => setViewMode('lookbook')}
                  title="Editorial Lookbook (2 Columns)"
                >
                  <LayoutGrid size={14} /> LOOKBOOK
                </button>
              </div>
              <span className="item-counter">
                {visible.length.toString().padStart(2, '0')} PIECES <span className="toolbar-divider">/</span> AW26
              </span>
            </div>
          </div>

          {/* Catalog Render: Precision Grid vs. Editorial Lookbook */}
          {viewMode === 'grid' ? (
            <div className="product-grid">
              {visible.map(p => (
                <article
                  className="product-card"
                  key={p.id}
                  role="button"
                  tabIndex="0"
                  aria-label={`View ${p.name} details`}
                  onClick={() => openProduct(p)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      openProduct(p);
                    }
                  }}
                >
                  <div className="product-image">
                    <img
                      src={p.image}
                      alt={`${p.name} — CALVENTO`}
                      loading="lazy"
                    />
                    <span className="product-label">{p.type || 'HAUTE EDIT'}</span>
                    <button
                      className={`heart-btn ${saved.includes(p.id) ? 'is-saved' : ''}`}
                      aria-label="Save piece"
                      onClick={e => {
                        e.stopPropagation();
                        toggleSave(p.id);
                      }}
                    >
                      <Heart size={17} fill={saved.includes(p.id) ? 'currentColor' : 'none'} />
                    </button>
                    <button
                      className="quick-add"
                      onClick={e => {
                        e.stopPropagation();
                        add(p, p.sizes?.[0] || '');
                      }}
                    >
                      COMMISSION PIECE <ArrowUpRight size={13}/>
                    </button>
                  </div>
                  <div className="product-meta">
                    <span>{p.category.toUpperCase()}</span>
                    <span>{money(p.price)}</span>
                  </div>
                  <h3>
                    <a
                      className="product-title-link"
                      href={'/products/' + slugify(p.name)}
                      onClick={e => {
                        e.preventDefault();
                        e.stopPropagation();
                        openProduct(p);
                      }}
                    >
                      {p.name}
                    </a>
                  </h3>
                  <p className="product-tagline">{p.tagline || p.description}</p>
                  <button
                    className="view-details"
                    onClick={e => {
                      e.stopPropagation();
                      openProduct(p);
                    }}
                  >
                    INSPECT CRAFT & SIZE <ArrowUpRight size={12}/>
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <div className="lookbook-grid">
              {visible.map(p => (
                <article
                  className="lookbook-card"
                  key={p.id}
                  onClick={() => openProduct(p)}
                >
                  <div className="lookbook-gallery">
                    <img src={p.image} alt={p.name} loading="lazy" />
                    {p.images && p.images.length > 1 && (
                      <div className="lookbook-alt-preview">
                        <img src={p.images[1]} alt={`${p.name} detail view`} loading="lazy" />
                      </div>
                    )}
                  </div>
                  <div className="lookbook-details">
                    <div className="lookbook-header">
                      <span className="eyebrow">{p.type} · {p.category.toUpperCase()}</span>
                      <span className="lookbook-sku">{p.sku}</span>
                    </div>
                    <h2>{p.name}</h2>
                    <p className="lookbook-tagline">{p.tagline}</p>
                    <p className="lookbook-narrative">{p.narrative || p.description}</p>
                    <div className="lookbook-price-bar">
                      <div>
                        <strong>{money(p.price)}</strong>
                        {p.priceUSD && <small> / {moneyUSD(p.priceUSD)} USD</small>}
                      </div>
                      <button
                        className="gold-button"
                        onClick={e => {
                          e.stopPropagation();
                          openProduct(p);
                        }}
                      >
                        COMMISSION LOOK <ArrowUpRight size={14}/>
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {visible.length === 0 && (
            <div className="empty-state">No commissions match this filter. Try another category.</div>
          )}

          <div className="collection-bottom">
            <span>THE CALVENTO WARDROBE — {visible.length.toString().padStart(2, '0')} VERIFIED PIECES</span>
            <button onClick={() => { setCategory('All'); setQuery(''); }}>
              RESET CATALOG FILTERS <ArrowUpRight size={14}/>
            </button>
          </div>
        </section>

        {/* Feature Story / Material Study */}
        <section className="feature-story">
          <div className="feature-photo">
            <img
              src="/wardrobe/calvento-look-38.jpg"
              alt="Italian Goatskin Suede Blouson in architectural foyer"
              loading="lazy"
            />
            <span>STUDY No. 02 / MATERIAL PROVENANCE</span>
          </div>
          <div className="feature-copy">
            <div className="section-kicker"><span>03 / THE ATELIER STANDARD</span></div>
            <h2>Uncompromising<br/><em>matter.</em></h2>
            <p>
              We believe garments earn their reverence through tactile honesty. From 15.2-micron Grade-A Mongolian cashmere to Italian vernice patent calfskin and solid 24K gold-plated brass ingots, every material is selected to mature with poise through decades of wear.
            </p>
            <button className="light-button" onClick={() => jump('journal')}>
              EXPLORE OUR MATERIAL LEDGER <ArrowUpRight size={14}/>
            </button>
            <div className="feature-number">14</div>
          </div>
        </section>

        {/* Journal Section */}
        <section className="journal-section" id="journal">
          <div className="section-kicker">
            <span>04 / THE JOURNAL</span>
            <span>CHRONICLES OF BESPOKE TIME</span>
          </div>
          <div className="journal-heading">
            <h2>In <em>practice.</em></h2>
            <button onClick={() => flash('Full journal chronicles publishing soon.')}>
              VIEW ARCHIVE <ArrowUpRight size={14}/>
            </button>
          </div>
          <div className="journal-grid">
            <article>
              <div className="journal-image">
                <img src="/wardrobe/calvento-look-29.jpg" loading="lazy" alt="Aurelius Double-Breasted Dinner Jacket" />
                <span>01 / SARTORIAL CUT</span>
              </div>
              <small>NAPLES ATELIER / 09.26</small>
              <h3>The architecture of the Neapolitan peak lapel.</h3>
              <p>Why horsehair canvas floating chests preserve an unassailable silhouette under evening light.</p>
              <a onClick={() => flash('Story available in next release.')}>READ MONOGRAPH <ArrowUpRight size={13}/></a>
            </article>

            <article>
              <div className="journal-image">
                <img src="/wardrobe/calvento-look-12.jpg" loading="lazy" alt="Emerald Bias-Cut Gown" />
                <span>02 / SILK WEAVE</span>
              </div>
              <small>COMO ATELIER / 10.26</small>
              <h3>Draping 30-Momme Charmeuse on the true bias.</h3>
              <p>Cutting silk on the exact 45-degree grain produces liquid movement unattainable by conventional seaming.</p>
              <a onClick={() => flash('Story available in next release.')}>READ MONOGRAPH <ArrowUpRight size={13}/></a>
            </article>

            <article>
              <div className="journal-image">
                <img src="/wardrobe/calvento-look-27.jpg" loading="lazy" alt="Patent leather stiletto pumps" />
                <span>03 / OBJECT DESIGN</span>
              </div>
              <small>VIGEVANO ATELIER / 11.26</small>
              <h3>Mirror-finish vernice and the 105mm balance.</h3>
              <p>The mathematical equilibrium between natural cuoio soles and razor-sharp stiletto pitch.</p>
              <a onClick={() => flash('Story available in next release.')}>READ MONOGRAPH <ArrowUpRight size={13}/></a>
            </article>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="faq-section" aria-labelledby="faq-title">
          <div className="section-kicker">
            <span>05 / THE HOUSE</span>
            <span>COMMISSION QUESTIONS, CONSIDERED</span>
          </div>
          <div className="faq-heading">
            <h2 id="faq-title">A few things<br/><em>worth knowing.</em></h2>
            <p>Clear guidance on our bespoke commission model, tailoring timelines, and concierge care.</p>
          </div>
          <div className="faq-list">
            <details>
              <summary>How does the Made-to-Order commission process work?</summary>
              <p>
                CALVENTO operates exclusively on a commission basis. When you select pieces and proceed via WhatsApp Concierge (+91 92416 19573), our atelier confirms your exact measurements, advises on tailoring timelines (typically 5–7 business days), and initiates handcrafted production.
              </p>
            </details>
            <details>
              <summary>What materials and provenances define CALVENTO garments?</summary>
              <p>
                Our collections use certified 100% Grade-A Mongolian Cashmere (15.2 micron), pure Como mulberry silk charmeuse, French Chantilly lace, French box calfskin, and custom 24K gold-plated Swiss hardware.
              </p>
            </details>
            <details>
              <summary>Can I request bespoke sizing or private fitting appointments?</summary>
              <p>
                Yes. Our WhatsApp Concierge connects you directly with a master tailoring consultant who can accommodate bespoke dimensions, sleeve length adjustments, or coordinate private viewings.
              </p>
            </details>
            <details>
              <summary>Where is CALVENTO based and how is delivery handled?</summary>
              <p>
                CALVENTO is an India-focused luxury house associated with KITTY CORP. All commissions receive complimentary insured white-glove packaging in signature linen presentation boxes with gold debossed seals.
              </p>
            </details>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="newsletter">
          <div>
            <div className="section-kicker"><span>PRIVATE CORRESPONDENCE</span></div>
            <h2>A little more<br/><em>considered.</em></h2>
            <p>Occasional monographs on craft, new commissions, and private salon viewings.<br/>No mass noise. Only what matters.</p>
          </div>
          <form onSubmit={handleNewsletter}>
            <label htmlFor="email">CLIENT EMAIL ADDRESS</label>
            <div className="email-line">
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="client@house.com"
                required
              />
              <button aria-label="Subscribe to correspondence"><ArrowUpRight/></button>
            </div>
            <small>
              {subscribed
                ? 'Your address has been placed on the private CALVENTO register.'
                : 'By enrolling, you accept private salon correspondence from CALVENTO.'}
            </small>
          </form>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-main">
          <div className="footer-brand">
            <a className="wordmark" href="#">CALVENTO<span>®</span></a>
            <p>Haute luxury wardrobe.<br/>Consciously commissioned.</p>
            <a className="enterprise-link" href="https://thekittycorp.com/" target="_blank" rel="noopener noreferrer">
              A KITTY CORP ENTERPRISE <ArrowUpRight size={12}/>
            </a>
            <p className="footer-operator">
              Brand stewardship: KITTY CORP · Founder: Virat Anand<br/>
              WhatsApp Concierge: +91 92416 19573 · support@thekittycorp.com
            </p>
            <div className="social" aria-label="KITTY CORP social networks">
              <a href="https://www.instagram.com/kittycorp.ai/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><Instagram size={17}/></a>
              <a href="https://linkedin.com/in/virat-anand-928460442" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><Linkedin size={17}/></a>
              <a href="https://wa.me/919241619573" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp Concierge"><MessageCircle size={17}/></a>
            </div>
          </div>

          <div className="footer-col">
            <span>CLIENT CONCIERGE</span>
            <a href="https://wa.me/919241619573" target="_blank" rel="noopener noreferrer">WhatsApp Order Line</a>
            <a href="/shipping-returns">White-Glove Shipping</a>
            <a href="/contact">Bespoke Inquiries</a>
          </div>

          <div className="footer-col">
            <span>THE HOUSE</span>
            <a onClick={() => jump('philosophy')}>Our Philosophy</a>
            <a onClick={() => jump('collection')}>The Wardrobe Edit</a>
            <a onClick={() => jump('journal')}>Atelier Journal</a>
          </div>

          <div className="footer-col">
            <span>CALVENTO STUDIO</span>
            <a href="/admin">Store Control Room ↗</a>
            <a href="/privacy-policy">Privacy Policy</a>
            <a href="/terms-and-conditions">Terms of Commission</a>
            <a href="/refund-cancellation">Craftsmanship Guarantee</a>
          </div>
        </div>

        <div className="footer-enterprise-band">
          <span>CALVENTO</span>
          <b>A KITTY CORP ENTERPRISE · VIRAT ANAND</b>
          <a href="https://thekittycorp.com/" target="_blank" rel="noopener noreferrer">
            MEET THE COMPANY <ArrowUpRight size={13}/>
          </a>
        </div>

        <div className="footer-bottom">
          <span>© 2026 CALVENTO. ALL RIGHTS RESERVED.</span>
          <span>HAUTE TAILORING ON COMMISSION <i>✳</i></span>
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>BACK TO TOP ↑</button>
        </div>
      </footer>

      {/* Product Detail Modal with Fabric Inspection Loupe & Complete the Look */}
      {selectedProduct && (
        <div
          className="overlay product-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={selectedProduct.name}
          onClick={closeProduct}
        >
          <section
            className="product-detail-panel"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="product-detail-close icon-btn"
              aria-label="Close product view"
              onClick={closeProduct}
            >
              <X size={20}/>
            </button>

            {/* Left: Gallery with Fabric Zoom Loupe */}
            <div className="detail-gallery">
              <div
                className={`detail-main-image ${zoomActive ? 'is-zoomed' : ''}`}
                onMouseMove={handleImageMouseMove}
                onMouseEnter={() => setZoomActive(true)}
                onMouseLeave={() => setZoomActive(false)}
              >
                <img
                  src={activeDetailImg}
                  alt={`${selectedProduct.name} main view`}
                />

                {/* Magnification Loupe Lens */}
                {zoomActive && (
                  <div
                    className="zoom-loupe"
                    style={{
                      backgroundImage: `url(${activeDetailImg})`,
                      backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
                      backgroundSize: '280%'
                    }}
                  />
                )}

                <div className="zoom-indicator-pill">
                  <ZoomIn size={12}/> HOVER TO INSPECT FABRIC WEAVE
                </div>
              </div>

              {selectedProduct.images && selectedProduct.images.length > 1 && (
                <div className="detail-thumbnails">
                  {selectedProduct.images.map((src, i) => (
                    <button
                      key={src + i}
                      className={selectedImage === i ? 'selected' : ''}
                      onClick={() => setSelectedImage(i)}
                      aria-label={`View angle ${i + 1}`}
                    >
                      <img src={src} alt={`${selectedProduct.name} angle ${i + 1}`} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Specifications & Bespoke Actions */}
            <div className="detail-copy">
              <div className="section-kicker">
                <span>{selectedProduct.type || 'HAUTE COUTURE'}</span>
                <span>CALVENTO / AW26</span>
              </div>
              <p className="detail-category">{selectedProduct.category?.toUpperCase()} · SKU: {selectedProduct.sku}</p>
              <h2>{selectedProduct.name}</h2>
              <div className="detail-pricing-row">
                <span className="detail-price">{money(selectedProduct.price)}</span>
                {selectedProduct.priceUSD && (
                  <span className="detail-price-usd">({moneyUSD(selectedProduct.priceUSD)} USD)</span>
                )}
              </div>

              <p className="detail-tagline">{selectedProduct.tagline}</p>
              <p className="detail-description">{selectedProduct.description}</p>
              {selectedProduct.narrative && (
                <p className="detail-narrative">{selectedProduct.narrative}</p>
              )}

              {/* Bespoke Craftsmanship Badge */}
              <div className="bespoke-badge">
                <Clock size={15}/>
                <div>
                  <strong>MADE-TO-ORDER BESPOKE COMMISSION</strong>
                  <span>Handcrafted over 5–7 days upon order confirmation</span>
                </div>
              </div>

              {/* Size / Format Selector */}
              {selectedProduct.sizes?.length > 0 && (
                <div className="size-select">
                  <div>
                    <span>SELECT SIZE / PROPORTION</span>
                    <small>Bespoke fitting coordinated on WhatsApp</small>
                  </div>
                  <div className="size-options">
                    {selectedProduct.sizes.map(size => (
                      <button
                        key={size}
                        className={selectedSize === size ? 'chosen' : ''}
                        onClick={() => setSelectedSize(size)}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="detail-actions">
                <button
                  className="gold-button detail-add"
                  disabled={selectedProduct.sizes?.length > 0 && !selectedSize}
                  onClick={() => {
                    add(selectedProduct, selectedSize);
                    closeProduct();
                    setCartOpen(true);
                  }}
                >
                  ADD TO PRIVATE BAG <ArrowUpRight size={15}/>
                </button>

                <a
                  className="whatsapp-inquire-btn"
                  href={getWhatsAppProductUrl(selectedProduct, selectedSize)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle size={17}/>
                  <span>INQUIRE ON WHATSAPP ({WHATSAPP_DISPLAY_PHONE})</span>
                </a>
              </div>

              {/* Detailed Atelier Specifications */}
              <div className="detail-specs">
                <h3>ATELIER SPECIFICATIONS</h3>
                {(selectedProduct.specs || [
                  ['Category', selectedProduct.category],
                  ['SKU', selectedProduct.sku]
                ]).map(([label, value]) => (
                  <div key={label}>
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>

              {/* "Complete the Look" Styling Pairings Engine */}
              {pairedProducts.length > 0 && (
                <div className="complete-the-look">
                  <div className="pairings-header">
                    <Sparkles size={13}/>
                    <span>COMPLETE THE LOOK — CURATED PAIRINGS</span>
                  </div>
                  <div className="pairings-grid">
                    {pairedProducts.map(pair => (
                      <div
                        key={pair.id}
                        className="pairing-card"
                        onClick={() => openProduct(pair)}
                      >
                        <img src={pair.image} alt={pair.name} />
                        <div>
                          <b>{pair.name}</b>
                          <span>{money(pair.price)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="detail-note">
                Every CALVENTO piece is crafted to individual commission with dedicated artisanal attention. Delivery schedules and bespoke fitting advice are coordinated directly via WhatsApp concierge.
              </p>
            </div>
          </section>
        </div>
      )}

      {/* Search Modal */}
      {searchOpen && (
        <div className="overlay" onClick={() => setSearchOpen(false)}>
          <div className="search-panel" onClick={e => e.stopPropagation()}>
            <div className="panel-top">
              <span>SEARCH THE ARCHIVE</span>
              <button className="icon-btn" onClick={() => setSearchOpen(false)}><X size={18}/></button>
            </div>
            <div className="search-input">
              <Search size={22}/>
              <input
                autoFocus
                placeholder="Search cashmere, silk, leather or perfume…"
                value={query}
                onChange={e => {
                  setQuery(e.target.value);
                  setCategory('All');
                }}
              />
              <button onClick={() => {
                setSearchOpen(false);
                jump('collection');
              }}>
                EXPLORE <ArrowUpRight size={14}/>
              </button>
            </div>
            <p>CURATED PROMPTS: MONGOLIAN CASHMERE, COMO SILK, BOX CALFSKIN, TUXEDO, HAUTE PARFUM</p>
          </div>
        </div>
      )}

      {/* VIP Shopping Bag Drawer */}
      {cartOpen && (
        <div className="overlay cart-overlay" onClick={() => setCartOpen(false)}>
          <aside className="cart-drawer" onClick={e => e.stopPropagation()}>
            <div className="cart-head">
              <div>
                <span>YOUR COMMISSION SELECTION</span>
                <h2>The Bag <em>({count})</em></h2>
              </div>
              <button className="icon-btn" onClick={() => setCartOpen(false)}><X size={20}/></button>
            </div>

            {cart.length === 0 ? (
              <div className="cart-empty">
                <ShoppingBag size={32} />
                <h3>Your bag is waiting.</h3>
                <p>Select bespoke pieces tailored to individual commission.</p>
                <button
                  className="gold-button"
                  onClick={() => {
                    setCartOpen(false);
                    jump('collection');
                  }}
                >
                  EXPLORE THE WARDROBE <ArrowUpRight size={14}/>
                </button>
              </div>
            ) : (
              <>
                <div className="cart-craft-note">
                  <Clock size={15}/>
                  <div>
                    <b>BESPOKE TAILORING NOTICE:</b>
                    <span>Pieces are handcrafted over 5–7 business days upon order confirmation.</span>
                  </div>
                </div>

                <div className="cart-items">
                  {cart.map(p => (
                    <div className="cart-item" key={p.cartKey || p.id}>
                      <img src={p.image} alt={p.name} />
                      <div className="cart-item-info">
                        <span>{p.category.toUpperCase()} · {p.sku}</span>
                        <h3>{p.name}</h3>
                        {p.selectedSize && <small className="cart-size">SIZE: {p.selectedSize}</small>}
                        <p>{money(p.price)}</p>
                        <div className="qty">
                          <button onClick={() => updateQty(p.cartKey || p.id, -1)} aria-label="Decrease">
                            <Minus size={12}/>
                          </button>
                          <span>{p.qty}</span>
                          <button onClick={() => updateQty(p.cartKey || p.id, 1)} aria-label="Increase">
                            <Plus size={12}/>
                          </button>
                        </div>
                      </div>
                      <button
                        className="remove-item"
                        onClick={() => updateQty(p.cartKey || p.id, -p.qty)}
                      >
                        REMOVE
                      </button>
                    </div>
                  ))}
                </div>

                {/* VIP Complimentary Gift Packaging Option */}
                <div className="cart-packaging-toggle">
                  <label>
                    <input
                      type="checkbox"
                      checked={giftBox}
                      onChange={e => setGiftBox(e.target.checked)}
                    />
                    <div className="packaging-text">
                      <Gift size={16} />
                      <div>
                        <b>Complimentary Calvento Signature Linen Box</b>
                        <small>Gold debossed ribbon, archival tissue wrap & bespoke note (+₹0)</small>
                      </div>
                    </div>
                  </label>
                </div>

                <div className="cart-summary">
                  <div className="summary-line">
                    <span>ESTIMATED COMMISSION TOTAL</span>
                    <strong>{money(total)}</strong>
                  </div>
                  <p>
                    Complimentary white-glove shipping. Direct commission confirmation and bespoke fitting coordinated via WhatsApp Concierge.
                  </p>
                  <a
                    className="gold-button checkout whatsapp-checkout"
                    href={getWhatsAppCartUrl(cart, total, { includeGiftBox: giftBox })}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleOrderArchive}
                  >
                    <MessageCircle size={18}/>
                    <span>ORDER VIA WHATSAPP ({WHATSAPP_DISPLAY_PHONE})</span>
                    <ArrowUpRight size={15}/>
                  </a>
                  <small>DIRECT PRIVATE CLIENT CONCIERGE · BESPOKE CRAFTSMANSHIP</small>
                </div>
              </>
            )}
          </aside>
        </div>
      )}

      {/* Mobile Sticky Quick-Bag Bar */}
      {count > 0 && !cartOpen && (
        <aside className="mobile-sticky-bar" aria-label="Quick bag access">
          <button onClick={() => setCartOpen(true)}>
            <div className="sticky-info">
              <ShoppingBag size={18} />
              <span>THE BAG <b>({count})</b> · {money(total)}</span>
            </div>
            <span className="sticky-cta">
              ORDER ON WHATSAPP <ArrowRight size={14}/>
            </span>
          </button>
        </aside>
      )}

      {/* Ephemeral Toast Notification */}
      {notice && (
        <div className="toast">
          <Check size={16}/> {notice}
        </div>
      )}
    </div>
  );
}

export default App;
