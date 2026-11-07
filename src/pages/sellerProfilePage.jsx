import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/navBar';
import Footer from '../components/footer';
import api, { getApiError } from '../utils/api';
import { AUTH_EVENT, getToken } from '../utils/auth';
import { shopDraft, shopFields, validateShop } from '../utils/seller';

export default function SellerProfilePage() {
  const [user, setUser] = useState(null);
  const [draft, setDraft] = useState(shopDraft);
  const [categories, setCategories] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [revision, setRevision] = useState(0);
  const generation = useRef(0);
  const lock = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    const current = ++generation.current;
    const token = getToken();
    let active = true;
    const valid = () => active && generation.current === current && token === getToken();
    const invalidate = () => {
      ++generation.current;
      controller.abort();
      setUser(null);
      setDraft(shopDraft());
      setLoading(true);
      setError('');
      setMessage('');
      setRevision(value => value + 1);
    };
    window.addEventListener(AUTH_EVENT, invalidate);
    window.addEventListener('storage', invalidate);
    (async () => {
      try {
        const { data } = await api.get('/auth/profile', { signal: controller.signal });
        if (!valid()) return;
        if (!data.user?.role) throw new Error('Invalid account response');
        if (data.user.role === 'seller' && data.user.sellerApprovalStatus === 'approved') {
          const response = await api.get('/categories', { signal: controller.signal });
          if (!valid()) return;
          if (!Array.isArray(response.data.categories)) throw new Error('Invalid categories response');
          setCategories(response.data.categories);
        }
        if (!valid()) return;
        setUser(data.user);
        setDraft(shopDraft(data.user.sellerProfile));
        setSelected((data.user.sellerProfile?.craftCategories || []).map(item => item._id || item));
        setErrors({});
      } catch (failure) {
        if (valid() && !controller.signal.aborted) setError(getApiError(failure, 'Unable to load your seller account.'));
      } finally { if (valid()) setLoading(false); }
    })();
    return () => {
      active = false;
      controller.abort();
      window.removeEventListener(AUTH_EVENT, invalidate);
      window.removeEventListener('storage', invalidate);
    };
  }, [revision]);

  async function save(event) {
    event.preventDefault();
    if (lock.current || user?.role !== 'seller' || user.sellerApprovalStatus !== 'approved') return;
    const problems = validateShop(draft);
    setErrors(problems);
    if (Object.keys(problems).length) return;
    lock.current = true;
    setSaving(true);
    setError('');
    setMessage('');
    const current = generation.current;
    const token = getToken();
    const valid = () => generation.current === current && token === getToken();
    try {
      const payload = { ...Object.fromEntries(Object.entries(draft).map(([key, value]) => [key, value.trim()])), craftCategories: selected };
      const exists = Boolean(user.sellerProfile?.shopId);
      const { data } = await api[exists ? 'put' : 'post'](exists ? '/sellers/me' : '/sellers', payload);
      if (!valid()) return;
      const profile = exists ? data.sellerProfile : data.seller?.sellerProfile;
      if (!data.success || !profile?.shopId) throw new Error('Invalid shop response');
      setUser(previous => ({ ...previous, sellerProfile: profile }));
      setDraft(shopDraft(profile));
      setMessage('Your shop profile has been saved.');
    } catch (failure) {
      if (valid()) setError(getApiError(failure, 'Unable to confirm the save. Refresh your account before retrying.'));
    } finally { lock.current = false; setSaving(false); }
  }

  const approved = user?.role === 'seller' && user.sellerApprovalStatus === 'approved';
  return <><Navbar /><main className="mx-auto min-h-[65vh] max-w-4xl px-5 py-12 text-stone-800">
    <h1 className="font-serif text-4xl text-[#70472c]">Your seller account</h1>
    <p className="my-4">Manage your artisan shop and check your application status.</p>
    {loading ? <p role="status">Loading your account…</p> : <>
      <button type="button" disabled={saving} onClick={() => { setLoading(true); setUser(null); setError(''); setMessage(''); setRevision(value => value + 1); }} className="mb-6 underline disabled:opacity-50">Refresh account</button>
      {user && user.role !== 'seller' && <p role="status">This account is not registered as a seller. Seller registration is available when creating a new account. <Link className="underline" to="/contact">Contact us</Link> for help with your existing account.</p>}
      {user?.role === 'seller' && <section className="mb-8 rounded-xl bg-[#f4eadb] p-5" aria-label="Application status">
        <h2 className="text-xl font-semibold">Application: {user.sellerApprovalStatus}</h2>
        {user.sellerApprovalStatus === 'pending' && <p>Your application is awaiting administrator approval. Refresh here to check for updates.</p>}
        {user.sellerApprovalStatus === 'rejected' && <p>Your application was rejected. <Link className="underline" to="/contact">Contact the team</Link> to request a review. Online resubmission is not currently available.</p>}
        {approved && <p>You can now {user.sellerProfile?.shopId ? 'edit' : 'create'} your shop profile.</p>}
      </section>}
      {approved && <form onSubmit={save} noValidate className="space-y-5">
        <fieldset disabled={saving} className="grid gap-5 sm:grid-cols-2">
          <legend className="mb-4 text-2xl font-serif">Shop profile</legend>
          {Object.entries(shopFields).map(([key, label]) => <div key={key} className={key === 'bio' ? 'sm:col-span-2' : ''}>
            <label htmlFor={key} className="mb-1 block font-medium">{label}{['shopName', 'bio', 'city', 'district', 'country', 'contactEmail', 'contactPhone'].includes(key) ? ' *' : ''}</label>
            {key === 'bio' ? <textarea id={key} value={draft[key]} maxLength={1000} rows={4} aria-invalid={Boolean(errors[key])} aria-describedby={errors[key] ? `${key}-error` : undefined} onChange={event => setDraft({ ...draft, [key]: event.target.value })} className="w-full rounded-lg border p-3" /> :
              <input id={key} type={key === 'contactEmail' ? 'email' : key === 'contactPhone' ? 'tel' : 'text'} value={draft[key]} maxLength={key === 'shopName' ? 100 : undefined} aria-invalid={Boolean(errors[key])} aria-describedby={errors[key] ? `${key}-error` : undefined} onChange={event => setDraft({ ...draft, [key]: event.target.value })} className="w-full rounded-lg border p-3" />}
            {errors[key] && <p id={`${key}-error`} className="text-sm text-red-700">{errors[key]}</p>}
          </div>)}
          <fieldset className="sm:col-span-2"><legend className="font-medium">Craft categories</legend>
            {categories.length === 0 && <p>No craft categories are available yet.</p>}
            {categories.map(category => <label key={category._id} className="mr-5 inline-flex gap-2 py-2"><input type="checkbox" checked={selected.includes(category._id)} onChange={event => setSelected(previous => event.target.checked ? [...previous, category._id] : previous.filter(id => id !== category._id))} />{category.name}</label>)}
          </fieldset>
          <p className="text-sm sm:col-span-2">Use publicly hosted image URLs for your logo and banner. Contact details appear on your public shop.</p>
          <button className="rounded-full bg-[#8b5e3c] px-6 py-3 text-white disabled:opacity-50" type="submit">{saving ? 'Saving…' : 'Save shop profile'}</button>
          {user.sellerProfile?.slug && <Link className="self-center underline" to={`/artisans/${user.sellerProfile.slug}`}>View public shop</Link>}
        </fieldset>
      </form>}
    </>}
    {error && <p role="alert" className="mt-5 text-red-700">{error}</p>}
    {message && <p role="status" className="mt-5 text-green-800">{message}</p>}
  </main><Footer /></>;
}
