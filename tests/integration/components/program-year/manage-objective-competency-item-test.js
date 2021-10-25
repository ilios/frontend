import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | program-year/manage-objective-competency-item', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    const title = 'lorem ipsum';
    this.set('isSelected', true);
    this.set('title', title);
    await render(hbs`<ProgramYear::ManageObjectiveCompetencyItem
      @title={{this.title}}
      @isSelected={{this.isSelected}}
      @add={{(noop)}}
      @remove={{(noop)}}
    />`);

    assert.dom('input[type="radio"]').exists();
    assert.dom('input').isChecked();
    assert.dom('label').hasClass('selected');
    assert.dom('label').hasText(title);

    this.set('isSelected', false);
    assert.dom('input[type="radio"]').exists();
    assert.dom('input').isNotChecked();
    assert.dom('label').doesNotHaveClass('selected');
    assert.dom('label').hasText(title);
  });
});
