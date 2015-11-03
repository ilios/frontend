import { moduleFor, test } from 'ember-qunit';
import {a as testgroup} from 'ilios/tests/helpers/test-groups';

moduleFor('route:admin-dashboard', 'Unit | Route | admin dashboard ' + testgroup, {
  // Specify the other units that are required for this test.
  // needs: ['controller:foo']
});

test('it exists', function(assert) {
  var route = this.subject();
  assert.ok(route);
});
