import { module, test } from 'qunit';
import { setupRenderingTest } from 'ilios/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { component } from 'ilios/tests/pages/components/reports/subject/competency';

module('Integration | Component | reports/subject/competency', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  const responseData = {
    data: {
      competencies: [
        { id: 1, title: 'First' },
        { id: 2, title: 'Second' },
      ],
    },
  };

  test('it renders', async function (assert) {
    assert.expect(4);
    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(query, 'query { competencies { id, title } }');
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'competency',
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(hbs`<Reports::Subject::Competency @report={{this.report}} />`);

    assert.strictEqual(component.results.length, 2);
    assert.strictEqual(component.results[0].title, 'First');
    assert.strictEqual(component.results[1].title, 'Second');
  });

  test('filter by school', async function (assert) {
    assert.expect(1);
    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(query, 'query { competencies(schools: [33]) { id, title } }');
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'competency',
      school: this.server.create('school', { id: 33 }),
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(hbs`<Reports::Subject::Competency @report={{this.report}} />`);
  });

  test('filter by course', async function (assert) {
    assert.expect(1);
    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(query, 'query { competencies(courses: [13]) { id, title } }');
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'competency',
      prepositionalObject: 'course',
      prepositionalObjectTableRowId: 13,
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(hbs`<Reports::Subject::Competency @report={{this.report}} />`);
  });

  test('filter by school and session', async function (assert) {
    assert.expect(1);
    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(
        query,
        'query { competencies(schools: [24], sessions: [13]) { id, title } }'
      );
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'competency',
      school: this.server.create('school', { id: 24 }),
      prepositionalObject: 'session',
      prepositionalObjectTableRowId: 13,
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(hbs`<Reports::Subject::Competency @report={{this.report}} />`);
  });
});
