import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';

module('Integration | Component | unassigned students summary', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function (assert) {
    const school = this.server.create('school', {
      id: 1,
      title: 'school 0',
    });
    this.server.create('school', {
      id: 2,
      title: 'school 1',
    });
    await setupAuthentication({
      school,
    });
    const schoolModels = await this.owner.lookup('service:store').findAll('school');

    const studentRole = this.server.create('user-role', {
      id: 4,
      title: 'Student',
    });
    this.server.createList('user', 5, {
      school,
      roles: [studentRole],
    });

    this.server.get('api/users', (schema, { queryParams }) => {
      assert.equal(queryParams['filters[school]'], 1);
      assert.deepEqual(queryParams['filters[roles]'], ['4']);
      assert.equal(queryParams['filters[cohorts]'], '');
      return schema.users.find([2, 3, 4, 5, 6]);
    });

    this.set('schools', schoolModels);
    await render(hbs`<UnassignedStudentsSummary @schools={{this.schools}} />`);

    assert
      .dom(this.element)
      .hasText(
        'Students Requiring Cohort Assignment school 0 school 1 There are 5 students needing assignment to a cohort Manage'
      );

    const options = findAll('option');
    assert.equal(options.length, 2);
    assert.dom(options[0]).hasText('school 0');
    assert.dom(options[1]).hasText('school 1');

    assert.dom('[data-test-manage-link]').exists({ count: 1 });
    assert.dom('div:nth-of-type(2)').hasClass('alert');
  });

  test('it renders empty', async function (assert) {
    const school = this.server.create('school', {
      id: 1,
      title: 'school 0',
    });
    await setupAuthentication({
      school,
    });
    const schoolModels = await this.owner.lookup('service:store').findAll('school');
    this.set('schools', schoolModels);
    await render(hbs`<UnassignedStudentsSummary @schools={{this.schools}} />`);
    assert
      .dom(this.element)
      .hasText(
        'Students Requiring Cohort Assignment school 0 There are 0 students needing assignment to a cohort'
      );
    assert.dom('div:nth-of-type(2)').hasNoClass('alert');
    assert.dom('[data-test-manage-link]').doesNotExist();
  });
});
