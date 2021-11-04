import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { component } from 'ilios/tests/pages/components/curriculum-inventory/verification-preview-header';

module(
  'Integration | Component | curriculum-inventory/verification-preview-header',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);

    test('it renders', async function (assert) {
      assert.expect(1);
      this.server.create('curriculum-inventory-report', {
        name: 'Foo Bar 2019',
      });
      const report = await this.owner
        .lookup('service:store')
        .find('curriculum-inventory-report', 1);
      this.set('report', report);
      await render(hbs`<CurriculumInventory::VerificationPreviewHeader @report={{this.report}} />`);
      assert.strictEqual(component.title, 'Verification Preview for Foo Bar 2019');
    });
  }
);
