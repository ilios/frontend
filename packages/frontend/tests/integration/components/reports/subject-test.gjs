import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import { setupAuthentication } from 'ilios-common';
import { component } from 'frontend/tests/pages/components/reports/subject';
import Subject from 'frontend/components/reports/subject';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | reports/subject', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    this.user = await setupAuthentication();
    //override default handler to just return all courses
    this.server.get('api/courses', (schema) => {
      return schema.courses.all();
    });
  });

  test('year filter works', async function (assert) {
    assert.expect(9);
    this.server.create('academic-year', {
      id: 2015,
    });
    this.server.create('academic-year', {
      id: 2016,
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
      prepositionalObject: 'instructor',
      prepositionalObjectTableRowId: this.user.id,
      user: this.user,
      school,
    });
    const reportModel = await this.owner.lookup('service:store').findRecord('report', report.id);
    this.set('selectedReport', reportModel);
    this.set('selectedYear', '');
    this.set('setReportYear', (year) => {
      this.set('selectedYear', year);
      assert.strictEqual(year, '2016', 'report year bubbles up for query params');
    });
    this.server.post('api/graphql', ({ db }, { requestBody }) => {
      const { query } = JSON.parse(requestBody);

      assert.strictEqual(
        query,
        'query { courses(schools: [1], instructors: [100]) { id, title, year, externalId } }',
      );
      return {
        data: {
          courses: db.courses.map(({ id, title, year, externalId }) => {
            return { id, title, year, externalId };
          }),
        },
      };
    });
    await render(
      <template>
        <Subject
          @report={{this.selectedReport}}
          @year={{this.selectedYear}}
          @changeYear={{this.setReportYear}}
        />
      </template>,
    );
    assert.strictEqual(component.title.text, 'my report 0');
    assert.strictEqual(
      component.description,
      'This report shows all Courses associated with Instructor "0 guy M. Mc0son" in school 0. (2)',
    );
    assert.strictEqual(component.results.length, 2);
    assert.strictEqual(component.results[0].text, '2015 course 0');
    assert.strictEqual(component.results[1].text, '2016 course 1');
    await component.academicYears.choose('2016');
    assert.strictEqual(component.results.length, 1);
    assert.strictEqual(component.results[0].text, 'course 1');
  });

  test('report results show academic year as range if applicable by configuration', async function (assert) {
    this.server.get('application/config', function () {
      return {
        config: {
          academicYearCrossesCalendarYearBoundaries: true,
        },
      };
    });
    const year = 2016;
    this.server.create('academic-year', { id: year });
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const programYear = this.server.create('program-year', { program });
    const cohort = this.server.create('cohort', { programYear });
    this.server.create('course', { school, year, cohorts: [cohort] });
    const report = this.server.create('report', {
      title: 'my report 0',
      subject: 'course',
      prepositionalObject: 'program',
      prepositionalObjectTableRowId: program.id,
      user: this.user,
      school,
    });
    const reportModel = await this.owner.lookup('service:store').findRecord('report', report.id);
    this.set('selectedReport', reportModel);
    this.set('selectedYear', '');
    this.server.post('api/graphql', ({ db }) => {
      return {
        data: {
          courses: db.courses.map(({ id, title, year, externalId }) => {
            return { id, title, year, externalId };
          }),
        },
      };
    });
    await render(
      <template>
        <Subject
          @report={{this.selectedReport}}
          @year={{this.selectedYear}}
          @changeYear={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(
      component.description,
      'This report shows all Courses associated with Program "program 0" in school 0. (1)',
    );
    assert.strictEqual(component.results[0].text, '2016 - 2017 course 0');
    this.set('selectedYear', year);
    assert.strictEqual(component.results[0].text, 'course 0');
  });

  test('changing year changes select #3839', async function (assert) {
    this.server.create('academic-year', {
      id: 2015,
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
    this.set('setReportYear', (year) => this.set('selectedYear', year));
    const reportModel = await this.owner.lookup('service:store').findRecord('report', report.id);
    this.set('selectedReport', reportModel);
    this.set('selectedYear', '');
    this.server.post('api/graphql', ({ db }) => {
      return {
        data: {
          courses: db.courses.map(({ id, title, year, externalId }) => {
            return { id, title, year, externalId };
          }),
        },
      };
    });
    await render(
      <template>
        <Subject
          @report={{this.selectedReport}}
          @year={{this.selectedYear}}
          @changeYear={{this.setReportYear}}
        />
      </template>,
    );
    assert.strictEqual(component.description, 'This report shows all Courses in school 0. (1)');
    assert.strictEqual(component.academicYears.value, '');
    assert.strictEqual(component.results.length, 1);
    await component.academicYears.choose('2015');
    assert.strictEqual(component.results.length, 1);
    assert.strictEqual(component.academicYears.value, '2015');
  });

  test('validation - report title too long', async function (assert) {
    this.server.create('academic-year', {
      id: 2015,
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
    this.set('setReportYear', (year) => this.set('selectedYear', year));
    const reportModel = await this.owner.lookup('service:store').findRecord('report', report.id);
    this.set('selectedReport', reportModel);
    this.set('selectedYear', '');
    this.server.post('api/graphql', ({ db }) => {
      return {
        data: {
          courses: db.courses.map(({ id, title, year, externalId }) => {
            return { id, title, year, externalId };
          }),
        },
      };
    });
    await render(
      <template>
        <Subject
          @report={{this.selectedReport}}
          @year={{this.selectedYear}}
          @changeYear={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(component.title.text, 'my report 0');
    await component.title.edit();
    assert.notOk(component.title.hasError);
    await component.title.set('a'.repeat(241));
    await component.title.save();
    assert.strictEqual(component.title.error, 'Title is too long (maximum is 240 characters)');
  });
});
