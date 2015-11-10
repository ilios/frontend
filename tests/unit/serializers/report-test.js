import { moduleForModel, test } from 'ember-qunit';
import {a as testgroup} from 'ilios/tests/helpers/test-groups';

moduleForModel('offering', 'Unit | Serializer | report' + testgroup, {
  // Specify the other units that are required for this test.
  needs: [
    'serializer:report'
  ]
});

test('it removes all non postable fields', function(assert) {
  var record = this.subject();

  var serializedRecord = record.serialize();
  
  assert.ok(!("createdAt" in serializedRecord));
});
