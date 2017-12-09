import { moduleForModel, test } from 'ember-qunit';
import Ember from 'ember';
import modelList from '../../helpers/model-list';
import { initialize } from '../../../initializers/replace-promise';
import moment from 'moment';

const { run } = Ember;

initialize();
moduleForModel('session', 'Unit | Model | Session', {
  needs: modelList
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

  await run( async ()=>{
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

  await run( async () => {
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

  await run( async () => {
    let groups = await session.get('associatedIlmLearnerGroups');
    assert.equal(groups.length, 0);
  });
});

test('check associatedIlmLearnerGroups', async function(assert) {
  assert.expect(4);
  let session = this.subject();
  let store = this.store();

  await run( async () => {
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

  await run( async () => {
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


test('associatedVocabularies', async function(assert) {
  assert.expect(3);
  const subject = this.subject();
  const store = this.store();
  await run( async () => {
    const vocab1 = store.createRecord('vocabulary', { title: 'Zeppelin' });
    const vocab2 = store.createRecord('vocabulary', { title: 'Aardvark' });
    const term1 = store.createRecord('term', { vocabulary: vocab1 });
    const term2 = store.createRecord('term', { vocabulary: vocab1 });
    const term3 = store.createRecord('term', { vocabulary: vocab2 });
    subject.get('terms').pushObjects([term1, term2, term3 ]);
    const vocabularies = await subject.get('associatedVocabularies');
    assert.equal(vocabularies.length, 2);
    assert.equal(vocabularies[0], vocab2);
    assert.equal(vocabularies[1], vocab1);
  });
});

test('termsWithAllParents', async function(assert) {
  assert.expect(7);
  const subject = this.subject();
  const store = this.store();
  await run( async () => {
    const term1 = store.createRecord('term');
    const term2 = store.createRecord('term', { parent: term1 });
    const term3 = store.createRecord('term', { parent: term1 });
    const term4 = store.createRecord('term', { parent: term2 });
    const term5 = store.createRecord('term', { parent: term3 });
    const term6 = store.createRecord('term');
    subject.get('terms').pushObjects([term4, term5, term6 ]);
    const terms = await subject.get('termsWithAllParents');
    assert.equal(terms.length, 6);
    assert.ok(terms.includes(term1));
    assert.ok(terms.includes(term2));
    assert.ok(terms.includes(term3));
    assert.ok(terms.includes(term4));
    assert.ok(terms.includes(term5));
    assert.ok(terms.includes(term6));
  });
});

test('termCount', function(assert) {
  assert.expect(2);
  const subject = this.subject();
  const store = this.store();
  run(() => {
    assert.equal(subject.get('termCount'), 0);
    const term1 = store.createRecord('term');
    const term2 = store.createRecord('term');
    subject.get('terms').pushObjects([ term1, term2 ]);
    assert.equal(subject.get('termCount'), 2);
  });
});

test('sortedObjectives', async function(assert){
  assert.expect(5);
  const subject = this.subject();
  const store = this.store();
  await run( async () => {
    const objective1 = store.createRecord('objective', { id: 1, position: 10});
    const objective2 = store.createRecord('objective', { id: 2, position: 5 });
    const objective3 = store.createRecord('objective', { id: 3, position: 5 });
    const objective4 = store.createRecord('objective', { id: 4, position: 0 });
    subject.get('objectives').pushObjects([ objective1, objective2, objective3, objective4 ]);
    const sortedObjectives = await subject.get('sortedObjectives');
    assert.equal(sortedObjectives.length, 4);
    assert.equal(sortedObjectives[0], objective4);
    assert.equal(sortedObjectives[1], objective3);
    assert.equal(sortedObjectives[2], objective2);
    assert.equal(sortedObjectives[3], objective1);
  });
});

test('totalSumOfferingsDuration', async function(assert){
  assert.expect(2);
  const subject = this.subject();
  const store = this.store();
  await run( async () => {
    const total = await subject.get('totalSumOfferingsDuration');
    assert.equal(total, 0);
  });

  await run( async () => {
    const offering1 = store.createRecord('offering', {startDate: moment('2017-01-01') , endDate: moment('2017-01-02') });
    const offering2 = store.createRecord('offering', {startDate: moment('2017-01-01 09:30:00'), endDate: moment('2017-01-01 10:00:00') });
    subject.get('offerings').pushObjects([ offering1, offering2 ]);
    const total = await subject.get('totalSumOfferingsDuration');
    assert.equal(total, 24.50);
  });
});
