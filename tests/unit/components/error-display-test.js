import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Component | error display ', function(hooks) {
  setupTest(hooks);

  test('properties have default values', function(assert) {
    assert.expect(1);

    const expected = {
      errors:     null,
      showDetails: true
    };

    const component = this.owner.factoryFor('component:error-display').create();

    const actual = {
      errors:     component.get('errors'),
      showDetails: component.get('showDetails'),
    };

    assert.deepEqual(actual, expected, 'default values are correct');
  });

  test('`toggleDetails` action changes `showDetails` property', function(assert) {
    assert.expect(1);

    const component = this.owner.factoryFor('component:error-display').create();

    component.send('toggleDetails');

    assert.equal(component.get('showDetails'), false);
  });
});
