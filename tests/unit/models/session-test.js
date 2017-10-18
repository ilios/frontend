import {
  moduleForModel,
  test
} from 'ember-qunit';
import Ember from 'ember';
import modelList from '../../helpers/model-list';

const { run } = Ember;

moduleForModel('session', 'Unit | Model | Session', {
  needs: modelList
});

test('it exists', function(assert) {
  let model = this.subject();
  // let store = this.store();
  assert.ok(!!model);
});

test('check required publication items', function(assert) {
  let model = this.subject();
  let store = this.store();
  assert.equal(model.get('requiredPublicationIssues').length, 2);
  model.set('title', 'nothing');
  assert.equal(model.get('requiredPublicationIssues').length, 1);
  model.get('offerings').addObject(store.createRecord('offering'));
  assert.equal(model.get('requiredPublicationIssues').length, 0);
});

test('check required ILM publication items', function(assert) {
  let model = this.subject();
  let store = this.store();
  run(function(){
    model.set('title', 'nothing');
    assert.equal(model.get('requiredPublicationIssues').length, 1);
    let ilmSession = store.createRecord('ilmSession');
    model.set('ilmSession', ilmSession);
    assert.equal(model.get('requiredPublicationIssues').length, 1);
  });
});

test('check optional publication items', function(assert) {
  let model = this.subject();
  let store = this.store();
  assert.equal(model.get('optionalPublicationIssues').length, 3);
  model.get('terms').addObject(store.createRecord('term'));
  assert.equal(model.get('optionalPublicationIssues').length, 2);
  model.get('objectives').addObject(store.createRecord('objective'));
  assert.equal(model.get('optionalPublicationIssues').length, 1);
  model.get('meshDescriptors').addObject(store.createRecord('meshDescriptor'));
  assert.equal(model.get('optionalPublicationIssues').length, 0);
});

test('check empty associatedOfferingLearnerGroups', async function(assert) {
  assert.expect(1);
  let session = this.subject();
  let groups = await session.get('associatedOfferingLearnerGroups');
  assert.equal(groups.length, 0);

});

test('check first level associatedOfferingLearnerGroups', async function(assert) {
  assert.expect(4);
  let session = this.subject();
  let store = this.store();

  run( async ()=>{
    let learnerGroup1 = store.createRecord('learner-group');
    let learnerGroup2 = store.createRecord('learner-group');
    let learnerGroup3 = store.createRecord('learner-group');
    let offering1 = store.createRecord('offering', {learnerGroups: [learnerGroup1, learnerGroup2]});
    let offering2 = store.createRecord('offering', {learnerGroups: [learnerGroup3]});

    session.get('offerings').pushObjects([offering1, offering2]);

    let groups = await session.get('associatedOfferingLearnerGroups');
    assert.equal(groups.length, 3);
    assert.ok(groups.includes(learnerGroup1));
    assert.ok(groups.includes(learnerGroup2));
    assert.ok(groups.includes(learnerGroup3));
  });


});

test('check multi level associatedOfferingLearnerGroups', async function(assert) {
  assert.expect(6);
  let session = this.subject();
  let store = this.store();

  run( async () => {
    let learnerGroup1 = store.createRecord('learner-group');
    let learnerGroup2 = store.createRecord('learner-group');
    let learnerGroup3 = store.createRecord('learner-group');
    let learnerGroup4 = store.createRecord('learner-group');
    let learnerGroup5 = store.createRecord('learner-group');
    let offering1 = store.createRecord('offering', {learnerGroups: [learnerGroup1, learnerGroup2, learnerGroup5]});
    let offering2 = store.createRecord('offering', {learnerGroups: [learnerGroup3]});
    let offering3 = store.createRecord('offering', {learnerGroups: [learnerGroup4]});
    session.get('offerings').pushObjects([offering1, offering2, offering3]);

    let groups = await session.get('associatedOfferingLearnerGroups');
    assert.equal(groups.length, 5);
    assert.ok(groups.includes(learnerGroup1));
    assert.ok(groups.includes(learnerGroup2));
    assert.ok(groups.includes(learnerGroup3));
    assert.ok(groups.includes(learnerGroup4));
    assert.ok(groups.includes(learnerGroup5));
  });

});

test('check empty associatedIlmLearnerGroups', async function(assert) {
  assert.expect(1);
  let session = this.subject();

  run( async () => {
    let groups = await session.get('associatedIlmLearnerGroups');
    assert.equal(groups.length, 0);
  });
});

test('check associatedIlmLearnerGroups', async function(assert) {
  assert.expect(4);
  let session = this.subject();
  let store = this.store();

  run( async () => {
    let learnerGroup1 = store.createRecord('learner-group');
    let learnerGroup2 = store.createRecord('learner-group');
    let learnerGroup3 = store.createRecord('learner-group');
    let ilm = store.createRecord('ilm-session', { learnerGroups: [ learnerGroup1, learnerGroup2, learnerGroup3 ] });

    session.set('ilmSession', ilm);

    let groups = await session.get('associatedIlmLearnerGroups');
    assert.equal(groups.length, 3);
    assert.ok(groups.includes(learnerGroup1));
    assert.ok(groups.includes(learnerGroup2));
    assert.ok(groups.includes(learnerGroup3));
  });
});

test('check empty associatedLearnerGroups', async function(assert) {
  assert.expect(1);
  let session = this.subject();
  const groups = await session.get('associatedLearnerGroups');
  assert.equal(groups.length, 0);
});

test('check associatedLearnerGroups', async function(assert) {
  assert.expect(6);
  let session = this.subject();
  let store = this.store();

  run( async () => {
    let learnerGroup1 = store.createRecord('learner-group');
    let learnerGroup2 = store.createRecord('learner-group');
    let learnerGroup3 = store.createRecord('learner-group');
    let learnerGroup4 = store.createRecord('learner-group');
    let learnerGroup5 = store.createRecord('learner-group');

    let ilm = store.createRecord('ilm-session', { learnerGroups: [ learnerGroup1, learnerGroup2, learnerGroup3, learnerGroup4 ] });
    let offering1 = store.createRecord('offering', {learnerGroups: [learnerGroup1, learnerGroup2, learnerGroup5]});
    let offering2 = store.createRecord('offering', {learnerGroups: [learnerGroup3]});

    session.set('ilmSession', ilm);
    session.get('offerings').pushObjects([offering1, offering2]);

    const groups = await session.get('associatedLearnerGroups');
    assert.equal(groups.length, 5);
    assert.ok(groups.includes(learnerGroup1));
    assert.ok(groups.includes(learnerGroup2));
    assert.ok(groups.includes(learnerGroup3));
    assert.ok(groups.includes(learnerGroup4));
    assert.ok(groups.includes(learnerGroup5));
  });
});

test('check learner groups count', function(assert) {
  assert.expect(2);
  let session = this.subject();
  let store = this.store();

  run(() => {
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

test('isIndependentLearning', function(assert) {
  assert.expect(2);
  const model = this.subject();
  const store = model.store;
  run(() => {
    assert.notOk(model.get('isIndependentLearning'));
    const ilmSession = store.createRecord('ilmSession', { id: 1 });
    model.set('ilmSession', ilmSession);
    assert.ok(model.get('isIndependentLearning'));
  });
});
