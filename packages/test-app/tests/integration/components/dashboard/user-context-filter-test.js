import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
// import { render } from '@ember/test-helpers';
// import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | dashboard/user-context-filter', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  test('it renders', async function (/* assert */) {
    // @todo implement [ST 2024/04/18]
  });
});
