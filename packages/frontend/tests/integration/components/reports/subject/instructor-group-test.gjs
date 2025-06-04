import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import { component } from 'frontend/tests/pages/components/reports/subject/instructor-group';
import InstructorGroup from 'frontend/components/reports/subject/instructor-group';

module('Integration | Component | reports/subject/instructor-group', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  const responseData = {
    data: {
      instructorGroups: [{ title: 'first Group' }, { title: 'Second Group' }],
    },
  };

  test('it renders', async function (assert) {
    assert.expect(4);
    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(query, 'query { instructorGroups { title, school { title } } }');
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'instructor group',
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(
      <template>
        <InstructorGroup
          @subject={{this.report.subject}}
          @prepositionalObject={{this.report.prepositionalObject}}
          @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
        />
      </template>,
    );

    assert.strictEqual(component.results.length, 2);
    assert.strictEqual(component.results[0].title, 'first Group');
    assert.strictEqual(component.results[1].title, 'Second Group');
  });

  test('it renders all results when resultsLengthMax is not reached', async function (assert) {
    assert.expect(3);

    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(query, 'query { instructorGroups { title, school { title } } }');
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'instructor group',
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(
      <template>
        <InstructorGroup
          @subject={{this.report.subject}}
          @prepositionalObject={{this.report.prepositionalObject}}
          @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
        />
      </template>,
    );

    assert.strictEqual(
      component.results.length,
      2,
      'responseData shows all 2 of 2 instructor groups',
    );
    assert.notOk(component.hasFullResultsDownloadButton, 'full results download button is hidden');
  });

  test('it renders limited results and an extra download button when resultsLengthMax is eclipsed', async function (assert) {
    assert.expect(3);

    const responseDataLarge = {
      data: {
        instructorGroups: [],
      },
    };

    for (let i = 0; i < 220; i++) {
      responseDataLarge.data.instructorGroups.push({
        title: `instructor group ${i}`,
      });
    }

    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(query, 'query { instructorGroups { title, school { title } } }');
      return responseDataLarge;
    });
    const { id } = this.server.create('report', {
      subject: 'instructor group',
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(
      <template>
        <InstructorGroup
          @subject={{this.report.subject}}
          @prepositionalObject={{this.report.prepositionalObject}}
          @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
        />
      </template>,
    );

    assert.strictEqual(
      component.results.length,
      200,
      'responseDataLarge shows only 200 of 220 instructor groups',
    );
    assert.ok(component.hasFullResultsDownloadButton, 'full results download button is present');
  });

  test('filter by school', async function (assert) {
    assert.expect(1);
    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(
        query,
        'query { instructorGroups(schools: [33]) { title, school { title } } }',
      );
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'instructor group',
      school: this.server.create('school', { id: 33 }),
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    this.set('school', await this.owner.lookup('service:store').findRecord('school', 33));
    await render(
      <template>
        <InstructorGroup
          @subject={{this.report.subject}}
          @prepositionalObject={{this.report.prepositionalObject}}
          @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
          @school={{this.school}}
        />
      </template>,
    );
  });

  test('filter by course', async function (assert) {
    assert.expect(1);
    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(
        query,
        'query { instructorGroups(courses: [13]) { title, school { title } } }',
      );
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'instructor group',
      prepositionalObject: 'course',
      prepositionalObjectTableRowId: 13,
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(
      <template>
        <InstructorGroup
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
        'query { instructorGroups(schools: [24], sessions: [13]) { title, school { title } } }',
      );
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'instructor group',
      school: this.server.create('school', { id: 24 }),
      prepositionalObject: 'session',
      prepositionalObjectTableRowId: 13,
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    this.set('school', await this.owner.lookup('service:store').findRecord('school', 24));
    await render(
      <template>
        <InstructorGroup
          @subject={{this.report.subject}}
          @prepositionalObject={{this.report.prepositionalObject}}
          @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
          @school={{this.school}}
        />
      </template>,
    );
  });
});
