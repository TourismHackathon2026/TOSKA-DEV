import { useState } from 'react';
import { AlertTriangle, X, Phone } from 'lucide-react';

/**
 * SOSButton — prominent emergency SOS trigger with a confirmation modal.
 * Uses the `sos-pulse` CSS class for the pulsing radar animation.
 */
export default function SOSButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* ── SOS Trigger Button ── */}
      <button
        id="sos-button"
        onClick={() => setIsOpen(true)}
        className="sos-pulse inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-white font-bold text-lg tracking-wide cursor-pointer select-none transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400/50"
        style={{
          background: 'linear-gradient(135deg, var(--color-safety-red), #dc2626)',
          boxShadow: '0 0 24px rgba(239, 68, 68, 0.45), inset 0 1px 0 rgba(255,255,255,0.12)',
        }}
        aria-label="Activate SOS Emergency"
      >
        <AlertTriangle size={22} strokeWidth={2.5} />
        SOS
      </button>

      {/* ── Confirmation Modal Overlay ── */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center px-4 animate-fadeIn"
          style={{ background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(8px)' }}
          onClick={() => setIsOpen(false)}
        >
          <div
            className="glass relative w-full max-w-md rounded-2xl p-8 text-center animate-fadeInUp"
            style={{
              boxShadow: '0 0 60px rgba(239, 68, 68, 0.2), 0 24px 48px rgba(0,0,0,0.5)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>

            {/* Icon */}
            <div
              className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(239,68,68,0.2), rgba(220,38,38,0.15))',
                border: '1px solid rgba(239,68,68,0.3)',
              }}
            >
              <AlertTriangle size={36} className="text-red-400" strokeWidth={2} />
            </div>

            {/* Title */}
            <h3
              className="text-2xl font-extrabold text-white mb-3"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Emergency SOS
            </h3>

            {/* Message */}
            <p className="text-slate-400 text-sm leading-relaxed mb-8 max-w-xs mx-auto">
              This will broadcast your GPS coordinates to local rescue teams and
              Nepal Mountain Rescue. Only activate in a genuine emergency.
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                id="sos-confirm-button"
                onClick={() => {
                  // In production this would trigger rescue APIs
                  alert('🚨 SOS Activated! Rescue teams notified with your GPS coordinates.');
                  setIsOpen(false);
                }}
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-white font-bold text-sm tracking-wide cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-95 focus:outline-none"
                style={{
                  background: 'linear-gradient(135deg, var(--color-safety-red), #dc2626)',
                  boxShadow: '0 0 20px rgba(239,68,68,0.35)',
                }}
              >
                <Phone size={16} />
                Confirm SOS
              </button>

              <button
                id="sos-cancel-button"
                onClick={() => setIsOpen(false)}
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl glass text-slate-300 font-semibold text-sm tracking-wide cursor-pointer transition-all duration-300 hover:bg-white/10 hover:text-white active:scale-95 focus:outline-none"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
