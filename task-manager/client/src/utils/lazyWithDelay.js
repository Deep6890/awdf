import { lazy } from 'react';

/**
 * Lazy load a component with a guaranteed minimum delay to prevent UI flicker
 * on fast networks while keeping fallbacks smooth on slower connections.
 * 
 * @param {Function} factory - Dynamic import factory returning a Promise<{ default: Component }>
 * @param {number} ms - Minimum delay in milliseconds (default: 300ms)
 * @returns {React.LazyExoticComponent}
 */
export function lazyWithMinDelay(factory, ms = 300) {
  return lazy(() =>
    Promise.all([
      factory(),
      new Promise((resolve) => setTimeout(resolve, ms))
    ]).then(([moduleExports]) => moduleExports)
  );
}
