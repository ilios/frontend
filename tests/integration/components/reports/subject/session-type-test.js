import { module, test } from 'qunit';
import { setupRenderingTest } from 'ilios/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { component } from 'ilios/tests/pages/components/reports/subject/session-type';

module('Integration | Component | reports/subject/session-type', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  const responseData = {
    data: {
      sessionTypes: [{ title: 'First Type' }, { title: 'Second Type' }],
    },
  };

  test('it renders', async function (assert) {
    assert.expect(4);
    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(query, 'query { sessionTypes { title } }');
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'session type',
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(hbs`<Reports::Subject::SessionType @report={{this.report}} />`);

    assert.strictEqual(component.results.length, 2);
    assert.strictEqual(component.results[0].title, 'First Type');
    assert.strictEqual(component.results[1].title, 'Second Type');
  });

  test('filter by school', async function (assert) {
    assert.expect(1);
    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(query, 'query { sessionTypes(schools: [33]) { title } }');
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'session type',
      school: this.server.create('school', { id: 33 }),
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(hbs`<Reports::Subject::SessionType @report={{this.report}} />`);
  });

  test('filter by course', async function (assert) {
    assert.expect(1);
    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(query, 'query { sessionTypes(courses: [13]) { title } }');
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'session type',
      prepositionalObject: 'course',
      prepositionalObjectTableRowId: 13,
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(hbs`<Reports::Subject::SessionType @report={{this.report}} />`);
  });

  test('filter by school and session', async function (assert) {
    assert.expect(1);
    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(query, 'query { sessionTypes(schools: [24], sessions: [13]) { title } }');
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'session type',
      school: this.server.create('school', { id: 24 }),
      prepositionalObject: 'session',
      prepositionalObjectTableRowId: 13,
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(hbs`<Reports::Subject::SessionType @report={{this.report}} />`);
  });

  test('filter by mesh', async function (assert) {
    assert.expect(1);
    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(query, 'query { sessionTypes(meshDescriptors: [ABC]) { title } }');
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'session type',
      prepositionalObject: 'mesh term',
      prepositionalObjectTableRowId: 'ABC',
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(hbs`<Reports::Subject::SessionType @report={{this.report}} />`);
  });
});
