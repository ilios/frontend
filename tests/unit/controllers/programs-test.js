import {
  moduleFor,
  test
} from 'ember-qunit';

moduleFor('controller:programs', 'Unit | Controller | Programs ', {
  needs: ['service:iliosMetrics'],
});

// Replace this with your real tests.
test('it exists', function(assert) {
  var controller = this.subject();
  assert.ok(controller);
});
