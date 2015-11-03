import { moduleForModel, test } from 'ember-qunit';
import {a as testgroup} from 'ilios/tests/helpers/test-groups';

moduleForModel('learning-material', 'Unit | Serializer | learning material' + testgroup, {
  // Specify the other units that are required for this test.
  needs: [
    'serializer:learning-material',
    'model:learning-material-user-role',
    'model:learning-material-status',
    'model:user',
    'model:session-learning-material',
    'model:course-learning-material',
  ]
});

test('it removes all non postable fields', function(assert) {
  var record = this.subject();

  var serializedRecord = record.serialize();
  
  assert.ok(!("uploadDate" in serializedRecord));
  assert.ok(!("absoluteFileUri" in serializedRecord));
});
