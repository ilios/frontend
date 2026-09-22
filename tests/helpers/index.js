import {
  setupApplicationTest as upstreamSetupApplicationTest,
  setupRenderingTest as upstreamSetupRenderingTest,
  setupTest as upstreamSetupTest,
} from 'ember-qunit';
import { setupMSW } from 'frontend/tests/msw';
import { setupIntl } from 'ember-intl/test-support';
import { setRunOptions } from 'ember-a11y-testing/test-support';

// This file exists to provide wrappers around ember-qunit's
// test setup functions. This way, you can easily extend the setup that is
// needed per test type.

function setupApplicationTest(hooks, options) {
  upstreamSetupApplicationTest(hooks, options);

  // Additional setup for application tests can be done here.
  //
  // For example, if you need an authenticated session for each
  // application test, you could do:
  //
  // hooks.beforeEach(async function () {
  //   await authenticateSession(); // ember-simple-auth
  // });
  //
  // This is also a good place to call test setup functions coming
  // from other addons:
  //
  setupIntl(hooks, 'en-us'); // ember-intl
  setupMSW(hooks);
}

function setupRenderingTest(hooks, options) {
  upstreamSetupRenderingTest(hooks, options);
  setupIntl(hooks, 'en-us'); // ember-intl

  // Additional setup for rendering tests can be done here.

  /**
   * These tests are run in issolation without a full application shell, so many items
   * will appear out of source order and with no styles (such as background color)
   */
  hooks.before(() => {
    setRunOptions({
      rules: {
        'color-contrast': { enabled: false },
        listitem: { enabled: false },
        'heading-order': { enabled: false },
      },
    });
  });
}

function setupTest(hooks, options) {
  upstreamSetupTest(hooks, options);

  // Additional setup for unit tests can be done here.
}

export { setupApplicationTest, setupRenderingTest, setupTest };
export { takeScreenshot, takeComponentScreenshot } from './take-screenshot';

export { default as setupAuthentication } from './setup-authentication';
export { default as waitForResource } from './wait-for-resource';
export { freezeDateAt, unfreezeDate } from './mockdate';
export { flatpickrDatePicker, flatpickrDateValue } from './flatpickr-date-picker';
export { default as setPreferReducedMotion } from './set-prefer-reduced-motion';
export {
  fillInQuillEditor,
  quillEditorValue,
  pageObjectFillInQuillEditor,
  pageObjectQuillEditorValue,
} from './quill-editor';
export { hasFocus } from './has-focus';
export { focusedText } from './focused-text';
export { keyOnFocus } from './key-on-focus';
export { default as jwtEncode } from './jwt-encode';
export { default as isInView } from './is-in-view';
export { default as scrollTo } from './scroll-to';
