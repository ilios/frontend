import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | curriculum-inventory-verification-preview-table3b', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`<CurriculumInventoryVerificationPreviewTable3b />`);

    assert.equal(this.element.textContent.trim(), '');

    // Template block usage:
    await render(hbs`
      <CurriculumInventoryVerificationPreviewTable3b>
        template block text
      </CurriculumInventoryVerificationPreviewTable3b>
    `);

    assert.equal(this.element.textContent.trim(), 'template block text');
  });
});
