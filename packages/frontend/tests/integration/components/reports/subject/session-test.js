import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import { component } from 'frontend/tests/pages/components/reports/subject/session';
import { component as headerComponent } from 'frontend/tests/pages/components/reports/subject-header';

import { setupAuthentication } from 'ilios-common';

module('Integration | Component | reports/subject/session', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  const responseData = {
    data: {
      sessions: [
        { id: 1, title: 'First Session', course: { id: 1, year: 2023, title: 'Course' } },
        {
          id: 2,
          title: 'Second Session',
          course: { id: 1, year: 2023, title: 'Course' },
        },
        {
          id: 3,
          title: 'Third Session',
          course: { id: 2, year: 2020, title: 'Course 2' },
        },
      ],
    },
  };

  test('it renders for user with permissions', async function (assert) {
    await setupAuthentication({}, true);
    assert.expect(23);
    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(query, 'query { sessions { id, title, course { id, year, title } } }');
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'session',
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(hbs`<Reports::Subject::Session
  @subject={{this.report.subject}}
  @prepositionalObject={{this.report.prepositionalObject}}
  @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
/>`);

    assert.strictEqual(component.results.length, 3);
    assert.ok(component.results[0].hasCourseLink);
    assert.ok(component.results[1].hasCourseLink);
    assert.ok(component.results[2].hasCourseLink);
    assert.ok(component.results[0].hasSessionLink);
    assert.ok(component.results[1].hasSessionLink);
    assert.ok(component.results[2].hasSessionLink);
    assert.strictEqual(component.results[0].year, '2020');
    assert.strictEqual(component.results[1].year, '2023');
    assert.strictEqual(component.results[2].year, '2023');
    assert.strictEqual(component.results[0].courseTitle, 'Course 2:');
    assert.strictEqual(component.results[1].courseTitle, 'Course:');
    assert.strictEqual(component.results[2].courseTitle, 'Course:');
    assert.strictEqual(component.results[0].sessionTitle, 'Third Session');
    assert.strictEqual(component.results[1].sessionTitle, 'First Session');
    assert.strictEqual(component.results[2].sessionTitle, 'Second Session');
    assert.strictEqual(component.results[0].courseLink, '/courses/2');
    assert.strictEqual(component.results[1].courseLink, '/courses/1');
    assert.strictEqual(component.results[2].courseLink, '/courses/1');
    assert.strictEqual(component.results[0].sessionLink, '/courses/2/sessions/3');
    assert.strictEqual(component.results[1].sessionLink, '/courses/1/sessions/1');
    assert.strictEqual(component.results[2].sessionLink, '/courses/1/sessions/2');
  });

  test('it renders for user with no permissions', async function (assert) {
    await setupAuthentication();
    assert.expect(17);
    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(query, 'query { sessions { id, title, course { id, year, title } } }');
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'session',
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(hbs`<Reports::Subject::Session
  @subject={{this.report.subject}}
  @prepositionalObject={{this.report.prepositionalObject}}
  @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
/>`);

    assert.strictEqual(component.results.length, 3);
    assert.notOk(component.results[0].hasCourseLink);
    assert.notOk(component.results[1].hasCourseLink);
    assert.notOk(component.results[2].hasCourseLink);
    assert.notOk(component.results[0].hasSessionLink);
    assert.notOk(component.results[1].hasSessionLink);
    assert.notOk(component.results[2].hasSessionLink);
    assert.strictEqual(component.results[0].year, '2020');
    assert.strictEqual(component.results[1].year, '2023');
    assert.strictEqual(component.results[2].year, '2023');
    assert.strictEqual(component.results[0].courseTitle, 'Course 2:');
    assert.strictEqual(component.results[1].courseTitle, 'Course:');
    assert.strictEqual(component.results[2].courseTitle, 'Course:');
    assert.strictEqual(component.results[0].sessionTitle, 'Third Session');
    assert.strictEqual(component.results[1].sessionTitle, 'First Session');
    assert.strictEqual(component.results[2].sessionTitle, 'Second Session');
  });

  test('it renders all results when resultsLengthMax is not reached', async function (assert) {
    await setupAuthentication({}, true);
    assert.expect(3);

    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(query, 'query { sessions { id, title, course { id, year, title } } }');
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'session',
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(hbs`<Reports::Subject::Session
  @subject={{this.report.subject}}
  @prepositionalObject={{this.report.prepositionalObject}}
  @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
/>`);

    assert.strictEqual(component.results.length, 3, 'responseData shows all 3 of 3 courses');
    assert.notOk(component.hasFullResultsDownloadButton, 'full results download button is hidden');
  });

  test('it renders limited results and an extra download button when resultsLengthMax is eclipsed', async function (assert) {
    await setupAuthentication({}, true);
    assert.expect(3);

    const years = [2020, 2021, 2022, 2023, 2024, 2025];
    const responseDataLarge = {
      data: {
        sessions: [],
      },
    };

    for (let i = 0; i < 220; i++) {
      responseDataLarge.data.sessions.push({
        id: i,
        title: `session ${i}`,
        course: { id: 1, year: years[Math.floor(Math.random()) + years.length], title: 'Course' },
      });
    }

    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(query, 'query { sessions { id, title, course { id, year, title } } }');
      return responseDataLarge;
    });
    const { id } = this.server.create('report', {
      subject: 'session',
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(hbs`<Reports::Subject::Session
  @subject={{this.report.subject}}
  @prepositionalObject={{this.report.prepositionalObject}}
  @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
/>`);

    assert.strictEqual(
      component.results.length,
      200,
      'responseDataLarge shows only 200 of 220 sessions',
    );
    assert.ok(component.hasFullResultsDownloadButton, 'full results download button is present');
  });

  test('it reads academic year config', async function (assert) {
    assert.expect(11);
    this.server.get('application/config', function () {
      return {
        config: {
          academicYearCrossesCalendarYearBoundaries: true,
        },
      };
    });
    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(query, 'query { sessions { id, title, course { id, year, title } } }');
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'session',
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(hbs`<Reports::Subject::Session
  @subject={{this.report.subject}}
  @prepositionalObject={{this.report.prepositionalObject}}
  @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
/>`);

    assert.strictEqual(component.results.length, 3);
    assert.strictEqual(component.results[0].year, '2020 - 2021');
    assert.strictEqual(component.results[1].year, '2023 - 2024');
    assert.strictEqual(component.results[2].year, '2023 - 2024');
    assert.strictEqual(component.results[0].courseTitle, 'Course 2:');
    assert.strictEqual(component.results[1].courseTitle, 'Course:');
    assert.strictEqual(component.results[1].courseTitle, 'Course:');
    assert.strictEqual(component.results[0].sessionTitle, 'Third Session');
    assert.strictEqual(component.results[1].sessionTitle, 'First Session');
    assert.strictEqual(component.results[2].sessionTitle, 'Second Session');
  });

  test('year filter works', async function (assert) {
    assert.expect(6);
    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(query, 'query { sessions { id, title, course { id, year, title } } }');
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'session',
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(hbs`<Reports::Subject::Session
  @subject={{this.report.subject}}
  @prepositionalObject={{this.report.prepositionalObject}}
  @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
  @year={{2023}}
/>`);

    assert.strictEqual(component.results.length, 2);
    assert.notOk(component.results[0].hasYear);
    assert.notOk(component.results[1].hasYear);
    assert.strictEqual(component.results[0].sessionTitle, 'First Session');
    assert.strictEqual(component.results[1].sessionTitle, 'Second Session');
  });

  test('filter by school', async function (assert) {
    assert.expect(2);
    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(
        query,
        'query { sessions(schools: [33]) { id, title, course { id, year, title } } }',
      );
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'session',
      school: this.server.create('school', { id: 33 }),
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    this.set('school', await this.owner.lookup('service:store').findRecord('school', 33));
    await render(hbs`<Reports::Subject::Session
  @subject={{this.report.subject}}
  @prepositionalObject={{this.report.prepositionalObject}}
  @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
  @school={{this.school}}
/>`);
    assert.ok(headerComponent.hasYearFilter);
  });

  test('filter by program', async function (assert) {
    assert.expect(2);
    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(
        query,
        'query { sessions(programs: [13]) { id, title, course { id, year, title } } }',
      );
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'session',
      prepositionalObject: 'program',
      prepositionalObjectTableRowId: 13,
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(hbs`<Reports::Subject::Session
  @subject={{this.report.subject}}
  @prepositionalObject={{this.report.prepositionalObject}}
  @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
/>`);
    assert.ok(headerComponent.hasYearFilter);
  });

  test('filter by school and program', async function (assert) {
    assert.expect(2);
    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(
        query,
        'query { sessions(schools: [24], programs: [13]) { id, title, course { id, year, title } } }',
      );
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'session',
      school: this.server.create('school', { id: 24 }),
      prepositionalObject: 'program',
      prepositionalObjectTableRowId: 13,
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    this.set('school', await this.owner.lookup('service:store').findRecord('school', 24));
    await render(hbs`<Reports::Subject::Session
  @subject={{this.report.subject}}
  @prepositionalObject={{this.report.prepositionalObject}}
  @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
  @school={{this.school}}
/>`);
    assert.ok(headerComponent.hasYearFilter);
  });

  test('filter by course', async function (assert) {
    assert.expect(2);
    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(
        query,
        'query { sessions(courses: [13]) { id, title, course { id, year, title } } }',
      );
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'session',
      prepositionalObject: 'course',
      prepositionalObjectTableRowId: 13,
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(hbs`<Reports::Subject::Session
  @subject={{this.report.subject}}
  @prepositionalObject={{this.report.prepositionalObject}}
  @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
/>`);
    assert.notOk(headerComponent.hasYearFilter);
  });

  test('filter by session type', async function (assert) {
    assert.expect(2);
    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(
        query,
        'query { sessions(sessionTypes: [13]) { id, title, course { id, year, title } } }',
      );
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'session',
      prepositionalObject: 'sessionType',
      prepositionalObjectTableRowId: 13,
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(hbs`<Reports::Subject::Session
  @subject={{this.report.subject}}
  @prepositionalObject={{this.report.prepositionalObject}}
  @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
/>`);
    assert.ok(headerComponent.hasYearFilter);
  });

  test('filter by mesh', async function (assert) {
    assert.expect(2);
    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(
        query,
        'query { sessions(meshDescriptors: ["ABC"]) { id, title, course { id, year, title } } }',
      );
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'session',
      prepositionalObject: 'mesh term',
      prepositionalObjectTableRowId: 'ABC',
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(hbs`<Reports::Subject::Session
  @subject={{this.report.subject}}
  @prepositionalObject={{this.report.prepositionalObject}}
  @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
/>`);
    assert.ok(headerComponent.hasYearFilter);
  });

  test('filter by academic year', async function (assert) {
    assert.expect(2);
    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(
        query,
        'query { sessions(academicYears: [2005]) { id, title, course { id, year, title } } }',
      );
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'session',
      prepositionalObject: 'academic year',
      prepositionalObjectTableRowId: '2005',
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(hbs`<Reports::Subject::Session
  @subject={{this.report.subject}}
  @prepositionalObject={{this.report.prepositionalObject}}
  @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
/>`);

    assert.notOk(headerComponent.hasYearFilter);
  });
});
