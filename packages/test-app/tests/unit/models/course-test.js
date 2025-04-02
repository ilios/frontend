import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { waitForResource, freezeDateAt, unfreezeDate } from 'ilios-common';

module('Unit | Model | Course', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    const model = this.owner.lookup('service:store').createRecord('course');
    assert.ok(!!model);
  });

  test('check required publication items', async function (assert) {
    const store = this.owner.lookup('service:store');
    const course = store.createRecord('course');

    assert.strictEqual(course.get('requiredPublicationIssues').length, 3);
    store.createRecord('cohort', { courses: [course] });
    assert.strictEqual(course.get('requiredPublicationIssues').length, 2);
    course.set('startDate', 'nothing');
    assert.strictEqual(course.get('requiredPublicationIssues').length, 1);
    course.set('endDate', 'nothing');
    assert.strictEqual(course.get('requiredPublicationIssues').length, 0);
  });

  test('check optional publication items', async function (assert) {
    const store = this.owner.lookup('service:store');
    const course = store.createRecord('course');

    assert.strictEqual(course.get('optionalPublicationIssues').length, 3);
    store.createRecord('term', { courses: [course] });
    assert.strictEqual(course.get('optionalPublicationIssues').length, 2);
    store.createRecord('course-objective', { course });
    assert.strictEqual(course.get('optionalPublicationIssues').length, 1);
    store.createRecord('mesh-descriptor', { courses: [course] });
    assert.strictEqual(course.get('optionalPublicationIssues').length, 0);
  });

  test('check empty competencies', async function (assert) {
    const course = this.owner.lookup('service:store').createRecord('course');

    const competencies = await waitForResource(course, 'competencies');
    assert.strictEqual(competencies.length, 0);
  });

  test('check competencies', async function (assert) {
    const store = this.owner.lookup('service:store');
    const course = store.createRecord('course');

    const competency1 = store.createRecord('competency');
    const competency2 = store.createRecord('competency');
    const competency3 = store.createRecord('competency');
    const programYearObjective1 = store.createRecord('program-year-objective', {
      competency: competency1,
    });
    const programYearObjective2 = store.createRecord('program-year-objective', {
      competency: competency2,
    });
    const programYearObjective3 = store.createRecord('program-year-objective', {
      competency: competency3,
    });
    store.createRecord('course-objective', {
      course,
      programYearObjectives: [programYearObjective1],
    });
    store.createRecord('course-objective', {
      course,
      programYearObjectives: [programYearObjective2, programYearObjective3],
    });

    const competencies = await waitForResource(course, 'competencies');

    assert.strictEqual(competencies.length, 3);
    assert.ok(competencies.includes(competency1));
    assert.ok(competencies.includes(competency2));
    assert.ok(competencies.includes(competency3));
  });

  test('check publishedSessionOfferingCounts count', async function (assert) {
    const store = this.owner.lookup('service:store');
    const course = store.createRecord('course');

    const offering1 = store.createRecord('offering');
    const offering2 = store.createRecord('offering');
    const offering3 = store.createRecord('offering');
    const offering4 = store.createRecord('offering');

    const session1 = store.createRecord('session', {
      offerings: [offering1, offering2],
      published: true,
      course,
    });
    store.createRecord('session', {
      offerings: [offering3],
      published: true,
      course,
    });
    const session3 = store.createRecord('session', {
      offerings: [offering4],
      published: false,
      course,
    });

    assert.strictEqual(await waitForResource(course, 'publishedOfferingCount'), 3);
    store.createRecord('offering', { session: session1 });

    session3.set('published', true);
    assert.strictEqual(await waitForResource(course, 'publishedOfferingCount'), 5);
  });

  test('domains', async function (assert) {
    const store = this.owner.lookup('service:store');
    const course = store.createRecord('course');

    const domain1 = store.createRecord('competency', {
      title: 'Zylinder',
    });
    const domain2 = store.createRecord('competency', { title: 'Anton' });
    const domain3 = store.createRecord('competency', {
      title: 'Lexicon',
    });
    const competency1 = store.createRecord('competency', {
      title: 'Zeppelin',
      parent: domain1,
    });
    const competency2 = store.createRecord('competency', {
      title: 'Aardvark',
      parent: domain1,
    });
    const competency3 = store.createRecord('competency', {
      title: 'Geflarknik',
      parent: domain2,
    });
    // competencies that are linked to these domains, but not to this course.
    // they should not appear in the output.
    store.createRecord('competency', { parent: domain1 });
    store.createRecord('competency', { parent: domain2 });
    store.createRecord('competency', { parent: domain3 });

    const programYearObjective1 = store.createRecord('program-year-objective', {
      competency: competency1,
    });
    const programYearObjective2 = store.createRecord('program-year-objective', {
      competency: competency2,
    });
    const programYearObjective3 = store.createRecord('program-year-objective', {
      competency: competency3,
    });
    const programYearObjective4 = store.createRecord('program-year-objective', {
      competency: domain3,
    });

    store.createRecord('course-objective', {
      course,
      programYearObjectives: [programYearObjective1],
    });
    store.createRecord('course-objective', {
      course,
      programYearObjectives: [programYearObjective2],
    });
    store.createRecord('course-objective', {
      course,
      programYearObjectives: [programYearObjective3],
    });
    store.createRecord('course-objective', {
      course,
      programYearObjectives: [programYearObjective4],
    });

    const domainObjects = await waitForResource(course, 'domainsWithSubcompetencies');
    assert.strictEqual(domainObjects.length, 3);

    assert.strictEqual(domainObjects[0].id, domain2.id);
    assert.strictEqual(domainObjects[0].title, domain2.title);
    assert.strictEqual(domainObjects[0].subCompetencies.length, 1);
    assert.ok(domainObjects[0].subCompetencies.includes(competency3));

    assert.strictEqual(domainObjects[1].id, domain3.id);
    assert.strictEqual(domainObjects[1].title, domain3.title);
    assert.strictEqual(domainObjects[1].subCompetencies.length, 0);

    assert.strictEqual(domainObjects[2].id, domain1.id);
    assert.strictEqual(domainObjects[2].title, domain1.title);
    assert.strictEqual(domainObjects[2].subCompetencies.length, 2);
    assert.strictEqual(domainObjects[2].subCompetencies[0], competency2);
    assert.strictEqual(domainObjects[2].subCompetencies[1], competency1);
  });

  test('schools', async function (assert) {
    const store = this.owner.lookup('service:store');
    const course = store.createRecord('course');

    const school1 = store.createRecord('school');
    const school2 = store.createRecord('school');
    const school3 = store.createRecord('school');
    const program1 = store.createRecord('program', { school: school2 });
    const program2 = store.createRecord('program', { school: school2 });
    const program3 = store.createRecord('program', { school: school3 });
    const programYear1 = store.createRecord('program-year', {
      program: program1,
    });
    const programYear2 = store.createRecord('program-year', {
      program: program2,
    });
    const programYear3 = store.createRecord('program-year', {
      program: program3,
    });
    store.createRecord('cohort', { programYear: programYear1, courses: [course] });
    store.createRecord('cohort', { programYear: programYear2, courses: [course] });
    store.createRecord('cohort', { programYear: programYear3, courses: [course] });

    course.set('school', school1);

    const schools = await waitForResource(course, 'schools');

    assert.strictEqual(schools.length, 3);
    assert.ok(schools.includes(school1));
    assert.ok(schools.includes(school2));
    assert.ok(schools.includes(school3));
  });

  test('assignableVocabularies', async function (assert) {
    const store = this.owner.lookup('service:store');

    const school1 = store.createRecord('school', { title: 'Zylinder' });
    const school2 = store.createRecord('school', { title: 'Anton' });
    const course = store.createRecord('course', { school: school2 });

    const vocabulary1 = store.createRecord('vocabulary', {
      title: 'Sowjetunion',
      school: school1,
    });
    const vocabulary2 = store.createRecord('vocabulary', {
      title: 'DDR',
      school: school1,
    });
    const vocabulary3 = store.createRecord('vocabulary', {
      title: 'Walter Ulbricht',
      school: school2,
    });
    const vocabulary4 = store.createRecord('vocabulary', {
      title: 'Antifaschistischer Schutzwall',
      school: school2,
    });
    const program = store.createRecord('program', { school: school1 });
    const programYear = store.createRecord('program-year', { program });
    store.createRecord('cohort', { programYear, courses: [course] });

    const vocabularies = await waitForResource(course, 'assignableVocabularies');
    assert.strictEqual(vocabularies.length, 4);
    assert.strictEqual(vocabularies[0], vocabulary4);
    assert.strictEqual(vocabularies[1], vocabulary3);
    assert.strictEqual(vocabularies[2], vocabulary2);
    assert.strictEqual(vocabularies[3], vocabulary1);
  });

  test('sortedCourseObjectives', async function (assert) {
    const store = this.owner.lookup('service:store');
    const course = store.createRecord('course');
    const sessionObjective1 = store.createRecord('course-objective', {
      id: '1',
      course,
      title: 'Aardvark',
      position: 3,
    });
    const sessionObjective2 = store.createRecord('course-objective', {
      id: '2',
      course,
      title: 'Bar',
      position: 2,
    });
    const sessionObjective3 = store.createRecord('course-objective', {
      id: '3',
      course,
      title: 'Foo',
      position: 2,
    });
    const objectives = await waitForResource(course, 'sortedCourseObjectives');
    assert.strictEqual(objectives.length, 3);
    assert.strictEqual(objectives[0], sessionObjective3);
    assert.strictEqual(objectives[1], sessionObjective2);
    assert.strictEqual(objectives[2], sessionObjective1);
  });

  test('associatedVocabularies', async function (assert) {
    const store = this.owner.lookup('service:store');
    const course = store.createRecord('course');
    const vocabulary1 = store.createRecord('vocabulary');
    const vocabulary2 = store.createRecord('vocabulary');
    store.createRecord('vocabulary');
    store.createRecord('term', { vocabulary: vocabulary1, courses: [course] });
    store.createRecord('term', { vocabulary: vocabulary1, courses: [course] });
    store.createRecord('term', { vocabulary: vocabulary1, courses: [course] });
    store.createRecord('term', { vocabulary: vocabulary2, courses: [course] });

    const vocabularies = await waitForResource(course, 'associatedVocabularies');
    assert.strictEqual(vocabularies.length, 2);
    assert.strictEqual(vocabularies[0], vocabulary1);
    assert.strictEqual(vocabularies[1], vocabulary2);
  });

  test('set dates based on year before year start', async function (assert) {
    freezeDateAt(new Date('5/6/1981'));
    const course = this.owner.lookup('service:store').createRecord('course', {
      year: 1981,
    });
    course.setDatesBasedOnYear();
    assert.strictEqual(course.startDate.getYear(), 81);
    assert.strictEqual(course.startDate.getMonth(), 6);
    assert.strictEqual(course.startDate.getDate(), 1);

    assert.strictEqual(course.endDate.getYear(), 81);
    assert.strictEqual(course.endDate.getMonth(), 7);
    assert.strictEqual(course.endDate.getDate(), 26);
    unfreezeDate();
  });

  test('set dates based on year after year start', async function (assert) {
    freezeDateAt(new Date('12/11/1980'));
    const course = this.owner.lookup('service:store').createRecord('course', {
      year: 1980,
    });
    course.setDatesBasedOnYear();
    assert.strictEqual(course.startDate.getYear(), 80);
    assert.strictEqual(course.startDate.getMonth(), 11);
    assert.strictEqual(course.startDate.getDate(), 11);

    assert.strictEqual(course.endDate.getYear(), 81);
    assert.strictEqual(course.endDate.getMonth(), 1);
    assert.strictEqual(course.endDate.getDate(), 5);
    unfreezeDate();
  });
});
