import { module, test } from 'qunit';
import { setupRenderingTest } from 'ilios/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { component } from 'ilios/tests/pages/components/reports/subject/instructor';
import { setupIntl } from 'ember-intl/test-support';

module('Integration | Component | reports/subject/instructor', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks, 'en-us');

  const responseData = {
    data: {
      users: [
        { firstName: 'First', middleName: 'Middle', lastName: 'Last', displayName: '' },
        { firstName: 'Second', middleName: 'Middle', lastName: 'Last', displayName: 'abc' },
      ],
    },
  };

  test('it renders', async function (assert) {
    assert.expect(4);
    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(query, 'query { users { firstName,middleName,lastName,displayName } }');
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'instructor',
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(hbs`<Reports::Subject::Instructor @report={{this.report}} />`);

    assert.strictEqual(component.results.length, 2);
    assert.strictEqual(component.results[0].name, 'abc');
    assert.strictEqual(component.results[1].name, 'First M. Last');
  });

  test('filter by school', async function (assert) {
    assert.expect(1);
    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(
        query,
        'query { users(schools: [33]) { firstName,middleName,lastName,displayName } }'
      );
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'instructor',
      school: this.server.create('school', { id: 33 }),
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(hbs`<Reports::Subject::Instructor @report={{this.report}} />`);
  });

  test('filter by course', async function (assert) {
    assert.expect(1);
    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(
        query,
        'query { users(instructedCourses: [13]) { firstName,middleName,lastName,displayName } }'
      );
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'instructor',
      prepositionalObject: 'course',
      prepositionalObjectTableRowId: 13,
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(hbs`<Reports::Subject::Instructor @report={{this.report}} />`);
  });

  test('filter by school and session', async function (assert) {
    assert.expect(1);
    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(
        query,
        'query { users(schools: [24], instructedSessions: [13]) { firstName,middleName,lastName,displayName } }'
      );
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'instructor',
      school: this.server.create('school', { id: 24 }),
      prepositionalObject: 'session',
      prepositionalObjectTableRowId: 13,
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(hbs`<Reports::Subject::Instructor @report={{this.report}} />`);
  });
});
