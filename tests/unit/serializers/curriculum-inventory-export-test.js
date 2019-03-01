import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Serializer | curriculum inventory export', function(hooks) {
  setupTest(hooks);

  test('it serializes records', function(assert) {
    let record = run(() => this.owner.lookup('service:store').createRecord('curriculum-inventory-export'));
    let serializedRecord = record.serialize();
    assert.ok(serializedRecord);
  });

  test('it removes all non postable fields', function(assert) {
    var record = run(() => this.owner.lookup('service:store').createRecord('curriculum-inventory-export'));
    var store = this.owner.lookup('service:store');
    run(()=> {
      var now = new Date();
      var doc = 'lorem ipsum';
      var user = store.createRecord('user', {});
      record.set('createdAt', now);
      record.set('document', doc);
      record.set('createdBy', user);
      assert.equal(record.get('createdAt'), now);
      assert.equal(record.get('document'), doc);
      record.get('createdBy').then(creator => {
        assert.equal(user, creator);
      });
      var serializedRecord = record.serialize();
      assert.ok(!('createdAt' in serializedRecord));
      assert.ok(!('createdBy' in serializedRecord));
      assert.ok(!('document' in serializedRecord));
    });
  });
});
