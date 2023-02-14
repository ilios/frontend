import { module, test } from 'qunit';
import { setupRenderingTest } from 'ilios/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { component } from 'ilios/tests/pages/components/reports/subject/program';
import { setupAuthentication } from 'ilios-common';

module('Integration | Component | reports/subject/program', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  const responseData = {
    data: {
      programs: [
        { id: 1, title: 'First Program', school: { title: 'School B' } },
        { id: 2, title: 'Second Program', school: { title: 'School A' } },
      ],
    },
  };

  test('it renders for user with permissions', async function (assert) {
    await setupAuthentication({}, true);
    assert.expect(10);
    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(query, 'query { programs { id, title, school { title } } }');
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'program',
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(hbs`<Reports::Subject::Program @report={{this.report}} />`);

    assert.strictEqual(component.results.length, 2);
    assert.ok(component.results[0].hasLink);
    assert.ok(component.results[1].hasLink);
    assert.strictEqual(component.results[0].school, 'School A');
    assert.strictEqual(component.results[1].school, 'School B');
    assert.strictEqual(component.results[0].title, 'Second Program');
    assert.strictEqual(component.results[1].title, 'First Program');
    assert.strictEqual(component.results[0].link, '/programs/2');
    assert.strictEqual(component.results[1].link, '/programs/1');
  });

  test('it renders for user with no permissions', async function (assert) {
    await setupAuthentication();
    assert.expect(8);
    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(query, 'query { programs { id, title, school { title } } }');
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'program',
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(hbs`<Reports::Subject::Program @report={{this.report}} />`);

    assert.strictEqual(component.results.length, 2);
    assert.notOk(component.results[0].hasLink);
    assert.notOk(component.results[1].hasLink);
    assert.strictEqual(component.results[0].school, 'School A');
    assert.strictEqual(component.results[1].school, 'School B');
    assert.strictEqual(component.results[0].title, 'Second Program');
    assert.strictEqual(component.results[1].title, 'First Program');
  });

  test('filter by school', async function (assert) {
    assert.expect(1);
    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(
        query,
        'query { programs(schools: [33]) { id, title, school { title } } }'
      );
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'program',
      school: this.server.create('school', { id: 33 }),
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(hbs`<Reports::Subject::Program @report={{this.report}} />`);
  });

  test('filter by session', async function (assert) {
    assert.expect(1);
    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(
        query,
        'query { programs(sessions: [13]) { id, title, school { title } } }'
      );
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'program',
      prepositionalObject: 'session',
      prepositionalObjectTableRowId: 13,
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(hbs`<Reports::Subject::Program @report={{this.report}} />`);
  });

  test('filter by school and session', async function (assert) {
    assert.expect(1);
    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(
        query,
        'query { programs(schools: [24], sessions: [13]) { id, title, school { title } } }'
      );
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'program',
      school: this.server.create('school', { id: 24 }),
      prepositionalObject: 'session',
      prepositionalObjectTableRowId: 13,
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(hbs`<Reports::Subject::Program @report={{this.report}} />`);
  });
});
