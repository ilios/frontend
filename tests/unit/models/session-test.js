import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import modelList from '../../helpers/model-list';
import { initialize } from '../../../initializers/replace-promise';
import moment from 'moment';

initialize();

module('Unit | Model | Session', function(hooks) {
  setupTest(hooks);

  test('check required publication items', function(assert) {
    let model = run(() => this.owner.lookup('service:store').createRecord('session'));
    let store = this.owner.lookup('service:store');
    assert.equal(model.get('requiredPublicationIssues').length, 2);
    model.set('title', 'nothing');
    assert.equal(model.get('requiredPublicationIssues').length, 1);
    model.get('offerings').addObject(store.createRecord('offering'));
    assert.equal(model.get('requiredPublicationIssues').length, 0);
  });

  test('check required ILM publication items', function(assert) {
    let model = run(() => this.owner.lookup('service:store').createRecord('session'));
    let store = this.owner.lookup('service:store');
    run(function(){
      model.set('title', 'nothing');
      assert.equal(model.get('requiredPublicationIssues').length, 1);
      let ilmSession = store.createRecord('ilmSession');
      model.set('ilmSession', ilmSession);
      assert.equal(model.get('requiredPublicationIssues').length, 1);
    });
  });

  test('check optional publication items', function(assert) {
    let model = run(() => this.owner.lookup('service:store').createRecord('session'));
    let store = this.owner.lookup('service:store');
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
    let session = run(() => this.owner.lookup('service:store').createRecord('session'));
    let groups = await session.get('associatedOfferingLearnerGroups');
    assert.equal(groups.length, 0);

  });

  test('check first level associatedOfferingLearnerGroups', async function(assert) {
    assert.expect(4);
    let session = run(() => this.owner.lookup('service:store').createRecord('session'));
    let store = this.owner.lookup('service:store');

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
    let session = run(() => this.owner.lookup('service:store').createRecord('session'));
    let store = this.owner.lookup('service:store');

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
    let session = run(() => this.owner.lookup('service:store').createRecord('session'));

    await run( async () => {
      let groups = await session.get('associatedIlmLearnerGroups');
      assert.equal(groups.length, 0);
    });
  });

  test('check associatedIlmLearnerGroups', async function(assert) {
    assert.expect(4);
    let session = run(() => this.owner.lookup('service:store').createRecord('session'));
    let store = this.owner.lookup('service:store');

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
    let session = run(() => this.owner.lookup('service:store').createRecord('session'));
    const groups = await session.get('associatedLearnerGroups');
    assert.equal(groups.length, 0);
  });

  test('check associatedLearnerGroups', async function(assert) {
    assert.expect(6);
    let session = run(() => this.owner.lookup('service:store').createRecord('session'));
    let store = this.owner.lookup('service:store');

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
    let session = run(() => this.owner.lookup('service:store').createRecord('session'));
    let store = this.owner.lookup('service:store');

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
    const model = run(() => this.owner.lookup('service:store').createRecord('session'));
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
    const subject = run(() => this.owner.lookup('service:store').createRecord('session'));
    const store = this.owner.lookup('service:store');
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
    const subject = run(() => this.owner.lookup('service:store').createRecord('session'));
    const store = this.owner.lookup('service:store');
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
    const subject = run(() => this.owner.lookup('service:store').createRecord('session'));
    const store = this.owner.lookup('service:store');
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
    const subject = run(() => this.owner.lookup('service:store').createRecord('session'));
    const store = this.owner.lookup('service:store');
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
    const subject = run(() => this.owner.lookup('service:store').createRecord('session'));
    const store = this.owner.lookup('service:store');
    await run( async () => {
      const total = await subject.get('totalSumOfferingsDuration');
      assert.equal(total, 0);
    });

    await run( async () => {
      const allDayOffering = store.createRecord('offering', {startDate: moment('2017-01-01') , endDate: moment('2017-01-02') });
      const halfAnHourOffering = store.createRecord('offering', {startDate: moment('2017-01-01 09:30:00'), endDate: moment('2017-01-01 10:00:00') });
      subject.get('offerings').pushObjects([ allDayOffering, halfAnHourOffering ]);
      const total = await subject.get('totalSumOfferingsDuration');
      assert.equal(total, 24.50);
    });
  });

  test('maxSingleOfferingDuration', async function(assert){
    assert.expect(2);
    const subject = run(() => this.owner.lookup('service:store').createRecord('session'));
    const store = this.owner.lookup('service:store');
    await run( async () => {
      const max = await subject.get('maxSingleOfferingDuration');
      assert.equal(max, 0);
    });

    await run( async () => {
      const allDayOffering = store.createRecord('offering', {startDate: moment('2017-01-01') , endDate: moment('2017-01-02') });
      const halfAnHourOffering = store.createRecord('offering', {startDate: moment('2017-01-01 09:30:00'), endDate: moment('2017-01-01 10:00:00') });
      subject.get('offerings').pushObjects([ allDayOffering, halfAnHourOffering ]);
      const max = await subject.get('maxSingleOfferingDuration');
      assert.equal(max, 24.00);
    });
  });


  test('firstOfferingDate - no offerings, and no ILM', async function(assert) {
    assert.expect(1);
    const subject = run(() => this.owner.lookup('service:store').createRecord('session'));
    await run(async () => {
      const firstDate = await subject.get('firstOfferingDate');
      assert.equal(firstDate, null);
    });
  });

  test('firstOfferingDate - ILM', async function(assert) {
    assert.expect(1);
    const subject = run(() => this.owner.lookup('service:store').createRecord('session'));
    const store = this.owner.lookup('service:store');
    await run(async () => {
      const ilm = store.createRecord('ilmSession', { dueDate: moment('2015-01-01') });
      subject.set('ilmSession', ilm);
      const firstDate = await subject.get('firstOfferingDate');
      assert.equal(firstDate, ilm.get('dueDate'));
    });
  });

  test('firstOfferingDate - offerings', async function(assert) {
    assert.expect(1);
    const subject = run(() => this.owner.lookup('service:store').createRecord('session'));
    const store = this.owner.lookup('service:store');
    await run(async () => {
      const offering1 = store.createRecord('offering', { startDate: moment('2017-01-01') });
      const offering2 = store.createRecord('offering', { startDate: moment('2016-01-01') });
      subject.get('offerings').pushObjects([ offering1, offering2 ]);
      const firstDate = await subject.get('firstOfferingDate');
      assert.equal(offering2.get('startDate'), firstDate);
    });
  });

  test('sortedOfferingsByDate', async function(assert) {
    assert.expect(4);
    const subject = run(() => this.owner.lookup('service:store').createRecord('session'));
    const store = this.owner.lookup('service:store');
    await run(async () => {
      const offering1 = store.createRecord('offering', { startDate: moment('2017-01-01') });
      const offering2 = store.createRecord('offering', { startDate: moment('2016-01-01') });
      const offering3 = store.createRecord('offering', { startDate: moment('2015-01-01') });
      const offeringWithNoStartDate = store.createRecord('offering');
      subject.get('offerings').pushObjects([ offering1, offering2, offering3, offeringWithNoStartDate ]);
      const sortedDates = await subject.get('sortedOfferingsByDate');
      assert.equal(sortedDates.length, 3);
      assert.equal(sortedDates[0], offering3);
      assert.equal(sortedDates[1], offering2);
      assert.equal(sortedDates[2], offering1);
    });
  });
});
