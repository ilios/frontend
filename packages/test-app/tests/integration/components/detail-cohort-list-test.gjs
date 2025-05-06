import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render, findAll } from '@ember/test-helpers';
import { setupMirage } from 'test-app/tests/test-support/mirage';
import DetailCohortList from 'ilios-common/components/detail-cohort-list';

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
    assert.dom('th').hasText('School');
    assert.dom(findAll('th')[1]).hasText('Program');
    assert.dom(findAll('th')[2]).hasText('Cohort');
    assert.dom('tbody tr').exists({ count: 2 });
    assert.dom('tbody tr:nth-of-type(1) td').hasText('School of Life');
    assert.dom(findAll('tbody tr:nth-of-type(1) td')[1]).hasText('Professional Pie Eating');
    assert.dom(findAll('tbody tr:nth-of-type(1) td')[2]).hasText('Aardvark');
    assert.dom('tbody tr:nth-of-type(2) td').hasText('Starfleet Academy');
    assert.dom(findAll('tbody tr:nth-of-type(2) td')[1]).hasText('Doctor of Rocket Surgery');
    assert.dom(findAll('tbody tr:nth-of-type(2) td')[2]).hasText('Class of 2011');
  });
});
