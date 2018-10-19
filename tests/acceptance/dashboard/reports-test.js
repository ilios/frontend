import { currentRouteName } from '@ember/test-helpers';
import {
  module,
  test
} from 'qunit';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';
import page from 'ilios-common/page-objects/dashboard';

import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Dashboard Reports', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const school = this.server.create('school');
    const user = await setupAuthentication( { school } );
    const vocabulary = this.server.create('vocabulary');
    const term = this.server.create('term', { vocabulary });
    this.server.create('academic-year', {
      id: 2015
    });
    this.server.create('academic-year', {
      id: 2016
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
  });

  test('visiting /dashboard', async function(assert) {
    await page.visit();
    assert.equal(currentRouteName(), 'dashboard');
  });

  test('shows reports', async function(assert) {
    await page.visit();
    assert.equal(page.myReports.reports().count, 2);
    assert.equal(page.myReports.reports(0).title, 'All Sessions for term 0 in school 0');
    assert.equal(page.myReports.reports(1).title, 'my report 0');
  });

  test('first report works', async function(assert) {
    await page.visit();
    assert.equal(page.myReports.reports().count, 2);
    await page.myReports.reports(1).select();
    assert.equal(page.myReports.selectedReport.title, 'my report 0');
    assert.equal(page.myReports.selectedReport.results().count, 1);
    assert.equal(page.myReports.selectedReport.results(0).text, '2015 - 2016 course 0 session 0');
  });

  test('no year filter on reports with a course prepositional object', async function(assert) {
    await page.visit();
    assert.equal(page.myReports.reports().count, 2);
    await page.myReports.reports(1).select();
    assert.equal(page.myReports.selectedReport.title, 'my report 0');
    assert.notOk(page.myReports.selectedReport.yearsFilterExists);
  });

  test('second report works', async function (assert) {
    await page.visit();
    assert.equal(page.myReports.reports().count, 2);
    await page.myReports.reports(0).select();
    assert.equal(page.myReports.selectedReport.title, 'All Sessions for term 0 in school 0');
    assert.equal(page.myReports.selectedReport.results().count, 2);
    assert.equal(page.myReports.selectedReport.results(0).text, '2015 - 2016 course 0 session 0');
    assert.equal(page.myReports.selectedReport.results(1).text, '2016 - 2017 course 1 session 1');
  });

  test('year filter works', async function (assert) {
    await page.visit();
    assert.equal(page.myReports.reports().count, 2);
    await page.myReports.reports(0).select();
    assert.equal(page.myReports.selectedReport.title, 'All Sessions for term 0 in school 0');
    assert.ok(page.myReports.selectedReport.yearsFilterExists);
    assert.equal(page.myReports.selectedReport.results().count, 2);
    await page.myReports.selectedReport.chooseYear('2016');
    assert.equal(page.myReports.selectedReport.results().count, 1);
    assert.equal(page.myReports.selectedReport.results(0).text, '2016 - 2017 course 1 session 1');
  });

  test('create new report', async function (assert) {
    await page.visit();
    assert.equal(page.myReports.reports().count, 2);
    await page.myReports.addNewReport();
    await page.myReports.newReport.setTitle('New Report');
    await page.myReports.newReport.chooseSchool('1');
    await page.myReports.newReport.chooseSubject('session');
    await page.myReports.newReport.chooseObjectType('course');
    await page.myReports.newReport.chooseObject('1');
    await page.myReports.newReport.save();

    assert.equal(page.myReports.reports().count, 3);
    await page.myReports.reports(2).select();

    assert.equal(page.myReports.selectedReport.title, 'New Report');
    assert.equal(page.myReports.selectedReport.results().count, 1);
    assert.equal(page.myReports.selectedReport.results(0).text, '2015 - 2016 course 0 session 0');
  });

  test('filter courses by year in new report form', async function (assert) {
    await page.visit();
    assert.equal(page.myReports.reports().count, 2);
    await page.myReports.addNewReport();

    await page.myReports.newReport.chooseSchool('1');
    await page.myReports.newReport.chooseSubject('session');
    await page.myReports.newReport.chooseObjectType('course');
    assert.equal(page.myReports.newReport.objectCount, 2);
    await page.myReports.newReport.chooseAcademicYear('2016');
    assert.equal(page.myReports.newReport.objectCount, 1);
    await page.myReports.newReport.chooseObject('2');
    await page.myReports.newReport.save();

    assert.equal(page.myReports.reports().count, 3);
    await page.myReports.reports(1).select();

    assert.equal(page.myReports.selectedReport.title, 'All Sessions for course 1 in school 0');
    assert.equal(page.myReports.selectedReport.results().count, 1);
    assert.equal(page.myReports.selectedReport.results(0).text, '2016 - 2017 course 1 session 1');
  });

  test('filter session by year in new report form', async function (assert) {
    await page.visit();
    assert.equal(page.myReports.reports().count, 2);
    await page.myReports.addNewReport();

    await page.myReports.newReport.chooseSchool('1');
    await page.myReports.newReport.chooseSubject('term');
    await page.myReports.newReport.chooseObjectType('session');
    assert.equal(page.myReports.newReport.objectCount, 2);
    await page.myReports.newReport.chooseAcademicYear('2016');
    assert.equal(page.myReports.newReport.objectCount, 1);
    await page.myReports.newReport.chooseObject('2');
    await page.myReports.newReport.save();

    assert.equal(page.myReports.reports().count, 3);
    await page.myReports.reports(1).select();

    assert.equal(page.myReports.selectedReport.title, 'All Terms for session 1 in school 0');
    assert.equal(page.myReports.selectedReport.results().count, 1);
    assert.equal(page.myReports.selectedReport.results(0).text, 'Vocabulary 1 > term 0');
  });

  test('get all courses associated with mesh term #3419', async function (assert) {
    this.server.create('mesh-descriptor', {
      id: 'D1234',
      courseIds: [1, 2]
    });
    await page.visit();
    assert.equal(page.myReports.reports().count, 2);
    await page.myReports.addNewReport();

    await page.myReports.newReport.chooseSchool('1');
    await page.myReports.newReport.chooseSubject('course');
    await page.myReports.newReport.chooseObjectType('mesh term');
    await page.myReports.newReport.fillMeshSearch('0');
    await page.myReports.newReport.runMeshSearch();
    assert.equal(page.myReports.newReport.meshSearchResults().count, 1);
    assert.equal(page.myReports.newReport.meshSearchResults(0).text, 'descriptor 0 D1234');
    await page.myReports.newReport.meshSearchResults(0).pick();
    await page.myReports.newReport.save();

    assert.equal(page.myReports.reports().count, 3);
    await page.myReports.reports(1).select();

    assert.equal(page.myReports.selectedReport.title, 'All Courses for descriptor 0 in school 0');
    assert.equal(page.myReports.selectedReport.results().count, 2);
    assert.equal(page.myReports.selectedReport.results(0).text, '2015 - 2016 course 0 (Theoretical Phys Ed)');
    assert.equal(page.myReports.selectedReport.results(1).text, '2016 - 2017 course 1');
  });

  test('Prepositional object resets when a new type is selected', async function (assert) {
    this.server.create('course', {
      year: '2016',
      schoolId: 1
    });
    await page.visit();
    assert.equal(page.myReports.reports().count, 2);
    await page.myReports.addNewReport();

    await page.myReports.newReport.chooseSchool('1');
    await page.myReports.newReport.chooseSubject('term');
    await page.myReports.newReport.chooseObjectType('session');
    await page.myReports.newReport.chooseObject('2');
    await page.myReports.newReport.chooseObjectType('course');
    await page.myReports.newReport.save();

    assert.equal(page.myReports.reports().count, 3);
    await page.myReports.reports(1).select();
    assert.equal(page.myReports.selectedReport.title, 'All Terms for course 0 in school 0');
  });

  test('Report Selector with Academic Year not selecting correct predicate #3427', async function (assert) {
    this.server.create('course', {
      year: '2016',
      schoolId: 1
    });
    await page.visit();
    assert.equal(page.myReports.reports().count, 2);
    await page.myReports.addNewReport();

    await page.myReports.newReport.chooseSchool('1');
    await page.myReports.newReport.chooseSubject('term');
    await page.myReports.newReport.chooseObjectType('course');
    await page.myReports.newReport.chooseAcademicYear('2016');
    await page.myReports.newReport.save();

    assert.equal(page.myReports.reports().count, 3);
    await page.myReports.reports(1).select();
    assert.equal(page.myReports.selectedReport.title, 'All Terms for course 1 in school 0');
  });

  test('course external Id in report', async function (assert) {
    await page.visit();
    assert.equal(page.myReports.reports().count, 2);
    await page.myReports.addNewReport();
    await page.myReports.newReport.chooseSchool('All Schools');
    await page.myReports.newReport.chooseSubject('course');
    await page.myReports.newReport.save();

    assert.equal(page.myReports.reports().count, 3);
    await page.myReports.reports(1).select();

    assert.equal(page.myReports.selectedReport.title, 'All Courses in All Schools');
    assert.equal(page.myReports.selectedReport.results().count, 2);
    assert.equal(page.myReports.selectedReport.results(0).text, '2015 - 2016 course 0 (Theoretical Phys Ed)');
    assert.equal(page.myReports.selectedReport.results(1).text, '2016 - 2017 course 1');
  });
});
