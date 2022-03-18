import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { component } from 'ilios-common/page-objects/components/pagedlist-controls';

module('Integration | Component | pagedlist controls', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  test('it renders', async function (assert) {
    await render(hbs`<PagedlistControls @limit={{10}} @offset={{11}} @total={{33}} />`);
    assert.strictEqual(component.limit.options.length, 3);
    assert.strictEqual(component.limit.options[0].text, '10');
    assert.strictEqual(component.limit.options[1].text, '25');
    assert.strictEqual(component.limit.options[2].text, '50');
    assert.ok(component.limit.options[0].selected);
    assert.strictEqual(component.pagerDetails.text, 'Showing 12 - 21 of 33');
    assert.notOk(component.firstPage.isDisabled);
    assert.notOk(component.previousPage.isDisabled);
    assert.notOk(component.nextPage.isDisabled);
    assert.notOk(component.lastPage.isDisabled);
  });

  test('limitless', async function (assert) {
    await render(hbs`<PagedlistControls @limitless={{true}} />`);
    assert.strictEqual(component.limit.options.length, 7);
    assert.strictEqual(component.limit.options[0].text, '10');
    assert.strictEqual(component.limit.options[1].text, '25');
    assert.strictEqual(component.limit.options[2].text, '50');
    assert.strictEqual(component.limit.options[3].text, '100');
    assert.strictEqual(component.limit.options[4].text, '200');
    assert.strictEqual(component.limit.options[5].text, '400');
    assert.strictEqual(component.limit.options[6].text, '1000');
    assert.notOk(component.pagerDetails.isPresent);
    assert.notOk(component.firstPage.isPresent);
    assert.notOk(component.lastPage.isPresent);
  });

  test('first page', async function (assert) {
    await render(hbs`<PagedlistControls @offset={{0}} @limit={{10}} @total={{100}} />`);
    assert.ok(component.firstPage.isDisabled);
    assert.ok(component.previousPage.isDisabled);
    assert.notOk(component.nextPage.isDisabled);
    assert.notOk(component.lastPage.isDisabled);
  });

  test('last page', async function (assert) {
    await render(hbs`<PagedlistControls @offset={{90}} @limit={{10}} @total={{100}} />`);
    assert.notOk(component.firstPage.isDisabled);
    assert.notOk(component.previousPage.isDisabled);
    assert.ok(component.nextPage.isDisabled);
    assert.ok(component.lastPage.isDisabled);
  });

  test('last page is first page', async function (assert) {
    await render(hbs`<PagedlistControls @offset={{0}} @limit={{10}} @total={{10}} />`);
    assert.ok(component.firstPage.isDisabled);
    assert.ok(component.previousPage.isDisabled);
    assert.ok(component.nextPage.isDisabled);
    assert.ok(component.lastPage.isDisabled);
  });

  test('go to previous page', async function (assert) {
    assert.expect(1);
    this.set('setOffset', (offset) => {
      assert.strictEqual(offset, 80);
    });
    await render(
      hbs`<PagedlistControls @offset={{90}} @limit={{10}} @total={{100}} @setOffset={{this.setOffset}} />`
    );
    await component.previousPage.click();
  });

  test('go to next page', async function (assert) {
    assert.expect(1);
    this.set('setOffset', (offset) => {
      assert.strictEqual(offset, 10);
    });
    await render(
      hbs`<PagedlistControls @offset={{0}} @limit={{10}} @total={{100}} @setOffset={{this.setOffset}} />`
    );
    await component.nextPage.click();
  });

  test('go to first page', async function (assert) {
    assert.expect(1);
    this.set('setOffset', (offset) => {
      assert.strictEqual(offset, 0);
    });
    await render(
      hbs`<PagedlistControls @offset={{50}} @limit={{10}} @total={{100}} @setOffset={{this.setOffset}} />`
    );
    await component.firstPage.click();
  });

  test('go to last page', async function (assert) {
    assert.expect(1);
    this.set('setOffset', (offset) => {
      assert.strictEqual(offset, 90);
    });
    await render(
      hbs`<PagedlistControls @offset={{50}} @limit={{10}} @total={{100}} @setOffset={{this.setOffset}} />`
    );
    await component.lastPage.click();
  });

  test('change limit', async function (assert) {
    assert.expect(2);
    this.set('setLimit', (limit) => {
      assert.strictEqual(limit, 10);
    });
    this.set('setOffset', (offset) => {
      assert.strictEqual(offset, 0);
    });
    await render(hbs`<PagedlistControls
      @offset={{10}}
      @limit={{25}}
      @total={{100}}
      @setOffset={{this.setOffset}}
      @setLimit={{this.setLimit}}
    />`);
    await component.limit.set(10);
  });
});
