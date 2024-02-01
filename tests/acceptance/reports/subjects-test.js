import { currentRouteName, currentURL } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';
import page from 'frontend/tests/pages/reports';
import subjectReportPage from 'frontend/tests/pages/reports-subject';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import percySnapshot from '@percy/ember';

module('Acceptance | Reports - Subject Reports', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const school = this.server.create('school');
    const user = await setupAuthentication({ school });
    const vocabulary = this.server.create('vocabulary', {
      school,
    });
    const term = this.server.create('term', { vocabulary });
    this.server.create('academic-year', {
      id: 2015,
    });
    this.server.create('academic-year', {
      id: 2016,
    });
    this.server.create('program', { school });
    const firstCourse = this.server.create('course', {
      school,
      year: 2015,
      externalId: 'Theoretical Phys Ed',
    });
    this.server.create('session', {
      course: firstCourse,
      terms: [term],
    });
    const secondCourse = this.server.create('course', {
      school,
      year: 2016,
    });
    this.server.create('session', {
      course: secondCourse,
      terms: [term],
    });
    this.server.create('report', {
      title: 'my report 0',
      subject: 'session',
      prepositionalObject: 'course',
      prepositionalObjectTableRowId: firstCourse.id,
      user,
      school,
    });
    this.server.create('report', {
      title: null,
      subject: 'session',
      prepositionalObject: 'term',
      prepositionalObjectTableRowId: term.id,
      user,
      school,
    });
    this.server.create('mesh-descriptor', {
      id: 'D1234',
      courses: [firstCourse, secondCourse],
    });
  });

  test('visiting /reports', async function (assert) {
    await page.visit();
    assert.strictEqual(currentRouteName(), 'reports');
  });

  test('shows reports', async function (assert) {
    assert.expect(3);
    await page.visit();
    await percySnapshot(assert);
    assert.strictEqual(page.root.list.table.reports.length, 2);
    assert.strictEqual(
      page.root.list.table.reports[0].title,
      'All Sessions for term 0 in school 0',
    );
    assert.strictEqual(page.root.list.table.reports[1].title, 'my report 0');
  });

  test('create new report', async function (assert) {
    assert.expect(15);
    await page.visit();
    assert.strictEqual(page.root.list.table.reports.length, 2);
    assert.strictEqual(
      page.root.list.table.reports[0].title,
      'All Sessions for term 0 in school 0',
    );
    assert.strictEqual(page.root.list.table.reports[1].title, 'my report 0');
    assert.ok(page.root.list.newReportLinkIsHidden);
    await page.root.list.toggleNewSubjectReportForm();
    await page.root.list.newSubject.title.set('aardvark');
    await page.root.list.newSubject.schools.choose('1');
    await page.root.list.newSubject.subjects.choose('session');
    await page.root.list.newSubject.objects.choose('course');
    await page.root.list.newSubject.course.input('cour');
    await page.root.list.newSubject.course.results[1].click();
    await percySnapshot(assert);
    await page.root.list.newSubject.save();
    await percySnapshot(assert);
    assert.strictEqual(page.root.list.table.reports.length, 3);
    assert.strictEqual(page.root.list.table.reports[0].title, 'aardvark');
    assert.strictEqual(
      page.root.list.table.reports[1].title,
      'All Sessions for term 0 in school 0',
    );
    assert.strictEqual(page.root.list.table.reports[2].title, 'my report 0');
    assert.notOk(page.root.list.newReportLinkIsHidden);
    assert.strictEqual(page.root.list.newReportLink, 'aardvark');

    this.server.post('api/graphql', ({ db }, { requestBody }) => {
      const { query } = JSON.parse(requestBody);
      const course = db.courses[0];
      const { id, title } = db.sessions[0];

      assert.strictEqual(
        query,
        'query { sessions(schools: [1], courses: [1]) { id, title, course { id, year, title } } }',
      );
      return {
        data: {
          sessions: [
            { id, title, course: { id: course.id, title: course.title, year: course.year } },
          ],
        },
      };
    });
    await page.root.list.table.reports[0].select();
    await percySnapshot(assert);
    assert.strictEqual(currentURL(), '/reports/subjects/3');
    assert.strictEqual(subjectReportPage.report.title.text, 'aardvark');
    assert.strictEqual(subjectReportPage.report.results.length, 1);
    assert.strictEqual(subjectReportPage.report.results[0].text, 'course 0: session 0');
  });

  test('create new report with empty title', async function (assert) {
    await page.visit();
    assert.strictEqual(page.root.list.table.reports.length, 2);
    assert.ok(page.root.list.newReportLinkIsHidden);
    await page.root.list.toggleNewSubjectReportForm();
    await page.root.list.newSubject.schools.choose('1');
    await page.root.list.newSubject.subjects.choose('session');
    await page.root.list.newSubject.save();
    assert.notOk(page.root.list.newReportLinkIsHidden);
    assert.strictEqual(page.root.list.table.reports.length, 3);
    assert.strictEqual(page.root.list.table.reports[1].title, 'All Sessions in school 0');
    assert.strictEqual(page.root.list.newReportLink, 'All Sessions in school 0');
  });

  test('filter session by year in new report form', async function (assert) {
    assert.expect(13);
    await page.visit();
    assert.strictEqual(page.root.list.table.reports.length, 2);
    assert.strictEqual(
      page.root.list.table.reports[0].title,
      'All Sessions for term 0 in school 0',
    );
    assert.strictEqual(page.root.list.table.reports[1].title, 'my report 0');
    await page.root.list.toggleNewSubjectReportForm();
    await page.root.list.newSubject.schools.choose('1');
    await page.root.list.newSubject.subjects.choose('term');
    await page.root.list.newSubject.objects.choose('session');

    await page.root.list.newSubject.session.input('session');
    assert.strictEqual(page.root.list.newSubject.session.results.length, 2);
    await page.root.list.newSubject.session.results[0].click();
    await page.root.list.newSubject.save();
    assert.strictEqual(page.root.list.table.reports.length, 3);
    assert.strictEqual(
      page.root.list.table.reports[0].title,
      'All Sessions for term 0 in school 0',
    );
    assert.strictEqual(
      page.root.list.table.reports[1].title,
      'All Terms for session 1 in school 0',
    );
    assert.strictEqual(page.root.list.table.reports[2].title, 'my report 0');
    this.server.post('api/graphql', ({ db }, { requestBody }) => {
      const { query } = JSON.parse(requestBody);
      const { id, title } = db.terms[0];
      const vocab = db.vocabularies[0];

      assert.strictEqual(
        query,
        'query { terms(schools: [1], sessions: [2]) { id, title, vocabulary { id, title } } }',
      );
      return {
        data: {
          terms: [{ id, title, vocabulary: { id: vocab.id, title: vocab.title } }],
        },
      };
    });
    await page.root.list.table.reports[1].select();
    assert.strictEqual(currentURL(), '/reports/subjects/3');
    assert.strictEqual(subjectReportPage.report.title.text, 'All Terms for session 1 in school 0');
    assert.strictEqual(subjectReportPage.report.results.length, 1);
    assert.strictEqual(subjectReportPage.report.results[0].text, 'Vocabulary 1 > term 0');
  });

  test('get all courses associated with mesh term #3419', async function (assert) {
    assert.expect(14);
    await page.visit();
    assert.strictEqual(page.root.list.table.reports.length, 2);
    assert.strictEqual(
      page.root.list.table.reports[0].title,
      'All Sessions for term 0 in school 0',
    );
    assert.strictEqual(page.root.list.table.reports[1].title, 'my report 0');
    await page.root.list.toggleNewSubjectReportForm();
    await page.root.list.newSubject.schools.choose('1');
    await page.root.list.newSubject.subjects.choose('course');
    await page.root.list.newSubject.objects.choose('mesh term');
    await page.root.list.newSubject.meshTerm.meshManager.search.set('descriptor 0');
    assert.strictEqual(page.root.list.newSubject.meshTerm.meshManager.searchResults.length, 1);
    await page.root.list.newSubject.meshTerm.meshManager.searchResults[0].add();
    await page.root.list.newSubject.save();
    assert.strictEqual(page.root.list.table.reports.length, 3);
    assert.strictEqual(
      page.root.list.table.reports[0].title,
      'All Courses for descriptor 0 in school 0',
    );
    assert.strictEqual(
      page.root.list.table.reports[1].title,
      'All Sessions for term 0 in school 0',
    );
    assert.strictEqual(page.root.list.table.reports[2].title, 'my report 0');
    this.server.post('api/graphql', ({ db }, { requestBody }) => {
      const { query } = JSON.parse(requestBody);

      assert.strictEqual(
        query,
        'query { courses(schools: [1], meshDescriptors: ["D1234"]) { id, title, year, externalId } }',
      );
      return {
        data: {
          courses: db.courses.map(({ id, title, year, externalId }) => {
            return { id, title, year, externalId };
          }),
        },
      };
    });
    await page.root.list.table.reports[0].select();
    assert.strictEqual(currentURL(), '/reports/subjects/3');
    assert.strictEqual(
      subjectReportPage.report.title.text,
      'All Courses for descriptor 0 in school 0',
    );
    assert.strictEqual(subjectReportPage.report.results.length, 2);
    assert.strictEqual(
      subjectReportPage.report.results[0].text,
      '2015 course 0 (Theoretical Phys Ed)',
    );
    assert.strictEqual(subjectReportPage.report.results[1].text, '2016 course 1');
  });

  test('Prepositional object resets when a new type is selected', async function (assert) {
    await page.visit();
    assert.strictEqual(page.root.list.table.reports.length, 2);
    assert.strictEqual(
      page.root.list.table.reports[0].title,
      'All Sessions for term 0 in school 0',
    );
    assert.strictEqual(page.root.list.table.reports[1].title, 'my report 0');
    await page.root.list.toggleNewSubjectReportForm();
    await page.root.list.newSubject.schools.choose('1');
    await page.root.list.newSubject.subjects.choose('term');
    await page.root.list.newSubject.objects.choose('program year');
    await page.root.list.newSubject.prepositionalObjects.choose('2');
    await page.root.list.newSubject.objects.choose('program');

    await page.root.list.newSubject.save();
    assert.strictEqual(page.root.list.table.reports.length, 3);
    assert.strictEqual(
      page.root.list.table.reports[0].title,
      'All Sessions for term 0 in school 0',
    );
    assert.strictEqual(
      page.root.list.table.reports[1].title,
      'All Terms for program 0 in school 0',
    );
    assert.strictEqual(page.root.list.table.reports[2].title, 'my report 0');
  });

  test('course external Id in report', async function (assert) {
    assert.expect(13);
    await page.visit();
    assert.strictEqual(page.root.list.table.reports.length, 2);
    assert.strictEqual(
      page.root.list.table.reports[0].title,
      'All Sessions for term 0 in school 0',
    );
    assert.strictEqual(page.root.list.table.reports[1].title, 'my report 0');
    await page.root.list.toggleNewSubjectReportForm();
    await page.root.list.newSubject.schools.choose('All Schools');
    await page.root.list.newSubject.subjects.choose('course');
    await page.root.list.newSubject.save();
    assert.strictEqual(page.root.list.table.reports.length, 3);
    assert.strictEqual(page.root.list.table.reports[0].title, 'All Courses in All Schools');
    assert.strictEqual(
      page.root.list.table.reports[1].title,
      'All Sessions for term 0 in school 0',
    );
    assert.strictEqual(page.root.list.table.reports[2].title, 'my report 0');
    this.server.post('api/graphql', ({ db }, { requestBody }) => {
      const { query } = JSON.parse(requestBody);

      assert.strictEqual(query, 'query { courses { id, title, year, externalId } }');
      return {
        data: {
          courses: db.courses.map(({ id, title, year, externalId }) => {
            return { id, title, year, externalId };
          }),
        },
      };
    });
    await page.root.list.table.reports[0].select();
    assert.strictEqual(currentURL(), '/reports/subjects/3');
    assert.strictEqual(subjectReportPage.report.title.text, 'All Courses in All Schools');
    assert.strictEqual(subjectReportPage.report.results.length, 2);
    assert.strictEqual(
      subjectReportPage.report.results[0].text,
      '2015 course 0 (Theoretical Phys Ed)',
    );
    assert.strictEqual(subjectReportPage.report.results[1].text, '2016 course 1');
  });

  test('delete report', async function (assert) {
    await page.visit();
    assert.strictEqual(page.root.list.table.reports.length, 2);
    assert.strictEqual(
      page.root.list.table.reports[0].title,
      'All Sessions for term 0 in school 0',
    );
    assert.strictEqual(page.root.list.table.reports[1].title, 'my report 0');
    await page.root.list.table.reports[0].remove();
    await page.root.list.table.confirmRemoval();
    assert.strictEqual(page.root.list.table.reports.length, 1);
    assert.strictEqual(page.root.list.table.reports[0].title, 'my report 0');
  });

  test('run subject report', async function (assert) {
    assert.expect(5);
    await page.visit();
    await page.root.list.toggleNewSubjectReportForm();
    await page.root.list.newSubject.schools.choose('1');
    await page.root.list.newSubject.subjects.choose('session');
    await page.root.list.newSubject.objects.choose('course');
    await page.root.list.newSubject.course.input('cour');
    await page.root.list.newSubject.course.results[1].click();
    this.server.post('api/graphql', ({ db }, { requestBody }) => {
      const { query } = JSON.parse(requestBody);
      const course = db.courses[0];
      const { id, title } = db.sessions[0];

      assert.strictEqual(
        query,
        'query { sessions(schools: [1], courses: [1]) { id, title, course { id, year, title } } }',
      );
      return {
        data: {
          sessions: [
            { id, title, course: { id: course.id, title: course.title, year: course.year } },
          ],
        },
      };
    });
    await page.root.list.newSubject.run();
    await percySnapshot(assert);
    assert.strictEqual(currentURL(), '/reports');
    assert.strictEqual(
      page.root.results.description,
      'This report shows all Sessions associated with Course "course 0" (2015) in school 0.',
    );
    assert.strictEqual(page.root.results.results.length, 1);
    assert.strictEqual(page.root.results.results[0].text, 'course 0: session 0');
  });

  test('remove report title', async function (assert) {
    assert.expect(6);
    await page.visit();
    this.server.post('api/graphql', () => {
      //send wrong data back, who cares
      return {
        data: {
          sessions: [],
        },
      };
    });
    await page.root.list.table.reports[1].select();
    assert.strictEqual(currentURL(), '/reports/subjects/1');
    assert.strictEqual(subjectReportPage.report.title.text, 'my report 0');
    await subjectReportPage.report.title.edit();
    await subjectReportPage.report.title.set('');
    await subjectReportPage.report.title.save();
    assert.strictEqual(
      subjectReportPage.report.title.text,
      'All Sessions for course 0 in school 0',
    );
    await page.visit();

    assert.strictEqual(page.root.list.table.reports.length, 2);
    assert.strictEqual(
      page.root.list.table.reports[0].title,
      'All Sessions for course 0 in school 0',
    );
    assert.strictEqual(
      page.root.list.table.reports[1].title,
      'All Sessions for term 0 in school 0',
    );
  });
});
