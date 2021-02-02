import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Serializer | learning material', function (hooks) {
  setupTest(hooks);

  test('it removes all non postable fields', function (assert) {
    var record = this.owner.lookup('service:store').createRecord('learning-material');

    var serializedRecord = record.serialize();

    assert.ok(!('uploadDate' in serializedRecord.data.attributes));
    assert.ok(!('absoluteFileUri' in serializedRecord.data.attributes));
  });

  test('no filehash usually', function (assert) {
    var record = this.owner.lookup('service:store').createRecord('learning-material');

    var serializedRecord = record.serialize();

    assert.ok(!('fileHash' in serializedRecord.data.attributes));
  });

  test('filehash when it is added', function (assert) {
    var record = this.owner.lookup('service:store').createRecord('learning-material');
    record.set('fileHash', 'BigPhatBass');
    var serializedRecord = record.serialize();

    assert.ok('fileHash' in serializedRecord.data.attributes);
    assert.equal(serializedRecord.data.attributes.fileHash, 'BigPhatBass');
  });
});
