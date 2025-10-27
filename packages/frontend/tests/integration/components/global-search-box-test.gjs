import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { component } from 'frontend/tests/pages/components/global-search-box';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import GlobalSearchBox from 'frontend/components/global-search-box';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | global search box', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders and is accessible', async function (assert) {
    await render(<template><GlobalSearchBox @search={{(noop)}} /></template>);
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('clicking search icon focuses input', async function (assert) {
    await render(<template><GlobalSearchBox @search={{(noop)}} /></template>);
    assert.notOk(component.inputHasFocus);
    await component.clickIcon();
    assert.ok(component.inputHasFocus);
  });

  test('clicking search searches if there is content', async function (assert) {
    this.set('search', (value) => {
      assert.step('search called');
      assert.strictEqual(value, 'typed it');
    });
    await render(<template><GlobalSearchBox @search={{this.search}} /></template>);
    await component.input('typed it');
    await component.clickIcon();
    assert.verifySteps(['search called']);
  });

  test('displays initial passed down value', async function (assert) {
    await render(<template><GlobalSearchBox @query="course" /></template>);
    assert.strictEqual(component.inputValue, 'course');
  });

  test('clicking enter triggers search', async function (assert) {
    this.set('search', (value) => {
      assert.step('search called');
      assert.strictEqual(value, 'typed it');
    });
    await render(<template><GlobalSearchBox @search={{this.search}} /></template>);
    await component.input('typed it');
    await component.keyDown.enter();
    assert.verifySteps(['search called']);
  });

  test('escape calls clears query', async function (assert) {
    await render(<template><GlobalSearchBox @search={{(noop)}} /></template>);
    await component.input('typed it');
    await component.keyDown.escape();
    assert.strictEqual(component.inputValue, '');
  });

  test('can empty with backspace', async function (assert) {
    this.set('query', 'test value');
    await render(<template><GlobalSearchBox @query={{this.query}} /></template>);
    assert.strictEqual(component.inputValue, 'test value');
    await component.input('typed it');
    assert.strictEqual(component.inputValue, 'typed it');
    await component.input('');
    assert.strictEqual(component.inputValue, '');
  });
});
