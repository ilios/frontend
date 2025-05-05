import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import { component } from 'frontend/tests/pages/components/user-profile-cohorts-details';
import UserProfileCohortsDetails from 'frontend/components/user-profile-cohorts-details';
import { array } from '@ember/helper';

module('Integration | Component | user-profile-cohorts-details', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const school1 = this.server.create('school');
    const school2 = this.server.create('school');
    const program1 = this.server.create('program', { school: school1 });
    const program2 = this.server.create('program', { school: school2 });
    const programYear1 = this.server.create('program-year', { program: program1 });
    const programYear2 = this.server.create('program-year', { program: program2 });
    const programYear3 = this.server.create('program-year', { program: program1 });
    const programYear4 = this.server.create('program-year', { program: program2 });

    const cohort1 = this.server.create('cohort', { programYear: programYear1 });
    const cohort2 = this.server.create('cohort', { programYear: programYear2 });
    const cohort3 = this.server.create('cohort', { programYear: programYear3 });
    const cohort4 = this.server.create('cohort', { programYear: programYear4 });

    this.cohort1 = await await this.owner.lookup('service:store').findRecord('cohort', cohort1.id);
    this.cohort2 = await await this.owner.lookup('service:store').findRecord('cohort', cohort2.id);
    this.cohort3 = await await this.owner.lookup('service:store').findRecord('cohort', cohort3.id);
    this.cohort4 = await await this.owner.lookup('service:store').findRecord('cohort', cohort4.id);
  });

  test('it renders', async function (assert) {
    this.set('primaryCohort', this.cohort1);
    this.set('secondaryCohorts', [this.cohort2, this.cohort3, this.cohort4]);
    await render(
      <template>
        <UserProfileCohortsDetails
          @primaryCohort={{this.primaryCohort}}
          @secondaryCohorts={{this.secondaryCohorts}}
        />
      </template>,
    );

    assert.strictEqual(component.primaryCohort.title, 'school 0 program 0 cohort 0');
    assert.strictEqual(component.secondaryCohorts.length, 3);
    assert.strictEqual(component.secondaryCohorts[0].title, 'school 0 program 0 cohort 2');
    assert.strictEqual(component.secondaryCohorts[1].title, 'school 1 program 1 cohort 1');
    assert.strictEqual(component.secondaryCohorts[2].title, 'school 1 program 1 cohort 3');
  });

  test('it renders empty', async function (assert) {
    this.set('primaryCohort', this.cohort1);
    this.set('secondaryCohorts', [this.cohort2, this.cohort3, this.cohort4]);
    await render(
      <template>
        <UserProfileCohortsDetails @primaryCohort={{null}} @secondaryCohorts={{(array)}} />
      </template>,
    );

    assert.strictEqual(component.primaryCohort.title, 'None');
    assert.strictEqual(component.secondaryCohorts.length, 1);
    assert.strictEqual(component.secondaryCohorts[0].title, 'None');
  });
});
