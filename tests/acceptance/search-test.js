import { module, skip } from 'qunit';
import { click, currentURL, fillIn, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';

module('Acceptance | search', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function() {
    this.school = this.server.create('school');
    this.user = await setupAuthentication({ school: this.school });
  });

  skip('visiting /search', async function(assert) {
    assert.expect(3);

    await visit('/search');
    assert.equal(currentURL(), '/search');
    await fillIn('input.global-search-input', 'hello');
    assert.equal(currentURL(), '/search', 'entering input value does not update query param');
    await click('[data-test-search-icon]');
    assert.equal(currentURL(), '/search?q=hello', 'triggering search updates query param');
  });
});
