import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import { component } from 'frontend/tests/pages/components/reports/subject/term';
import Term from 'frontend/components/reports/subject/term';

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
    this.server.post('api/graphql', function (schema, { requestBody }) {
      assert.step('API called');
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(
        query,
        'query { terms { id, title, vocabulary { id, title, school { title } } } }',
      );
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'term',
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(
      <template>
        <Term
          @subject={{this.report.subject}}
          @prepositionalObject={{this.report.prepositionalObject}}
          @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
        />
      </template>,
    );

    assert.strictEqual(component.results.length, 3);
    assert.strictEqual(component.results[0].title, 'Vocab A > First');
    assert.strictEqual(component.results[1].title, 'Vocab A > Third');
    assert.strictEqual(component.results[2].title, 'Vocab B > Second');
    assert.verifySteps(['API called']);
  });

  test('it renders all results when resultsLengthMax is not reached', async function (assert) {
    this.server.post('api/graphql', function (schema, { requestBody }) {
      assert.step('API called');
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(
        query,
        'query { terms { id, title, vocabulary { id, title, school { title } } } }',
      );
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'term',
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(
      <template>
        <Term
          @subject={{this.report.subject}}
          @prepositionalObject={{this.report.prepositionalObject}}
          @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
        />
      </template>,
    );

    assert.strictEqual(component.results.length, 3, 'responseData shows all 3 of 3 terms');
    assert.notOk(component.hasFullResultsDownloadButton, 'full results download button is hidden');
    assert.verifySteps(['API called']);
  });

  test('it renders limited results and an extra download button when resultsLengthMax is eclipsed', async function (assert) {
    const alphabet = [...Array(26).keys()].map((i) => String.fromCharCode(i + 65));
    const responseDataLarge = {
      data: {
        terms: [],
      },
    };

    for (let i = 0; i < 220; i++) {
      const letter = alphabet[Math.floor(Math.random() * alphabet.length)];
      responseDataLarge.data.terms.push({
        id: i,
        title: `term ${i}`,
        vocabulary: {
          id: 1,
          title: `Vocab ${letter}`,
        },
      });
    }

    this.server.post('api/graphql', function (schema, { requestBody }) {
      assert.step('API called');
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(
        query,
        'query { terms { id, title, vocabulary { id, title, school { title } } } }',
      );
      return responseDataLarge;
    });
    const { id } = this.server.create('report', {
      subject: 'term',
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(
      <template>
        <Term
          @subject={{this.report.subject}}
          @prepositionalObject={{this.report.prepositionalObject}}
          @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
        />
      </template>,
    );

    assert.strictEqual(
      component.results.length,
      200,
      'responseDataLarge shows only 200 of 220 terms',
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
        'query { terms(schools: [33]) { id, title, vocabulary { id, title, school { title } } } }',
      );
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'term',
      school: this.server.create('school', { id: 33 }),
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    this.set('school', await this.owner.lookup('service:store').findRecord('school', 33));
    await render(
      <template>
        <Term
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
        'query { terms(courses: [13]) { id, title, vocabulary { id, title, school { title } } } }',
      );
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'term',
      prepositionalObject: 'course',
      prepositionalObjectTableRowId: 13,
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(
      <template>
        <Term
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
        'query { terms(schools: [24], sessions: [13]) { id, title, vocabulary { id, title, school { title } } } }',
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
    this.set('school', await this.owner.lookup('service:store').findRecord('school', 24));
    await render(
      <template>
        <Term
          @subject={{this.report.subject}}
          @prepositionalObject={{this.report.prepositionalObject}}
          @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
          @school={{this.school}}
        />
      </template>,
    );
    assert.verifySteps(['API called']);
  });
});
