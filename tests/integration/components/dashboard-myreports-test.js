import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { component } from 'ilios/tests/pages/components/dashboard-myreports';

module('Integration | Component | dashboard myreports', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    this.user = this.server.create('user');
    const jwtObject = {
      'user_id': this.user.id
    };
    let encodedData = window.btoa('') + '.' + window.btoa(JSON.stringify(jwtObject)) + '.';
    await authenticateSession({
      jwt: encodedData
    });
  });

  test('list reports', async function(assert) {
    assert.expect(4);
    const course = this.server.create('course');
    const session = this.server.create('session', {
      course
    });
    this.server.create('report', {
      title: 'report 0',
      subject: 'courses',
      user: this.user,
    });
    this.server.create('report', {
      title: 'report 1',
      subject: 'courses',
      prepositionalObject: 'session',
      prepositionalObjectTableRowId: session.id,
      user: this.user,
    });
    this.setProperties({ selectedReport: null, selectedYear: '' });
    this.setProperties({ setReport: () => {}, setReportYear: () => {} });
    await render(hbs`<DashboardMyreports
      @selectedReport={{this.selectedReport}}
      @selectedYear={{this.selectedYear}}
      @onReportSelect={{action this.setReport}}
      @onReportYearSelect={{action this.setReportYear}}
    />`);
    assert.equal(component.title, 'My Reports');
    assert.equal(component.reports.length, 2);
    assert.equal(component.reports[0].title, 'report 0');
    assert.equal(component.reports[1].title, 'report 1');
  });

  test('display none when no reports', async function(assert) {
    assert.expect(3);
    await render(hbs`<DashboardMyreports />`);
    assert.equal(component.title, 'My Reports');
    assert.equal(component.reports.length, 1);
    assert.equal(component.reports[0].title, 'None');
  });

  test('year filter works', async function(assert) {
    assert.expect(9);
    this.server.create('academic-year', {
      id: 2015
    });
    this.server.create('academic-year', {
      id: 2016
    });
    const school = this.server.create('school');
    this.server.create('course', {
      school,
      year: 2015,
    });
    this.server.create('course', {
      school,
      year: 2016,
    });
    const report = this.server.create('report', {
      title: 'my report 0',
      subject: 'course',
      prepositionalObject: 'school',
      prepositionalObjectTableRowId: school.id,
      user: this.user,
      school,
    });
    //override default hander to just return all courses
    this.server.get('api/courses', (schema) => {
      return schema.courses.all();
    });

    this.setProperties({ selectedReport: null, selectedYear: '' });
    this.set('setReport', (reportId) => {
      this.set('selectedReport', report);
      assert.equal(reportId, '1', 'report id bubbles up for query params');
    });
    this.set('setReportYear', (year) => {
      this.set('selectedYear', year);
      assert.equal(year, '2016', 'report year bubbles up for query params');
    });
    await render(hbs`<DashboardMyreports
      @selectedReport={{this.selectedReport}}
      @selectedYear={{this.selectedYear}}
      @onReportSelect={{action this.setReport}}
      @onReportYearSelect={{action this.setReportYear}}
    />`);
    assert.equal(component.title, 'My Reports');
    assert.equal(component.reports.length, 1);
    assert.equal(component.reports[0].title, 'my report 0');
    await component.reports[0].select();
    assert.ok(component.selectedReport.yearsFilterExists);
    assert.equal(component.selectedReport.results.length, 2);
    await component.selectedReport.chooseYear('2016');
    assert.equal(component.selectedReport.results.length, 1);
    assert.equal(component.selectedReport.results[0].text, '2016 - 2017 course 1');
  });

  test('changing year changes select #3839', async function(assert) {
    assert.expect(5);
    this.server.create('academic-year', {
      id: 2015
    });
    const school = this.server.create('school');
    this.server.create('course', {
      school,
      year: 2015,
    });
    const report = this.server.create('report', {
      title: 'my report 0',
      subject: 'course',
      user: this.user,
      school,
    });
    //override default hander to just return all courses
    this.server.get('api/courses', (schema) => {
      return schema.courses.all();
    });

    this.setProperties({ selectedReport: null, selectedYear: '' });
    this.set('setReport', () => this.set('selectedReport', report));
    this.set('setReportYear', (year) => this.set('selectedYear', year));
    await render(hbs`<DashboardMyreports
      @selectedReport={{this.selectedReport}}
      @selectedYear={{this.selectedYear}}
      @onReportSelect={{action this.setReport}}
      @onReportYearSelect={{action this.setReportYear}}
    />`);
    await component.reports[0].select();
    assert.ok(component.selectedReport.yearsFilterExists);
    assert.equal(component.selectedReport.currentYear, '');
    assert.equal(component.selectedReport.results.length, 1);
    await component.selectedReport.chooseYear('2015');
    assert.equal(component.selectedReport.results.length, 1);
    assert.equal(component.selectedReport.currentYear, '2015');
  });
});
