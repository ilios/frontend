import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { a11yAudit } from 'ember-a11y-testing/test-support';
import { component } from 'ilios-common/page-objects/components/search-box';

module('Integration | Component | search box', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders and is accessible', async function (assert) {
    await render(hbs`<SearchBox />`);
    await a11yAudit(this.element);
    assert.ok(true, 'not a11y violations');
  });

  test('clicking search calls search', async function (assert) {
    assert.expect(1);
    this.set('search', (value) => {
      assert.strictEqual(value, '');
    });
    await render(hbs`<SearchBox @search={{this.search}} />`);
    await component.submit();
  });

  test('typing calls search', async function (assert) {
    assert.expect(1);
    this.set('search', (value) => {
      assert.strictEqual(value, 'typed it');
    });
    await render(hbs`<SearchBox @search={{this.search}} />`);
    await component.set('typed it');
  });

  test('escape calls clear', async function (assert) {
    assert.expect(1);
    this.set('clear', () => {
      assert.ok(true);
    });
    await render(hbs`<SearchBox @search={{(noop)}} @clear={{this.clear}} />`);
    await component.set('typed it');
    await component.esc();
  });

  test('clicking submit button sets focus', async function (assert) {
    await render(hbs`<SearchBox @search={{(noop)}} />`);
    assert.notOk(component.inputHasFocus);
    await component.submit();
    assert.ok(component.inputHasFocus);
  });

  test('default placeholder', async function (assert) {
    await render(hbs`<SearchBox @search={{(noop)}} />`);
    assert.strictEqual(component.placeholder, 'Search');
  });

  test('custom placeholder', async function (assert) {
    const placeholder = 'Geflarknik';
    this.set('placeholder', placeholder);
    await render(hbs`<SearchBox @search={{(noop)}} @placeholder={{this.placeholder}} />`);
    assert.strictEqual(component.placeholder, placeholder);
  });

  test('default maxlength', async function (assert) {
    const MAX_LENGTH = 6000;

    await render(hbs`<SearchBox @search={{(noop)}} />`);
    await component.set('t'.repeat(6000));

    assert.strictEqual(component.value.length, MAX_LENGTH);

    await component.keydown({ which: 84 });
    assert.strictEqual(component.value.length, MAX_LENGTH);
  });

  test('custom maxlength', async function (assert) {
    const MAX_LENGTH = 255;

    await render(hbs`<SearchBox @search={{(noop)}} @maxlength={{this.MAX_LENGTH}} />`);
    await component.set('t'.repeat(255));

    assert.strictEqual(component.value.length, MAX_LENGTH);

    await component.keydown({ which: 84 });
    assert.strictEqual(component.value.length, MAX_LENGTH);
  });
});
