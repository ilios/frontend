import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMSW } from 'ilios-common/msw';
import { setupAuthentication } from 'ilios-common';
import { component } from 'frontend/tests/pages/components/unassigned-students-summary';
import UnassignedStudentsSummary from 'frontend/components/unassigned-students-summary';
import { formatJsonApi } from 'ilios-common/msw/utils/json-api-formatter.js';

module('Integration | Component | unassigned students summary', function (hooks) {
  setupRenderingTest(hooks);
  setupMSW(hooks);

  test('it renders', async function (assert) {
    const school = await this.server.create('school', {
      id: 1,
      title: 'school 0',
    });
    await this.server.create('school', {
      id: 2,
      title: 'school 1',
    });
    await setupAuthentication({ school });
    const schoolModels = await this.owner.lookup('service:store').findAll('school');

    const studentRole = await this.server.create('user-role', {
      id: 4,
      title: 'Student',
    });
    this.users = await this.server.createList('user', 5, {
      school,
      roles: [studentRole],
    });

    this.server.get('/api/users', ({ request }) => {
      const { searchParams } = new URL(request.url);
      assert.strictEqual(Number(searchParams.get('filters[school]')), 1);
      assert.strictEqual(searchParams.getAll('filters[roles][]').length, 1);
      assert.deepEqual(searchParams.getAll('filters[roles][]'), ['4']);
      assert.strictEqual(searchParams.get('filters[cohorts]'), '');

      assert.step('API called');
      return formatJsonApi(this.users, 'user');
    });

    this.set('schools', schoolModels);
    await render(<template><UnassignedStudentsSummary @schools={{this.schools}} /></template>);

    assert.strictEqual(component.title, 'Students Requiring Cohort Assignment');
    assert.strictEqual(component.schools.length, 2);
    assert.ok(component.hasMultipleSchools);
    assert.strictEqual(component.schools[0].text, 'school 0');
    assert.strictEqual(component.schools[1].text, 'school 1');
    assert.strictEqual(component.selectedSchool, '1');
    assert.strictEqual(
      component.summaryText,
      'There are 5 students needing assignment to a cohort.',
    );
    assert.ok(component.hasManageLink);
    assert.ok(component.hasAlert);
    assert.verifySteps(['API called']);
  });

  test('it renders empty', async function (assert) {
    const school = await this.server.create('school', {
      id: 1,
      title: 'school 0',
    });
    await setupAuthentication({ school });
    const schoolModels = await this.owner.lookup('service:store').findAll('school');
    this.set('schools', schoolModels);
    await render(<template><UnassignedStudentsSummary @schools={{this.schools}} /></template>);

    assert.strictEqual(component.title, 'Students Requiring Cohort Assignment');
    assert.strictEqual(component.singleSelectedSchool, 'school 0');
    assert.notOk(component.hasMultipleSchools);
    assert.strictEqual(
      component.summaryText,
      'There are 0 students needing assignment to a cohort.',
    );

    assert.notOk(component.hasManageLink);
    assert.notOk(component.hasAlert);
  });
});
