import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FEATURED_TREKS } from '../data/treks';
import {
  createTrailRegistrationInFirestore,
  subscribeToUserTrailRegistrations,
  updateUserLiveLocation,
  stopUserLiveTracking,
} from '../utils/firebaseService';
import {
  Calendar,
  Satellite,
  Loader2,
  ShieldCheck,
  XCircle,
} from 'lucide-react';

export default function TrailRegistration() {
  const { user } = useAuth();
  const [selectedTrekId, setSelectedTrekId] = useState(FEATURED_TREKS[0]?.id || '');
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [trailRegistrations, setTrailRegistrations] = useState([]);
  const [saving, setSaving] = useState(false);
  const [tracking, setTracking] = useState(false);
  const [watchId, setWatchId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [geoError, setGeoError] = useState('');

  const selectedTrek = FEATURED_TREKS.find((trek) => trek.id === selectedTrekId) || FEATURED_TREKS[0];
  const latestRegistration = trailRegistrations[0] || null;

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToUserTrailRegistrations((items) => {
      setTrailRegistrations(items);
    });
    return () => unsubscribe?.();
  }, [user]);

  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  const handleRegister = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!user) {
      setError('Sign in to register for a trail.');
      return;
    }

    if (!selectedTrekId || !startDate) {
      setError('Select a trek and start date.');
      return;
    }

    setSaving(true);
    try {
      const registration = await createTrailRegistrationInFirestore({
        trekId: selectedTrek.id,
        trekName: selectedTrek.name,
        startDate,
        notes,
      });
      setNotes('');
      setStartDate(new Date().toISOString().split('T')[0]);
      setMessage(`Registered for ${registration.trekName}. You can now activate live tracking.`);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Unable to register for this trail.');
    } finally {
      setSaving(false);
    }
  };

  const startLiveTracking = () => {
    setError('');
    setGeoError('');
    setMessage('');

    if (!user) {
      setError('Please sign in to share your live location.');
      return;
    }

    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }

    if (!selectedTrek && !latestRegistration) {
      setError('Register for a trail first before sharing location.');
      return;
    }

    const trekName = selectedTrek?.name || latestRegistration?.trekName || 'Unknown route';
    const watch = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude, altitude } = position.coords;
        try {
          await updateUserLiveLocation({
            trek: trekName,
            latitude,
            longitude,
            altitude: altitude || 0,
            status: 'active',
            battery: 100,
          });
          setTracking(true);
          setMessage('Live location sharing active. Updates will refresh automatically.');
        } catch (err) {
          console.error(err);
          setError('Unable to update live location.');
        }
      },
      (positionError) => {
        console.error(positionError);
        setGeoError(positionError.message || 'Unable to access location.');
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 },
    );

    setWatchId(watch);
  };

  const stopLiveTracking = async () => {
    setError('');
    setGeoError('');
    setMessage('');

    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }

    try {
      await stopUserLiveTracking();
      setTracking(false);
      setMessage('Live tracking paused. Your last known location remains visible to admins.');
    } catch (err) {
      console.error(err);
      setError('Unable to stop live tracking.');
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm animate-fadeInUp">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900" style={{ fontFamily: 'var(--font-heading)' }}>
            Trail Registration & Tracking
          </h2>
          <p className="text-sm text-slate-500">
            Register for a route and keep your live location updated for admins and rescue teams.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-3xl bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600">
          <Satellite className="h-4 w-4 text-[#00965E]" /> {tracking ? 'Sharing live location' : 'Live tracking idle'}
        </div>
      </div>

      <form onSubmit={handleRegister} className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
        <div className="grid gap-4">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Select trek route</span>
            <select
              value={selectedTrekId}
              onChange={(event) => setSelectedTrekId(event.target.value)}
              className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-primary"
            >
              {FEATURED_TREKS.map((trek) => (
                <option key={trek.id} value={trek.id}>{trek.name}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Start date</span>
            <div className="relative">
              <Calendar className="pointer-events-none absolute left-4 top-4 h-4 w-4 text-slate-400" />
              <input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className="mt-2 w-full rounded-3xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none focus:border-primary"
              />
            </div>
          </label>

          <label className="block lg:col-span-2">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Notes</span>
            <textarea
              rows="4"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Guide name, medical condition, or team notes"
              className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-primary resize-none"
            />
          </label>
        </div>

        <div className="flex flex-col gap-3 justify-between rounded-3xl bg-slate-50 p-5">
          <div className="space-y-3">
            <div className="rounded-3xl bg-white p-4 border border-slate-200">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Next step</p>
              <p className="mt-2 text-sm text-slate-700">After registration, tap the button below to publish your live trail location.</p>
            </div>

            <div className="rounded-3xl bg-white p-4 border border-slate-200">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Current route</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{selectedTrek?.name}</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-3xl bg-[#00965E] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#007A44] disabled:opacity-70"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Register for trail'}
          </button>

          <button
            type="button"
            onClick={tracking ? stopLiveTracking : startLiveTracking}
            className="inline-flex items-center justify-center gap-2 rounded-3xl border border-[#00965E] bg-white px-6 py-3 text-sm font-semibold text-[#00965E] transition hover:bg-[#00965E] hover:text-white disabled:opacity-70"
            disabled={saving}
          >
            {tracking ? <XCircle className="h-4 w-4" /> : <Satellite className="h-4 w-4" />}
            {tracking ? 'Pause location sharing' : 'Share live location'}
          </button>
        </div>
      </form>

      {(error || geoError || message) && (
        <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
          {error && <p className="text-red-600">{error}</p>}
          {geoError && <p className="text-orange-600">{geoError}</p>}
          {message && <p className="text-slate-800">{message}</p>}
        </div>
      )}

      <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5">
        <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-slate-800 uppercase tracking-[0.2em]">
          <ShieldCheck className="h-4 w-4 text-[#00965E]" />
          Your latest registration
        </div>
        {latestRegistration ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl bg-white p-4 border border-slate-200">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Route</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{latestRegistration.trekName}</p>
            </div>
            <div className="rounded-3xl bg-white p-4 border border-slate-200">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Status</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{latestRegistration.status}</p>
            </div>
            <div className="rounded-3xl bg-white p-4 border border-slate-200">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Start date</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{latestRegistration.startDate}</p>
            </div>
            <div className="rounded-3xl bg-white p-4 border border-slate-200">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Registered</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{latestRegistration.createdAt ? new Date(latestRegistration.createdAt.seconds * 1000).toLocaleString() : 'Just now'}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500">No trail registration found yet. Register above to begin sharing your route.</p>
        )}
      </div>
    </div>
  );
}
