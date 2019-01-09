import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | learnergroup tree', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    let learnerGroup = EmberObject.create({
      children: []
    });
    this.set('learnerGroup', learnerGroup);
    this.set('nothing', parseInt);

    await render(hbs`{{learnergroup-tree learnerGroup=learnerGroup add=(action nothing)}}`);

    assert.dom(this.element).hasText('');
  });
});
