import { module, test } from 'qunit';
import { setupRenderingTest } from 'ilios/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { component } from 'ilios/tests/pages/components/reports/subject/mesh-term';
import { setupIntl } from 'ember-intl/test-support';

module('Integration | Component | reports/subject/mesh-term', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks, 'en-us');

  const responseData = {
    data: {
      meshDescriptors: [
        { id: 2, name: 'Second Term' },
        { id: 1, name: 'first Term' },
      ],
    },
  };

  test('it renders', async function (assert) {
    assert.expect(4);
    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(query, 'query { meshDescriptors { id, name } }');
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'mesh term',
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(hbs`<Reports::Subject::MeshTerm @report={{this.report}} />`);

    assert.strictEqual(component.results.length, 2);
    assert.strictEqual(component.results[0].name, 'first Term');
    assert.strictEqual(component.results[1].name, 'Second Term');
  });

  test('filter by school', async function (assert) {
    assert.expect(1);
    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(query, 'query { meshDescriptors(schools: [33]) { id, name } }');
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'mesh term',
      school: this.server.create('school', { id: 33 }),
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(hbs`<Reports::Subject::MeshTerm @report={{this.report}} />`);
  });

  test('filter by session', async function (assert) {
    assert.expect(1);
    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(query, 'query { meshDescriptors(sessions: [13]) { id, name } }');
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'mesh term',
      prepositionalObject: 'session',
      prepositionalObjectTableRowId: 13,
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(hbs`<Reports::Subject::MeshTerm @report={{this.report}} />`);
  });

  test('filter by school and session', async function (assert) {
    assert.expect(1);
    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(
        query,
        'query { meshDescriptors(schools: [24], sessions: [13]) { id, name } }'
      );
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'mesh term',
      school: this.server.create('school', { id: 24 }),
      prepositionalObject: 'session',
      prepositionalObjectTableRowId: 13,
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(hbs`<Reports::Subject::MeshTerm @report={{this.report}} />`);
  });
});
