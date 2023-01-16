import { module, test } from 'qunit';
import { setupRenderingTest } from 'ilios/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { component } from 'ilios/tests/pages/components/reports/subject/term';

module('Integration | Component | reports/subject/term', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  const responseData = {
    data: {
      terms: [
        { id: 1, title: 'First', vocabulary: { id: 1, title: 'Vocab A' } },
        { id: 2, title: 'Second', vocabulary: { id: 2, title: 'Vocab B' } },
        { id: 3, title: 'Third', vocabulary: { id: 1, title: 'Vocab A' } },
      ],
    },
  };

  test('it renders', async function (assert) {
    assert.expect(5);
    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(query, 'query { terms { id, title, vocabulary { id, title } } }');
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'term',
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(hbs`<Reports::Subject::Term @report={{this.report}} />`);

    assert.strictEqual(component.results.length, 3);
    assert.strictEqual(component.results[0].title, 'Vocab A > First');
    assert.strictEqual(component.results[1].title, 'Vocab A > Third');
    assert.strictEqual(component.results[2].title, 'Vocab B > Second');
  });

  test('filter by school', async function (assert) {
    assert.expect(1);
    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(
        query,
        'query { terms(schools: [33]) { id, title, vocabulary { id, title } } }'
      );
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'term',
      school: this.server.create('school', { id: 33 }),
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(hbs`<Reports::Subject::Term @report={{this.report}} />`);
  });

  test('filter by course', async function (assert) {
    assert.expect(1);
    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(
        query,
        'query { terms(courses: [13]) { id, title, vocabulary { id, title } } }'
      );
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'term',
      prepositionalObject: 'course',
      prepositionalObjectTableRowId: 13,
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(hbs`<Reports::Subject::Term @report={{this.report}} />`);
  });

  test('filter by school and session', async function (assert) {
    assert.expect(1);
    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(
        query,
        'query { terms(schools: [24], sessions: [13]) { id, title, vocabulary { id, title } } }'
      );
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'term',
      school: this.server.create('school', { id: 24 }),
      prepositionalObject: 'session',
      prepositionalObjectTableRowId: 13,
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(hbs`<Reports::Subject::Term @report={{this.report}} />`);
  });
});
