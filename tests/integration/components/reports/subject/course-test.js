import { module, test } from 'qunit';
import { setupRenderingTest } from 'ilios/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { component } from 'ilios/tests/pages/components/reports/subject/course';
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
    await render(hbs`<Reports::Subject::Course @report={{this.report}} />`);

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
    await render(hbs`<Reports::Subject::Course @report={{this.report}} />`);

    assert.strictEqual(component.results.length, 2);
    assert.notOk(component.results[0].hasLink);
    assert.notOk(component.results[1].hasLink);
    assert.strictEqual(component.results[0].year, '2020');
    assert.strictEqual(component.results[1].year, '2023');
    assert.strictEqual(component.results[0].courseTitle, 'Second Course (ext ID 1)');
    assert.strictEqual(component.results[1].courseTitle, 'First Course');
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
    await render(hbs`<Reports::Subject::Course @report={{this.report}} />`);

    assert.strictEqual(component.results.length, 2);
    assert.strictEqual(component.results[0].year, '2020-2021');
    assert.strictEqual(component.results[1].year, '2023-2024');
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
    await render(hbs`<Reports::Subject::Course @report={{this.report}} @year={{2023}} />`);

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
    await render(hbs`<Reports::Subject::Course @report={{this.report}} />`);
  });

  test('filter by program', async function (assert) {
    assert.expect(1);
    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(
        query,
        'query { courses(programs: [13]) { id, title, year, externalId } }'
      );
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'course',
      prepositionalObject: 'program',
      prepositionalObjectTableRowId: 13,
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(hbs`<Reports::Subject::Course @report={{this.report}} />`);
  });

  test('filter by school and program', async function (assert) {
    assert.expect(1);
    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(
        query,
        'query { courses(schools: [24], programs: [13]) { id, title, year, externalId } }'
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
    await render(hbs`<Reports::Subject::Course @report={{this.report}} />`);
  });
});
