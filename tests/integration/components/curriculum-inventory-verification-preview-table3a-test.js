import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | curriculum-inventory-verification-preview-table3a', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`<CurriculumInventoryVerificationPreviewTable3a />`);

    assert.equal(this.element.textContent.trim(), '');

    // Template block usage:
    await render(hbs`
      <CurriculumInventoryVerificationPreviewTable3a>
        template block text
      </CurriculumInventoryVerificationPreviewTable3a>
    `);

    assert.equal(this.element.textContent.trim(), 'template block text');
  });
});
