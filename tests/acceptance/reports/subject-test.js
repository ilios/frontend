import { currentURL } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';
import page from 'ilios/tests/pages/reports-subject';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Reports - Subject Report', function (hooks) {
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
    const store = this.owner.lookup('service:store');
    this.courseReport = await store.findRecord('report', courseReport.id);
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
            },
          };
        });

      return { data: { sessions: reportData } };
    };
    this.server.post('api/graphql', async () => this.getReportData(['1', '2']));
  });

  test('course report works', async function (assert) {
    this.server.post('api/graphql', async () => this.getReportData(['1']));
    await page.visit({ reportId: this.courseReport.id });
    assert.strictEqual(currentURL(), '/reports/subjects/1');
    assert.strictEqual(page.report.title, 'my report 0');
    assert.strictEqual(page.report.results.length, 1);
    assert.strictEqual(page.report.results[0].text, 'course 0: session 0');
  });

  test('term report works', async function (assert) {
    await page.visit({ reportId: this.termReport.id });
    assert.strictEqual(currentURL(), '/reports/subjects/2');
    assert.strictEqual(page.report.title, 'All Sessions for term 0 in school 0');
    assert.strictEqual(page.report.results.length, 2);
    assert.strictEqual(page.report.results[0].text, '2015 course 0: session 0');
    assert.strictEqual(page.report.results[1].text, '2016 course 1: session 1');
  });

  test('academic years is shown as range as applicable by configuration', async function (assert) {
    const { apiVersion } = this.owner.resolveRegistration('config:environment');
    this.server.get('application/config', function () {
      return {
        config: {
          academicYearCrossesCalendarYearBoundaries: true,
          apiVersion,
        },
      };
    });
    await page.visit({ reportId: this.termReport.id });
    assert.strictEqual(page.report.results[0].text, '2015 - 2016 course 0: session 0');
    assert.strictEqual(page.report.results[1].text, '2016 - 2017 course 1: session 1');
  });

  test('no academic years filter on reports with a course prepositional object', async function (assert) {
    await page.visit({ reportId: this.courseReport.id });
    assert.notOk(page.report.academicYears.isVisible);
  });

  test('academic year filter works', async function (assert) {
    this.server.post('api/graphql', async () => this.getReportData(['1', '2']));
    await page.visit({ reportId: this.termReport.id });
    assert.strictEqual(currentURL(), '/reports/subjects/2');
    assert.strictEqual(page.report.results.length, 2);
    assert.strictEqual(page.report.results[0].text, '2015 course 0: session 0');
    assert.strictEqual(page.report.results[1].text, '2016 course 1: session 1');
    await page.report.academicYears.choose('2016');
    assert.strictEqual(page.report.results.length, 1);
    assert.strictEqual(page.report.results[0].text, 'course 1: session 1');
    assert.strictEqual(currentURL(), '/reports/subjects/2?reportYear=2016');
  });
});
