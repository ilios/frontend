import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { component } from 'ilios/tests/pages/components/curriculum-inventory/publication-status';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Integration | Component | curriculum-inventory/publication-status', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  hooks.beforeEach(function () {
    this.report = this.server.create('curriculum-inventory-report');
  });

  test('it renders finalized and is accessible', async function (assert) {
    this.server.create('curriculum-inventory-export', { report: this.report });
    const reportModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-report', this.report.id);
    this.set('item', reportModel);
    await render(hbs`<CurriculumInventory::PublicationStatus
      @item={{this.item}}
    />`);
    assert.ok(component.isFinalized);
    assert.strictEqual(component.text, 'Finalized');
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });
  test('it renders draft and is accessible', async function (assert) {
    const reportModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-report', this.report.id);
    this.set('item', reportModel);
    await render(hbs`<CurriculumInventory::PublicationStatus
      @item={{this.item}}
    />`);
    assert.notOk(component.isFinalized);
    assert.strictEqual(component.text, 'Draft');
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });
});
