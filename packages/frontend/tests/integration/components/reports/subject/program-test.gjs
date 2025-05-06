import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import { component } from 'frontend/tests/pages/components/reports/subject/program';
import { setupAuthentication } from 'ilios-common';
import Program from 'frontend/components/reports/subject/program';

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
    await render(
      <template>
        <Program
          @subject={{this.report.subject}}
          @prepositionalObject={{this.report.prepositionalObject}}
          @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
        />
      </template>,
    );

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
    await render(
      <template>
        <Program
          @subject={{this.report.subject}}
          @prepositionalObject={{this.report.prepositionalObject}}
          @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
        />
      </template>,
    );

    assert.strictEqual(component.results.length, 2);
    assert.notOk(component.results[0].hasLink);
    assert.notOk(component.results[1].hasLink);
    assert.strictEqual(component.results[0].school, 'School A');
    assert.strictEqual(component.results[1].school, 'School B');
    assert.strictEqual(component.results[0].title, 'Second Program');
    assert.strictEqual(component.results[1].title, 'First Program');
  });

  test('it renders all results when resultsLengthMax is not reached', async function (assert) {
    await setupAuthentication({}, true);
    assert.expect(3);

    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(query, 'query { programs { id, title, school { title } } }');
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'program',
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(
      <template>
        <Program
          @subject={{this.report.subject}}
          @prepositionalObject={{this.report.prepositionalObject}}
          @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
        />
      </template>,
    );

    assert.strictEqual(component.results.length, 2, 'responseData shows all 2 of 2 programs');
    assert.notOk(component.hasFullResultsDownloadButton, 'full results download button is hidden');
  });

  test('it renders limited results and an extra download button when resultsLengthMax is eclipsed', async function (assert) {
    await setupAuthentication({}, true);
    assert.expect(3);

    const alphabet = [...Array(26).keys()].map((i) => String.fromCharCode(i + 65));
    const responseDataLarge = {
      data: {
        programs: [],
      },
    };

    for (let i = 0; i < 220; i++) {
      const letter = alphabet[Math.floor(Math.random() * alphabet.length)];
      responseDataLarge.data.programs.push({
        id: i,
        title: `program ${i}`,
        school: { id: 1, title: `School ${letter}` },
      });
    }

    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(query, 'query { programs { id, title, school { title } } }');
      return responseDataLarge;
    });
    const { id } = this.server.create('report', {
      subject: 'program',
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(
      <template>
        <Program
          @subject={{this.report.subject}}
          @prepositionalObject={{this.report.prepositionalObject}}
          @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
        />
      </template>,
    );

    assert.strictEqual(
      component.results.length,
      200,
      'responseDataLarge shows only 200 of 220 programs',
    );
    assert.ok(component.hasFullResultsDownloadButton, 'full results download button is present');
  });

  test('filter by school', async function (assert) {
    assert.expect(1);
    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(
        query,
        'query { programs(schools: [33]) { id, title, school { title } } }',
      );
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'program',
      school: this.server.create('school', { id: 33 }),
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    this.set('school', await this.owner.lookup('service:store').findRecord('school', 33));
    await render(
      <template>
        <Program
          @subject={{this.report.subject}}
          @prepositionalObject={{this.report.prepositionalObject}}
          @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
          @school={{this.school}}
        />
      </template>,
    );
  });

  test('filter by session', async function (assert) {
    assert.expect(1);
    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(
        query,
        'query { programs(sessions: [13]) { id, title, school { title } } }',
      );
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'program',
      prepositionalObject: 'session',
      prepositionalObjectTableRowId: 13,
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(
      <template>
        <Program
          @subject={{this.report.subject}}
          @prepositionalObject={{this.report.prepositionalObject}}
          @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
        />
      </template>,
    );
  });

  test('filter by school and session', async function (assert) {
    assert.expect(1);
    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(
        query,
        'query { programs(schools: [24], sessions: [13]) { id, title, school { title } } }',
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
    this.set('school', await this.owner.lookup('service:store').findRecord('school', 24));
    await render(
      <template>
        <Program
          @subject={{this.report.subject}}
          @prepositionalObject={{this.report.prepositionalObject}}
          @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
          @school={{this.school}}
        />
      </template>,
    );
  });
});
