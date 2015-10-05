import {
  moduleForModel,
  test
} from 'ember-qunit';
import Ember from 'ember';

moduleForModel('session', 'Session', {
  needs: [
    'model:aamc-method',
    'model:aamc-pcrs',
    'model:alert-change-type',
    'model:alert',
    'model:cohort',
    'model:competency',
    'model:course-learning-material',
    'model:course',
    'model:course-clerkship-type',
    'model:curriculum-inventory-academic-level',
    'model:curriculum-inventory-export',
    'model:curriculum-inventory-institution',
    'model:curriculum-inventory-report',
    'model:curriculum-inventory-sequence-block',
    'model:curriculum-inventory-sequence',
    'model:department',
    'model:topic',
    'model:academic-year',
    'model:ilm-session',
    'model:instructor-group',
    'model:learner-group',
    'model:learning-material-status',
    'model:learning-material-user-role',
    'model:learning-material',
    'model:mesh-concept',
    'model:mesh-descriptor',
    'model:mesh-qualifier',
    'model:objective',
    'model:offering',
    'model:program-year',
    'model:program-year-steward',
    'model:program',
    'model:publish-event',
    'model:report',
    'model:school',
    'model:session-description',
    'model:session-learning-material',
    'model:session-type',
    'model:session',
    'model:user-role',
    'model:user',
  ]
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
  model.get('topics').addObject(store.createRecord('topic'));
  assert.equal(model.get('optionalPublicationIssues').length, 2);
  model.get('objectives').addObject(store.createRecord('objective'));
  assert.equal(model.get('optionalPublicationIssues').length, 1);
  model.get('meshDescriptors').addObject(store.createRecord('meshDescriptor'));
  assert.equal(model.get('optionalPublicationIssues').length, 0);
});
