import {
  moduleForModel,
  test
} from 'ember-qunit';
import modelList from '../../helpers/model-list';

moduleForModel('course', 'Course', {
  needs: modelList
});

test('it exists', function(assert) {
  var model = this.subject();
  assert.ok(!!model);
});

test('check required publication items', function(assert) {
  var model = this.subject();
  var store = this.store();
  assert.equal(model.get('requiredPublicationIssues').length, 3);
  var cohort = store.createRecord('cohort');
  model.get('cohorts').addObject(cohort);
  assert.equal(model.get('requiredPublicationIssues').length, 2);
  model.set('startDate', 'nothing');
  assert.equal(model.get('requiredPublicationIssues').length, 1);
  model.set('endDate', 'nothing');
  assert.equal(model.get('requiredPublicationIssues').length, 0);
});

test('check optional publication items', function(assert) {
  var model = this.subject();
  var store = this.store();
  assert.equal(model.get('optionalPublicationIssues').length, 3);
  model.get('topics').addObject(store.createRecord('topic'));
  assert.equal(model.get('optionalPublicationIssues').length, 2);
  model.get('objectives').addObject(store.createRecord('objective'));
  assert.equal(model.get('optionalPublicationIssues').length, 1);
  model.get('meshDescriptors').addObject(store.createRecord('meshDescriptor'));
  assert.equal(model.get('optionalPublicationIssues').length, 0);
});
