import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, MapPin } from 'lucide-react';

const loadGoogleMaps = (apiKey) => {
  if (typeof window === 'undefined') return Promise.reject(new Error('Browser environment required'));
  if (window.google?.maps) return Promise.resolve(window.google.maps);
  if (window.__googleMapsPromise) return window.__googleMapsPromise;

  window.__googleMapsPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google?.maps) {
        resolve(window.google.maps);
      } else {
        reject(new Error('Google Maps loaded but global object missing'));
      }
    };
    script.onerror = () => reject(new Error('Google Maps script failed to load'));
    document.head.appendChild(script);
  });

  return window.__googleMapsPromise;
};

function formatMarkerTitle(marker) {
  return `${marker.name} · ${marker.trek}`;
}

export default function GoogleMapsTrace({ markers = [], center = { lat: 28.2, lng: 84.0 } }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      setError('Google Maps API key is not configured. Add VITE_GOOGLE_MAPS_API_KEY to your .env file.');
      setStatus('error');
      return;
    }

    loadGoogleMaps(apiKey)
      .then((maps) => {
        if (!containerRef.current) {
          setError('Map container not available');
          setStatus('error');
          return;
        }

        const map = new maps.Map(containerRef.current, {
          center,
          zoom: 6,
          mapTypeId: 'terrain',
          disableDefaultUI: true,
          gestureHandling: 'greedy',
        });

        const bounds = new maps.LatLngBounds();

        markers.forEach((marker) => {
          const position = { lat: Number(marker.lat), lng: Number(marker.lng) };
          bounds.extend(position);

          const markerIcon = {
            path: maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: marker.status === 'critical' ? '#D32F2F' : marker.status === 'warning' ? '#F59E0B' : '#0F9D58',
            fillOpacity: 0.95,
            strokeWeight: 0,
          };

          const mapMarker = new maps.Marker({
            position,
            map,
            title: formatMarkerTitle(marker),
            icon: markerIcon,
          });

          const infoWindow = new maps.InfoWindow({
            content: `<div style="font-family:system-ui, sans-serif; line-height:1.3; font-size:14px;">
              <strong>${formatMarkerTitle(marker)}</strong><br />
              Status: ${marker.status}<br />
              Altitude: ${marker.altitude ?? 'N/A'}m
            </div>`,
          });

          mapMarker.addListener('click', () => infoWindow.open({ anchor: mapMarker, map }));
        });

        if (markers.length) {
          map.fitBounds(bounds, 72);
        }

        mapRef.current = map;
        setStatus('ready');
      })
      .catch((err) => {
        setError(err.message || 'Failed to load Google Maps');
        setStatus('error');
      });

    return () => {
      mapRef.current = null;
    };
  }, [markers, center]);

  return (
    <div className="relative rounded-[28px] border border-slate-200 bg-slate-50 p-4">
      <div className="mb-4 flex items-center gap-3">
        <div className="h-11 w-11 rounded-2xl bg-[#00965E]/10 text-[#00965E] flex items-center justify-center">
          <MapPin size={20} />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">Google Maps: Lost Person Trace</p>
          <p className="text-xs text-slate-500">Track critical trekker coordinates in real time on the live mission map.</p>
        </div>
      </div>

      {status === 'loading' && (
        <div className="flex h-[360px] items-center justify-center rounded-[24px] bg-white text-sm text-slate-500">
          Loading Google Maps…
        </div>
      )}

      {status === 'error' && (
        <div className="flex h-[360px] items-center justify-center rounded-[24px] bg-red-50 p-6 text-sm text-red-700">
          <AlertTriangle className="mr-2 h-4 w-4" />
          {error}
        </div>
      )}

      <div ref={containerRef} className="h-[360px] rounded-[24px] bg-slate-200" />
    </div>
  );
}
