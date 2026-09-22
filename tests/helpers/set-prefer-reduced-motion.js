/**
 * This overrides the `window.matchMedia()` method to enable testing of reduction motion preference.
 *
 * ACHTUNG!
 * In your test, ensure to capture the original `matchMedia()` method in your test during setup and restore it
 * during teardown.
 *
 * ```js
 * import { setPreferReducedMotion } from 'ilios-common';
 *
 * module('Integration | Component | my-component', function (hooks) {
 *   setupRenderingTest(hooks);
 *
 *   hooks.beforeEach(function () {
 *     this.originalMatchMedia = window.matchMedia;
 *   });
 *
 *   hooks.afterEach(function () {
 *     window.matchMedia = this.originalMatchMedia;
 *   });
 *
 *   test('with reduced motion preference', async function (assert) {
 *     setPreferReducedMotion(true);
 *     // rest of test here
 *   });
 *
 *   test('without reduced motion preference', async function (assert) {
 *     setPreferReducedMotion(false);
 *     // rest of test here
 *   });
 * });
 * ```
 * @param {boolean} reduced set to TRUE to simulate reduced motion preference, FALSE to negate the preference.
 */
export default function setPreferReducedMotion(reduced) {
  window.matchMedia = (query) => {
    return {
      matches: query === '(prefers-reduced-motion: reduce)' && reduced,
      media: query,
      onchange: null,
      addListener: () => {}, // deprecated but sometimes used
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    };
  };
}
