import { moduleForModel, test } from 'ember-qunit';
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

  await run( async () => {
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

test("domains", async function(assert) {
  assert.expect(10);
  let course = this.subject();
  let store = this.store();
  await run( async () => {
    const domain1 = store.createRecord('competency', { id: 1, title: 'Zylinder' });
    const domain2 = store.createRecord('competency', { id: 2, title: 'Anton' });
    const domain3 = store.createRecord('competency', { id: 3, title: 'Lexicon' });
    const competency1 = store.createRecord('competency', { id: 4, title: 'Zeppelin', parent: domain1 });
    const competency2 = store.createRecord('competency', { id: 5, title: 'Aardvark', parent: domain1 });
    const competency3 = store.createRecord('competency', { id: 6, title: 'Geflarknik', parent: domain2 });
    // competencies that are linked to these domains, but not to this course.
    // they should not appear in the output.
    store.createRecord('competency', { id: 7, parent: domain1 });
    store.createRecord('competency', { id: 8, parent: domain2 });
    store.createRecord('competency', { id: 9, parent: domain3 });

    let objective1 = store.createRecord('objective', { competency: competency1 });
    let objective2 = store.createRecord('objective', { competency: competency2 });
    let objective3 = store.createRecord('objective', { competency: competency3 });
    let objective4 = store.createRecord('objective', { competency: domain3 });

    course.get('objectives').pushObjects([ objective1, objective2, objective3, objective4 ]);

    const domainProxies = await course.get('domains');
    assert.equal(domainProxies.length, 3);

    const domainProxy1 = domainProxies[0];
    assert.equal(domainProxy1.get('content'), domain2);
    assert.equal(domainProxy1.get('subCompetencies').length, 1);
    assert.ok(domainProxy1.get('subCompetencies').includes(competency3));

    const domainProxy2 = domainProxies[1];
    assert.equal(domainProxy2.get('content'), domain3);
    assert.equal(domainProxy2.get('subCompetencies').length, 0);

    const domainProxy3 = domainProxies[2];
    assert.equal(domainProxy3.get('content'), domain1);
    assert.equal(domainProxy3.get('subCompetencies').length, 2);
    assert.equal(domainProxy3.get('subCompetencies')[0], competency2);
    assert.equal(domainProxy3.get('subCompetencies')[1], competency1);
  });
});


test('schools', async function(assert) {
  assert.expect(4);
  let course = this.subject();
  let store = this.store();
  await run( async () => {
    const school1 = store.createRecord('school');
    const school2 = store.createRecord('school');
    const school3 = store.createRecord('school');
    const program1 = store.createRecord('program', { school: school2 });
    const program2 = store.createRecord('program', { school: school2 });
    const program3 = store.createRecord('program', { school: school3 });
    const programYear1 = store.createRecord('programYear', { program: program1 });
    const programYear2 = store.createRecord('programYear', { program: program2 });
    const programYear3 = store.createRecord('programYear', { program: program3 });
    const cohort1 = store.createRecord('cohort', { programYear: programYear1 });
    const cohort2 = store.createRecord('cohort', { programYear: programYear2 });
    const cohort3 = store.createRecord('cohort', { programYear: programYear3 });

    course.get('cohorts').pushObjects([ cohort1, cohort2, cohort3 ]);
    course.set('school', school1);

    const schools = await course.get('schools');

    assert.equal(schools.length, 3);
    assert.ok(schools.includes(school1));
    assert.ok(schools.includes(school2));
    assert.ok(schools.includes(school3));
  });
});
