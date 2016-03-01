import { moduleForModel, test } from 'ember-qunit';
import {a as testgroup} from 'ilios/tests/helpers/test-groups';

moduleForModel('course', 'Unit | Serializer | Course ' + testgroup, {
  // Specify the other units that are required for this test.
  needs: [
    'serializer:course',
    'model:school',
    'model:user',
    'model:course',
    'model:course-clerkship-type',
    'model:session',
    'model:offering',
    'model:term',
    'model:objective',
    'model:cohort',
    'model:mesh-descriptor',
    'model:course-learning-material'
  ]
});

test('it serializes records', function(assert) {
  var record = this.subject();

  var serializedRecord = record.serialize();

  assert.ok(serializedRecord);
});
