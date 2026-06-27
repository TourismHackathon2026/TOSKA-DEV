import { X } from 'lucide-react';

export default function NotificationsPanel({ notifications, visible, onClose }) {
  if (!visible) return null;

  return (
    <div className="absolute right-0 top-full z-50 mt-2 w-[320px] rounded-3xl border border-slate-200 bg-white shadow-xl">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">Notifications</p>
          <p className="text-xs text-slate-500">Real-time alerts and updates</p>
        </div>
        <button onClick={onClose} className="rounded-full p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="max-h-96 overflow-y-auto p-3">
        {notifications.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
            No notifications yet.
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((item) => (
              <div key={item.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                    <p className="text-xs text-slate-500">{item.type?.toUpperCase()}</p>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {item.createdAt ? new Date(item.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-700">{item.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
