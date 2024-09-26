import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import { component } from 'frontend/tests/pages/components/reports/subject/mesh-term';

module('Integration | Component | reports/subject/mesh-term', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

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
    await render(hbs`<Reports::Subject::MeshTerm
  @subject={{this.report.subject}}
  @prepositionalObject={{this.report.prepositionalObject}}
  @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
/>`);

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
    this.set('school', await this.owner.lookup('service:store').findRecord('school', 33));
    await render(hbs`<Reports::Subject::MeshTerm
  @subject={{this.report.subject}}
  @prepositionalObject={{this.report.prepositionalObject}}
  @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
  @school={{this.school}}
/>`);
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
    await render(hbs`<Reports::Subject::MeshTerm
  @subject={{this.report.subject}}
  @prepositionalObject={{this.report.prepositionalObject}}
  @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
/>`);
  });

  test('filter by school and session', async function (assert) {
    assert.expect(1);
    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(
        query,
        'query { meshDescriptors(schools: [24], sessions: [13]) { id, name } }',
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
    this.set('school', await this.owner.lookup('service:store').findRecord('school', 24));
    await render(hbs`<Reports::Subject::MeshTerm
  @subject={{this.report.subject}}
  @prepositionalObject={{this.report.prepositionalObject}}
  @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
  @school={{this.school}}
/>`);
  });
});
