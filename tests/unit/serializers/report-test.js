import { moduleForModel, test } from 'ember-qunit';
import {a as testgroup} from 'ilios/tests/helpers/test-groups';

moduleForModel('offering', 'Unit | Serializer | report' + testgroup, {
  // Specify the other units that are required for this test.
  needs: [
    'serializer:report',
    'model:session',
    'model:learner-group',
    'model:instructor-group',
    'model:user',
  ]
});

test('it removes all non postable fields', function(assert) {
  var record = this.subject();

  var serializedRecord = record.serialize();
  
  assert.ok(!("createdAt" in serializedRecord));
});
