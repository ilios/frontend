import { currentRouteName, currentURL } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';
import page from 'frontend/tests/pages/reports';
import subjectReportPage from 'frontend/tests/pages/reports-subject';
import { setupApplicationTest } from 'frontend/tests/helpers';
import percySnapshot from '@percy/ember';
import { getUniqueName } from '../../helpers/percy-snapshot-name';

module('Acceptance | Reports - Subject Reports', function (hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(async function () {
    const school = this.server.create('school');
    const user = await setupAuthentication({ school }, true);
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

  test('visiting /reports ends up at subjects', async function (assert) {
    await page.visit();
    assert.strictEqual(currentRouteName(), 'reports.subjects');
    assert.ok(page.switcher.subject.isActive);
    assert.notOk(page.switcher.curriculum.isActive);
    assert.ok(page.subjects.isPresent);
  });

  test('shows reports', async function (assert) {
    assert.expect(3);
    await page.visit();
    await percySnapshot(assert);
    assert.strictEqual(page.subjects.list.table.reports.length, 2);
    assert.strictEqual(
      page.subjects.list.table.reports[0].title,
      'All Sessions for term 0 in school 0',
    );
    assert.strictEqual(page.subjects.list.table.reports[1].title, 'my report 0');
  });

  test('create new report', async function (assert) {
    assert.expect(15);
    await page.visit();
    assert.strictEqual(page.subjects.list.table.reports.length, 2);
    assert.strictEqual(
      page.subjects.list.table.reports[0].title,
      'All Sessions for term 0 in school 0',
    );
    assert.strictEqual(page.subjects.list.table.reports[1].title, 'my report 0');
    assert.ok(page.subjects.list.newReportLinkIsHidden);
    await page.subjects.list.toggleNewSubjectReportForm();
    await page.subjects.list.newSubject.title.set('aardvark');
    await page.subjects.list.newSubject.schools.choose('1');
    await page.subjects.list.newSubject.subjects.choose('session');
    await page.subjects.list.newSubject.objects.choose('course');
    await page.subjects.list.newSubject.course.input('cour');
    await page.subjects.list.newSubject.course.results[1].click();
    await percySnapshot(getUniqueName(assert, 'pre-save form'));
    await page.subjects.list.newSubject.save();
    await percySnapshot(getUniqueName(assert, 'post-save form'));
    assert.strictEqual(page.subjects.list.table.reports.length, 3);
    assert.strictEqual(page.subjects.list.table.reports[0].title, 'aardvark');
    assert.strictEqual(
      page.subjects.list.table.reports[1].title,
      'All Sessions for term 0 in school 0',
    );
    assert.strictEqual(page.subjects.list.table.reports[2].title, 'my report 0');
    assert.notOk(page.subjects.list.newReportLinkIsHidden);
    assert.strictEqual(page.subjects.list.newReportLink, 'aardvark');

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
    await page.subjects.list.table.reports[0].select();
    await percySnapshot(assert);
    assert.strictEqual(currentURL(), '/reports/subjects/3');
    assert.strictEqual(subjectReportPage.report.title.text, 'aardvark');
    assert.strictEqual(subjectReportPage.report.results.length, 1);
    assert.strictEqual(subjectReportPage.report.results[0].text, 'course 0: session 0');
  });

  test('create new report with empty title', async function (assert) {
    await page.visit();
    assert.strictEqual(page.subjects.list.table.reports.length, 2);
    assert.ok(page.subjects.list.newReportLinkIsHidden);
    await page.subjects.list.toggleNewSubjectReportForm();
    await page.subjects.list.newSubject.schools.choose('1');
    await page.subjects.list.newSubject.subjects.choose('session');
    await page.subjects.list.newSubject.save();
    assert.notOk(page.subjects.list.newReportLinkIsHidden);
    assert.strictEqual(page.subjects.list.table.reports.length, 3);
    assert.strictEqual(page.subjects.list.table.reports[1].title, 'All Sessions in school 0');
    assert.strictEqual(page.subjects.list.newReportLink, 'All Sessions in school 0');
  });

  test('filter session by year in new report form', async function (assert) {
    assert.expect(13);
    await page.visit();
    assert.strictEqual(page.subjects.list.table.reports.length, 2);
    assert.strictEqual(
      page.subjects.list.table.reports[0].title,
      'All Sessions for term 0 in school 0',
    );
    assert.strictEqual(page.subjects.list.table.reports[1].title, 'my report 0');
    await page.subjects.list.toggleNewSubjectReportForm();
    await page.subjects.list.newSubject.schools.choose('1');
    await page.subjects.list.newSubject.subjects.choose('term');
    await page.subjects.list.newSubject.objects.choose('session');

    await page.subjects.list.newSubject.session.input('session');
    assert.strictEqual(page.subjects.list.newSubject.session.results.length, 2);
    await page.subjects.list.newSubject.session.results[0].click();
    await page.subjects.list.newSubject.save();
    assert.strictEqual(page.subjects.list.table.reports.length, 3);
    assert.strictEqual(
      page.subjects.list.table.reports[0].title,
      'All Sessions for term 0 in school 0',
    );
    assert.strictEqual(
      page.subjects.list.table.reports[1].title,
      'All Terms for session 1 in school 0',
    );
    assert.strictEqual(page.subjects.list.table.reports[2].title, 'my report 0');
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
    await page.subjects.list.table.reports[1].select();
    assert.strictEqual(currentURL(), '/reports/subjects/3');
    assert.strictEqual(subjectReportPage.report.title.text, 'All Terms for session 1 in school 0');
    assert.strictEqual(subjectReportPage.report.results.length, 1);
    assert.strictEqual(subjectReportPage.report.results[0].text, 'Vocabulary 1 > term 0');
  });

  test('get all courses associated with mesh term #3419', async function (assert) {
    assert.expect(16);
    await page.visit();
    assert.strictEqual(page.subjects.list.table.reports.length, 2);
    assert.strictEqual(
      page.subjects.list.table.reports[0].title,
      'All Sessions for term 0 in school 0',
    );
    assert.strictEqual(page.subjects.list.table.reports[1].title, 'my report 0');
    await page.subjects.list.toggleNewSubjectReportForm();
    await page.subjects.list.newSubject.schools.choose('1');
    await page.subjects.list.newSubject.subjects.choose('course');
    await page.subjects.list.newSubject.objects.choose('mesh term');
    await page.subjects.list.newSubject.meshTerm.meshManager.search.set('descriptor 0');
    assert.strictEqual(page.subjects.list.newSubject.meshTerm.meshManager.searchResults.length, 1);
    await page.subjects.list.newSubject.meshTerm.meshManager.searchResults[0].add();
    await page.subjects.list.newSubject.save();
    assert.strictEqual(page.subjects.list.table.reports.length, 3);
    assert.strictEqual(
      page.subjects.list.table.reports[0].title,
      'All Courses for descriptor 0 in school 0',
    );
    assert.strictEqual(
      page.subjects.list.table.reports[1].title,
      'All Sessions for term 0 in school 0',
    );
    assert.strictEqual(page.subjects.list.table.reports[2].title, 'my report 0');
    let graphQueryCounter = 0;
    this.server.post('api/graphql', function ({ db }, { requestBody }) {
      graphQueryCounter++;
      const { query } = JSON.parse(requestBody);
      let rhett;
      switch (graphQueryCounter) {
        case 1:
          assert.strictEqual(
            query,
            'query { meshDescriptors(id: "D1234") { courses { id }, courseObjectives { course { id } }, sessions { course { id } }, sessionObjectives { session { course { id } } } } }',
          );
          rhett = {
            data: {
              meshDescriptors: [
                {
                  courses: db.courses.map(({ id }) => {
                    return { id };
                  }),
                  courseObjectives: [],
                  sessions: [],
                  sessionObjectives: [],
                },
              ],
            },
          };
          break;
        case 2:
          assert.strictEqual(
            query,
            'query { courses(schools: [1], ids: [1, 2]) { id, title, year, externalId } }',
          );
          rhett = {
            data: {
              courses: db.courses.map(({ id, title, year, externalId }) => {
                return { id, title, year, externalId };
              }),
            },
          };
          break;
        default:
          assert.ok(false, 'too many queries');
      }

      return rhett;
    });
    await page.subjects.list.table.reports[0].select();
    assert.strictEqual(currentURL(), '/reports/subjects/3');
    assert.strictEqual(
      subjectReportPage.report.title.text,
      'All Courses for descriptor 0 in school 0',
    );
    assert.ok(subjectReportPage.report.academicYears.isVisible);
    assert.strictEqual(subjectReportPage.report.results.length, 2);
    assert.strictEqual(
      subjectReportPage.report.results[0].text,
      '2015 course 0 (Theoretical Phys Ed)',
    );
    assert.strictEqual(subjectReportPage.report.results[1].text, '2016 course 1');
  });

  test('Prepositional object resets when a new type is selected', async function (assert) {
    await page.visit();
    assert.strictEqual(page.subjects.list.table.reports.length, 2);
    assert.strictEqual(
      page.subjects.list.table.reports[0].title,
      'All Sessions for term 0 in school 0',
    );
    assert.strictEqual(page.subjects.list.table.reports[1].title, 'my report 0');
    await page.subjects.list.toggleNewSubjectReportForm();
    await page.subjects.list.newSubject.schools.choose('1');
    await page.subjects.list.newSubject.subjects.choose('term');
    await page.subjects.list.newSubject.objects.choose('program year');
    await page.subjects.list.newSubject.prepositionalObjects.choose('2');
    await page.subjects.list.newSubject.objects.choose('program');
    await page.subjects.list.newSubject.prepositionalObjects.choose('1');

    await page.subjects.list.newSubject.save();
    assert.strictEqual(page.subjects.list.table.reports.length, 3);
    assert.strictEqual(
      page.subjects.list.table.reports[0].title,
      'All Sessions for term 0 in school 0',
    );
    assert.strictEqual(
      page.subjects.list.table.reports[1].title,
      'All Terms for program 0 in school 0',
    );
    assert.strictEqual(page.subjects.list.table.reports[2].title, 'my report 0');
  });

  test('course external Id in report', async function (assert) {
    assert.expect(13);
    await page.visit();
    assert.strictEqual(page.subjects.list.table.reports.length, 2);
    assert.strictEqual(
      page.subjects.list.table.reports[0].title,
      'All Sessions for term 0 in school 0',
    );
    assert.strictEqual(page.subjects.list.table.reports[1].title, 'my report 0');
    await page.subjects.list.toggleNewSubjectReportForm();
    await page.subjects.list.newSubject.schools.choose('All Schools');
    await page.subjects.list.newSubject.subjects.choose('course');
    await page.subjects.list.newSubject.save();
    assert.strictEqual(page.subjects.list.table.reports.length, 3);
    assert.strictEqual(page.subjects.list.table.reports[0].title, 'All Courses in All Schools');
    assert.strictEqual(
      page.subjects.list.table.reports[1].title,
      'All Sessions for term 0 in school 0',
    );
    assert.strictEqual(page.subjects.list.table.reports[2].title, 'my report 0');
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
    await page.subjects.list.table.reports[0].select();
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
    assert.strictEqual(page.subjects.list.table.reports.length, 2);
    assert.strictEqual(
      page.subjects.list.table.reports[0].title,
      'All Sessions for term 0 in school 0',
    );
    assert.strictEqual(page.subjects.list.table.reports[1].title, 'my report 0');
    await page.subjects.list.table.reports[0].remove();
    await page.subjects.list.table.confirmRemoval();
    assert.strictEqual(page.subjects.list.table.reports.length, 1);
    assert.strictEqual(page.subjects.list.table.reports[0].title, 'my report 0');
  });

  test('run subject report', async function (assert) {
    assert.expect(5);
    await page.visit();
    await page.subjects.list.toggleNewSubjectReportForm();
    await page.subjects.list.newSubject.schools.choose('1');
    await page.subjects.list.newSubject.subjects.choose('session');
    await page.subjects.list.newSubject.objects.choose('course');
    await page.subjects.list.newSubject.course.input('cour');
    await page.subjects.list.newSubject.course.results[1].click();
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
    await page.subjects.list.newSubject.run();
    await percySnapshot(assert);
    assert.strictEqual(
      currentURL(),
      '/reports/subjects?selectedSchoolId=1&selectedSubject=session&showNewReportForm=true',
    );
    assert.strictEqual(
      page.subjects.results.description,
      'This report shows all Sessions associated with Course "course 0" (2015) in school 0. (1)',
    );
    assert.strictEqual(page.subjects.results.results.length, 1);
    assert.strictEqual(page.subjects.results.results[0].text, 'course 0: session 0');
  });

  test('reset year when subject report is run', async function (assert) {
    assert.expect(12);
    await page.visit();
    await page.subjects.list.toggleNewSubjectReportForm();
    await page.subjects.list.newSubject.schools.choose('1');
    await page.subjects.list.newSubject.subjects.choose('course');
    this.server.post('api/graphql', ({ db }, { requestBody }) => {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(
        query,
        'query { courses(schools: [1]) { id, title, year, externalId } }',
        'has correct graphql query',
      );
      return {
        data: {
          courses: db.courses.map(({ id, title, year, externalId }) => {
            return { id, title, year, externalId };
          }),
        },
      };
    });
    await page.subjects.list.newSubject.run();
    assert.strictEqual(
      page.subjects.runSubject.header.description,
      'This report shows all Courses in school 0. (2)',
      'has correct report description',
    );
    assert.strictEqual(page.subjects.runSubject.results.results.length, 2);
    assert.strictEqual(
      page.subjects.runSubject.results.results[0].text,
      '2015 course 0 (Theoretical Phys Ed)',
    );
    assert.strictEqual(page.subjects.runSubject.results.results[1].text, '2016 course 1');
    assert.ok(page.subjects.runSubject.header.academicYears.isVisible);
    await page.subjects.runSubject.header.academicYears.choose('2016');
    assert.strictEqual(page.subjects.runSubject.results.results.length, 1);
    assert.strictEqual(page.subjects.runSubject.results.results[0].text, 'course 1');
    await page.subjects.list.newSubject.run();
    assert.strictEqual(page.subjects.runSubject.results.results.length, 2);
    assert.strictEqual(
      page.subjects.runSubject.results.results[0].text,
      '2015 course 0 (Theoretical Phys Ed)',
    );
    assert.strictEqual(page.subjects.runSubject.results.results[1].text, '2016 course 1');
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
    await page.subjects.list.table.reports[1].select();
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

    assert.strictEqual(page.subjects.list.table.reports.length, 2);
    assert.strictEqual(
      page.subjects.list.table.reports[0].title,
      'All Sessions for course 0 in school 0',
    );
    assert.strictEqual(
      page.subjects.list.table.reports[1].title,
      'All Sessions for term 0 in school 0',
    );
  });

  test('create new report for instructors by academic year #3594', async function (assert) {
    assert.expect(15);
    this.server.createList('user', 3);
    await page.visit();
    assert.strictEqual(page.subjects.list.table.reports.length, 2);
    assert.ok(page.subjects.list.newReportLinkIsHidden);
    await page.subjects.list.toggleNewSubjectReportForm();
    await page.subjects.list.newSubject.schools.choose('1');
    await page.subjects.list.newSubject.subjects.choose('instructor');
    await page.subjects.list.newSubject.objects.choose('academic year');
    await page.subjects.list.newSubject.prepositionalObjects.choose('2015');
    await page.subjects.list.newSubject.save();
    assert.notOk(page.subjects.list.newReportLinkIsHidden);
    assert.strictEqual(page.subjects.list.table.reports.length, 3);
    assert.strictEqual(
      page.subjects.list.table.reports[0].title,
      'All Instructors for 2015 - 2016 in school 0',
    );
    assert.strictEqual(
      page.subjects.list.newReportLink,
      'All Instructors for 2015 - 2016 in school 0',
    );

    let counter = 0;
    this.server.post('api/graphql', ({ db }, { requestBody }) => {
      const { query } = JSON.parse(requestBody);
      const users = db.users.map(({ id, firstName, middleName, lastName, displayName }) => {
        return { id, firstName, middleName, lastName, displayName };
      });
      counter++;
      switch (counter) {
        case 1:
          assert.strictEqual(
            query,
            'query { courses(schools: [1], academicYears: [2015]) { id } }',
          );
          return {
            data: {
              courses: [{ id: 1 }, { id: 31 }],
            },
          };
        case 2:
          assert.ok(query.includes('query { courses(ids: [1,31])'));
          return {
            data: {
              courses: [
                { sessions: [{ offerings: [{ instructors: users, instructorGroups: [] }] }] },
              ],
            },
          };
        default:
          assert.ok(false, 'too many queries');
      }
    });
    await page.subjects.list.table.reports[0].select();
    assert.strictEqual(currentURL(), '/reports/subjects/3');
    assert.strictEqual(
      subjectReportPage.report.title.text,
      'All Instructors for 2015 - 2016 in school 0',
    );
    assert.strictEqual(subjectReportPage.report.results.length, 4);
    assert.strictEqual(subjectReportPage.report.results[0].text, '0 guy M. Mc0son');
    assert.strictEqual(subjectReportPage.report.results[1].text, '1 guy M. Mc1son');
    assert.strictEqual(subjectReportPage.report.results[2].text, '2 guy M. Mc2son');
    assert.strictEqual(subjectReportPage.report.results[3].text, '3 guy M. Mc3son');
  });

  test('courses by academic year hides year', async function (assert) {
    assert.expect(5);
    await page.visit();
    await page.subjects.list.toggleNewSubjectReportForm();
    await page.subjects.list.newSubject.schools.choose('');
    await page.subjects.list.newSubject.subjects.choose('course');
    await page.subjects.list.newSubject.objects.choose('academic year');
    await page.subjects.list.newSubject.prepositionalObjects.choose('2015');
    await page.subjects.list.newSubject.save();
    this.server.post('api/graphql', ({ db }, { requestBody }) => {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(
        query,
        'query { courses(academicYears: [2015]) { id, title, year, externalId } }',
      );
      const coursesIn2015 = db.courses.filter(({ year }) => year === 2015);
      return {
        data: {
          courses: coursesIn2015.map(({ id, title, year, externalId }) => {
            return { id, title, year, externalId };
          }),
        },
      };
    });
    await page.subjects.list.table.reports[0].select();
    assert.strictEqual(currentURL(), '/reports/subjects/3');
    assert.notOk(subjectReportPage.report.academicYears.isVisible);
    assert.strictEqual(subjectReportPage.report.results.length, 1);
    assert.strictEqual(subjectReportPage.report.results[0].text, 'course 0 (Theoretical Phys Ed)');
  });
});
