import { module, test } from 'qunit';
import { setupRenderingTest } from 'ilios/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { component } from 'ilios/tests/pages/components/reports/subject/learning-material';
import { setupIntl } from 'ember-intl/test-support';

module('Integration | Component | reports/subject/learning-material', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks, 'en-us');

  const responseData = {
    data: {
      learningMaterials: [
        { id: 1, title: 'first' },
        { id: 2, title: 'Second' },
      ],
    },
  };

  test('it renders', async function (assert) {
    assert.expect(4);
    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(query, 'query { learningMaterials { id, title } }');
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'learning material',
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(hbs`<Reports::Subject::LearningMaterial @report={{this.report}} />`);

    assert.strictEqual(component.results.length, 2);
    assert.strictEqual(component.results[0].title, 'first');
    assert.strictEqual(component.results[1].title, 'Second');
  });

  test('filter by school', async function (assert) {
    assert.expect(1);
    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(query, 'query { learningMaterials(schools: [33]) { id, title } }');
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'learning material',
      school: this.server.create('school', { id: 33 }),
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(hbs`<Reports::Subject::LearningMaterial @report={{this.report}} />`);
  });

  test('filter by course', async function (assert) {
    assert.expect(1);
    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(query, 'query { learningMaterials(courses: [13]) { id, title } }');
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'learning material',
      prepositionalObject: 'course',
      prepositionalObjectTableRowId: 13,
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(hbs`<Reports::Subject::LearningMaterial @report={{this.report}} />`);
  });

  test('filter by school and session', async function (assert) {
    assert.expect(1);
    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(
        query,
        'query { learningMaterials(schools: [24], sessions: [13]) { id, title } }'
      );
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'learning material',
      school: this.server.create('school', { id: 24 }),
      prepositionalObject: 'session',
      prepositionalObjectTableRowId: 13,
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(hbs`<Reports::Subject::LearningMaterial @report={{this.report}} />`);
  });

  test('filter by mesh', async function (assert) {
    assert.expect(1);
    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(
        query,
        'query { learningMaterials(meshDescriptors: [ABC]) { id, title } }'
      );
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'learning material',
      prepositionalObject: 'mesh term',
      prepositionalObjectTableRowId: 'ABC',
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(hbs`<Reports::Subject::LearningMaterial @report={{this.report}} />`);
  });
});
