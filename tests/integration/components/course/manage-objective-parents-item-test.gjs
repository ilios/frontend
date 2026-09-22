import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import ManageObjectiveParentsItem from 'ilios-common/components/course/manage-objective-parents-item';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | course/manage-objective-parents-item', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    this.set('isSelected', true);
    this.set('allowMultipleParents', true);
    this.set('title', '<p>Country &amp; Western</p>');
    await render(
      <template>
        <ManageObjectiveParentsItem
          @title={{this.title}}
          @isSelected={{this.isSelected}}
          @allowMultipleParents={{this.allowMultipleParents}}
          @add={{(noop)}}
          @remove={{(noop)}}
        />
      </template>,
    );

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
