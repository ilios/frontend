import { moduleFor, test } from 'ember-qunit';

moduleFor('controller:curriculum-inventory-reports', 'Unit | Controller | curriculum-inventory-reports', {
  needs: [
    'service:currentUser',
    'service:i18n',
    'service:iliosMetrics',
    'service:headData',
  ],
});

// Replace this with your real tests.
test('it exists', function(assert) {
  let controller = this.subject();
  assert.ok(controller);
});
