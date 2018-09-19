import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Component | expand collapse button ', function(hooks) {
  setupTest(hooks);

  test('has default false value', function(assert) {
    assert.expect(1);

    run(this, () => {
      const component = this.owner.factoryFor('component:expand-collapse-button').create();

      assert.equal(component.get('value'), false, 'value is false by default');
    });
  });
});
