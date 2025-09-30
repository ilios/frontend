import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import { component } from 'frontend/tests/pages/components/reports/subject/instructor';
import Instructor from 'frontend/components/reports/subject/instructor';

module('Integration | Component | reports/subject/instructor', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  const responseData = {
    data: {
      users: [
        {
          id: 1,
          firstName: 'First',
          middleName: 'Middle',
          lastName: 'Last',
          displayName: '',
          school: { title: 'School 1' },
        },
        {
          id: 2,
          firstName: 'Second',
          middleName: 'Middle',
          lastName: 'Last',
          displayName: 'abc',
          school: { title: 'School 2' },
        },
      ],
    },
  };

  test('it renders', async function (assert) {
    assert.expect(6);
    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(
        query,
        'query { users { firstName, middleName, lastName, displayName, school { title } } }',
      );
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'instructor',
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(
      <template>
        <Instructor
          @subject={{this.report.subject}}
          @prepositionalObject={{this.report.prepositionalObject}}
          @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
        />
      </template>,
    );

    assert.strictEqual(component.results.length, 2);
    assert.strictEqual(component.results[0].school, 'School 1:');
    assert.strictEqual(component.results[0].name, 'First M. Last');
    assert.strictEqual(component.results[1].school, 'School 2:');
    assert.strictEqual(component.results[1].name, 'abc');
  });

  test('it renders all results when resultsLengthMax is not reached', async function (assert) {
    assert.expect(3);

    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(
        query,
        'query { users { firstName, middleName, lastName, displayName, school { title } } }',
      );
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'instructor',
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(
      <template>
        <Instructor
          @subject={{this.report.subject}}
          @prepositionalObject={{this.report.prepositionalObject}}
          @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
        />
      </template>,
    );

    assert.strictEqual(component.results.length, 2, 'responseData shows all 2 of 2 instructors');
    assert.notOk(component.hasFullResultsDownloadButton, 'full results download button is hidden');
  });

  test('it renders limited results and an extra download button when resultsLengthMax is eclipsed', async function (assert) {
    assert.expect(3);

    const responseDataLarge = {
      data: {
        users: [],
      },
    };

    for (let i = 0; i < 220; i++) {
      responseDataLarge.data.users.push({
        firstName: `First${i}`,
        middleName: `Middle${i}`,
        lastName: `Last${i}`,
        displayName: `abc`,
        school: { title: `School ${i}` },
      });
    }

    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(
        query,
        'query { users { firstName, middleName, lastName, displayName, school { title } } }',
      );
      return responseDataLarge;
    });
    const { id } = this.server.create('report', {
      subject: 'instructor',
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(
      <template>
        <Instructor
          @subject={{this.report.subject}}
          @prepositionalObject={{this.report.prepositionalObject}}
          @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
        />
      </template>,
    );

    assert.strictEqual(
      component.results.length,
      200,
      'responseDataLarge shows only 200 of 220 instructors',
    );
    assert.ok(component.hasFullResultsDownloadButton, 'full results download button is present');
  });

  test('filter by school', async function (assert) {
    assert.expect(1);
    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(
        query,
        'query { users(schools: [33]) { firstName, middleName, lastName, displayName, school { title } } }',
      );
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'instructor',
      school: this.server.create('school', { id: 33 }),
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    this.set('school', await this.owner.lookup('service:store').findRecord('school', 33));
    await render(
      <template>
        <Instructor
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
        `query { courses(ids: [13]) { sessions {
        ilmSession { instructorGroups {  users { id firstName middleName lastName displayName school { title } }} instructors { id firstName middleName lastName displayName school { title } } }
        offerings { instructorGroups {  users { id firstName middleName lastName displayName school { title } }} instructors { id firstName middleName lastName displayName school { title } } }
      }, school { title } } }`,
      );
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'instructor',
      prepositionalObject: 'course',
      prepositionalObjectTableRowId: 13,
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(
      <template>
        <Instructor
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
        'query { users(schools: [24], instructedSessions: [13]) { firstName, middleName, lastName, displayName, school { title } } }',
      );
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'instructor',
      school: this.server.create('school', { id: 24 }),
      prepositionalObject: 'session',
      prepositionalObjectTableRowId: 13,
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    this.set('school', await this.owner.lookup('service:store').findRecord('school', 24));
    await render(
      <template>
        <Instructor
          @subject={{this.report.subject}}
          @prepositionalObject={{this.report.prepositionalObject}}
          @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
          @school={{this.school}}
        />
      </template>,
    );
  });

  test('filter by academic year', async function (assert) {
    assert.expect(7);
    let counter = 0;
    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      counter++;
      const { users } = responseData.data;
      switch (counter) {
        case 1:
          assert.strictEqual(
            query,
            'query { courses(academicYears: [2005]) { id, school { title } } }',
          );
          return {
            data: {
              courses: [{ id: 1 }, { id: 31 }],
            },
          };
        case 2:
          assert.ok(query.includes('query { courses(ids: [1,31])'));
          return {
            data: {
              courses: [
                { sessions: [{ offerings: [{ instructors: [users[1]], instructorGroups: [] }] }] },
                {
                  sessions: [
                    {
                      ilmSession: { instructors: [users[0]], instructorGroups: [] },
                      offerings: [],
                      instructorGroups: [],
                    },
                  ],
                },
              ],
            },
          };
        default:
          assert.ok(false, 'too many queries');
      }
    });
    const { id } = this.server.create('report', {
      subject: 'instructor',
      prepositionalObject: 'academic year',
      prepositionalObjectTableRowId: 2005,
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(
      <template>
        <Instructor
          @subject={{this.report.subject}}
          @prepositionalObject={{this.report.prepositionalObject}}
          @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
        />
      </template>,
    );

    assert.strictEqual(component.results.length, 2);
    assert.strictEqual(component.results[0].school, 'School 1:');
    assert.strictEqual(component.results[0].name, 'First M. Last');
    assert.strictEqual(component.results[1].school, 'School 2:');
    assert.strictEqual(component.results[1].name, 'abc');
  });

  test('filter by session types', async function (assert) {
    assert.expect(1);
    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(
        query,
        'query { users(instructedSessionTypes: [4]) { firstName, middleName, lastName, displayName, school { title } } }',
      );
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'instructor',
      prepositionalObject: 'session type',
      prepositionalObjectTableRowId: 4,
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(
      <template>
        <Instructor
          @subject={{this.report.subject}}
          @prepositionalObject={{this.report.prepositionalObject}}
          @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
        />
      </template>,
    );
  });

  test('filter by learning material', async function (assert) {
    assert.expect(7);
    let counter = 0;
    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      counter++;
      const { users } = responseData.data;
      switch (counter) {
        case 1:
          assert.strictEqual(
            query,
            'query { courses(learningMaterials: [1]) { id, school { title } } }',
            'correct first query is run',
          );
          return {
            data: {
              courses: [
                {
                  id: 1,
                },
              ],
            },
          };
        case 2:
          assert.ok(query.includes('query { courses(ids: [1])'), 'correct second query is run');
          return {
            data: {
              courses: [
                { sessions: [{ offerings: [{ instructors: [users[1]], instructorGroups: [] }] }] },
                {
                  sessions: [
                    {
                      ilmSession: { instructors: [users[0]], instructorGroups: [] },
                      offerings: [],
                      instructorGroups: [],
                    },
                  ],
                },
              ],
            },
          };
        default:
          assert.ok(false, 'too many queries');
      }
    });
    const { id } = this.server.create('report', {
      subject: 'instructor',
      prepositionalObject: 'learning material',
      prepositionalObjectTableRowId: 1,
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(
      <template>
        <Instructor
          @subject={{this.report.subject}}
          @prepositionalObject={{this.report.prepositionalObject}}
          @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
        />
      </template>,
    );

    assert.strictEqual(component.results.length, 2, 'result count is correct');
    assert.strictEqual(component.results[0].school, 'School 1:', 'result row school is correct');
    assert.strictEqual(component.results[0].name, 'First M. Last', 'result row name is correct');
    assert.strictEqual(component.results[1].school, 'School 2:', 'result row school is correct');
    assert.strictEqual(component.results[1].name, 'abc', 'result row name is correct');
  });
});
