import { useEffect, useState } from 'react';
import { AlertTriangle, MapPin, User, Loader2, CheckCircle2, Clock } from 'lucide-react';
import { subscribeToSOSAlerts, resolveSOSAlertInFirestore } from '../utils/firebaseService';
import { useAuth } from '../context/AuthContext';

export default function AdminSOSAlerts() {
  const { dbUser } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState(null);

  useEffect(() => {
    if (!dbUser?.role || dbUser.role !== 'admin') {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToSOSAlerts((data) => {
      setAlerts(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [dbUser]);

  if (dbUser?.role !== 'admin') {
    return null;
  }

  return (
    <div className="grid gap-6 mb-8 animate-fadeInUp">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900" style={{ fontFamily: 'var(--font-heading)' }}>
              Admin SOS Dashboard
            </h2>
            <p className="text-sm text-slate-500">
              Real-time SOS alerts from users. Resolve critical incidents as soon as they arrive.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-3xl bg-[#FEF2F2] px-4 py-2 text-sm font-semibold text-[#B71C1C]">
            <AlertTriangle size={16} /> {alerts.filter((item) => item.status !== 'resolved').length} open
          </div>
        </div>

        {loading ? (
          <div className="flex h-40 items-center justify-center rounded-3xl bg-slate-50 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : alerts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
            No SOS alerts have been received yet.
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div key={alert.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                      <AlertTriangle className="h-4 w-4 text-[#D32F2F]" />
                      <span>#{alert.id} — {alert.status === 'resolved' ? 'Resolved' : 'Open'}</span>
                    </div>
                    <p className="text-base font-bold text-slate-900">{alert.userName}</p>
                    <p className="text-sm text-slate-600">{alert.message}</p>
                  </div>
                  <div className="grid gap-2 text-xs text-slate-500 sm:text-right">
                    <span className="inline-flex items-center gap-2">
                      <MapPin className="h-4 w-4" /> {alert.latitude.toFixed(4)}, {alert.longitude.toFixed(4)}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <Clock className="h-4 w-4" /> {alert.createdAt ? new Date(alert.createdAt.seconds * 1000).toLocaleString() : 'Just now'}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <User className="h-4 w-4" /> {alert.userId || 'Anonymous'}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${alert.status === 'resolved' ? 'bg-slate-200 text-slate-700' : 'bg-[#FEF2F2] text-[#B71C1C]'}`}>
                    {alert.status === 'resolved' ? 'Resolved' : 'Needs immediate action'}
                  </span>
                  {alert.status !== 'resolved' && (
                    <button
                      onClick={async () => {
                        setResolving(alert.id);
                        try {
                          await resolveSOSAlertInFirestore(alert.id);
                        } catch (err) {
                          console.error(err);
                        } finally {
                          setResolving(null);
                        }
                      }}
                      disabled={resolving === alert.id}
                      className="inline-flex items-center gap-2 rounded-2xl bg-[#00965E] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#007A44] disabled:opacity-70"
                    >
                      {resolving === alert.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                      Resolve alert
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
