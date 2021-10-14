import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | session/manage-objective-parents-item', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    this.set('isSelected', true);
    this.set('title', '<p>Country &amp; Western</p>');
    await render(hbs`<Session::ManageObjectiveParentsItem
      @title={{this.title}}
      @isSelected={{this.isSelected}}
      @add={{(noop)}}
      @remove={{(noop)}}
    />`);

    assert.dom('input[type="checkbox"]').exists();
    assert.dom('input').isChecked();
    assert.dom('label').hasClass('selected');
    assert.dom('label').hasText('Country & Western');

    this.set('isSelected', false);
    assert.dom('input[type="checkbox"]').exists();
    assert.dom('input').isNotChecked();
    assert.dom('label').doesNotHaveClass('selected');
    assert.dom('label').hasText('Country & Western');
  });
});
