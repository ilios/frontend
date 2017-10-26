import Ember from 'ember';
import { moduleForModel, test } from 'ember-qunit';
import modelList from '../../helpers/model-list';

const { run } = Ember;

moduleForModel('term', 'Unit | Model | term', {
  // Specify the other units that are required for this test.
  needs: modelList
});


test('isTopLevel', function(assert) {
  assert.expect(2);
  const model = this.subject();
  const store = model.store;
  run(()=>{
    assert.ok(model.get('isTopLevel'));
    store.createRecord('term', { id: 1, children: [ model ] });
    assert.notOk(model.get('isTopLevel'));
  });
});

test('hasChildren', function(assert) {
  assert.expect(2);
  const model = this.subject();
  const store = model.store;
  run(()=>{
    assert.notOk(model.get('hasChildren'));
    const child = store.createRecord('term', { id: 1 });
    model.get('children').pushObject(child);
    assert.ok(model.get('hasChildren'));
  });
});
