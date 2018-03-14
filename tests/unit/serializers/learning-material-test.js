import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

import { run } from '@ember/runloop';

module('Unit | Serializer | learning material', function(hooks) {
  setupTest(hooks);

  test('it removes all non postable fields', function(assert) {
    var record = run(() => this.owner.lookup('service:store').createRecord('learning-material'));

    var serializedRecord = record.serialize();
    
    assert.ok(!("uploadDate" in serializedRecord));
    assert.ok(!("absoluteFileUri" in serializedRecord));
  });

  test('no filehash usually', function(assert) {
    var record = run(() => this.owner.lookup('service:store').createRecord('learning-material'));

    var serializedRecord = record.serialize();
    
    assert.ok(!("fileHash" in serializedRecord));
  });

  test('filehash when it is added', function(assert) {
    var record = run(() => this.owner.lookup('service:store').createRecord('learning-material'));
    record.set('fileHash', 'BigPhatBass');
    var serializedRecord = record.serialize();
    
    assert.ok(("fileHash" in serializedRecord));
    assert.equal(serializedRecord.fileHash, 'BigPhatBass');
  });
});
