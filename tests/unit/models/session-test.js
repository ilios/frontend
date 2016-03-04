import {
  moduleForModel,
  test
} from 'ember-qunit';
import {a as testgroup} from 'ilios/tests/helpers/test-groups';
import Ember from 'ember';
import modelList from '../../helpers/model-list';

moduleForModel('session', 'Unit | Model | Session' + testgroup, {
  needs: modelList
});

test('it exists', function(assert) {
  var model = this.subject();
  // var store = this.store();
  assert.ok(!!model);
});

test('check required publication items', function(assert) {
  var model = this.subject();
  var store = this.store();
  assert.equal(model.get('requiredPublicationIssues').length, 2);
  model.set('title', 'nothing');
  assert.equal(model.get('requiredPublicationIssues').length, 1);
  model.get('offerings').addObject(store.createRecord('offering'));
  assert.equal(model.get('requiredPublicationIssues').length, 0);
});

test('check required ILM publication items', function(assert) {
  var model = this.subject();
  var store = this.store();
  Ember.run(function(){
    model.set('title', 'nothing');
    assert.equal(model.get('requiredPublicationIssues').length, 1);
    let ilmSession = store.createRecord('ilmSession');
    model.set('ilmSession', ilmSession);
    assert.equal(model.get('requiredPublicationIssues').length, 1);
  });
});

test('check optional publication items', function(assert) {
  var model = this.subject();
  var store = this.store();
  assert.equal(model.get('optionalPublicationIssues').length, 3);
  model.get('terms').addObject(store.createRecord('term'));
  assert.equal(model.get('optionalPublicationIssues').length, 2);
  model.get('objectives').addObject(store.createRecord('objective'));
  assert.equal(model.get('optionalPublicationIssues').length, 1);
  model.get('meshDescriptors').addObject(store.createRecord('meshDescriptor'));
  assert.equal(model.get('optionalPublicationIssues').length, 0);
});
