import { currentURL } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';
import page from 'frontend/tests/pages/reports';
import subjectReportPage from 'frontend/tests/pages/reports-subject';
import { setupApplicationTest, takeScreenshot } from 'frontend/tests/helpers';

module('Acceptance | Reports - Subject Reports', function (hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(async function () {
    this.school = await this.server.create('school');
    const user = await setupAuthentication({ school: this.school, directedSchools: [this.school] });
    this.vocabulary = await this.server.create('vocabulary', {
      school: this.school,
    });
    this.term = await this.server.create('term', { vocabulary: this.vocabulary });
    await this.server.create('academic-year', {
      id: 2015,
      title: '2015 - 2016',
    });
    await this.server.create('academic-year', {
      id: 2016,
      title: '2016 - 2017',
    });
    await this.server.create('program', { school: this.school });
    this.firstCourse = await this.server.create('course', {
      school: this.school,
      year: 2015,
      externalId: 'Theoretical Phys Ed',
    });
    this.session = await this.server.create('session', {
      course: this.firstCourse,
      terms: [this.term],
    });
    this.secondCourse = await this.server.create('course', {
      school: this.school,
      year: 2016,
    });
    await this.server.create('session', {
      course: this.secondCourse,
      terms: [this.term],
    });
    await this.server.create('report', {
      title: 'my report 0',
      subject: 'session',
      prepositionalObject: 'course',
      prepositionalObjectTableRowId: `${this.firstCourse.id}`,
      user,
      school: this.school,
    });
    await this.server.create('report', {
      title: null,
      subject: 'session',
      prepositionalObject: 'term',
      prepositionalObjectTableRowId: `${this.term.id}`,
      user,
      school: this.school,
    });
    await this.server.create('mesh-descriptor', {
      id: 'D1234',
      courses: [this.firstCourse, this.secondCourse],
    });
  });

  test('shows reports', async function (assert) {
    await page.visitSubjectReports();
    await takeScreenshot(assert);
    assert.strictEqual(page.subjects.list.table.reports.length, 2);
    assert.strictEqual(
      page.subjects.list.table.reports[0].title,
      'All Sessions for Term term 0 in school 0',
    );
    assert.strictEqual(page.subjects.list.table.reports[1].title, 'my report 0');
  });

  test('create new report', async function (assert) {
    await page.visitSubjectReports();
    assert.strictEqual(page.subjects.list.table.reports.length, 2, 'report count is correct');
    assert.strictEqual(
      page.subjects.list.table.reports[0].title,
      'All Sessions for Term term 0 in school 0',
      'first report title is correct',
    );
    assert.strictEqual(
      page.subjects.list.table.reports[1].title,
      'my report 0',
      'second report title is correct',
    );
    assert.ok(
      page.subjects.list.newReportLinkIsHidden,
      'new report link notification is not displayed',
    );
    await page.subjects.list.toggleNewSubjectReportForm();
    await page.subjects.list.newSubject.title.set('aardvark');
    await page.subjects.list.newSubject.schools.choose('1');
    await page.subjects.list.newSubject.subjects.choose('session');
    await page.subjects.list.newSubject.objects.choose('course');
    await page.subjects.list.newSubject.course.input('cour');
    await page.subjects.list.newSubject.course.results[1].click();
    await takeScreenshot(assert, 'pre-save form');
    await page.subjects.list.newSubject.save();
    await takeScreenshot(assert, 'post-save form');
    assert.strictEqual(
      page.subjects.list.table.reports.length,
      3,
      'report count is correct after adding new report',
    );
    assert.strictEqual(
      page.subjects.list.table.reports[0].title,
      'aardvark',
      'new first report title is correct',
    );
    assert.strictEqual(
      page.subjects.list.table.reports[1].title,
      'All Sessions for Term term 0 in school 0',
      'changed second report title is correct',
    );
    assert.strictEqual(
      page.subjects.list.table.reports[2].title,
      'my report 0',
      'new third report title is correct',
    );
    assert.notOk(
      page.subjects.list.newReportLinkIsHidden,
      'new report link notification is displayed',
    );
    assert.strictEqual(
      page.subjects.list.newReportLink,
      'aardvark',
      'new report link has correct link title',
    );

    this.server.post('/api/graphql', async ({ request }) => {
      const { query } = await request.json();
      assert.step('API called');
      const { id, title } = this.session;
      const school = {
        id: this.school.id,
        title: this.school.title,
      };

      assert.strictEqual(
        query,
        'query { sessions(schools: [1], courses: [1]) { id, title, course { id, year, title, school { title } } } }',
        'graphql query is correct',
      );
      return {
        data: {
          sessions: [
            {
              id,
              title,
              course: {
                id: this.firstCourse.id,
                title: this.firstCourse.title,
                year: this.firstCourse.year,
                school,
              },
            },
          ],
        },
      };
    });
    await page.subjects.list.table.reports[0].select();
    await takeScreenshot(assert);

    assert.strictEqual(currentURL(), '/reports/subjects/3', 'current report url is correct');
    assert.strictEqual(
      subjectReportPage.report.title.text,
      'aardvark',
      'current report title is correct',
    );
    assert.strictEqual(subjectReportPage.report.results.length, 1);
    assert.strictEqual(subjectReportPage.report.results[0].text, 'course 0: session 0');
    assert.verifySteps(['API called']);
  });

  test('create new report with empty title', async function (assert) {
    await page.visitSubjectReports();
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
    await page.visitSubjectReports();
    assert.strictEqual(page.subjects.list.table.reports.length, 2);
    assert.strictEqual(
      page.subjects.list.table.reports[0].title,
      'All Sessions for Term term 0 in school 0',
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
      'All Sessions for Term term 0 in school 0',
    );
    assert.strictEqual(
      page.subjects.list.table.reports[1].title,
      'All Terms for Session session 1 (2016) in school 0',
    );
    assert.strictEqual(page.subjects.list.table.reports[2].title, 'my report 0');
    this.server.post('/api/graphql', async ({ request }) => {
      const { query } = await request.json();
      assert.step('API called');
      const { id, title } = this.term;

      assert.strictEqual(
        query,
        'query { terms(schools: [1], sessions: [2]) { id, title, vocabulary { id, title, school { title } } } }',
      );
      return {
        data: {
          terms: [
            { id, title, vocabulary: { id: this.vocabulary.id, title: this.vocabulary.title } },
          ],
        },
      };
    });
    await page.subjects.list.table.reports[1].select();
    assert.strictEqual(currentURL(), '/reports/subjects/3');
    assert.strictEqual(
      subjectReportPage.report.title.text,
      'All Terms for Session session 1 (2016) in school 0',
    );
    assert.strictEqual(subjectReportPage.report.results.length, 1);
    assert.strictEqual(subjectReportPage.report.results[0].text, 'Vocabulary 1 > term 0');
    assert.verifySteps(['API called']);
  });

  test('get all courses associated with mesh term #3419', async function (assert) {
    await page.visitSubjectReports();
    assert.strictEqual(page.subjects.list.table.reports.length, 2);
    assert.strictEqual(
      page.subjects.list.table.reports[0].title,
      'All Sessions for Term term 0 in school 0',
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
      'All Courses for MeSH Term descriptor 0 in school 0',
    );
    assert.strictEqual(
      page.subjects.list.table.reports[1].title,
      'All Sessions for Term term 0 in school 0',
    );
    assert.strictEqual(page.subjects.list.table.reports[2].title, 'my report 0');
    this.server.post('/api/graphql', async ({ request }) => {
      const { query } = await request.json();
      assert.step('API called');
      assert.strictEqual(
        query,
        'query { courses(schools: [1], ids: [1, 2]) { id, title, year, externalId, school { title } } }',
      );
      return {
        data: {
          courses: this.server.db.course.all().map(({ id, title, year, externalId }) => {
            return { id, title, year, externalId };
          }),
        },
      };
    });
    this.server.post('/api/graphql', async ({ request }) => {
      const { query } = await request.json();
      assert.step('API called');
      assert.strictEqual(
        query,
        'query { meshDescriptors(id: "D1234") { courses { id }, courseObjectives { course { id } }, sessions { course { id } }, sessionObjectives { session { course { id } } } } }',
      );
      return {
        data: {
          meshDescriptors: [
            {
              courses: this.server.db.course.all().map(({ id }) => {
                return { id };
              }),
              courseObjectives: [],
              sessions: [],
              sessionObjectives: [],
            },
          ],
        },
      };
    });
    await page.subjects.list.table.reports[0].select();
    assert.strictEqual(currentURL(), '/reports/subjects/3');
    assert.strictEqual(
      subjectReportPage.report.title.text,
      'All Courses for MeSH Term descriptor 0 in school 0',
    );
    assert.ok(subjectReportPage.report.academicYears.isVisible);
    assert.strictEqual(subjectReportPage.report.results.length, 2);
    assert.strictEqual(subjectReportPage.report.results[0].text, '2016 course 1');
    assert.strictEqual(
      subjectReportPage.report.results[1].text,
      '2015 course 0 (Theoretical Phys Ed)',
    );
    assert.verifySteps(['API called', 'API called']);
  });

  test('Prepositional object resets when a new type is selected', async function (assert) {
    await page.visitSubjectReports();
    assert.strictEqual(page.subjects.list.table.reports.length, 2);
    assert.strictEqual(
      page.subjects.list.table.reports[0].title,
      'All Sessions for Term term 0 in school 0',
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
      'All Sessions for Term term 0 in school 0',
    );
    assert.strictEqual(
      page.subjects.list.table.reports[1].title,
      'All Terms for Program program 0 in school 0',
    );
    assert.strictEqual(page.subjects.list.table.reports[2].title, 'my report 0');
  });

  test('course external id in report', async function (assert) {
    await page.visitSubjectReports();
    assert.strictEqual(page.subjects.list.table.reports.length, 2, 'report list count correct');
    assert.strictEqual(
      page.subjects.list.table.reports[0].title,
      'All Sessions for Term term 0 in school 0',
      'first report title correct',
    );
    assert.strictEqual(
      page.subjects.list.table.reports[1].title,
      'my report 0',
      'second report title correct',
    );
    await page.subjects.list.toggleNewSubjectReportForm();
    await page.subjects.list.newSubject.schools.choose('All Schools');
    await page.subjects.list.newSubject.subjects.choose('course');
    await page.subjects.list.newSubject.save();
    assert.strictEqual(page.subjects.list.table.reports.length, 3, 'report list count correct');
    assert.strictEqual(
      page.subjects.list.table.reports[0].title,
      'All Courses in All Schools',
      'first report title correct',
    );
    assert.strictEqual(
      page.subjects.list.table.reports[1].title,
      'All Sessions for Term term 0 in school 0',
      'second report title correct',
    );
    assert.strictEqual(
      page.subjects.list.table.reports[2].title,
      'my report 0',
      'third report title correct',
    );
    this.server.post('/api/graphql', async ({ request }) => {
      const { query } = await request.json();
      assert.step('API called');

      assert.strictEqual(
        query,
        'query { courses { id, title, year, externalId, school { title } } }',
      );
      return {
        data: {
          courses: this.server.db.course.all().map(({ id, title, year, externalId, school }) => {
            return { id, title, year, externalId, school: { id: school.id, title: school.title } };
          }),
        },
      };
    });
    await page.subjects.list.table.reports[0].select();

    assert.strictEqual(currentURL(), '/reports/subjects/3', 'report detail url correct');
    assert.strictEqual(
      subjectReportPage.report.title.text,
      'All Courses in All Schools',
      'report header title correct',
    );
    assert.strictEqual(subjectReportPage.report.results.length, 2, 'report results count correct');
    assert.strictEqual(
      subjectReportPage.report.results[0].text,
      'school 0: 2016 course 1',
      'second report result title correct',
    );
    assert.strictEqual(
      subjectReportPage.report.results[1].text,
      'school 0: 2015 course 0 (Theoretical Phys Ed)',
      'first report result title correct',
    );
    assert.verifySteps(['API called']);
  });

  test('delete report', async function (assert) {
    await page.visitSubjectReports();
    assert.strictEqual(page.subjects.list.table.reports.length, 2);
    assert.strictEqual(
      page.subjects.list.table.reports[0].title,
      'All Sessions for Term term 0 in school 0',
    );
    assert.strictEqual(page.subjects.list.table.reports[1].title, 'my report 0');
    await page.subjects.list.table.reports[0].remove();
    await page.subjects.list.table.confirmRemoval();
    assert.strictEqual(page.subjects.list.table.reports.length, 1);
    assert.strictEqual(page.subjects.list.table.reports[0].title, 'my report 0');
  });

  test('run subject report', async function (assert) {
    await page.visitSubjectReports();
    await page.subjects.list.toggleNewSubjectReportForm();
    await page.subjects.list.newSubject.schools.choose('1');
    await page.subjects.list.newSubject.subjects.choose('session');
    await page.subjects.list.newSubject.objects.choose('course');
    await page.subjects.list.newSubject.course.input('cour');
    await page.subjects.list.newSubject.course.results[1].click();
    this.server.post('/api/graphql', async ({ request }) => {
      const { query } = await request.json();
      assert.step('API called');
      const { id, title } = this.session;

      assert.strictEqual(
        query,
        'query { sessions(schools: [1], courses: [1]) { id, title, course { id, year, title, school { title } } } }',
      );
      return {
        data: {
          sessions: [
            {
              id,
              title,
              course: {
                id: this.firstCourse.id,
                title: this.firstCourse.title,
                year: this.firstCourse.year,
                school: { id: this.firstCourse.school.id, title: this.firstCourse.school.title },
              },
            },
          ],
        },
      };
    });
    await page.subjects.list.newSubject.run();
    await takeScreenshot(assert);
    assert.strictEqual(
      currentURL(),
      '/reports/subjects?selectedPrepositionalObject=course&selectedPrepositionalObjectId=1&selectedSchoolId=1&selectedSubject=session&showNewReportForm=true',
    );
    assert.strictEqual(
      page.subjects.results.description,
      'This report shows all Sessions associated with Course "course 0" (2015) in school 0. (1)',
    );
    assert.strictEqual(page.subjects.results.results.length, 1);
    assert.strictEqual(page.subjects.results.results[0].text, 'course 0: session 0');
    assert.verifySteps(['API called']);
  });

  test('reset year when subject report is run', async function (assert) {
    await page.visitSubjectReports();
    await page.subjects.list.toggleNewSubjectReportForm();
    await page.subjects.list.newSubject.schools.choose('1');
    await page.subjects.list.newSubject.subjects.choose('course');
    this.server.post('/api/graphql', async ({ request }) => {
      const { query } = await request.json();
      assert.step('API called');
      assert.strictEqual(
        query,
        'query { courses(schools: [1]) { id, title, year, externalId, school { title } } }',
        'has correct graphql query',
      );
      return {
        data: {
          courses: this.server.db.course.all().map(({ id, title, year, externalId }) => {
            return { id, title, year, externalId };
          }),
        },
      };
    });
    this.server.post('/api/graphql', async ({ request }) => {
      const { query } = await request.json();
      assert.step('API called');
      assert.strictEqual(
        query,
        'query { courses(schools: [1]) { id, title, year, externalId, school { title } } }',
        'has correct graphql query',
      );
      return {
        data: {
          courses: this.server.db.course.all().map(({ id, title, year, externalId }) => {
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
    assert.strictEqual(page.subjects.runSubject.results.results[0].text, '2016 course 1');
    assert.strictEqual(
      page.subjects.runSubject.results.results[1].text,
      '2015 course 0 (Theoretical Phys Ed)',
    );
    assert.ok(page.subjects.runSubject.header.academicYears.isVisible);
    await page.subjects.runSubject.header.academicYears.choose('2016');
    assert.strictEqual(page.subjects.runSubject.results.results.length, 1);
    assert.strictEqual(page.subjects.runSubject.results.results[0].text, 'course 1');
    await page.subjects.list.newSubject.run();
    assert.strictEqual(page.subjects.runSubject.results.results.length, 2);
    assert.strictEqual(page.subjects.runSubject.results.results[0].text, '2016 course 1');
    assert.strictEqual(
      page.subjects.runSubject.results.results[1].text,
      '2015 course 0 (Theoretical Phys Ed)',
    );
    assert.verifySteps(['API called', 'API called']);
  });

  test('remove report title', async function (assert) {
    await page.visitSubjectReports();
    this.server.post('/api/graphql', () => {
      assert.step('API called');
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
      'All Sessions for Course course 0 (2015) in school 0',
    );
    await page.visitSubjectReports();

    assert.strictEqual(page.subjects.list.table.reports.length, 2);
    assert.strictEqual(
      page.subjects.list.table.reports[0].title,
      'All Sessions for Course course 0 (2015) in school 0',
    );
    assert.strictEqual(
      page.subjects.list.table.reports[1].title,
      'All Sessions for Term term 0 in school 0',
    );
    assert.verifySteps(['API called']);
  });

  test('create new report for instructors by academic year #3594', async function (assert) {
    await this.server.createList('user', 3);
    await page.visitSubjectReports();
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
      'All Instructors for Academic Year 2015 - 2016 in school 0',
    );
    assert.strictEqual(
      page.subjects.list.newReportLink,
      'All Instructors for Academic Year 2015 - 2016 in school 0',
    );

    this.server.post('/api/graphql', async ({ request }) => {
      const { query } = await request.json();
      const users = this.server.db.user
        .all()
        .map(({ id, firstName, middleName, lastName, displayName }) => {
          return { id, firstName, middleName, lastName, displayName };
        });
      assert.step('API called');
      assert.ok(query.includes('query { courses(ids: [1,31])'));
      return {
        data: {
          courses: [{ sessions: [{ offerings: [{ instructors: users, instructorGroups: [] }] }] }],
        },
      };
    });

    this.server.post('/api/graphql', async ({ request }) => {
      const { query } = await request.json();
      assert.strictEqual(
        query,
        'query { courses(schools: [1], academicYears: [2015]) { id, school { title } } }',
      );
      assert.step('API called');
      return {
        data: {
          courses: [{ id: 1 }, { id: 31 }],
        },
      };
    });
    await page.subjects.list.table.reports[0].select();
    assert.strictEqual(currentURL(), '/reports/subjects/3');
    assert.strictEqual(
      subjectReportPage.report.title.text,
      'All Instructors for Academic Year 2015 - 2016 in school 0',
    );
    assert.strictEqual(subjectReportPage.report.results.length, 4);
    assert.strictEqual(subjectReportPage.report.results[0].text, '0 guy M. Mc0son');
    assert.strictEqual(subjectReportPage.report.results[1].text, '1 guy M. Mc1son');
    assert.strictEqual(subjectReportPage.report.results[2].text, '2 guy M. Mc2son');
    assert.strictEqual(subjectReportPage.report.results[3].text, '3 guy M. Mc3son');
    assert.verifySteps(['API called', 'API called']);
  });

  test('courses by academic year hides year', async function (assert) {
    await page.visitSubjectReports();
    await page.subjects.list.toggleNewSubjectReportForm();
    await page.subjects.list.newSubject.schools.choose('');
    await page.subjects.list.newSubject.subjects.choose('course');
    await page.subjects.list.newSubject.objects.choose('academic year');
    await page.subjects.list.newSubject.prepositionalObjects.choose('2015');
    await page.subjects.list.newSubject.save();
    this.server.post('/api/graphql', async ({ request }) => {
      const { query } = await request.json();
      assert.step('API called');
      assert.strictEqual(
        query,
        'query { courses(academicYears: [2015]) { id, title, year, externalId, school { title } } }',
      );
      const coursesIn2015 = this.server.db.course.all().filter(({ year }) => year === 2015);
      return {
        data: {
          courses: coursesIn2015.map(({ id, title, year, externalId, school }) => {
            return { id, title, year, externalId, school: { id: school.id, title: school.title } };
          }),
        },
      };
    });
    await page.subjects.list.table.reports[0].select();
    assert.strictEqual(currentURL(), '/reports/subjects/3', 'report detail URL is correct');
    assert.notOk(
      subjectReportPage.report.academicYears.isVisible,
      'academic years dropdown is visible',
    );
    assert.strictEqual(subjectReportPage.report.results.length, 1);
    assert.strictEqual(
      subjectReportPage.report.results[0].text,
      'school 0: course 0 (Theoretical Phys Ed)',
    );
    assert.verifySteps(['API called']);
  });
});
