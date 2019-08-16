import { module, test } from 'qunit';
import { visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';

module('Acceptance | header', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('privileged users can view search', async function (assert) {
    await setupAuthentication({}, true);
    await visit('/');
    assert.dom('.global-search-box').exists();
  });

  test('students can not view search', async function (assert) {
    await setupAuthentication();
    await visit('/');
    assert.dom('.global-search-box').doesNotExist();
  });
});
