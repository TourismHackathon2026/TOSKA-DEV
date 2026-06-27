import { useEffect, useRef, useState } from 'react';

/**
 * Animated counter that counts up from 0 when the element scrolls into view.
 * Returns [ref, displayValue].
 *
 * @param {number|string} end - Target value (can include text like "4.9" or "12,400")
 * @param {number} duration - Animation duration in ms (default 1800)
 */
export function useCountUp(end, duration = 1800) {
  const ref = useRef(null);
  const [display, setDisplay] = useState('0');
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || hasAnimated.current) return;

    // Parse numeric value from the end string
    const cleaned = String(end).replace(/[^0-9.\-]/g, '');
    const numericEnd = parseFloat(cleaned);

    if (isNaN(numericEnd)) {
      setDisplay(String(end));
      return;
    }

    const isDecimal = String(cleaned).includes('.');
    const decimalPlaces = isDecimal ? (String(cleaned).split('.')[1] || '').length : 0;
    const prefix = String(end).match(/^[^0-9\-]*/)?.[0] || '';
    const suffix = String(end).match(/[^0-9.]*$/)?.[0] || '';
    const hasCommas = String(end).includes(',');

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          observer.unobserve(el);

          const start = performance.now();
          const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

          function animate(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easeOutQuart(progress);
            const current = numericEnd * easedProgress;

            let formatted;
            if (isDecimal) {
              formatted = current.toFixed(decimalPlaces);
            } else {
              const rounded = Math.round(current);
              formatted = hasCommas ? rounded.toLocaleString() : String(rounded);
            }

            setDisplay(prefix + formatted + suffix);

            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          }

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [end, duration]);

  return [ref, display];
}
