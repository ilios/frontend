import { scheduleOnce } from '@ember/runloop';

/**
 * Optional arguments object type definition.
 *
 * @typedef {object} Options The Optional arguments object.
 * @property {?boolean} disabled - Set to TRUE in order to prevent scrolling. Defaults to FALSE.
 * @property {?string} scrollBehavior - Determines whether scrolling is instant or animates smoothly. Default to "smooth". See https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView#behavior for details.
 */

/**
 * Scrolls a given element into view.
 *
 * @param {Element} element The target element to scroll into view.
 * @param {?Options} options Optional arguments.
 */
export default function scrollIntoView(element, options) {
  const opts = {
    block: 'start',
    inline: 'nearest',
    behavior: options?.scrollBehavior ?? 'smooth',
  };

  function deferredScroll() {
    // https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView
    element?.scrollIntoView(opts);
  }

  if (!options?.disabled) {
    // eslint-disable-next-line ember/no-runloop
    scheduleOnce('afterRender', deferredScroll);
  }
}
