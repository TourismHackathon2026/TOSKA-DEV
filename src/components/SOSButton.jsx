import { useState } from 'react';
import { AlertTriangle, X, Phone, Loader2 } from 'lucide-react';
import { sendSOSAlert } from '../utils/firebaseService';

/**
 * SOSButton — prominent emergency SOS trigger with a confirmation modal.
 * Uses the `sos-pulse` CSS class for the pulsing radar animation.
 * Retrieves real coordinates using geolocation API and dispatches them to Firestore.
 */
export default function SOSButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConfirmSOS = () => {
    setLoading(true);

    const fallbackSend = async () => {
      try {
        await sendSOSAlert({
          latitude: 27.9881,
          longitude: 86.9250,
          altitude: 5364,
          message: 'Emergency SOS manual trigger (GPS coordinates unavailable)',
        });
        alert('🚨 SOS Dispatched! Emergency dispatchers have been notified.');
      } catch (err) {
        console.error('SOS failed:', err);
        alert('Failed to send SOS: ' + err.message);
      } finally {
        setLoading(false);
        setIsOpen(false);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            await sendSOSAlert({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              altitude: position.coords.altitude || 0,
              message: 'Emergency SOS manual trigger via Web App Dashboard',
            });
            alert(`🚨 SOS Dispatched! Location coordinates sent:\nLat: ${position.coords.latitude.toFixed(4)}\nLng: ${position.coords.longitude.toFixed(4)}`);
          } catch (err) {
            console.error('SOS failed:', err);
            alert('Failed to send SOS: ' + err.message);
          } finally {
            setLoading(false);
            setIsOpen(false);
          }
        },
        (error) => {
          console.warn('Geolocation blocked or unavailable. Falling back to default region.', error);
          fallbackSend();
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      fallbackSend();
    }
  };

  return (
    <>
      {/* ── SOS Trigger Button ── */}
      <button
        id="sos-button"
        onClick={() => setIsOpen(true)}
        className="sos-pulse inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-white font-bold text-lg tracking-wide cursor-pointer select-none transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400/50"
        style={{
          background: '#D32F2F',
          boxShadow: '0 0 24px rgba(211, 47, 47, 0.35)',
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
          style={{ background: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)' }}
          onClick={() => {
            if (!loading) setIsOpen(false);
          }}
        >
          <div
            className="relative w-full max-w-md rounded-2xl p-8 text-center animate-fadeInUp"
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              boxShadow: '0 0 40px rgba(211, 47, 47, 0.1), 0 24px 48px rgba(0,0,0,0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={() => setIsOpen(false)}
              disabled={loading}
              className="absolute top-4 right-4 transition-colors cursor-pointer disabled:opacity-50 text-slate-400 hover:text-slate-700"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>

            {/* Icon */}
            <div
              className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
              style={{
                background: '#FEF2F2',
                border: '2px solid rgba(211,47,47,0.2)',
              }}
            >
              <AlertTriangle size={36} style={{ color: '#D32F2F' }} strokeWidth={2} />
            </div>

            {/* Title */}
            <h3
              className="text-2xl font-extrabold text-slate-800 mb-3"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Emergency SOS
            </h3>

            {/* Message */}
            <p className="text-sm text-slate-500 leading-relaxed max-w-[320px] mx-auto mb-8">
              This will broadcast your GPS coordinates to local rescue teams and
              Nepal Mountain Rescue. Only activate in a genuine emergency.
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                id="sos-confirm-button"
                onClick={handleConfirmSOS}
                disabled={loading}
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-white font-bold text-sm tracking-wide cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-95 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: '#D32F2F',
                  boxShadow: '0 4px 14px rgba(211,47,47,0.3)',
                }}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Phone size={16} />
                )}
                Confirm SOS
              </button>

              <button
                id="sos-cancel-button"
                onClick={() => setIsOpen(false)}
                disabled={loading}
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm tracking-wide cursor-pointer transition-all duration-300 active:scale-95 focus:outline-none disabled:opacity-50 text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200"
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
