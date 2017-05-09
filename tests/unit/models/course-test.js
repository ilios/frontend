import {
  moduleForModel,
  test
} from 'ember-qunit';
import modelList from '../../helpers/model-list';
import Ember from 'ember';

const { run } = Ember;

moduleForModel('course', 'Unit | Model | Course', {
  needs: modelList
});

test('it exists', function(assert) {
  let model = this.subject();
  assert.ok(!!model);
});

test('check required publication items', function(assert) {
  let model = this.subject();
  let store = this.store();
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

test('check empty competencies', async function(assert) {
  assert.expect(1);
  let course = this.subject();

  const competencies = await course.get('competencies');
  assert.equal(competencies.length, 0);
});

test('check competencies', async function(assert) {
  assert.expect(4);
  let course = this.subject();
  let store = this.store();

  run( async () => {
    let competency1 = store.createRecord('competency');
    let competency2 = store.createRecord('competency');
    let competency3 = store.createRecord('competency');

    let objective1 = store.createRecord('objective', {competency: competency1});
    let objective2 = store.createRecord('objective', {competency: competency2});
    let objective3 = store.createRecord('objective', {competency: competency3, courses: [course], parents: [objective1]});
    let objective4 = store.createRecord('objective', {courses: [course], parents: [objective2]});
    objective1.get('children').pushObject(objective3);
    objective2.get('children').pushObject(objective4);
    course.get('objectives').pushObjects([objective3, objective4]);

    const competencies = await course.get('competencies');

    assert.equal(competencies.length, 3);
    assert.ok(competencies.includes(competency1));
    assert.ok(competencies.includes(competency2));
    assert.ok(competencies.includes(competency3));
  });
});

test('check publishedSessionOfferingCounts count', function(assert) {
  assert.expect(2);
  let course = this.subject();
  let store = this.store();

  run(() => {
    let offering1 = store.createRecord('offering');
    let offering2 = store.createRecord('offering');
    let offering3 = store.createRecord('offering');
    let offering4 = store.createRecord('offering');

    let session1 = store.createRecord('session', {offerings: [offering1, offering2], published: true});
    let session2 = store.createRecord('session', {offerings: [offering3], published: true});
    let session3 = store.createRecord('session', {offerings: [offering4], published: false});

    course.get('sessions').pushObjects([session1, session2, session3]);

    assert.equal(course.get('publishedOfferingCount'), 3);
    let offering5 = store.createRecord('offering');
    session1.get('offerings').pushObject(offering5);
    session3.set('published', true);

    assert.equal(course.get('publishedOfferingCount'), 5);
  });
});
