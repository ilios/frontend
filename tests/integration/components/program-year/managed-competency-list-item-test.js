import { module, test } from 'qunit';
import { setupRenderingTest } from 'ilios/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | program-year/managed-competency-list-item', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`<ProgramYear::ManagedCompetencyListItem />`);

    assert.dom(this.element).hasText('');

    // Template block usage:
    await render(hbs`
      <ProgramYear::ManagedCompetencyListItem>
        template block text
      </ProgramYear::ManagedCompetencyListItem>
    `);

    assert.dom(this.element).hasText('template block text');
  });
});
