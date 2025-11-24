import { currentURL } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';
import page from 'frontend/tests/pages/reports-subject';
import { setupApplicationTest, takeScreenshot } from 'frontend/tests/helpers';
import percySnapshot from '@percy/ember';

module('Acceptance | Reports - Subject Report', function (hooks) {
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
    const courseReport = this.server.create('report', {
      title: 'my report 0',
      subject: 'session',
      prepositionalObject: 'course',
      prepositionalObjectTableRowId: firstCourse.id,
      user,
      school,
    });
    const termReport = this.server.create('report', {
      title: null,
      subject: 'session',
      prepositionalObject: 'term',
      prepositionalObjectTableRowId: term.id,
      user,
      school,
    });
    const courseNoTitleReport = this.server.create('report', {
      subject: 'session',
      prepositionalObject: 'course',
      prepositionalObjectTableRowId: firstCourse.id,
      user,
      school,
    });
    const store = this.owner.lookup('service:store');
    this.courseReport = await store.findRecord('report', courseReport.id);
    this.courseNoTitleReport = await store.findRecord('report', courseNoTitleReport.id);
    this.termReport = await this.owner.lookup('service:store').findRecord('report', termReport.id);

    this.getReportData = async (sessionIds) => {
      const sessions = await store.findAll('session');
      const courses = await store.findAll('course');
      const reportData = sessions
        .filter(({ id }) => sessionIds.includes(id))
        .map((m) => {
          const course = courses.find(({ id }) => id == m.belongsTo('course').id());
          return {
            id: m.id,
            title: m.title,
            course: {
              id: course.id,
              title: course.title,
              year: course.year,
              school: school,
            },
          };
        });

      return { data: { sessions: reportData } };
    };
    this.server.post('api/graphql', async () => this.getReportData(['1', '2']));
  });

  test('course report works', async function (assert) {
    this.server.post('api/graphql', async () => {
      assert.step('API called');
      return this.getReportData(['1']);
    });
    await page.visit({ reportId: this.courseReport.id });
    await takeScreenshot(assert);
    await percySnapshot(assert);
    assert.strictEqual(currentURL(), '/reports/subjects/1');
    assert.strictEqual(page.report.title.text, 'my report 0');
    assert.strictEqual(page.report.results.length, 1);
    assert.strictEqual(page.report.results[0].text, 'course 0: session 0');
    assert.verifySteps(['API called']);
  });

  test('term report works', async function (assert) {
    await page.visit({ reportId: this.termReport.id });
    await takeScreenshot(assert);
    await percySnapshot(assert);
    assert.strictEqual(currentURL(), '/reports/subjects/2');
    assert.strictEqual(page.report.title.text, 'All Sessions for Term term 0 in school 0');
    assert.strictEqual(
      page.report.description,
      'This report shows all Sessions associated with Term "term 0" in school 0. (2)',
    );
    assert.strictEqual(page.report.results.length, 2);
    assert.strictEqual(page.report.results[0].text, '2016 course 1: session 1');
    assert.strictEqual(page.report.results[1].text, '2015 course 0: session 0');
  });

  test('academic years is shown as range as applicable by configuration', async function (assert) {
    const { apiVersion } = this.owner.resolveRegistration('config:environment');
    this.server.get('application/config', function () {
      assert.step('API called');
      return {
        config: {
          academicYearCrossesCalendarYearBoundaries: true,
          apiVersion,
        },
      };
    });
    await page.visit({ reportId: this.termReport.id });
    assert.strictEqual(page.report.results[0].text, '2016 - 2017 course 1: session 1');
    assert.strictEqual(page.report.results[1].text, '2015 - 2016 course 0: session 0');
    assert.verifySteps(['API called']);
  });

  test('no academic years filter on reports with a course prepositional object', async function (assert) {
    await page.visit({ reportId: this.courseReport.id });
    assert.notOk(page.report.academicYears.isVisible);
  });

  test('academic year filter works', async function (assert) {
    this.server.post('api/graphql', async () => {
      assert.step('API called');
      return this.getReportData(['1', '2']);
    });
    await page.visit({ reportId: this.termReport.id });
    assert.strictEqual(currentURL(), '/reports/subjects/2');
    assert.strictEqual(page.report.results.length, 2);
    assert.strictEqual(page.report.results[0].text, '2016 course 1: session 1');
    assert.strictEqual(page.report.results[1].text, '2015 course 0: session 0');
    await page.report.academicYears.choose('2016');
    assert.strictEqual(page.report.results.length, 1);
    assert.strictEqual(page.report.results[0].text, 'course 1: session 1');
    assert.strictEqual(currentURL(), '/reports/subjects/2?reportYear=2016');
    assert.verifySteps(['API called']);
  });

  test('copy report button works with auto-generated title', async function (assert) {
    this.server.post('api/graphql', async () => {
      assert.step('API called');
      return this.getReportData(['1', '2']);
    });
    await page.visit({ reportId: this.courseNoTitleReport.id });
    await page.report.copy.button.click();
    assert.strictEqual(
      currentURL(),
      '/reports/subjects?selectedPrepositionalObject=course&selectedPrepositionalObjectId=1&selectedSchoolId=1&selectedSubject=session&showNewReportForm=true&title=All%20Sessions%20for%20Course%20course%200%20(2015)%20in%20school%200%20(Copy)',
    );
    assert.verifySteps(['API called']);
  });

  test('copy report button works with custom title', async function (assert) {
    this.server.post('api/graphql', async () => {
      assert.step('API called');
      return this.getReportData(['1', '2']);
    });
    await page.visit({ reportId: this.courseReport.id });
    await page.report.copy.button.click();
    assert.strictEqual(
      currentURL(),
      '/reports/subjects?selectedPrepositionalObject=course&selectedPrepositionalObjectId=1&selectedSchoolId=1&selectedSubject=session&showNewReportForm=true&title=my%20report%200%20(Copy)',
    );
    assert.verifySteps(['API called']);
  });
});
