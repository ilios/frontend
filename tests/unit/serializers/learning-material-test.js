import { moduleForModel, test } from 'ember-qunit';

moduleForModel('learning-material', 'Unit | Serializer | learning material', {
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

test('no filehash usually', function(assert) {
  var record = this.subject();

  var serializedRecord = record.serialize();
  
  assert.ok(!("fileHash" in serializedRecord));
});

test('filehash when it is added', function(assert) {
  var record = this.subject();
  record.set('fileHash', 'BigPhatBass');
  var serializedRecord = record.serialize();
  
  assert.ok(("fileHash" in serializedRecord));
  assert.equal(serializedRecord.fileHash, 'BigPhatBass');
});
