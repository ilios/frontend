import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import { component } from 'frontend/tests/pages/components/reports/subject/session-type';
import SessionType from 'frontend/components/reports/subject/session-type';

module('Integration | Component | reports/subject/session-type', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  const responseData = {
    data: {
      sessionTypes: [{ title: 'first Type' }, { title: 'Second Type' }],
    },
  };

  test('it renders', async function (assert) {
    this.server.post('api/graphql', function (schema, { requestBody }) {
      assert.step('API called');
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(query, 'query { sessionTypes { title, school { title } } }');
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'session type',
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(
      <template>
        <SessionType
          @subject={{this.report.subject}}
          @prepositionalObject={{this.report.prepositionalObject}}
          @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
        />
      </template>,
    );

    assert.strictEqual(component.results.length, 2);
    assert.strictEqual(component.results[0].title, 'first Type');
    assert.strictEqual(component.results[1].title, 'Second Type');
    assert.verifySteps(['API called']);
  });

  test('it renders all results when resultsLengthMax is not reached', async function (assert) {
    this.server.post('api/graphql', function (schema, { requestBody }) {
      assert.step('API called');
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(query, 'query { sessionTypes { title, school { title } } }');
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'session type',
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(
      <template>
        <SessionType
          @subject={{this.report.subject}}
          @prepositionalObject={{this.report.prepositionalObject}}
          @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
        />
      </template>,
    );

    assert.strictEqual(component.results.length, 2, 'responseData shows all 2 of 2 session types');
    assert.notOk(component.hasFullResultsDownloadButton, 'full results download button is hidden');
    assert.verifySteps(['API called']);
  });

  test('it renders limited results and an extra download button when resultsLengthMax is eclipsed', async function (assert) {
    const responseDataLarge = {
      data: {
        sessionTypes: [],
      },
    };

    for (let i = 0; i < 220; i++) {
      responseDataLarge.data.sessionTypes.push({
        title: `session type ${i}`,
      });
    }

    this.server.post('api/graphql', function (schema, { requestBody }) {
      assert.step('API called');
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(query, 'query { sessionTypes { title, school { title } } }');
      return responseDataLarge;
    });
    const { id } = this.server.create('report', {
      subject: 'session type',
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(
      <template>
        <SessionType
          @subject={{this.report.subject}}
          @prepositionalObject={{this.report.prepositionalObject}}
          @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
        />
      </template>,
    );

    assert.strictEqual(
      component.results.length,
      200,
      'responseDataLarge shows only 200 of 220 session types',
    );
    assert.ok(component.hasFullResultsDownloadButton, 'full results download button is present');
    assert.verifySteps(['API called']);
  });

  test('filter by school', async function (assert) {
    this.server.post('api/graphql', function (schema, { requestBody }) {
      assert.step('API called');
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(
        query,
        'query { sessionTypes(schools: [33]) { title, school { title } } }',
      );
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'session type',
      school: this.server.create('school', { id: 33 }),
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    this.set('school', await this.owner.lookup('service:store').findRecord('school', 33));
    await render(
      <template>
        <SessionType
          @subject={{this.report.subject}}
          @prepositionalObject={{this.report.prepositionalObject}}
          @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
          @school={{this.school}}
        />
      </template>,
    );
    assert.verifySteps(['API called']);
  });

  test('filter by course', async function (assert) {
    this.server.post('api/graphql', function (schema, { requestBody }) {
      assert.step('API called');
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(
        query,
        'query { sessionTypes(courses: [13]) { title, school { title } } }',
      );
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'session type',
      prepositionalObject: 'course',
      prepositionalObjectTableRowId: 13,
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(
      <template>
        <SessionType
          @subject={{this.report.subject}}
          @prepositionalObject={{this.report.prepositionalObject}}
          @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
        />
      </template>,
    );
    assert.verifySteps(['API called']);
  });

  test('filter by school and session', async function (assert) {
    this.server.post('api/graphql', function (schema, { requestBody }) {
      assert.step('API called');
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(
        query,
        'query { sessionTypes(schools: [24], sessions: [13]) { title, school { title } } }',
      );
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'session type',
      school: this.server.create('school', { id: 24 }),
      prepositionalObject: 'session',
      prepositionalObjectTableRowId: 13,
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    this.set('school', await this.owner.lookup('service:store').findRecord('school', 24));
    await render(
      <template>
        <SessionType
          @subject={{this.report.subject}}
          @prepositionalObject={{this.report.prepositionalObject}}
          @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
          @school={{this.school}}
        />
      </template>,
    );
    assert.verifySteps(['API called']);
  });

  test('filter by mesh', async function (assert) {
    this.server.post('api/graphql', function (schema, { requestBody }) {
      assert.step('API called');
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(
        query,
        'query { sessionTypes(meshDescriptors: ["ABC"]) { title, school { title } } }',
      );
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'session type',
      prepositionalObject: 'mesh term',
      prepositionalObjectTableRowId: 'ABC',
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(
      <template>
        <SessionType
          @subject={{this.report.subject}}
          @prepositionalObject={{this.report.prepositionalObject}}
          @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
        />
      </template>,
    );
    assert.verifySteps(['API called']);
  });
});
