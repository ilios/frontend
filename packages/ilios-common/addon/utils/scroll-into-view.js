import { scheduleOnce } from '@ember/runloop';

/**
 * Optional arguments object type definition.
 *
 * @typedef {object} Options The Optional arguments object.
 * @property {?boolean} disabled - Set to TRUE in order to prevent scrolling. Defaults to FALSE.
 * @property {?object} opts - Parameters to control scrolling behavior. See https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView#scrollintoviewoptions.
 */

/**
 * Scrolls a given element into view.
 *
 * @param {Element} element The target element to scroll into view.
 * @param {?Options} options Optional arguments.
 */
export default function scrollIntoView(element, options) {
  const defaultOpts = {
    block: 'start',
    inline: 'nearest',
    behavior: 'instant',
  };
  // Merge default options with any given overrides.
  const opts = options?.opts ? { ...defaultOpts, ...options.opts } : defaultOpts;

  function deferredScroll() {
    // https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView
    element?.scrollIntoView(opts);
  }

  if (!options?.disabled) {
    // eslint-disable-next-line ember/no-runloop
    scheduleOnce('afterRender', deferredScroll);
  }
}
