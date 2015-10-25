import { moduleFor, test } from 'ember-qunit';
import {a as testgroup} from 'ilios/tests/helpers/test-groups';

moduleFor('controller:program-year/publication-check', 'Unit | Controller | ProgramYearPublicationCheck' + testgroup, {
  // Specify the other units that are required for this test.
  needs: ['controller:program', 'controller:programYear']
});

// Replace this with your real tests.
test('it exists', function(assert) {
  var controller = this.subject();
  assert.ok(controller);
});
