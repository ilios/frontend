import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';
import { component } from 'ilios/tests/pages/components/unassigned-students-summary';

module('Integration | Component | unassigned students summary', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function (assert) {
    assert.expect(12);
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
      assert.strictEqual(parseInt(queryParams['filters[school]'], 10), 1);
      assert.deepEqual(queryParams['filters[roles]'], ['4']);
      assert.strictEqual(queryParams['filters[cohorts]'], '');
      return schema.users.find([2, 3, 4, 5, 6]);
    });

    this.set('schools', schoolModels);
    await render(hbs`<UnassignedStudentsSummary @schools={{this.schools}} />`);

    assert.strictEqual(component.title, 'Students Requiring Cohort Assignment');
    assert.strictEqual(component.schools.length, 2);
    assert.ok(component.hasMultipleSchools);
    assert.strictEqual(component.schools[0].text, 'school 0');
    assert.strictEqual(component.schools[1].text, 'school 1');
    assert.strictEqual(component.selectedSchool, '1');
    assert.strictEqual(
      component.summaryText,
      'There are 5 students needing assignment to a cohort'
    );
    assert.ok(component.hasManageLink);
    assert.ok(component.hasAlert);
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

    assert.strictEqual(component.title, 'Students Requiring Cohort Assignment');
    assert.strictEqual(component.singleSelectedSchool, 'school 0');
    assert.notOk(component.hasMultipleSchools);
    assert.strictEqual(
      component.summaryText,
      'There are 0 students needing assignment to a cohort'
    );

    assert.notOk(component.hasManageLink);
    assert.notOk(component.hasAlert);
  });
});
