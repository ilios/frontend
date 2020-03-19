import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import a11yAudit from 'ember-a11y-testing/test-support/audit';

module('Integration | Component | curriculum-inventory/publication-status', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders published and is accessible', async function (assert) {
    this.set('item', { isPublished: true, isScheduled: false });
    await render(hbs`<CurriculumInventory::PublicationStatus
      @item={{this.item}}
    />`);
    assert.dom().hasTextContaining('Finalized');

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });
  test('it renders draft and is accessible', async function (assert) {
    this.set('item', { isPublished: false, isScheduled: false });
    await render(hbs`<CurriculumInventory::PublicationStatus
      @item={{this.item}}
    />`);
    assert.dom().hasTextContaining('Draft');

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });
});
