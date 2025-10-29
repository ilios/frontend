import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import { setupAuthentication } from 'ilios-common';
import { component } from 'frontend/tests/pages/components/user-profile-cohorts';
import UserProfileCohorts from 'frontend/components/user-profile-cohorts';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | user profile cohorts', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const currentYear = new Date().getFullYear();
    const school1 = this.server.create('school');
    const school2 = this.server.create('school');
    const program1 = this.server.create('program', { school: school1, duration: 4 });
    const program2 = this.server.create('program', { school: school2, duration: 4 });
    const programYear1 = this.server.create('program-year', {
      program: program1,
      startYear: currentYear - program1.duration,
    });
    const programYear2 = this.server.create('program-year', {
      program: program2,
      startYear: currentYear - program2.duration,
    });
    const programYear3 = this.server.create('program-year', {
      program: program1,
      startYear: currentYear - program1.duration,
    });
    const programYear4 = this.server.create('program-year', {
      program: program2,
      startYear: currentYear - program2.duration,
    });
    const programYear5 = this.server.create('program-year', {
      program: program1,
      startYear: currentYear - program1.duration,
    });

    this.cohort1 = this.server.create('cohort', { programYear: programYear1 });
    this.cohort2 = this.server.create('cohort', { programYear: programYear2 });
    this.cohort3 = this.server.create('cohort', { programYear: programYear3 });
    this.cohort4 = this.server.create('cohort', { programYear: programYear4 });
    this.cohort5 = this.server.create('cohort', { programYear: programYear5 });

    const user = this.server.create('user', {
      primaryCohort: this.cohort1,
      cohorts: [this.cohort1, this.cohort2],
    });
    await setupAuthentication({
      school: school1,
      administeredSchools: [school1, school2],
    });

    this.user = await this.owner.lookup('service:store').findRecord('user', user.id);
  });

  test('it renders', async function (assert) {
    this.set('user', this.user);
    await render(<template><UserProfileCohorts @user={{this.user}} /></template>);
    assert.strictEqual(
      component.details.primaryCohort.text,
      'Primary Cohort: school 0 program 0 cohort 0',
    );
    assert.strictEqual(component.details.secondaryCohorts.length, 1);
    assert.strictEqual(component.details.secondaryCohorts[0].title, 'school 1 program 1 cohort 1');
  });

  test('clicking manage sends the action', async function (assert) {
    this.set('user', this.user);
    this.set('click', (what) => {
      assert.step('click called');
      assert.ok(what, 'recieved boolean true value');
    });
    await render(
      <template>
        <UserProfileCohorts
          @user={{this.user}}
          @isManageable={{true}}
          @setIsManaging={{this.click}}
        />
      </template>,
    );
    await component.manage();
    assert.verifySteps(['click called']);
  });

  test('can edit user cohorts', async function (assert) {
    this.set('user', this.user);

    await render(
      <template>
        <UserProfileCohorts @isManaging={{true}} @user={{this.user}} @setIsManaging={{(noop)}} />
      </template>,
    );

    assert.strictEqual(component.manager.primaryCohort.title, 'school 0 program 0 cohort 0');
    assert.strictEqual(component.manager.secondaryCohorts.length, 1);
    assert.strictEqual(component.manager.secondaryCohorts[0].title, 'school 1 program 1 cohort 1');
    assert.strictEqual(component.manager.schools.filter.value, '1');
    assert.strictEqual(component.manager.schools.filter.options.length, 2);
    assert.strictEqual(component.manager.assignableCohorts.length, 2);
    assert.strictEqual(component.manager.assignableCohorts[0].title, 'program 0 cohort 2');
    assert.strictEqual(component.manager.assignableCohorts[1].title, 'program 0 cohort 4');
    await component.manager.assignableCohorts[1].add();
    assert.strictEqual(component.manager.assignableCohorts.length, 1);
    assert.strictEqual(component.manager.assignableCohorts[0].title, 'program 0 cohort 2');
    assert.strictEqual(component.manager.secondaryCohorts.length, 2);
    assert.strictEqual(component.manager.secondaryCohorts[0].title, 'school 0 program 0 cohort 4');
    assert.strictEqual(component.manager.secondaryCohorts[1].title, 'school 1 program 1 cohort 1');
    await component.manager.secondaryCohorts[0].remove();
    assert.strictEqual(component.manager.assignableCohorts.length, 2);
    assert.strictEqual(component.manager.assignableCohorts[0].title, 'program 0 cohort 2');
    assert.strictEqual(component.manager.assignableCohorts[1].title, 'program 0 cohort 4');
    assert.strictEqual(component.manager.secondaryCohorts.length, 1);
    assert.strictEqual(component.manager.secondaryCohorts[0].title, 'school 1 program 1 cohort 1');
    await component.manager.schools.filter.select('2');
    assert.strictEqual(component.manager.assignableCohorts.length, 1);
    assert.strictEqual(component.manager.assignableCohorts[0].title, 'program 1 cohort 3');
    await component.manager.secondaryCohorts[0].promote();
    await component.manager.secondaryCohorts[0].remove();
    await component.manager.assignableCohorts[0].add();
    await component.save();

    assert.strictEqual(component.manager.schools.filter.value, '2');
    assert.strictEqual(component.manager.assignableCohorts.length, 0);
    assert.strictEqual(component.manager.primaryCohort.title, 'school 1 program 1 cohort 1');
    assert.strictEqual(component.manager.secondaryCohorts.length, 1);
    assert.strictEqual(component.manager.secondaryCohorts[0].title, 'school 1 program 1 cohort 3');

    await component.manager.schools.filter.select('1');

    assert.strictEqual(component.manager.assignableCohorts.length, 3);
    assert.strictEqual(component.manager.primaryCohort.title, 'school 1 program 1 cohort 1');
    assert.strictEqual(component.manager.secondaryCohorts.length, 1);
    assert.strictEqual(component.manager.secondaryCohorts[0].title, 'school 1 program 1 cohort 3');

    const user = this.server.schema.users.find(this.user.id);
    assert.strictEqual(user.primaryCohort.id, this.cohort2.id, 'user has correct primary cohort');
    assert.notOk(user.attrs.cohortIds.includes(this.cohort1.id), 'cohort1 has been removed');
    assert.ok(user.attrs.cohortIds.includes(this.cohort2.id), 'cohort2 is still present');
    assert.ok(user.attrs.cohortIds.includes(this.cohort4.id), 'cohort4 has been added');
  });
});
