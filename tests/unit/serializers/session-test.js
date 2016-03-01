import { moduleForModel, test } from 'ember-qunit';
import {a as testgroup} from 'ilios/tests/helpers/test-groups';

moduleForModel('session', 'Unit | Serializer | Session ' + testgroup, {
  // Specify the other units that are required for this test.
  needs: [
    'serializer:session',
    'model:session-type',
    'model:course',
    'model:ilm-session',
    'model:term',
    'model:objective',
    'model:mesh-descriptor',
    'model:session-description',
    'model:session-learning-material',
    'model:offering',
  ]
});

test('it removes all non postable fields', function(assert) {
  var record = this.subject();

  var serializedRecord = record.serialize();

  assert.ok(!("updatedAt" in serializedRecord));
});
