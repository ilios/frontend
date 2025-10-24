import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { a11yAudit } from 'ember-a11y-testing/test-support';
import { component } from 'ilios-common/page-objects/components/search-box';
import SearchBox from 'ilios-common/components/search-box';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | search box', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders and is accessible', async function (assert) {
    await render(<template><SearchBox /></template>);
    await a11yAudit(this.element);
    assert.ok(true, 'not a11y violations');
  });

  test('clicking search calls search', async function (assert) {
    this.set('search', (value) => {
      assert.step('search called');
      assert.strictEqual(value, '');
    });
    await render(<template><SearchBox @search={{this.search}} /></template>);
    await component.submit();
    assert.verifySteps(['search called']);
  });

  test('typing calls search', async function (assert) {
    this.set('search', (value) => {
      assert.step('search called');
      assert.strictEqual(value, 'typed it');
    });
    await render(<template><SearchBox @search={{this.search}} /></template>);
    await component.set('typed it');
    assert.verifySteps(['search called']);
  });

  test('escape calls clear', async function (assert) {
    this.set('clear', () => {
      assert.step('clear called');
    });
    await render(<template><SearchBox @search={{(noop)}} @clear={{this.clear}} /></template>);
    await component.set('typed it');
    await component.esc();
    assert.verifySteps(['clear called']);
  });

  test('clicking submit button sets focus', async function (assert) {
    await render(<template><SearchBox @search={{(noop)}} /></template>);
    assert.notOk(component.inputHasFocus);
    await component.submit();
    assert.ok(component.inputHasFocus);
  });

  test('default placeholder', async function (assert) {
    await render(<template><SearchBox @search={{(noop)}} /></template>);
    assert.strictEqual(component.placeholder, 'Search');
  });

  test('custom placeholder', async function (assert) {
    const placeholder = 'Geflarknik';
    this.set('placeholder', placeholder);
    await render(
      <template><SearchBox @search={{(noop)}} @placeholder={{this.placeholder}} /></template>,
    );
    assert.strictEqual(component.placeholder, placeholder);
  });

  test('default maxlength', async function (assert) {
    const MAX_LENGTH = 6000;

    await render(<template><SearchBox @search={{(noop)}} /></template>);
    await component.set('t'.repeat(6000));

    assert.strictEqual(component.value.length, MAX_LENGTH);

    await component.keydown({ which: 84 });
    assert.strictEqual(component.value.length, MAX_LENGTH);
  });

  test('custom maxlength', async function (assert) {
    const MAX_LENGTH = 255;

    await render(
      <template><SearchBox @search={{(noop)}} @maxlength={{this.MAX_LENGTH}} /></template>,
    );
    await component.set('t'.repeat(255));

    assert.strictEqual(component.value.length, MAX_LENGTH);

    await component.keydown({ which: 84 });
    assert.strictEqual(component.value.length, MAX_LENGTH);
  });
});
