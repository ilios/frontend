import { moduleForModel, test } from 'ember-qunit';
import Ember from 'ember';

moduleForModel('curriculum-inventory-export', 'Unit | Serializer | curriculum inventory export', {
  // Specify the other units that are required for this test.
  needs: [
    'model:authentication',
    'model:curriculum-inventory-export',
    'model:curriculum-inventory-report',
    'model:user',
    'model:user-made-reminder',
    'model:report',
    'model:school',
    'model:course',
    'model:learner-group',
    'model:instructor-group',
    'model:ilm-session',
    'model:offering',
    'model:program-year',
    'model:user-role',
    'model:cohort',
    'model:pending-user-update',
    'model:permission',
    'model:session',
    'model:program',
    'serializer:curriculum-inventory-export',
  ]
});

test('it serializes records', function(assert) {
  let record = this.subject();
  let serializedRecord = record.serialize();
  assert.ok(serializedRecord);
});

test('it removes all non postable fields', function(assert) {
  var record = this.subject();
  var store = this.store();
  Ember.run(()=> {
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
