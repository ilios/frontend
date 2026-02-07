import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMirage } from 'test-app/tests/test-support/mirage';
import DetailCohortList from 'ilios-common/components/detail-cohort-list';
import { component } from 'ilios-common/page-objects/components/detail-cohort-list';

module('Integration | Component | detail cohort list', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function (assert) {
    const school1 = this.server.create('school', {
      title: 'School of Life',
    });
    const school2 = this.server.create('school', {
      title: 'Starfleet Academy',
    });

    const program1 = this.server.create('program', {
      title: 'Professional Pie Eating',
      school: school1,
    });
    const program2 = this.server.create('program', {
      title: 'Doctor of Rocket Surgery',
      school: school2,
      duration: 5,
    });
    const programYear1 = this.server.create('program-year', {
      program: program1,
    });
    const programYear2 = this.server.create('program-year', {
      startYear: 2006,
      program: program2,
    });
    this.server.create('cohort', {
      title: 'Aardvark',
      programYear: programYear1,
    });
    this.server.create('cohort', {
      title: null,
      programYear: programYear2,
    });

    const cohorts = await this.owner.lookup('service:store').findAll('cohort');

    this.set('cohorts', cohorts);
    await render(<template><DetailCohortList @cohorts={{this.cohorts}} /></template>);
    assert.strictEqual(component.header.school, 'School');
    assert.strictEqual(component.header.program, 'Program');
    assert.strictEqual(component.header.cohort, 'Cohort');
    assert.strictEqual(component.cohorts.length, 2);
    assert.strictEqual(component.cohorts[0].school, 'School of Life');
    assert.strictEqual(component.cohorts[0].program, 'Professional Pie Eating');
    assert.strictEqual(component.cohorts[0].cohort, 'Aardvark');
    assert.strictEqual(component.cohorts[1].school, 'Starfleet Academy');
    assert.strictEqual(component.cohorts[1].program, 'Doctor of Rocket Surgery');
    assert.strictEqual(component.cohorts[1].cohort, 'Class of 2011');
  });
});
