import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import { component } from 'frontend/tests/pages/components/reports/subject/instructor';

module('Integration | Component | reports/subject/instructor', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  const responseData = {
    data: {
      users: [
        { id: 1, firstName: 'First', middleName: 'Middle', lastName: 'Last', displayName: '' },
        { id: 2, firstName: 'Second', middleName: 'Middle', lastName: 'Last', displayName: 'abc' },
      ],
    },
  };

  test('it renders', async function (assert) {
    assert.expect(4);
    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(query, 'query { users { firstName,middleName,lastName,displayName } }');
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'instructor',
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(hbs`<Reports::Subject::Instructor
  @subject={{this.report.subject}}
  @prepositionalObject={{this.report.prepositionalObject}}
  @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
/>`);

    assert.strictEqual(component.results.length, 2);
    assert.strictEqual(component.results[0].name, 'abc');
    assert.strictEqual(component.results[1].name, 'First M. Last');
  });

  test('it renders all results when resultsLengthMax is not reached', async function (assert) {
    assert.expect(3);

    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(query, 'query { users { firstName,middleName,lastName,displayName } }');
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'instructor',
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(hbs`<Reports::Subject::Instructor
  @subject={{this.report.subject}}
  @prepositionalObject={{this.report.prepositionalObject}}
  @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
/>`);

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
      });
    }

    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(query, 'query { users { firstName,middleName,lastName,displayName } }');
      return responseDataLarge;
    });
    const { id } = this.server.create('report', {
      subject: 'instructor',
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(hbs`<Reports::Subject::Instructor
  @subject={{this.report.subject}}
  @prepositionalObject={{this.report.prepositionalObject}}
  @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
/>`);

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
        'query { users(schools: [33]) { firstName,middleName,lastName,displayName } }',
      );
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'instructor',
      school: this.server.create('school', { id: 33 }),
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    this.set('school', await this.owner.lookup('service:store').findRecord('school', 33));
    await render(hbs`<Reports::Subject::Instructor
  @subject={{this.report.subject}}
  @prepositionalObject={{this.report.prepositionalObject}}
  @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
  @school={{this.school}}
/>`);
  });

  test('filter by course', async function (assert) {
    assert.expect(1);
    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(
        query,
        `query { courses(ids: [13]) { sessions {
        ilmSession { instructorGroups {  users { id firstName middleName lastName displayName }} instructors { id firstName middleName lastName displayName } }
        offerings { instructorGroups {  users { id firstName middleName lastName displayName }} instructors { id firstName middleName lastName displayName } }
      } } }`,
      );
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'instructor',
      prepositionalObject: 'course',
      prepositionalObjectTableRowId: 13,
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(hbs`<Reports::Subject::Instructor
  @subject={{this.report.subject}}
  @prepositionalObject={{this.report.prepositionalObject}}
  @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
/>`);
  });

  test('filter by school and session', async function (assert) {
    assert.expect(1);
    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(
        query,
        'query { users(schools: [24], instructedSessions: [13]) { firstName,middleName,lastName,displayName } }',
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
    await render(hbs`<Reports::Subject::Instructor
  @subject={{this.report.subject}}
  @prepositionalObject={{this.report.prepositionalObject}}
  @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
  @school={{this.school}}
/>`);
  });

  test('filter by academic year', async function (assert) {
    assert.expect(5);
    let counter = 0;
    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      counter++;
      const { users } = responseData.data;
      switch (counter) {
        case 1:
          assert.strictEqual(query, 'query { courses(academicYears: [2005]) { id } }');
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
    await render(hbs`<Reports::Subject::Instructor
  @subject={{this.report.subject}}
  @prepositionalObject={{this.report.prepositionalObject}}
  @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
/>`);

    assert.strictEqual(component.results.length, 2);
    assert.strictEqual(component.results[0].name, 'abc');
    assert.strictEqual(component.results[1].name, 'First M. Last');
  });

  test('filter by session types', async function (assert) {
    assert.expect(1);
    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(
        query,
        'query { users(instructedSessionTypes: [4]) { firstName,middleName,lastName,displayName } }',
      );
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'instructor',
      prepositionalObject: 'session type',
      prepositionalObjectTableRowId: 4,
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(hbs`<Reports::Subject::Instructor
  @subject={{this.report.subject}}
  @prepositionalObject={{this.report.prepositionalObject}}
  @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
/>`);
  });
});
