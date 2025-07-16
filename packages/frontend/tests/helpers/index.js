import {
  setupApplicationTest as upstreamSetupApplicationTest,
  setupRenderingTest as upstreamSetupRenderingTest,
  setupTest as upstreamSetupTest,
} from 'ember-qunit';
import { setupMirage } from 'frontend/tests/test-support/mirage';
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
  setupMirage(hooks); // ember-mirage
}

function setupRenderingTest(hooks, options) {
  upstreamSetupRenderingTest(hooks, options);
  setupIntl(hooks, 'en-us'); // ember-intl

  // Additional setup for rendering tests can be done here.

  setRunOptions({
    rules: {
      //disable color-contrast check on integration tests as we don't have a full background or styles
      'color-contrast': { enabled: false },
      listitem: { enabled: false },
    },
  });
}

function setupTest(hooks, options) {
  upstreamSetupTest(hooks, options);

  // Additional setup for unit tests can be done here.
}

export { setupApplicationTest, setupRenderingTest, setupTest };
