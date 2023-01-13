import { module, test } from 'qunit';
import { setupRenderingTest } from 'ilios/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { component } from 'ilios/tests/pages/components/reports/subject/session';
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
    await render(hbs`<Reports::Subject::Session @report={{this.report}} />`);

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
    await render(hbs`<Reports::Subject::Session @report={{this.report}} />`);

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
    await render(hbs`<Reports::Subject::Session @report={{this.report}} />`);

    assert.strictEqual(component.results.length, 3);
    assert.strictEqual(component.results[0].year, '2020-2021');
    assert.strictEqual(component.results[1].year, '2023-2024');
    assert.strictEqual(component.results[2].year, '2023-2024');
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
    await render(hbs`<Reports::Subject::Session @report={{this.report}} @year={{2023}} />`);

    assert.strictEqual(component.results.length, 2);
    assert.notOk(component.results[0].hasYear);
    assert.notOk(component.results[1].hasYear);
    assert.strictEqual(component.results[0].sessionTitle, 'First Session');
    assert.strictEqual(component.results[1].sessionTitle, 'Second Session');
  });

  test('filter by school', async function (assert) {
    assert.expect(1);
    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(
        query,
        'query { sessions(schools: [33]) { id, title, course { id, year, title } } }'
      );
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'session',
      school: this.server.create('school', { id: 33 }),
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(hbs`<Reports::Subject::Session @report={{this.report}} />`);
  });

  test('filter by program', async function (assert) {
    assert.expect(1);
    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(
        query,
        'query { sessions(programs: [13]) { id, title, course { id, year, title } } }'
      );
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'session',
      prepositionalObject: 'program',
      prepositionalObjectTableRowId: 13,
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(hbs`<Reports::Subject::Session @report={{this.report}} />`);
  });

  test('filter by school and program', async function (assert) {
    assert.expect(1);
    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(
        query,
        'query { sessions(schools: [24], programs: [13]) { id, title, course { id, year, title } } }'
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
    await render(hbs`<Reports::Subject::Session @report={{this.report}} />`);
  });

  test('filter by course', async function (assert) {
    assert.expect(1);
    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(
        query,
        'query { sessions(course: 13) { id, title, course { id, year, title } } }'
      );
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'session',
      prepositionalObject: 'course',
      prepositionalObjectTableRowId: 13,
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(hbs`<Reports::Subject::Session @report={{this.report}} />`);
  });

  test('filter by session type', async function (assert) {
    assert.expect(1);
    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(
        query,
        'query { sessions(sessionType: 13) { id, title, course { id, year, title } } }'
      );
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'session',
      prepositionalObject: 'sessionType',
      prepositionalObjectTableRowId: 13,
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(hbs`<Reports::Subject::Session @report={{this.report}} />`);
  });
});
