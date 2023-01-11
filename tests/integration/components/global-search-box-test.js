import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { component } from 'ilios/tests/pages/components/global-search-box';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';

module('Integration | Component | global search box', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  hooks.beforeEach(function () {
    this.server.get('api/search/v1/curriculum', () => {
      return {
        results: {
          autocomplete: ['first', 'second', 'third'],
        },
      };
    });
  });

  test('it renders and is accessible', async function (assert) {
    await render(hbs`<GlobalSearchBox @search={{(noop)}} />`);
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('clicking search icon focuses input', async function (assert) {
    await render(hbs`<GlobalSearchBox @search={{(noop)}} />`);
    assert.notOk(component.inputHasFocus);
    await component.clickIcon();
    assert.ok(component.inputHasFocus);
  });

  test('clicking search searches if there is content', async function (assert) {
    assert.expect(1);
    this.set('search', (value) => assert.strictEqual(value, 'typed it'));
    await render(hbs`<GlobalSearchBox @search={{this.search}} />`);
    await component.input('typed it');
    await component.clickIcon();
  });

  test('displays initial passed down value', async function (assert) {
    await render(hbs`<GlobalSearchBox @query="course" />`);
    assert.strictEqual(component.inputValue, 'course');
  });

  test('typing start autocomplete', async function (assert) {
    assert.expect(5);
    const input = 'typed it';
    this.server.get('api/search/v1/curriculum', (schema, { queryParams }) => {
      assert.ok(queryParams.q);
      assert.ok(queryParams.onlySuggest);
      assert.strictEqual(queryParams.q, input);
      assert.strictEqual(queryParams.onlySuggest, 'true');

      return {
        results: {
          autocomplete: ['one', 'two', 'three'],
        },
      };
    });

    this.set('search', (value) => {
      assert.strictEqual(value, input);
    });
    await render(hbs`<GlobalSearchBox @search={{this.search}} />`);
    await component.input(input);
    await component.triggerInput();
    assert.strictEqual(component.autocompleteResults.length, 3);
  });

  test('clicking enter triggers search', async function (assert) {
    assert.expect(3);
    this.set('search', (value) => {
      assert.strictEqual(value, 'typed it');
      assert.ok(true, 'search action gets called');
    });
    await render(hbs`<GlobalSearchBox @search={{this.search}} />`);
    await component.input('typed it');
    await component.keyUp.enter();
    assert.strictEqual(component.autocompleteResults.length, 0);
  });

  test('escape calls clears query', async function (assert) {
    await render(hbs`<GlobalSearchBox @search={{(noop)}} />`);
    await component.input('typed it');
    assert.strictEqual(component.autocompleteResults.length, 3);
    await component.keyUp.escape();
    assert.strictEqual(component.autocompleteResults.length, 0);
    assert.strictEqual(component.inputValue, '');
  });

  test('vertical triggers work', async function (assert) {
    assert.expect(38);
    let inputValue = 'first';
    this.set('search', (value) => {
      assert.strictEqual(value, inputValue);
      assert.ok(true, 'search action gets called');
    });
    await render(hbs`<GlobalSearchBox @search={{this.search}} />`);
    await component.input('typed it');
    await component.keyUp.down();
    assert.ok(component.resultsRow1HasActiveClass);
    assert.notOk(component.resultsRow2HasActiveClass);
    assert.notOk(component.resultsRow3HasActiveClass);
    assert.strictEqual(component.inputValue, 'first');
    await component.keyUp.down();
    assert.notOk(component.resultsRow1HasActiveClass);
    assert.ok(component.resultsRow2HasActiveClass);
    assert.notOk(component.resultsRow3HasActiveClass);
    assert.strictEqual(component.inputValue, 'second');
    await component.keyUp.down();
    assert.notOk(component.resultsRow1HasActiveClass);
    assert.notOk(component.resultsRow2HasActiveClass);
    assert.ok(component.resultsRow3HasActiveClass);
    assert.strictEqual(component.inputValue, 'third');
    await component.keyUp.down();
    assert.notOk(component.resultsRow1HasActiveClass);
    assert.notOk(component.resultsRow2HasActiveClass);
    assert.notOk(component.resultsRow3HasActiveClass);
    assert.strictEqual(component.inputValue, 'typed it');
    await component.keyUp.up();
    assert.notOk(component.resultsRow1HasActiveClass);
    assert.notOk(component.resultsRow2HasActiveClass);
    assert.ok(component.resultsRow3HasActiveClass);
    assert.strictEqual(component.inputValue, 'third');
    await component.keyUp.up();
    assert.notOk(component.resultsRow1HasActiveClass);
    assert.ok(component.resultsRow2HasActiveClass);
    assert.notOk(component.resultsRow3HasActiveClass);
    assert.strictEqual(component.inputValue, 'second');
    await component.keyUp.up();
    assert.ok(component.resultsRow1HasActiveClass);
    assert.notOk(component.resultsRow2HasActiveClass);
    assert.notOk(component.resultsRow3HasActiveClass);
    assert.strictEqual(component.inputValue, 'first');
    await component.keyUp.up();
    assert.notOk(component.resultsRow1HasActiveClass);
    assert.notOk(component.resultsRow2HasActiveClass);
    assert.notOk(component.resultsRow3HasActiveClass);
    assert.strictEqual(component.inputValue, 'typed it');
    await component.keyUp.down();
    await component.keyUp.enter();
    inputValue = 'second';
    await component.input('typed it');
    await component.keyUp.down();
    await component.keyUp.down();
    await component.keyUp.enter();
    inputValue = 'third';
    await component.input('typed it');
    await component.keyUp.up();
    await component.keyUp.enter();
  });

  test('can empty with backspace', async function (assert) {
    this.set('query', 'test value');
    await render(hbs`<GlobalSearchBox @query={{this.query}} />`);
    assert.strictEqual(component.inputValue, 'test value');
    await component.input('typed it');
    assert.strictEqual(component.inputValue, 'typed it');
    await component.input('');
    assert.strictEqual(component.inputValue, '');
  });

  test('can empty with backspace after choosing autocomplete', async function (assert) {
    this.set('query', 'test value');
    await render(hbs`<GlobalSearchBox @query={{this.query}} />`);
    assert.strictEqual(component.inputValue, 'test value');
    await component.input('typed it');
    assert.strictEqual(component.inputValue, 'typed it');
    await component.keyUp.down();
    assert.strictEqual(component.inputValue, 'first');
    await component.input('');
    assert.strictEqual(component.inputValue, '');
  });

  test('require at least three chars to run autocomplete #4769', async function (assert) {
    assert.expect(2);
    const input = 'ty';
    this.set('search', () => {
      assert.ok(false, 'search should not be called');
    });
    await render(hbs`<GlobalSearchBox @search={{this.search}} />`);
    await component.input(input);
    await component.triggerInput();
    assert.strictEqual(component.autocompleteResults.length, 1);
    assert.strictEqual(component.autocompleteResults[0].text, 'keep typing...');
  });
});
