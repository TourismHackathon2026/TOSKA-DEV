import { useEffect, useRef } from 'react';

/**
 * Citizens Bank-style scroll reveal hook.
 * Applies a fade-in-up animation when elements enter the viewport.
 *
 * @param {Object} options
 * @param {string} options.threshold - Intersection threshold (0-1). Default 0.15
 * @param {string} options.rootMargin - Root margin. Default '0px 0px -60px 0px'
 */
export function useScrollReveal({ threshold = 0.15, rootMargin = '0px 0px -60px 0px' } = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Set initial hidden state
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
          observer.unobserve(el);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return ref;
}

/**
 * Batch scroll reveal — observes all children with [data-reveal] attribute.
 * Each child gets a staggered delay.
 */
export function useScrollRevealGroup({ threshold = 0.1, rootMargin = '0px 0px -40px 0px', stagger = 80 } = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const children = container.querySelectorAll('[data-reveal]');
    children.forEach((child, i) => {
      child.style.opacity = '0';
      child.style.transform = 'translateY(20px)';
      child.style.transition = `opacity 0.5s cubic-bezier(0.4,0,0.2,1) ${i * stagger}ms, transform 0.5s cubic-bezier(0.4,0,0.2,1) ${i * stagger}ms`;
    });

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          children.forEach((child) => {
            child.style.opacity = '1';
            child.style.transform = 'translateY(0)';
          });
          observer.unobserve(container);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [threshold, rootMargin, stagger]);

  return ref;
}
