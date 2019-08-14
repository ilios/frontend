import { module, test } from 'qunit';
import { click, currentURL, fillIn, find, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';
import page from 'ilios/tests/pages/search';

module('Acceptance | search', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function() {
    this.school = this.server.create('school');
    this.user = await setupAuthentication({ school: this.school });
  });

  test('visiting /search', async function(assert) {
    assert.expect(8);
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

    await page.visit();
    assert.equal(currentURL(), '/search');
    await page.searchBox.input(input);
    assert.equal(currentURL(), '/search', 'entering input value does not update query param');
    await page.searchBox.clickIcon();
    assert.equal(page.searchBox.inputValue, input);
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

  test('clicking back on search updates results and input #4759', async function(assert) {
    assert.expect(11);

    const firstInput = 'first';
    const secondInput = 'second';

    let searchRun = 0;
    this.server.get('search/v1/curriculum', (schema, { queryParams }) => {
      if (!queryParams.onlySuggest) {
        switch (searchRun) {
        case 0:
          assert.equal(queryParams.q, firstInput, 'first time, first input');
          break;
        case 1:
          assert.equal(queryParams.q, secondInput, 'second time, second input');
          break;
        case 2:
          assert.equal(queryParams.q, firstInput, 'third time, first input');
          break;
        default:
          assert.ok(false, 'Search called too many times');
          break;
        }
        searchRun++;
      }
      return {
        results: {
          autocomplete: [queryParams.q],
          courses: []
        }
      };
    });
    await page.visit();
    assert.equal(currentURL(), '/search');
    await page.searchBox.input(firstInput);
    await page.searchBox.clickIcon();
    assert.equal(page.searchBox.inputValue, firstInput);
    assert.equal(currentURL(), `/search?q=${firstInput}`);
    await page.searchBox.input(secondInput);
    await page.searchBox.clickIcon();
    assert.equal(page.searchBox.inputValue, secondInput);
    assert.equal(currentURL(), `/search?q=${secondInput}`);
    await page.visit({ q: firstInput });
    assert.equal(currentURL(), `/search?q=${firstInput}`);
    assert.equal(page.searchBox.inputValue, firstInput);
    assert.equal(page.searchBox.autocompleteResults.length, 0);
  });
});
