import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | course/manage-objective-parents-item', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    this.set('isSelected', true);
    this.set('allowMultipleParents', true);
    this.set('title', '<p>Country &amp; Western</p>');
    await render(hbs`<Course::ManageObjectiveParentsItem
      @title={{this.title}}
      @isSelected={{this.isSelected}}
      @allowMultipleParents={{this.allowMultipleParents}}
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

    this.set('allowMultipleParents', false);
    assert.dom('input[type="radio"]').exists();
    assert.dom('input').isNotChecked();
    assert.dom('label').doesNotHaveClass('selected');
    assert.dom('label').hasText('Country & Western');

    this.set('isSelected', true);
    assert.dom('input[type="radio"]').exists();
    assert.dom('input').isChecked();
    assert.dom('label').hasClass('selected');
    assert.dom('label').hasText('Country & Western');
  });
});
