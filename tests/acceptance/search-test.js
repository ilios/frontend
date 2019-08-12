import { module, test } from 'qunit';
import { click, currentURL, fillIn, find, visit } from '@ember/test-helpers';
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

  test('visiting /search', async function(assert) {
    assert.expect(7);

    const input = 'hello';

    this.server.get('search/v1/curriculum', (schema, { queryParams }) => {
      assert.ok(queryParams.q);
      assert.equal(queryParams.q, input);

      return {
        results: {
          autocomplete: [],
          courses: []
        }
      };
    });

    await visit('/search');
    assert.equal(currentURL(), '/search');
    await fillIn('input.global-search-input', input);
    assert.equal(currentURL(), '/search', 'entering input value does not update query param');
    await click('[data-test-search-icon]');
    assert.equal(currentURL(), `/search?q=${input}`, 'triggering search updates query param');
  });

  test('search with special chars #4752', async function(assert) {
    assert.expect(4);

    const input = 'H&L+foo=bar';

    this.server.get('search/v1/curriculum', () => {
      return {
        results: {
          autocomplete: [],
          courses: []
        }
      };
    });

    await visit('/search');
    assert.equal(currentURL(), '/search');
    await fillIn('input.global-search-input', input);
    assert.equal(currentURL(), '/search', 'entering input value does not update query param');
    await click('[data-test-search-icon]');
    assert.equal(currentURL(), `/search?q=${encodeURIComponent(input)}`);
    assert.equal(find('input.global-search-input').value, input);
  });

  test('search with special chars from dashboard #4752', async function(assert) {
    assert.expect(3);

    const input = 'H&L+foo=bar';

    this.server.get('search/v1/curriculum', () => {
      return {
        results: {
          autocomplete: [],
          courses: []
        }
      };
    });
    const headerSearchBox = '[data-test-ilios-header] [data-test-global-search-box] input';
    const searchBox = '[data-test-global-search] [data-test-global-search-box] input';

    await visit('/dashboard');
    assert.equal(currentURL(), '/dashboard');
    await fillIn(headerSearchBox, input);
    await click('[data-test-search-icon]');
    assert.equal(currentURL(), `/search?page=1&q=${encodeURIComponent(input)}`);
    assert.equal(find(searchBox).value, input);
  });
});
