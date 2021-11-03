import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { component } from 'ilios/tests/pages/components/curriculum-inventory/publication-status';

module('Integration | Component | curriculum-inventory/publication-status', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders finalized and is accessible', async function (assert) {
    this.set('item', { isFinalized: true });
    await render(hbs`<CurriculumInventory::PublicationStatus
      @item={{this.item}}
    />`);
    assert.ok(component.isFinalized);
    assert.equal(component.text, 'Finalized');
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });
  test('it renders draft and is accessible', async function (assert) {
    this.set('item', { isFinalized: false });
    await render(hbs`<CurriculumInventory::PublicationStatus
      @item={{this.item}}
    />`);
    assert.notOk(component.isFinalized);
    assert.equal(component.text, 'Draft');
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });
});
