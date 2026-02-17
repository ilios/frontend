import {
  setupApplicationTest as upstreamSetupApplicationTest,
  setupRenderingTest as upstreamSetupRenderingTest,
  setupTest as upstreamSetupTest,
} from 'ember-qunit';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import { setupIntl } from 'ember-intl/test-support';
import { setRunOptions } from 'ember-a11y-testing/test-support';

/**
 * In order to get wcag22 rules we have to specify the tags manually.
 * see: https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md#wcag-22-level-a--aa-rules
 *
 * There is no supported way to add tags, only to send the entire list.
 * see https://github.com/dequelabs/axe-core/issues/4717
 */
const runOnly = {
  type: 'tag',
  values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice', 'wcag22a', 'wcag22aa'],
};

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
  setRunOptions({
    preload: false,
    runOnly,
  });
}

function setupRenderingTest(hooks, options) {
  upstreamSetupRenderingTest(hooks, options);
  setupIntl(hooks, 'en-us'); // ember-intl

  // Additional setup for rendering tests can be done here.
  setRunOptions({
    preload: false,
    rules: {
      //disable color-contrast check on integration tests as we don't have a full background or styles
      'color-contrast': { enabled: false },
      //dislable list-item as many components are just an li element not in a list
      listitem: { enabled: false },
      //disable heading order as many components have headings that start too low
      'heading-order': { enabled: false },
    },
    runOnly,
  });
}

function setupTest(hooks, options) {
  upstreamSetupTest(hooks, options);

  // Additional setup for unit tests can be done here.
}

export { setupApplicationTest, setupRenderingTest, setupTest };
export { takeScreenshot, takeComponentScreenshot } from './take-screenshot';
