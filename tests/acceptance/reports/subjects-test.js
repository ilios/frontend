import { currentRouteName, currentURL } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';
import page from 'ilios/tests/pages/reports-subjects';
import reportPage from 'ilios/tests/pages/reports-subject';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

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

  test('visiting /reports/subjects', async function (assert) {
    await page.visit();
    assert.strictEqual(currentRouteName(), 'reports.subjects');
  });

  test('shows reports', async function (assert) {
    await page.visit();
    assert.strictEqual(page.reports.reports.length, 2);
    assert.strictEqual(page.reports.reports[0].title, 'All Sessions for term 0 in school 0');
    assert.strictEqual(page.reports.reports[1].title, 'my report 0');
  });

  test('create new report', async function (assert) {
    await page.visit();
    assert.strictEqual(page.reports.reports.length, 2);
    assert.strictEqual(page.reports.reports[0].title, 'All Sessions for term 0 in school 0');
    assert.strictEqual(page.reports.reports[1].title, 'my report 0');
    await page.reports.newReportFormToggle.click();
    await page.reports.newReport.title.set('aardvark');
    await page.reports.newReport.schools.choose('1');
    await page.reports.newReport.subjects.choose('session');
    await page.reports.newReport.objects.choose('course');
    await page.reports.newReport.prepositionalObjects.choose('1');
    await page.reports.newReport.save();
    assert.strictEqual(page.reports.reports.length, 3);
    assert.strictEqual(page.reports.reports[0].title, 'aardvark');
    assert.strictEqual(page.reports.reports[1].title, 'All Sessions for term 0 in school 0');
    assert.strictEqual(page.reports.reports[2].title, 'my report 0');
    await page.reports.reports[0].select();
    assert.strictEqual(currentURL(), '/reports/subjects/3');
    assert.strictEqual(reportPage.report.title, 'aardvark');
    assert.strictEqual(reportPage.report.results.length, 1);
    assert.strictEqual(reportPage.report.results[0].text, '2015 course 0 session 0');
  });

  test('filter courses by year in new report form', async function (assert) {
    await page.visit();
    assert.strictEqual(page.reports.reports.length, 2);
    assert.strictEqual(page.reports.reports[0].title, 'All Sessions for term 0 in school 0');
    assert.strictEqual(page.reports.reports[1].title, 'my report 0');
    await page.reports.newReportFormToggle.click();
    await page.reports.newReport.schools.choose('1');
    await page.reports.newReport.subjects.choose('session');
    await page.reports.newReport.objects.choose('course');
    assert.strictEqual(page.reports.newReport.prepositionalObjects.items.length, 2);
    await page.reports.newReport.academicYears.choose('2016');
    assert.strictEqual(page.reports.newReport.prepositionalObjects.items.length, 1);
    await page.reports.newReport.prepositionalObjects.choose('2');
    await page.reports.newReport.save();
    assert.strictEqual(page.reports.reports.length, 3);
    assert.strictEqual(page.reports.reports[0].title, 'All Sessions for course 1 in school 0');
    assert.strictEqual(page.reports.reports[1].title, 'All Sessions for term 0 in school 0');
    assert.strictEqual(page.reports.reports[2].title, 'my report 0');
    await page.reports.reports[0].select();
    assert.strictEqual(currentURL(), '/reports/subjects/3');
    assert.strictEqual(reportPage.report.title, 'All Sessions for course 1 in school 0');
    assert.strictEqual(reportPage.report.results.length, 1);
    assert.strictEqual(reportPage.report.results[0].text, '2016 course 1 session 1');
  });

  test('filter session by year in new report form', async function (assert) {
    await page.visit();
    assert.strictEqual(page.reports.reports.length, 2);
    assert.strictEqual(page.reports.reports[0].title, 'All Sessions for term 0 in school 0');
    assert.strictEqual(page.reports.reports[1].title, 'my report 0');
    await page.reports.newReportFormToggle.click();
    await page.reports.newReport.schools.choose('1');
    await page.reports.newReport.subjects.choose('term');
    await page.reports.newReport.objects.choose('session');
    assert.strictEqual(page.reports.newReport.prepositionalObjects.items.length, 2);
    await page.reports.newReport.academicYears.choose('2016');
    assert.strictEqual(page.reports.newReport.prepositionalObjects.items.length, 1);
    await page.reports.newReport.prepositionalObjects.choose('2');
    await page.reports.newReport.save();
    assert.strictEqual(page.reports.reports.length, 3);
    assert.strictEqual(page.reports.reports[0].title, 'All Sessions for term 0 in school 0');
    assert.strictEqual(page.reports.reports[1].title, 'All Terms for session 1 in school 0');
    assert.strictEqual(page.reports.reports[2].title, 'my report 0');
    await page.reports.reports[1].select();
    assert.strictEqual(currentURL(), '/reports/subjects/3');
    assert.strictEqual(reportPage.report.title, 'All Terms for session 1 in school 0');
    assert.strictEqual(reportPage.report.results.length, 1);
    assert.strictEqual(reportPage.report.results[0].text, 'Vocabulary 1 > term 0');
  });

  test('get all courses associated with mesh term #3419', async function (assert) {
    await page.visit();
    assert.strictEqual(page.reports.reports.length, 2);
    assert.strictEqual(page.reports.reports[0].title, 'All Sessions for term 0 in school 0');
    assert.strictEqual(page.reports.reports[1].title, 'my report 0');
    await page.reports.newReportFormToggle.click();
    await page.reports.newReport.schools.choose('1');
    await page.reports.newReport.subjects.choose('course');
    await page.reports.newReport.objects.choose('mesh term');
    await page.reports.newReport.mesh.manager.search.set('descriptor 0');
    assert.strictEqual(page.reports.newReport.mesh.manager.searchResults.length, 1);
    await page.reports.newReport.mesh.manager.searchResults[0].add();
    await page.reports.newReport.save();
    assert.strictEqual(page.reports.reports.length, 3);
    assert.strictEqual(page.reports.reports[0].title, 'All Courses for descriptor 0 in school 0');
    assert.strictEqual(page.reports.reports[1].title, 'All Sessions for term 0 in school 0');
    assert.strictEqual(page.reports.reports[2].title, 'my report 0');
    await page.reports.reports[0].select();
    assert.strictEqual(currentURL(), '/reports/subjects/3');
    assert.strictEqual(reportPage.report.title, 'All Courses for descriptor 0 in school 0');
    assert.strictEqual(reportPage.report.results.length, 2);
    assert.strictEqual(reportPage.report.results[0].text, '2015 course 0 (Theoretical Phys Ed)');
    assert.strictEqual(reportPage.report.results[1].text, '2016 course 1');
  });

  test('Prepositional object resets when a new type is selected', async function (assert) {
    await page.visit();
    assert.strictEqual(page.reports.reports.length, 2);
    assert.strictEqual(page.reports.reports[0].title, 'All Sessions for term 0 in school 0');
    assert.strictEqual(page.reports.reports[1].title, 'my report 0');
    await page.reports.newReportFormToggle.click();
    await page.reports.newReport.schools.choose('1');
    await page.reports.newReport.subjects.choose('term');
    await page.reports.newReport.objects.choose('session');
    await page.reports.newReport.prepositionalObjects.choose('2');
    await page.reports.newReport.objects.choose('course');
    await page.reports.newReport.save();
    assert.strictEqual(page.reports.reports.length, 3);
    assert.strictEqual(page.reports.reports[0].title, 'All Sessions for term 0 in school 0');
    assert.strictEqual(page.reports.reports[1].title, 'All Terms for course 0 in school 0');
    assert.strictEqual(page.reports.reports[2].title, 'my report 0');
  });

  test('Report Selector with Academic Year not selecting correct predicate #3427', async function (assert) {
    await page.visit();
    assert.strictEqual(page.reports.reports.length, 2);
    assert.strictEqual(page.reports.reports[0].title, 'All Sessions for term 0 in school 0');
    assert.strictEqual(page.reports.reports[1].title, 'my report 0');
    await page.reports.newReportFormToggle.click();
    await page.reports.newReport.schools.choose('1');
    await page.reports.newReport.subjects.choose('term');
    await page.reports.newReport.objects.choose('course');
    await page.reports.newReport.academicYears.choose('2016');
    await page.reports.newReport.save();
    assert.strictEqual(page.reports.reports.length, 3);
    assert.strictEqual(page.reports.reports[0].title, 'All Sessions for term 0 in school 0');
    assert.strictEqual(page.reports.reports[1].title, 'All Terms for course 1 in school 0');
    assert.strictEqual(page.reports.reports[2].title, 'my report 0');
  });

  test('course external Id in report', async function (assert) {
    await page.visit();
    assert.strictEqual(page.reports.reports.length, 2);
    assert.strictEqual(page.reports.reports[0].title, 'All Sessions for term 0 in school 0');
    assert.strictEqual(page.reports.reports[1].title, 'my report 0');
    await page.reports.newReportFormToggle.click();
    await page.reports.newReport.schools.choose('All Schools');
    await page.reports.newReport.subjects.choose('course');
    await page.reports.newReport.save();
    assert.strictEqual(page.reports.reports.length, 3);
    assert.strictEqual(page.reports.reports[0].title, 'All Courses in All Schools');
    assert.strictEqual(page.reports.reports[1].title, 'All Sessions for term 0 in school 0');
    assert.strictEqual(page.reports.reports[2].title, 'my report 0');
    await page.reports.reports[0].select();
    assert.strictEqual(currentURL(), '/reports/subjects/3');
    assert.strictEqual(reportPage.report.title, 'All Courses in All Schools');
    assert.strictEqual(reportPage.report.results.length, 2);
    assert.strictEqual(reportPage.report.results[0].text, '2015 course 0 (Theoretical Phys Ed)');
    assert.strictEqual(reportPage.report.results[1].text, '2016 course 1');
  });

  test('delete report', async function (assert) {
    await page.visit();
    assert.strictEqual(page.reports.reports.length, 2);
    assert.strictEqual(page.reports.reports[0].title, 'All Sessions for term 0 in school 0');
    assert.strictEqual(page.reports.reports[1].title, 'my report 0');
    await page.reports.reports[0].remove();
    assert.strictEqual(page.reports.reports.length, 1);
    assert.strictEqual(page.reports.reports[0].title, 'my report 0');
  });
});
