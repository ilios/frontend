import { module, test } from 'qunit';
import { setupRenderingTest } from 'ilios/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { component } from 'ilios/tests/pages/components/reports/subject/program-year';
import { setupAuthentication } from 'ilios-common';

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
    assert.expect(20);
    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(
        query,
        'query { programYears { id, startYear, program { id, title, duration, school { title } } } }'
      );
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'program year',
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(hbs`<Reports::Subject::ProgramYear @report={{this.report}} />`);

    assert.strictEqual(component.results.length, 3);
    assert.ok(component.results[0].hasLink);
    assert.ok(component.results[1].hasLink);
    assert.ok(component.results[2].hasLink);
    assert.ok(component.results[0].hasSchool);
    assert.ok(component.results[1].hasSchool);
    assert.ok(component.results[2].hasSchool);
    assert.strictEqual(component.results[0].school, 'School A -');
    assert.strictEqual(component.results[1].school, 'School B -');
    assert.strictEqual(component.results[2].school, 'School B -');
    assert.strictEqual(component.results[0].program, 'Program 2:');
    assert.strictEqual(component.results[1].program, 'Program 1:');
    assert.strictEqual(component.results[2].program, 'Program 1:');
    assert.strictEqual(component.results[0].title, '2028');
    assert.strictEqual(component.results[1].title, '2021');
    assert.strictEqual(component.results[2].title, '2022');
    assert.strictEqual(component.results[0].link, '/programs/2/programyears/3');
    assert.strictEqual(component.results[1].link, '/programs/1/programyears/2');
    assert.strictEqual(component.results[2].link, '/programs/1/programyears/1');
  });

  test('it renders for user with no permissions', async function (assert) {
    await setupAuthentication();
    assert.expect(17);
    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(
        query,
        'query { programYears { id, startYear, program { id, title, duration, school { title } } } }'
      );
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'program year',
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(hbs`<Reports::Subject::ProgramYear @report={{this.report}} />`);

    assert.strictEqual(component.results.length, 3);
    assert.notOk(component.results[0].hasLink);
    assert.notOk(component.results[1].hasLink);
    assert.notOk(component.results[2].hasLink);
    assert.ok(component.results[0].hasSchool);
    assert.ok(component.results[1].hasSchool);
    assert.ok(component.results[2].hasSchool);
    assert.strictEqual(component.results[0].school, 'School A -');
    assert.strictEqual(component.results[1].school, 'School B -');
    assert.strictEqual(component.results[2].school, 'School B -');
    assert.strictEqual(component.results[0].program, 'Program 2:');
    assert.strictEqual(component.results[1].program, 'Program 1:');
    assert.strictEqual(component.results[2].program, 'Program 1:');
    assert.strictEqual(component.results[0].title, '2028');
    assert.strictEqual(component.results[1].title, '2021');
    assert.strictEqual(component.results[2].title, '2022');
  });

  test('filter by school', async function (assert) {
    assert.expect(8);
    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(
        query,
        'query { programYears(schools: [33]) { id, startYear, program { id, title, duration, school { title } } } }'
      );
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'program year',
      school: this.server.create('school', { id: 33 }),
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(hbs`<Reports::Subject::ProgramYear @report={{this.report}} />`);

    assert.strictEqual(component.results.length, 3);
    assert.notOk(component.results[0].hasSchool);
    assert.notOk(component.results[1].hasSchool);
    assert.notOk(component.results[2].hasSchool);
    assert.strictEqual(component.results[0].title, '2028');
    assert.strictEqual(component.results[1].title, '2021');
    assert.strictEqual(component.results[2].title, '2022');
  });
});
