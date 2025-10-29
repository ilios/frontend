import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import { component } from 'frontend/tests/pages/components/reports/subject/program-year';
import { setupAuthentication } from 'ilios-common';
import ProgramYear from 'frontend/components/reports/subject/program-year';

module('Integration | Component | reports/subject/program-year', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  const responseData = {
    data: {
      programYears: [
        {
          id: 1,
          startYear: 2020,
          program: { id: 1, title: 'Program 1', duration: 2, school: { title: 'School B' } },
        },
        {
          id: 2,
          startYear: 2019,
          program: { id: 1, title: 'Program 1', duration: 2, school: { title: 'School B' } },
        },
        {
          id: 3,
          startYear: 2023,
          program: { id: 2, title: 'Program 2', duration: 5, school: { title: 'School A' } },
        },
      ],
    },
  };

  test('it renders for user with permissions', async function (assert) {
    await setupAuthentication({}, true);
    this.server.post('api/graphql', function (schema, { requestBody }) {
      assert.step('API called');
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(
        query,
        'query { programYears { id, startYear, program { id, title, duration, school { title } } } }',
      );
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'program year',
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(
      <template>
        <ProgramYear
          @subject={{this.report.subject}}
          @prepositionalObject={{this.report.prepositionalObject}}
          @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
        />
      </template>,
    );

    assert.strictEqual(component.results.length, 3);
    assert.ok(component.results[0].hasLink);
    assert.ok(component.results[1].hasLink);
    assert.ok(component.results[2].hasLink);
    assert.ok(component.results[0].hasSchool);
    assert.ok(component.results[1].hasSchool);
    assert.ok(component.results[2].hasSchool);
    assert.strictEqual(component.results[0].school, 'School A:');
    assert.strictEqual(component.results[1].school, 'School B:');
    assert.strictEqual(component.results[2].school, 'School B:');
    assert.strictEqual(component.results[0].program, 'Program 2:');
    assert.strictEqual(component.results[1].program, 'Program 1:');
    assert.strictEqual(component.results[2].program, 'Program 1:');
    assert.strictEqual(component.results[0].title, '2028');
    assert.strictEqual(component.results[1].title, '2021');
    assert.strictEqual(component.results[2].title, '2022');
    assert.strictEqual(component.results[0].link, '/programs/2/programyears/3');
    assert.strictEqual(component.results[1].link, '/programs/1/programyears/2');
    assert.strictEqual(component.results[2].link, '/programs/1/programyears/1');
    assert.verifySteps(['API called']);
  });

  test('it renders for user with no permissions', async function (assert) {
    await setupAuthentication();
    this.server.post('api/graphql', function (schema, { requestBody }) {
      assert.step('API called');
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(
        query,
        'query { programYears { id, startYear, program { id, title, duration, school { title } } } }',
      );
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'program year',
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(
      <template>
        <ProgramYear
          @subject={{this.report.subject}}
          @prepositionalObject={{this.report.prepositionalObject}}
          @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
        />
      </template>,
    );

    assert.strictEqual(component.results.length, 3);
    assert.notOk(component.results[0].hasLink);
    assert.notOk(component.results[1].hasLink);
    assert.notOk(component.results[2].hasLink);
    assert.ok(component.results[0].hasSchool);
    assert.ok(component.results[1].hasSchool);
    assert.ok(component.results[2].hasSchool);
    assert.strictEqual(component.results[0].school, 'School A:');
    assert.strictEqual(component.results[1].school, 'School B:');
    assert.strictEqual(component.results[2].school, 'School B:');
    assert.strictEqual(component.results[0].program, 'Program 2:');
    assert.strictEqual(component.results[1].program, 'Program 1:');
    assert.strictEqual(component.results[2].program, 'Program 1:');
    assert.strictEqual(component.results[0].title, '2028');
    assert.strictEqual(component.results[1].title, '2021');
    assert.strictEqual(component.results[2].title, '2022');
    assert.verifySteps(['API called']);
  });

  test('it renders all results when resultsLengthMax is not reached', async function (assert) {
    await setupAuthentication({}, true);

    this.server.post('api/graphql', function (schema, { requestBody }) {
      assert.step('API called');
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(
        query,
        'query { programYears { id, startYear, program { id, title, duration, school { title } } } }',
      );
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'program year',
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(
      <template>
        <ProgramYear
          @subject={{this.report.subject}}
          @prepositionalObject={{this.report.prepositionalObject}}
          @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
        />
      </template>,
    );

    assert.strictEqual(component.results.length, 3, 'responseData shows all 3 of 3 program years');
    assert.notOk(component.hasFullResultsDownloadButton, 'full results download button is hidden');
    assert.verifySteps(['API called']);
  });

  test('it renders limited results and an extra download button when resultsLengthMax is eclipsed', async function (assert) {
    await setupAuthentication({}, true);

    const years = [2020, 2021, 2022, 2023, 2024, 2025];
    const alphabet = [...Array(26).keys()].map((i) => String.fromCharCode(i + 65));
    const responseDataLarge = {
      data: {
        programYears: [],
      },
    };

    for (let i = 0; i < 220; i++) {
      const letter = alphabet[Math.floor(Math.random() * alphabet.length)];
      responseDataLarge.data.programYears.push({
        id: i,
        startYear: years[Math.floor(Math.random() * years.length)],
        program: {
          title: `program ${i}`,
          duration: Math.floor(Math.random() * 100),
          school: { title: `School ${letter}` },
        },
      });
    }

    this.server.post('api/graphql', function (schema, { requestBody }) {
      assert.step('API called');
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(
        query,
        'query { programYears { id, startYear, program { id, title, duration, school { title } } } }',
      );
      return responseDataLarge;
    });
    const { id } = this.server.create('report', {
      subject: 'program year',
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(
      <template>
        <ProgramYear
          @subject={{this.report.subject}}
          @prepositionalObject={{this.report.prepositionalObject}}
          @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
        />
      </template>,
    );

    assert.strictEqual(
      component.results.length,
      200,
      'responseDataLarge shows only 200 of 220 program years',
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
        'query { programYears(schools: [33]) { id, startYear, program { id, title, duration, school { title } } } }',
      );
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'program year',
      school: this.server.create('school', { id: 33 }),
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    this.set('school', await this.owner.lookup('service:store').findRecord('school', 33));
    await render(
      <template>
        <ProgramYear
          @subject={{this.report.subject}}
          @prepositionalObject={{this.report.prepositionalObject}}
          @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
          @school={{this.school}}
        />
      </template>,
    );

    assert.strictEqual(component.results.length, 3);
    assert.notOk(component.results[0].hasSchool);
    assert.notOk(component.results[1].hasSchool);
    assert.notOk(component.results[2].hasSchool);
    assert.strictEqual(component.results[0].title, '2028');
    assert.strictEqual(component.results[1].title, '2021');
    assert.strictEqual(component.results[2].title, '2022');
    assert.verifySteps(['API called']);
  });
});
