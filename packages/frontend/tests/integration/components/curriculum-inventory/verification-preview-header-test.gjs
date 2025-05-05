import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import { component } from 'frontend/tests/pages/components/curriculum-inventory/verification-preview-header';
import VerificationPreviewHeader from 'frontend/components/curriculum-inventory/verification-preview-header';

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
        .findRecord('curriculum-inventory-report', 1);
      this.set('report', report);
      await render(<template><VerificationPreviewHeader @report={{this.report}} /></template>);
      assert.strictEqual(component.title, 'Verification Preview for Foo Bar 2019');
    });
  },
);
