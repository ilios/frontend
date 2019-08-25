import { module, test } from 'qunit';
import { visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';
import { resolve } from 'rsvp';
import Service from '@ember/service';

module('Acceptance | header', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('privileged users can view search', async function (assert) {
    const iliosConfigMock = Service.extend({
      apiNameSpace: '/api',
      searchEnabled: resolve(true),
    });
    this.owner.register('service:iliosConfig', iliosConfigMock);
    await setupAuthentication({}, true);
    await visit('/');
    assert.dom('.global-search-box').exists();
  });

  test('when search is disabled on the server it does not display', async function (assert) {
    const iliosConfigMock = Service.extend({
      apiNameSpace: '/api',
      searchEnabled: resolve(false),
    });
    this.owner.register('service:iliosConfig', iliosConfigMock);
    await setupAuthentication({}, true);
    await visit('/');
    assert.dom('.global-search-box').doesNotExist();
  });

  test('students can not view search', async function (assert) {
    const iliosConfigMock = Service.extend({
      apiNameSpace: '/api',
      searchEnabled: resolve(true),
    });
    this.owner.register('service:iliosConfig', iliosConfigMock);
    await setupAuthentication();
    await visit('/');
    assert.dom('.global-search-box').doesNotExist();
  });
});
