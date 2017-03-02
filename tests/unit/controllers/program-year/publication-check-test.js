import { moduleFor, test } from 'ember-qunit';

moduleFor('controller:program-year/publication-check', 'Unit | Controller | ProgramYearPublicationCheck', {
  // Specify the other units that are required for this test.
  needs: ['controller:program', 'service:iliosMetrics', 'service:headData']
});

// Replace this with your real tests.
test('it exists', function(assert) {
  var controller = this.subject();
  assert.ok(controller);
});
