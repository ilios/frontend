import { module, test, skip } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import { component } from 'frontend/tests/pages/components/reports/subject/course';
import { setupAuthentication } from 'ilios-common';

module('Integration | Component | reports/subject/course', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  const responseData = {
    data: {
      courses: [
        { id: 1, title: 'First Course', year: 2023 },
        { id: 2, title: 'Second Course', year: 2020, externalId: 'ext ID 1' },
      ],
    },
  };

  test('it renders for user with permissions', async function (assert) {
    await setupAuthentication({}, true);
    assert.expect(10);
    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(query, 'query { courses { id, title, year, externalId } }');
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'course',
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(hbs`<Reports::Subject::Course
  @subject={{this.report.subject}}
  @prepositionalObject={{this.report.prepositionalObject}}
  @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
/>`);

    assert.strictEqual(component.results.length, 2);
    assert.ok(component.results[0].hasLink);
    assert.ok(component.results[1].hasLink);
    assert.strictEqual(component.results[0].year, '2020');
    assert.strictEqual(component.results[1].year, '2023');
    assert.strictEqual(component.results[0].courseTitle, 'Second Course (ext ID 1)');
    assert.strictEqual(component.results[1].courseTitle, 'First Course');
    assert.strictEqual(component.results[0].link, '/courses/2');
    assert.strictEqual(component.results[1].link, '/courses/1');
  });

  test('it renders for user with no permissions', async function (assert) {
    await setupAuthentication();
    assert.expect(8);
    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(query, 'query { courses { id, title, year, externalId } }');
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'course',
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(hbs`<Reports::Subject::Course
  @subject={{this.report.subject}}
  @prepositionalObject={{this.report.prepositionalObject}}
  @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
/>`);

    assert.strictEqual(component.results.length, 2);
    assert.notOk(component.results[0].hasLink);
    assert.notOk(component.results[1].hasLink);
    assert.strictEqual(component.results[0].year, '2020');
    assert.strictEqual(component.results[1].year, '2023');
    assert.strictEqual(component.results[0].courseTitle, 'Second Course (ext ID 1)');
    assert.strictEqual(component.results[1].courseTitle, 'First Course');
  });

  test('it renders all results when resultsLengthMax is not reached', async function (assert) {
    await setupAuthentication({}, true);
    assert.expect(3);

    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(query, 'query { courses { id, title, year, externalId } }');
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'course',
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(hbs`<Reports::Subject::Course
  @subject={{this.report.subject}}
  @prepositionalObject={{this.report.prepositionalObject}}
  @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
/>`);

    assert.strictEqual(component.results.length, 2, 'responseData shows all 2 of 2 courses');
    assert.notOk(component.hasFullResultsDownloadButton, 'full results download button is hidden');
  });

  test('it renders limited results and an extra download button when resultsLengthMax is eclipsed', async function (assert) {
    await setupAuthentication({}, true);
    assert.expect(3);

    const years = [2020, 2021, 2022, 2023, 2024, 2025];
    const responseDataLarge = {
      data: {
        courses: [],
      },
    };

    for (let i = 0; i < 220; i++) {
      responseDataLarge.data.courses.push({
        id: i,
        title: `course ${i}`,
        year: years[Math.floor(Math.random() * years.length)],
      });
    }

    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(query, 'query { courses { id, title, year, externalId } }');
      return responseDataLarge;
    });
    const { id } = this.server.create('report', {
      subject: 'course',
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(hbs`<Reports::Subject::Course
  @subject={{this.report.subject}}
  @prepositionalObject={{this.report.prepositionalObject}}
  @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
/>`);

    assert.strictEqual(
      component.results.length,
      200,
      'responseDataLarge shows only 200 of 220 courses',
    );
    assert.ok(component.hasFullResultsDownloadButton, 'full results download button is present');
  });

  test('it reads academic year config', async function (assert) {
    assert.expect(6);
    this.server.get('application/config', function () {
      return {
        config: {
          academicYearCrossesCalendarYearBoundaries: true,
        },
      };
    });
    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(query, 'query { courses { id, title, year, externalId } }');
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'course',
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(hbs`<Reports::Subject::Course
  @subject={{this.report.subject}}
  @prepositionalObject={{this.report.prepositionalObject}}
  @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
/>`);

    assert.strictEqual(component.results.length, 2);
    assert.strictEqual(component.results[0].year, '2020 - 2021');
    assert.strictEqual(component.results[1].year, '2023 - 2024');
    assert.strictEqual(component.results[0].courseTitle, 'Second Course (ext ID 1)');
    assert.strictEqual(component.results[1].courseTitle, 'First Course');
  });

  test('year filter works', async function (assert) {
    assert.expect(4);
    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(query, 'query { courses { id, title, year, externalId } }');
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'course',
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(hbs`<Reports::Subject::Course
  @subject={{this.report.subject}}
  @prepositionalObject={{this.report.prepositionalObject}}
  @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
  @year={{2023}}
/>`);

    assert.strictEqual(component.results.length, 1);
    assert.notOk(component.results[0].hasYear);
    assert.strictEqual(component.results[0].courseTitle, 'First Course');
  });

  test('filter by school', async function (assert) {
    assert.expect(1);
    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(query, 'query { courses(schools: [33]) { id, title, year, externalId } }');
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'course',
      school: this.server.create('school', { id: 33 }),
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    this.set('school', await this.owner.lookup('service:store').findRecord('school', 33));
    await render(hbs`<Reports::Subject::Course
  @subject={{this.report.subject}}
  @prepositionalObject={{this.report.prepositionalObject}}
  @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
  @school={{this.school}}
/>`);
  });

  test('filter by program', async function (assert) {
    assert.expect(1);
    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(
        query,
        'query { courses(programs: [13]) { id, title, year, externalId } }',
      );
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'course',
      prepositionalObject: 'program',
      prepositionalObjectTableRowId: 13,
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(hbs`<Reports::Subject::Course
  @subject={{this.report.subject}}
  @prepositionalObject={{this.report.prepositionalObject}}
  @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
/>`);
  });

  test('filter by school and program', async function (assert) {
    assert.expect(1);
    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(
        query,
        'query { courses(schools: [24], programs: [13]) { id, title, year, externalId } }',
      );
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'course',
      school: this.server.create('school', { id: 24 }),
      prepositionalObject: 'program',
      prepositionalObjectTableRowId: 13,
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    this.set('school', await this.owner.lookup('service:store').findRecord('school', 24));
    await render(hbs`<Reports::Subject::Course
  @subject={{this.report.subject}}
  @prepositionalObject={{this.report.prepositionalObject}}
  @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
  @school={{this.school}}
/>`);
  });

  test('filter by program year', async function (assert) {
    assert.expect(1);
    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(
        query,
        'query { courses(programYears: [13]) { id, title, year, externalId } }',
      );
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'course',
      prepositionalObject: 'program year',
      prepositionalObjectTableRowId: 13,
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(hbs`<Reports::Subject::Course
  @subject={{this.report.subject}}
  @prepositionalObject={{this.report.prepositionalObject}}
  @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
/>`);
  });

  test('filter by mesh', async function (assert) {
    assert.expect(2);
    let graphQueryCounter = 0;
    this.server.post('api/graphql', function (schema, { requestBody }) {
      graphQueryCounter++;
      const { query } = JSON.parse(requestBody);
      let rhett;
      switch (graphQueryCounter) {
        case 1:
          assert.strictEqual(
            query,
            'query { meshDescriptors(id: "ABC") { courses { id }, courseObjectives { course { id } }, sessions { course { id } }, sessionObjectives { session { course { id } } } } }',
          );
          rhett = {
            data: {
              meshDescriptors: [
                {
                  courses: [{ id: 1 }, { id: 3 }, { id: 5 }, { id: 1 }],
                  courseObjectives: [{ course: { id: 2 } }],
                  sessions: [{ course: { id: 4 } }, { course: { id: 3 } }],
                  sessionObjectives: [{ session: { course: { id: 6 } } }],
                },
              ],
            },
          };
          break;
        case 2:
          assert.strictEqual(
            query,
            'query { courses(ids: [1, 2, 3, 4, 5, 6]) { id, title, year, externalId } }',
          );
          rhett = responseData;
          break;
        default:
          assert.ok(false, 'too many queries');
      }

      return rhett;
    });
    const { id } = this.server.create('report', {
      subject: 'course',
      prepositionalObject: 'mesh term',
      prepositionalObjectTableRowId: 'ABC',
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(hbs`<Reports::Subject::Course
  @subject={{this.report.subject}}
  @prepositionalObject={{this.report.prepositionalObject}}
  @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
/>`);
  });

  test('filter by academic year', async function (assert) {
    assert.expect(1);
    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(
        query,
        'query { courses(academicYears: [2015]) { id, title, year, externalId } }',
      );
      return {
        data: {
          courses: [{ id: 1, title: 'First Course', year: 2015 }],
        },
      };
    });
    const { id } = this.server.create('report', {
      subject: 'course',
      prepositionalObject: 'academic year',
      prepositionalObjectTableRowId: '2015',
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(hbs`<Reports::Subject::Course
  @subject={{this.report.subject}}
  @prepositionalObject={{this.report.prepositionalObject}}
  @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
/>`);
  });

  //skipped because I can't figure out how to test the download functionality
  skip('download', async function (assert) {
    await setupAuthentication({}, true);
    assert.expect(10);
    this.server.post('api/graphql', () => responseData);
    const { id } = this.server.create('report', {
      subject: 'course',
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(hbs`<Reports::Subject::Course
  @subject={{this.report.subject}}
  @prepositionalObject={{this.report.prepositionalObject}}
  @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
/>`);

    await click('[data-test-download]');
  });
});
