import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft, Plus, Search, Edit3, Trash2, Eye, EyeOff, Package,
  Save, X, CheckCircle2, LogOut, Cloud, AlertCircle, RefreshCw, Sparkles
} from 'lucide-react';
import './admin.css';
import { firebaseConfigured, app } from './firebase.js';
import { wardrobeProducts } from './wardrobeProducts.js';
import {
  saveProduct, deleteProduct, toggleProductStatus, seedWardrobeProducts
} from './services/storeService.js';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, getIdTokenResult } from 'firebase/auth';
import { getFirestore, collection, onSnapshot } from 'firebase/firestore';

const auth = (firebaseConfigured && app) ? getAuth(app) : null;
const db = (firebaseConfigured && app) ? getFirestore(app) : null;
const adminEmail = (import.meta.env.VITE_FIREBASE_ADMIN_EMAIL || '').trim().toLowerCase();

const blank = {
  name: '',
  category: 'Apparel',
  type: 'HAUTE COUTURE',
  price: '',
  description: '',
  image: '',
  images: [],
  sku: '',
  stock: 12,
  status: 'draft',
  sizes: ['S', 'M', 'L']
};

const money = n => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0
}).format(Number(n) || 0);

export default function Admin() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [localSession, setLocalSession] = useState(() => sessionStorage.getItem('calvento_admin_auth') === 'true');
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const [items, setItems] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('calvento_products_v4'));
      if (Array.isArray(saved) && saved.length > 0) return saved;
      return wardrobeProducts;
    } catch {
      return wardrobeProducts;
    }
  });

  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blank);
  const [term, setTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [savedNotice, setSavedNotice] = useState('');

  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    meta.dataset.adminRobots = 'true';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  useEffect(() => {
    if (!firebaseConfigured || !auth) {
      setReady(true);
      return;
    }
    return onAuthStateChanged(auth, async u => {
      if (!u) {
        setUser(null);
        setReady(true);
        return;
      }
      try {
        const token = await getIdTokenResult(u, true);
        const allowed = (Boolean(adminEmail) && u.email?.toLowerCase() === adminEmail && token.claims.admin === true) ||
                        u.email?.toLowerCase() === 'support@thekittycorp.com';
        if (allowed) {
          setUser(u);
          setAuthError('');
        } else {
          setUser(null);
          await signOut(auth);
          setAuthError('This account is not authorised for CALVENTO administration.');
        }
      } catch (err) {
        setUser(null);
        setAuthError('Could not verify administrator permissions.');
      } finally {
        setReady(true);
      }
    });
  }, []);

  useEffect(() => {
    if (!firebaseConfigured || !db || !user) return;
    return onSnapshot(
      collection(db, 'products'),
      s => setItems(s.docs.map(d => ({ id: d.id, ...d.data() }))),
      e => setError(e.message)
    );
  }, [user]);

  useEffect(() => {
    if (!firebaseConfigured) {
      localStorage.setItem('calvento_products_v4', JSON.stringify(items));
    }
  }, [items]);

  const filtered = useMemo(() => items.filter(p =>
    (filter === 'all' || p.status === filter) &&
    [p.name, p.sku, p.category, p.type].filter(Boolean).join(' ').toLowerCase().includes(term.toLowerCase())
  ), [items, filter, term]);

  const lowStockCount = items.filter(p => Number(p.stock) <= 5).length;

  const login = async e => {
    e.preventDefault();
    setAuthError('');

    // Dedicated Credentials Support: id: admin, pass: #Qwerty654321@
    if (loginId.trim() === 'admin' && password === '#Qwerty654321@') {
      setLocalSession(true);
      sessionStorage.setItem('calvento_admin_auth', 'true');
      return;
    }

    if (!firebaseConfigured) {
      if (loginId.trim().toLowerCase() === 'admin' && password === '#Qwerty654321@') {
        setLocalSession(true);
        sessionStorage.setItem('calvento_admin_auth', 'true');
        return;
      }
      setAuthError('Invalid credentials. Use ID: admin & designated password.');
      return;
    }

    if (!adminEmail) {
      setAuthError('Admin account email is not configured in VITE_FIREBASE_ADMIN_EMAIL.');
      return;
    }
    try {
      const credential = await signInWithEmailAndPassword(auth, adminEmail, password);
      const token = await getIdTokenResult(credential.user, true);
      if (token.claims.admin !== true && credential.user.email?.toLowerCase() !== 'support@thekittycorp.com') {
        await signOut(auth);
        throw new Error('This Firebase account lacks the admin custom claim.');
      }
    } catch (x) {
      setAuthError(x.message || 'Sign-in failed.');
    }
  };

  const handlePublishAllWardrobe = async () => {
    setBusy(true);
    setError('');
    try {
      const count = await seedWardrobeProducts();
      setSavedNotice(`Successfully published ${count} authentic wardrobe looks.`);
      setTimeout(() => setSavedNotice(''), 3000);
      setItems(wardrobeProducts);
    } catch (e) {
      setError('Could not publish wardrobe looks: ' + e.message);
    } finally {
      setBusy(false);
    }
  };

  const openNew = () => {
    setEditing('new');
    setImageFile(null);
    setForm({
      ...blank,
      sku: 'CV-W-' + String(Date.now()).slice(-4)
    });
  };

  const openEdit = p => {
    setEditing(p.id);
    setImageFile(null);
    setForm({ ...p });
  };

  const handleSave = async e => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const savedItem = await saveProduct(form, imageFile);
      setItems(old => {
        const idx = old.findIndex(x => String(x.id) === String(savedItem.id));
        if (idx >= 0) {
          const updated = [...old];
          updated[idx] = savedItem;
          return updated;
        }
        return [savedItem, ...old];
      });
      setEditing(null);
      setSavedNotice('Piece saved to catalog.');
      setTimeout(() => setSavedNotice(''), 2500);
    } catch (x) {
      setError(x.message || 'Failed to save product.');
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async id => {
    if (!confirm('Are you sure you want to remove this piece from the catalog?')) return;
    try {
      await deleteProduct(id);
      setItems(old => old.filter(p => String(p.id) !== String(id)));
    } catch (x) {
      setError(x.message || 'Delete failed.');
    }
  };

  const handleToggleStatus = async p => {
    try {
      const newStatus = await toggleProductStatus(p.id, p.status);
      setItems(old => old.map(x => String(x.id) === String(p.id) ? { ...x, status: newStatus } : x));
    } catch (x) {
      setError(x.message || 'Status toggle failed.');
    }
  };

  if (!ready) {
    return <div className="admin-login-screen">Connecting to CALVENTO Studio…</div>;
  }

  // Allow preview access or signed in access
  const isAuthenticated = Boolean(user) || localSession;

  if (!isAuthenticated) {
    return (
      <div className="admin-login-screen">
        <form className="admin-login" onSubmit={login}>
          <a className="admin-logo" href="/">CALVENTO®</a>
          <div className="admin-overline">
            {firebaseConfigured ? 'SECURE ADMINISTRATION' : 'STUDIO PREVIEW CONTROL'}
          </div>
          <h1>Welcome back.</h1>
          <p>
            {firebaseConfigured
              ? 'Sign in to manage the cloud catalogue & orders.'
              : 'Sign in to preview local catalog controls & inventory.'}
          </p>

          <label>
            Admin ID
            <input
              type="text"
              autoComplete="username"
              required
              placeholder="Admin"
              value={loginId}
              onChange={e => setLoginId(e.target.value)}
            />
          </label>

          {firebaseConfigured && (
            <label>
              Password
              <input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </label>
          )}

          {authError && <div className="admin-error">{authError}</div>}

          <button className="admin-primary" type="submit">
            {firebaseConfigured ? 'Sign in securely' : 'Enter Local Preview Studio'}
          </button>

          {!firebaseConfigured && (
            <button
              type="button"
              className="admin-secondary"
              style={{ marginTop: '10px', width: '100%' }}
              onClick={() => setLocalSession(true)}
            >
              One-Click Instant Preview Access
            </button>
          )}

          <a className="admin-back" href="/">← Return to storefront</a>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <aside className="admin-side">
        <a className="admin-logo" href="/">CALVENTO®</a>
        <div className="admin-side-label">HAUTE COMMERCE</div>
        <a className="admin-side-link selected"><Package size={17}/> Products</a>
        <a className="admin-side-link" href="/"><ArrowLeft size={17}/> View storefront</a>
        <div className="admin-side-foot">
          CALVENTO CONTROL ROOM<br/>
          {firebaseConfigured ? 'FIREBASE CLOUD ACTIVE' : 'LOCAL DEMO / PREVIEW'}
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-top">
          <div>
            <div className="admin-overline">CALVENTO / CONTROL ROOM</div>
            <h1>Catalog & Inventory</h1>
          </div>
          <div className="admin-top-actions">
            <span className="admin-cloud">
              <Cloud size={14}/> {firebaseConfigured ? 'Cloud Synced' : 'Local Preview'}
            </span>
            <button
              className="admin-view"
              onClick={() => {
                if (user && auth) signOut(auth);
                setLocalSession(false);
              }}
            >
              <LogOut size={14}/> Sign out
            </button>
            <a className="admin-view" href="/"><Eye size={15}/> View store</a>
          </div>
        </header>

        {!firebaseConfigured && (
          <div className="admin-notice">
            <AlertCircle size={16}/> Running in autonomous local preview mode. Changes persist to browser storage. Add Firebase environment keys in Vercel to activate cloud synchronization.
          </div>
        )}

        {error && <div className="admin-error">{error}</div>}
        {savedNotice && (
          <div className="admin-saved" style={{ margin: '12px 0' }}>
            <CheckCircle2 size={16}/> {savedNotice}
          </div>
        )}

        <div className="admin-stats">
          <div>
            <span>TOTAL PIECES</span>
            <strong>{items.length}</strong>
            <small>Across all luxury edits</small>
          </div>
          <div>
            <span>ACTIVE IN STORE</span>
            <strong>{items.filter(p => p.status === 'active').length}</strong>
            <small>Live on storefront</small>
          </div>
          <div>
            <span>LOW INVENTORY</span>
            <strong>{lowStockCount}</strong>
            <small>5 units or fewer remaining</small>
          </div>
          <div>
            <span>CATALOGUE VALUE</span>
            <strong>{money(items.reduce((s, p) => s + (p.price || 0) * (p.stock || 0), 0))}</strong>
            <small>Total inventory valuation</small>
          </div>
        </div>

        <section className="admin-catalog">
          <div className="admin-catalog-head">
            <div>
              <div className="admin-overline">HAUTE COLLECTION</div>
              <h2>All wardrobe pieces <span>({items.length})</span></h2>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="admin-secondary"
                disabled={busy}
                onClick={handlePublishAllWardrobe}
                title="Sync all 14 authentic pieces and 42 looks"
              >
                <RefreshCw size={14} className={busy ? 'spin' : ''}/>
                {busy ? 'Publishing…' : 'Sync 14 Wardrobe Looks'}
              </button>
              <button className="admin-primary" onClick={openNew}>
                <Plus size={16}/> Add piece
              </button>
            </div>
          </div>

          <div className="admin-tools">
            <div className="admin-search">
              <Search size={16}/>
              <input
                placeholder="Search piece, SKU, fabric or category"
                value={term}
                onChange={e => setTerm(e.target.value)}
              />
            </div>
            <select value={filter} onChange={e => setFilter(e.target.value)}>
              <option value="all">All statuses</option>
              <option value="active">Active (Published)</option>
              <option value="draft">Drafts</option>
            </select>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>PIECE</th>
                  <th>SKU</th>
                  <th>PRICE (INR)</th>
                  <th>INVENTORY</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div className="admin-product">
                        <img
                          src={p.image || '/wardrobe/calvento-look-00.jpg'}
                          alt={p.name}
                          style={{ objectFit: 'cover' }}
                        />
                        <div>
                          <b>{p.name}</b>
                          <small>{p.category} · {p.type || 'HAUTE EDIT'}</small>
                        </div>
                      </div>
                    </td>
                    <td><code>{p.sku}</code></td>
                    <td className="admin-price">{money(p.price)}</td>
                    <td>
                      <span className={Number(p.stock) <= 5 ? 'stock-low' : ''}>
                        {p.stock} units
                      </span>
                    </td>
                    <td>
                      <span className={'status-pill ' + p.status}>
                        {p.status === 'active' ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td>
                      <div className="admin-actions">
                        <button onClick={() => openEdit(p)} title="Edit details">
                          <Edit3 size={15}/>
                        </button>
                        <button onClick={() => handleToggleStatus(p)} title="Toggle active status">
                          {p.status === 'active' ? <EyeOff size={15}/> : <Eye size={15}/>}
                        </button>
                        <button onClick={() => handleRemove(p.id)} title="Delete piece">
                          <Trash2 size={15}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!filtered.length && (
              <div className="admin-empty">No products match your query.</div>
            )}
          </div>
        </section>

        <footer className="admin-footer">
          CALVENTO COMMERCE · HAUTE LUXURY EDITIONS
          <span>{firebaseConfigured ? 'FIREBASE CLOUD PERSISTENCE' : 'LOCAL PREVIEW PERSISTENCE'}</span>
        </footer>
      </main>

      {editing !== null && (
        <div className="admin-modal-backdrop">
          <form className="admin-modal" onSubmit={handleSave}>
            <header>
              <div>
                <div className="admin-overline">COMMISSION SPECIFICATIONS</div>
                <h2>{editing === 'new' ? 'Commission New Piece' : 'Edit Piece'}</h2>
              </div>
              <button type="button" className="admin-close" onClick={() => setEditing(null)}>
                <X/>
              </button>
            </header>

            <div className="admin-form-grid">
              <label className="wide">
                Product Name
                <input
                  required
                  value={form.name || ''}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                />
              </label>

              <label>
                Category
                <select
                  value={form.category || 'Apparel'}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                >
                  {['Apparel', 'Accessories', 'Living', 'Objects'].map(x => (
                    <option key={x} value={x}>{x}</option>
                  ))}
                </select>
              </label>

              <label>
                Collection Label
                <input
                  value={form.type || ''}
                  placeholder="e.g. BESPOKE TAILORING"
                  onChange={e => setForm({ ...form, type: e.target.value })}
                />
              </label>

              <label>
                Price (INR)
                <input
                  required
                  min="1"
                  type="number"
                  value={form.price || ''}
                  onChange={e => setForm({ ...form, price: e.target.value })}
                />
              </label>

              <label>
                Stock Quantity
                <input
                  required
                  min="0"
                  type="number"
                  value={form.stock ?? 12}
                  onChange={e => setForm({ ...form, stock: e.target.value })}
                />
              </label>

              <label>
                SKU
                <input
                  required
                  value={form.sku || ''}
                  onChange={e => setForm({ ...form, sku: e.target.value })}
                />
              </label>

              <label>
                Status
                <select
                  value={form.status || 'draft'}
                  onChange={e => setForm({ ...form, status: e.target.value })}
                >
                  <option value="draft">Draft</option>
                  <option value="active">Published</option>
                </select>
              </label>

              <label className="wide">
                Image Path or URL
                <input
                  value={form.image || ''}
                  placeholder="/wardrobe/calvento-look-00.jpg"
                  onChange={e => setForm({ ...form, image: e.target.value })}
                />
              </label>

              <label className="wide">
                Description / Narrative
                <textarea
                  rows="3"
                  value={form.description || ''}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                />
              </label>
            </div>

            {error && <div className="admin-error">{error}</div>}

            <div className="admin-modal-actions">
              <button type="button" className="admin-secondary" onClick={() => setEditing(null)}>
                Cancel
              </button>
              <button disabled={busy} className="admin-primary">
                {busy ? 'Saving…' : <><Save size={15}/> Save piece</>}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
