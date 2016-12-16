import {
  moduleForModel,
  test
} from 'ember-qunit';
import Ember from 'ember';
import modelList from '../../helpers/model-list';

moduleForModel('session', 'Unit | Model | Session', {
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

test('check associatedOfferingLearnerGroups', function(assert) {
  assert.expect(11);
  let session = this.subject();
  let store = this.store();

  return session.get('associatedOfferingLearnerGroups').then(groups => {
    assert.equal(groups.length, 0);

    let learnerGroup1 = store.createRecord('learner-group');
    let learnerGroup2 = store.createRecord('learner-group');
    let learnerGroup3 = store.createRecord('learner-group');
    let offering1 = store.createRecord('offering', {learnerGroups: [learnerGroup1, learnerGroup2]});
    let offering2 = store.createRecord('offering', {learnerGroups: [learnerGroup3]});

    session.get('offerings').pushObjects([offering1, offering2]);

    return session.get('associatedOfferingLearnerGroups').then(groups => {
      assert.equal(groups.length, 3);
      assert.ok(groups.includes(learnerGroup1));
      assert.ok(groups.includes(learnerGroup2));
      assert.ok(groups.includes(learnerGroup3));

      let learnerGroup4 = store.createRecord('learner-group');
      let offering3 = store.createRecord('offering', {learnerGroups: [learnerGroup4]});
      session.get('offerings').pushObject(offering3);
      let learnerGroup5 = store.createRecord('learner-group');
      offering1.get('learnerGroups').pushObject(learnerGroup5);

      return session.get('associatedOfferingLearnerGroups').then(groups => {
        assert.equal(groups.length, 5);
        assert.ok(groups.includes(learnerGroup1));
        assert.ok(groups.includes(learnerGroup2));
        assert.ok(groups.includes(learnerGroup3));
        assert.ok(groups.includes(learnerGroup4));
        assert.ok(groups.includes(learnerGroup5));
      });

    });
  });
});

test('check associatedIlmLearnerGroups', function(assert) {
  assert.expect(10);
  let session = this.subject();
  let store = this.store();

  return session.get('associatedIlmLearnerGroups').then(groups => {
    assert.equal(groups.length, 0);

    let learnerGroup1 = store.createRecord('learner-group');
    let learnerGroup2 = store.createRecord('learner-group');
    let learnerGroup3 = store.createRecord('learner-group');
    let ilm = store.createRecord('ilm-session', { learnerGroups: [ learnerGroup1, learnerGroup2, learnerGroup3 ] });

    session.set('ilmSession', ilm);

    return session.get('associatedIlmLearnerGroups').then(groups => {
      assert.equal(groups.length, 3);
      assert.ok(groups.includes(learnerGroup1));
      assert.ok(groups.includes(learnerGroup2));
      assert.ok(groups.includes(learnerGroup3));

      let learnerGroup4 = store.createRecord('learner-group');
      session.get('ilmSession').get('learnerGroups').pushObject(learnerGroup4);

      return session.get('associatedIlmLearnerGroups').then(groups => {
        assert.equal(groups.length, 4);
        assert.ok(groups.includes(learnerGroup1));
        assert.ok(groups.includes(learnerGroup2));
        assert.ok(groups.includes(learnerGroup3));
        assert.ok(groups.includes(learnerGroup4));
      });
    });
  });
});

test('check associatedLearnerGroups', function(assert) {
  assert.expect(11);
  let session = this.subject();
  let store = this.store();

  return session.get('associatedLearnerGroups').then(groups => {
    assert.equal(groups.length, 0);

    let learnerGroup1 = store.createRecord('learner-group');
    let learnerGroup2 = store.createRecord('learner-group');
    let learnerGroup3 = store.createRecord('learner-group');
    let ilm = store.createRecord('ilm-session', { learnerGroups: [ learnerGroup1, learnerGroup2, learnerGroup3 ] });
    let offering1 = store.createRecord('offering', {learnerGroups: [learnerGroup1, learnerGroup2]});
    let offering2 = store.createRecord('offering', {learnerGroups: [learnerGroup3]});

    session.set('ilmSession', ilm);
    session.get('offerings').pushObjects([offering1, offering2]);

    return session.get('associatedLearnerGroups').then(groups => {
      assert.equal(groups.length, 3);
      assert.ok(groups.includes(learnerGroup1));
      assert.ok(groups.includes(learnerGroup2));
      assert.ok(groups.includes(learnerGroup3));

      let learnerGroup4 = store.createRecord('learner-group');
      session.get('ilmSession').get('learnerGroups').pushObject(learnerGroup4);
      let learnerGroup5 = store.createRecord('learner-group');
      offering1.get('learnerGroups').pushObject(learnerGroup5);

      return session.get('associatedLearnerGroups').then(groups => {
        assert.equal(groups.length, 5);
        assert.ok(groups.includes(learnerGroup1));
        assert.ok(groups.includes(learnerGroup2));
        assert.ok(groups.includes(learnerGroup3));
        assert.ok(groups.includes(learnerGroup4));
        assert.ok(groups.includes(learnerGroup5));
      });
    });
  });
});

test('check learner groups count', function(assert) {
  assert.expect(2);
  let session = this.subject();
  let store = this.store();

  Ember.run(() => {
    let learnerGroup1 = store.createRecord('learner-group');
    let learnerGroup2 = store.createRecord('learner-group');
    let learnerGroup3 = store.createRecord('learner-group');
    let offering1 = store.createRecord('offering', {learnerGroups: [learnerGroup1, learnerGroup2]});
    let offering2 = store.createRecord('offering', {learnerGroups: [learnerGroup3]});

    session.get('offerings').pushObjects([offering1, offering2]);

    assert.equal(session.get('learnerGroupCount'), 3);

    let learnerGroup4 = store.createRecord('learner-group');
    let offering3 = store.createRecord('offering', {learnerGroups: [learnerGroup4]});
    session.get('offerings').pushObject(offering3);
    let learnerGroup5 = store.createRecord('learner-group');
    offering1.get('learnerGroups').pushObject(learnerGroup5);

    assert.equal(session.get('learnerGroupCount'), 5);
  });
});
