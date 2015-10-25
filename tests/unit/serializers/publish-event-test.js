import { moduleForModel, test } from 'ember-qunit';
import {a as testgroup} from 'ilios/tests/helpers/test-groups';

moduleForModel('publish-event' + testgroup, 'Unit | Serializer | publish event', {
  needs: [
    'serializer:publish-event',
    'model:course',
    'model:program',
    'model:programYear',
    'model:session',
    'model:user',
  ]
});

test('it removes all non postable fields', function(assert) {
  var record = this.subject();

  var serializedRecord = record.serialize();
  
  assert.ok(!("machineIp" in serializedRecord));
  assert.ok(!("timeStamp" in serializedRecord));
  assert.ok(!("tableName" in serializedRecord));
  assert.ok(!("tableRowId" in serializedRecord));
  assert.ok(!("administrator" in serializedRecord));
});
