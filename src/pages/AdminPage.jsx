import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  subscribeToSOSAlerts,
  subscribeToLiveTrekkers,
  subscribeToTrailRegistrations,
} from '../utils/firebaseService';
import {
  AlertTriangle,
  ShieldCheck,
  Users,
  MapPin,
  Loader2,
  Activity,
  Plus,
  Pencil,
  Trash2,
  X,
} from 'lucide-react';
import { getTrails, upsertTrail, deleteTrail } from '../utils/trailService';

export default function AdminPage() {
  const { dbUser, loading, isAdmin } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [trackers, setTrackers] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [trails, setTrails] = useState(getTrails);
  const [showTrailModal, setShowTrailModal] = useState(false);
  const [trailForm, setTrailForm] = useState({
    id: '',
    name: '',
    region: '',
    difficulty: 'Moderate',
    duration: '5 Days',
    maxAltitude: '3,000m',
    distance: '50 km',
    bestSeason: 'Year-round',
    description: '',
    highlights: '',
    rating: 4.7,
    reviews: 0,
    price: 0,
    activeTrekkers: 0,
    image: '',
  });
  const [trailSaving, setTrailSaving] = useState(false);
  const [trailMessage, setTrailMessage] = useState('');

  const canAccessAdmin = Boolean(isAdmin || dbUser?.role === 'admin');

  useEffect(() => {
    if (!canAccessAdmin) return undefined;
    const unsubAlerts = subscribeToSOSAlerts(setAlerts);
    const unsubTrackers = subscribeToLiveTrekkers(setTrackers);
    const unsubRegistrations = subscribeToTrailRegistrations(setRegistrations);
    const refreshTrails = () => setTrails(getTrails());
    refreshTrails();
    window.addEventListener('trail-data-updated', refreshTrails);
    return () => {
      unsubAlerts?.();
      unsubTrackers?.();
      unsubRegistrations?.();
      window.removeEventListener('trail-data-updated', refreshTrails);
    };
  }, [canAccessAdmin]);

  const openTrailModal = (trail = null) => {
    setTrailMessage('');
    if (trail) {
      setTrailForm({
        id: trail.id,
        name: trail.name || '',
        region: trail.region || '',
        difficulty: trail.difficulty || 'Moderate',
        duration: trail.duration || '5 Days',
        maxAltitude: trail.maxAltitude || '3,000m',
        distance: trail.distance || '50 km',
        bestSeason: trail.bestSeason || 'Year-round',
        description: trail.description || '',
        highlights: Array.isArray(trail.highlights) ? trail.highlights.join(', ') : '',
        rating: trail.rating || 4.7,
        reviews: trail.reviews || 0,
        price: trail.price || 0,
        activeTrekkers: trail.activeTrekkers || 0,
        image: trail.image || '',
      });
    } else {
      setTrailForm({
        id: '',
        name: '',
        region: '',
        difficulty: 'Moderate',
        duration: '5 Days',
        maxAltitude: '3,000m',
        distance: '50 km',
        bestSeason: 'Year-round',
        description: '',
        highlights: '',
        rating: 4.7,
        reviews: 0,
        price: 0,
        activeTrekkers: 0,
        image: '',
      });
    }
    setShowTrailModal(true);
  };

  const handleTrailSubmit = async (event) => {
    event.preventDefault();
    setTrailSaving(true);
    setTrailMessage('');
    try {
      const payload = {
        id: trailForm.id || undefined,
        name: trailForm.name.trim(),
        region: trailForm.region.trim(),
        difficulty: trailForm.difficulty,
        duration: trailForm.duration.trim(),
        maxAltitude: trailForm.maxAltitude.trim(),
        distance: trailForm.distance.trim(),
        bestSeason: trailForm.bestSeason.trim(),
        description: trailForm.description.trim(),
        highlights: trailForm.highlights.split(',').map((item) => item.trim()).filter(Boolean),
        rating: Number(trailForm.rating || 4.7),
        reviews: Number(trailForm.reviews || 0),
        price: Number(trailForm.price || 0),
        activeTrekkers: Number(trailForm.activeTrekkers || 0),
        image: trailForm.image.trim(),
      };

      if (!payload.name || !payload.region || !payload.description) {
        throw new Error('Please fill in the trail name, region, and description.');
      }

      const nextTrails = upsertTrail(payload);
      setTrails(nextTrails);
      setShowTrailModal(false);
      setTrailMessage('Trail saved successfully.');
    } catch (error) {
      setTrailMessage(error.message || 'Unable to save trail.');
    } finally {
      setTrailSaving(false);
    }
  };

  const handleDeleteTrail = (trailId) => {
    if (!window.confirm('Delete this trail from the explore page?')) return;
    const nextTrails = deleteTrail(trailId);
    setTrails(nextTrails);
    setTrailMessage('Trail removed from the explore page.');
  };

  if (!loading && !canAccessAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-[#F4F6F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#00965E]">Admin Control Center</p>
            <h1 className="mt-3 text-4xl font-extrabold text-slate-900" style={{ fontFamily: 'var(--font-heading)' }}>
              Mission Command
            </h1>
            <p className="mt-2 text-sm text-slate-500">Monitor live trail registrations, SOS alerts, and active tracker telemetry.</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <div className="flex items-center gap-3 text-slate-700">
              <ShieldCheck className="h-5 w-5 text-[#00965E]" />
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Signed in as</p>
                <p className="font-semibold text-slate-900">{dbUser?.name || dbUser?.email}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-3 mb-8">
          {[
            { label: 'Open SOS alerts', value: alerts.filter((item) => item.status !== 'resolved').length, icon: AlertTriangle, color: '#D32F2F' },
            { label: 'Active trackers', value: trackers.length, icon: Users, color: '#00965E' },
            { label: 'Trail registrations', value: registrations.length, icon: Activity, color: '#1A56DB' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-6">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl" style={{ background: `${stat.color}1A`, color: stat.color }}>
                  <stat.icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-500">{stat.label}</p>
                  <p className="mt-1 text-3xl font-bold text-slate-900">{stat.value}</p>
                </div>
              </div>
              <p className="text-sm text-slate-500">Real-time data from Firestore telemetry streams.</p>
            </div>
          ))}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Explore trails manager</h2>
              <p className="text-sm text-slate-500">Create, edit, and remove trekking routes shown on the explore page.</p>
            </div>
            <button
              onClick={() => openTrailModal()}
              className="inline-flex items-center gap-2 rounded-3xl bg-[#00965E] px-4 py-2 text-sm font-semibold text-white"
            >
              <Plus className="h-4 w-4" /> Add trail
            </button>
          </div>

          {trailMessage && (
            <div className="mb-4 rounded-2xl border border-[#C2EAD9] bg-[#E5F5EE] px-4 py-3 text-sm text-[#005A3C]">
              {trailMessage}
            </div>
          )}

          <div className="grid gap-4">
            {trails.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">No trails yet. Add your first trek route.</div>
            ) : (
              trails.map((trail) => (
                <div key={trail.id} className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{trail.name}</p>
                    <p className="text-sm text-slate-500">{trail.region} · {trail.difficulty} · {trail.duration}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openTrailModal(trail)} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700">
                      <Pencil className="h-4 w-4" /> Edit
                    </button>
                    <button onClick={() => handleDeleteTrail(trail.id)} className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">
                      <Trash2 className="h-4 w-4" /> Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Recent SOS alerts</h2>
                <p className="text-sm text-slate-500">Review and resolve any new emergency notifications.</p>
              </div>
              <span className="rounded-full bg-[#FEF2F2] px-3 py-1 text-xs font-semibold text-[#D32F2F]">Live</span>
            </div>
            {alerts.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">No SOS alerts yet.</div>
            ) : (
              <div className="space-y-4">
                {alerts.slice(0, 5).map((alert) => (
                  <div key={alert.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{alert.userName}</p>
                        <p className="text-xs text-slate-500">{alert.message}</p>
                      </div>
                      <span className="text-[11px] uppercase tracking-[0.2em] text-slate-500">{alert.status}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-2"><MapPin className="h-3.5 w-3.5" />{alert.latitude.toFixed(4)}, {alert.longitude.toFixed(4)}</span>
                      <span>{alert.createdAt ? new Date(alert.createdAt.seconds * 1000).toLocaleString() : 'Just now'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Live tracker snapshot</h2>
                <p className="text-sm text-slate-500">A quick view of devices currently publishing location.</p>
              </div>
              <span className="rounded-full bg-[#E5F5EE] px-3 py-1 text-xs font-semibold text-[#00965E]">{trackers.length} online</span>
            </div>
            {trackers.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">No trackers reporting location.</div>
            ) : (
              <div className="space-y-4">
                {trackers.slice(0, 5).map((tracker) => (
                  <div key={tracker.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center gap-3 text-sm font-semibold text-slate-900">
                      <Users className="h-4 w-4 text-[#00965E]" />
                      <span>{tracker.name}</span>
                    </div>
                    <div className="mt-2 grid gap-2 text-xs text-slate-500">
                      <span>Route: {tracker.trek || 'N/A'}</span>
                      <span>Last updated: {tracker.updatedAt ? new Date(tracker.updatedAt.seconds * 1000).toLocaleString() : 'Just now'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Trail registration insights</h2>
              <p className="text-sm text-slate-500">Monitor who has enrolled on missions and which trails are active.</p>
            </div>
            <span className="rounded-full bg-[#E3F7FF] px-3 py-1 text-xs font-semibold text-[#1A56DB]">{registrations.length} total</span>
          </div>
          {registrations.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">No active trail registrations.</div>
          ) : (
            <div className="grid gap-4">
              {registrations.slice(0, 6).map((reg) => (
                <div key={reg.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
                    <div>
                      <p className="font-semibold text-slate-900">{reg.userName}</p>
                      <p className="text-sm text-slate-600">{reg.trekName}</p>
                    </div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{reg.status}</p>
                  </div>
                  <div className="mt-2 text-xs text-slate-500">Registered {reg.startDate} · {reg.createdAt ? new Date(reg.createdAt.seconds * 1000).toLocaleString() : 'Just now'}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showTrailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-6">
          <div className="w-full max-w-2xl rounded-[32px] border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{trailForm.id ? 'Edit trail' : 'Add new trail'}</h3>
                <p className="text-sm text-slate-500">Manage the trail card displayed on the explore page.</p>
              </div>
              <button onClick={() => setShowTrailModal(false)} className="rounded-full p-2 text-slate-500 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleTrailSubmit} className="grid gap-4 md:grid-cols-2">
              <label className="block md:col-span-2">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Trail name</span>
                <input value={trailForm.name} onChange={(event) => setTrailForm((prev) => ({ ...prev, name: event.target.value }))} className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900" required />
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Region</span>
                <input value={trailForm.region} onChange={(event) => setTrailForm((prev) => ({ ...prev, region: event.target.value }))} className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900" required />
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Difficulty</span>
                <input value={trailForm.difficulty} onChange={(event) => setTrailForm((prev) => ({ ...prev, difficulty: event.target.value }))} className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900" />
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Duration</span>
                <input value={trailForm.duration} onChange={(event) => setTrailForm((prev) => ({ ...prev, duration: event.target.value }))} className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900" />
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Max altitude</span>
                <input value={trailForm.maxAltitude} onChange={(event) => setTrailForm((prev) => ({ ...prev, maxAltitude: event.target.value }))} className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900" />
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Distance</span>
                <input value={trailForm.distance} onChange={(event) => setTrailForm((prev) => ({ ...prev, distance: event.target.value }))} className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900" />
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Best season</span>
                <input value={trailForm.bestSeason} onChange={(event) => setTrailForm((prev) => ({ ...prev, bestSeason: event.target.value }))} className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900" />
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Price</span>
                <input type="number" value={trailForm.price} onChange={(event) => setTrailForm((prev) => ({ ...prev, price: event.target.value }))} className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900" />
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Reviews</span>
                <input type="number" value={trailForm.reviews} onChange={(event) => setTrailForm((prev) => ({ ...prev, reviews: event.target.value }))} className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900" />
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Rating</span>
                <input type="number" step="0.1" value={trailForm.rating} onChange={(event) => setTrailForm((prev) => ({ ...prev, rating: event.target.value }))} className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900" />
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Active trekkers</span>
                <input type="number" value={trailForm.activeTrekkers} onChange={(event) => setTrailForm((prev) => ({ ...prev, activeTrekkers: event.target.value }))} className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900" />
              </label>
              <label className="block md:col-span-2">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Image URL</span>
                <input value={trailForm.image} onChange={(event) => setTrailForm((prev) => ({ ...prev, image: event.target.value }))} className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900" />
              </label>
              <label className="block md:col-span-2">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Description</span>
                <textarea value={trailForm.description} onChange={(event) => setTrailForm((prev) => ({ ...prev, description: event.target.value }))} rows={3} className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900" required />
              </label>
              <label className="block md:col-span-2">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Highlights (comma separated)</span>
                <input value={trailForm.highlights} onChange={(event) => setTrailForm((prev) => ({ ...prev, highlights: event.target.value }))} className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900" />
              </label>

              <div className="md:col-span-2 flex justify-end gap-3 mt-2">
                <button type="button" onClick={() => setShowTrailModal(false)} className="rounded-3xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">Cancel</button>
                <button type="submit" disabled={trailSaving} className="inline-flex items-center gap-2 rounded-3xl bg-[#00965E] px-5 py-2 text-sm font-semibold text-white disabled:opacity-70">
                  {trailSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : trailForm.id ? 'Save changes' : 'Add trail'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
