import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render, settled } from '@ember/test-helpers';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import { setupAuthentication } from 'ilios-common';
import { component } from 'frontend/tests/pages/components/user-profile-cohorts-manager';
import UserProfileCohortsManager from 'frontend/components/user-profile-cohorts-manager';
import noop from 'ilios-common/helpers/noop';
import { array } from '@ember/helper';

module('Integration | Component | user-profile-cohorts-manager', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const currentYear = new Date().getFullYear();
    const school1 = this.server.create('school');
    const school2 = this.server.create('school');
    const program1 = this.server.create('program', { school: school1, duration: 1 });
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
      program: program2,
      startYear: currentYear - program2.duration - 4,
    });
    const programYear6 = this.server.create('program-year', {
      program: program2,
      startYear: currentYear - program2.duration - 5,
    });
    const programYear7 = this.server.create('program-year', {
      program: program2,
      startYear: currentYear - program2.duration + 5,
    });

    const cohort1 = this.server.create('cohort', { programYear: programYear1 });
    const cohort2 = this.server.create('cohort', { programYear: programYear2 });
    const cohort3 = this.server.create('cohort', { programYear: programYear3 });
    const cohort4 = this.server.create('cohort', { programYear: programYear4 });
    const cohort5 = this.server.create('cohort', { programYear: programYear5 });
    const cohort6 = this.server.create('cohort', { programYear: programYear6 });
    const cohort7 = this.server.create('cohort', { programYear: programYear7 });

    this.cohort1 = await await this.owner.lookup('service:store').findRecord('cohort', cohort1.id);
    this.cohort2 = await await this.owner.lookup('service:store').findRecord('cohort', cohort2.id);
    this.cohort3 = await await this.owner.lookup('service:store').findRecord('cohort', cohort3.id);
    this.cohort4 = await await this.owner.lookup('service:store').findRecord('cohort', cohort4.id);
    this.cohort5 = await await this.owner.lookup('service:store').findRecord('cohort', cohort5.id);
    this.cohort6 = await await this.owner.lookup('service:store').findRecord('cohort', cohort6.id);
    this.cohort7 = await await this.owner.lookup('service:store').findRecord('cohort', cohort7.id);
    this.school1 = await await this.owner.lookup('service:store').findRecord('school', school1.id);
    this.school2 = await await this.owner.lookup('service:store').findRecord('school', school2.id);

    await setupAuthentication({
      school: school1,
      administeredSchools: [school1, school2],
    });
  });

  test('it renders', async function (assert) {
    this.set('primaryCohort', this.cohort1);
    this.set('secondaryCohorts', [this.cohort2, this.cohort3]);
    this.set('schools', [this.school1, this.school2]);
    this.set('selectedSchool', this.school1);
    await render(
      <template>
        <UserProfileCohortsManager
          @primaryCohort={{this.primaryCohort}}
          @secondaryCohorts={{this.secondaryCohorts}}
          @addSecondaryCohort={{(noop)}}
          @removeSecondaryCohort={{(noop)}}
          @setPrimaryCohort={{(noop)}}
          @schools={{this.schools}}
          @selectedSchool={{this.selectedSchool}}
          @setSchool={{(noop)}}
        />
      </template>,
    );

    assert.strictEqual(component.primaryCohort.title, 'school 0 program 0 cohort 0');
    assert.strictEqual(component.secondaryCohorts.length, 2);
    assert.strictEqual(component.secondaryCohorts[0].title, 'school 0 program 0 cohort 2');
    assert.strictEqual(component.secondaryCohorts[1].title, 'school 1 program 1 cohort 1');
    assert.strictEqual(component.schools.filter.options.length, 2);
    assert.strictEqual(component.schools.filter.options[0].text, 'school 0');
    assert.ok(component.schools.filter.options[0].selected);
    assert.strictEqual(component.schools.filter.options[1].text, 'school 1');
    assert.notOk(component.schools.filter.options[1].selected);
    assert.strictEqual(component.assignableCohorts.length, 0);
    this.set('selectedSchool', this.school2);
    await settled();
    assert.strictEqual(component.assignableCohorts.length, 2);
    assert.strictEqual(component.assignableCohorts[0].title, 'program 1 cohort 3');
    assert.strictEqual(component.assignableCohorts[1].title, 'program 1 cohort 4');
  });

  test('it renders with only one school', async function (assert) {
    this.set('schools', [this.school2]);
    this.set('selectedSchool', this.school2);
    await render(
      <template>
        <UserProfileCohortsManager
          @primaryCohort={{null}}
          @secondaryCohorts={{(array)}}
          @addSecondaryCohort={{(noop)}}
          @removeSecondaryCohort={{(noop)}}
          @setPrimaryCohort={{(noop)}}
          @schools={{this.schools}}
          @selectedSchool={{this.selectedSchool}}
          @setSchool={{(noop)}}
        />
      </template>,
    );

    assert.strictEqual(component.schools.text, 'school 1');

    assert.strictEqual(component.assignableCohorts.length, 3);
    assert.strictEqual(component.assignableCohorts[0].title, 'program 1 cohort 1');
    assert.strictEqual(component.assignableCohorts[1].title, 'program 1 cohort 3');
    assert.strictEqual(component.assignableCohorts[2].title, 'program 1 cohort 4');
  });

  test('it renders without selected cohorts', async function (assert) {
    this.set('schools', [this.school1, this.school2]);
    this.set('selectedSchool', this.school1);
    await render(
      <template>
        <UserProfileCohortsManager
          @primaryCohort={{null}}
          @secondaryCohorts={{(array)}}
          @addSecondaryCohort={{(noop)}}
          @removeSecondaryCohort={{(noop)}}
          @setPrimaryCohort={{(noop)}}
          @schools={{this.schools}}
          @selectedSchool={{this.selectedSchool}}
          @setSchool={{(noop)}}
        />
      </template>,
    );

    assert.strictEqual(component.primaryCohort.title, 'None');
    assert.strictEqual(component.secondaryCohorts.length, 1);
    assert.strictEqual(component.secondaryCohorts[0].title, 'None');
    assert.strictEqual(component.schools.filter.options.length, 2);
    assert.strictEqual(component.schools.filter.options[0].text, 'school 0');
    assert.ok(component.schools.filter.options[0].selected);
    assert.strictEqual(component.schools.filter.options[1].text, 'school 1');
    assert.notOk(component.schools.filter.options[1].selected);
    assert.strictEqual(component.assignableCohorts.length, 2);
    assert.strictEqual(component.assignableCohorts[0].title, 'program 0 cohort 0');
    assert.strictEqual(component.assignableCohorts[1].title, 'program 0 cohort 2');
    this.set('selectedSchool', this.school2);
    await settled();
    assert.strictEqual(component.assignableCohorts.length, 3);
    assert.strictEqual(component.assignableCohorts[0].title, 'program 1 cohort 1');
    assert.strictEqual(component.assignableCohorts[1].title, 'program 1 cohort 3');
    assert.strictEqual(component.assignableCohorts[2].title, 'program 1 cohort 4');
  });

  test('promote secondary cohort to primary cohort', async function (assert) {
    assert.expect(2);
    this.set('secondaryCohorts', [this.cohort1]);
    this.set('setPrimaryCohort', (cohort) => {
      assert.strictEqual(cohort, this.cohort1);
    });
    this.set('schools', [this.school1, this.school2]);
    this.set('selectedSchool', this.school1);
    await render(
      <template>
        <UserProfileCohortsManager
          @primaryCohort={{null}}
          @secondaryCohorts={{this.secondaryCohorts}}
          @addSecondaryCohort={{(noop)}}
          @removeSecondaryCohort={{(noop)}}
          @setPrimaryCohort={{this.setPrimaryCohort}}
          @schools={{this.schools}}
          @selectedSchool={{this.selectedSchool}}
          @setSchool={{(noop)}}
        />
      </template>,
    );

    assert.strictEqual(component.secondaryCohorts[0].title, 'school 0 program 0 cohort 0');
    await component.secondaryCohorts[0].promote();
  });

  test('remove primary cohort', async function (assert) {
    assert.expect(2);
    this.set('primaryCohort', this.cohort1);
    this.set('setPrimaryCohort', (cohort) => {
      assert.strictEqual(cohort, null);
    });
    this.set('schools', [this.school1, this.school2]);
    this.set('selectedSchool', this.school1);
    await render(
      <template>
        <UserProfileCohortsManager
          @primaryCohort={{this.primaryCohort}}
          @secondaryCohorts={{(array)}}
          @addSecondaryCohort={{(noop)}}
          @removeSecondaryCohort={{(noop)}}
          @setPrimaryCohort={{this.setPrimaryCohort}}
          @schools={{this.schools}}
          @selectedSchool={{this.selectedSchool}}
          @setSchool={{(noop)}}
        />
      </template>,
    );

    assert.strictEqual(component.primaryCohort.title, 'school 0 program 0 cohort 0');
    await component.primaryCohort.remove();
  });

  test('add secondary cohort', async function (assert) {
    assert.expect(2);
    this.set('addSecondaryCohort', (cohort) => {
      assert.strictEqual(cohort, this.cohort1);
    });
    this.set('schools', [this.school1, this.school2]);
    this.set('selectedSchool', this.school1);
    await render(
      <template>
        <UserProfileCohortsManager
          @primaryCohort={{(noop)}}
          @secondaryCohorts={{(array)}}
          @addSecondaryCohort={{this.addSecondaryCohort}}
          @removeSecondaryCohort={{(noop)}}
          @setPrimaryCohort={{(noop)}}
          @schools={{this.schools}}
          @selectedSchool={{this.selectedSchool}}
          @setSchool={{(noop)}}
        />
      </template>,
    );

    assert.strictEqual(component.assignableCohorts[0].title, 'program 0 cohort 0');
    await component.assignableCohorts[0].add();
  });

  test('remove secondary cohort', async function (assert) {
    assert.expect(2);
    this.set('removeSecondaryCohort', (cohort) => {
      assert.strictEqual(cohort, this.cohort1);
    });
    this.set('secondaryCohorts', [this.cohort1]);
    this.set('schools', [this.school1, this.school2]);
    this.set('selectedSchool', this.school1);
    await render(
      <template>
        <UserProfileCohortsManager
          @primaryCohort={{(noop)}}
          @secondaryCohorts={{this.secondaryCohorts}}
          @addSecondaryCohort={{(noop)}}
          @removeSecondaryCohort={{this.removeSecondaryCohort}}
          @setPrimaryCohort={{(noop)}}
          @schools={{this.schools}}
          @selectedSchool={{this.selectedSchool}}
          @setSchool={{(noop)}}
        />
      </template>,
    );

    assert.strictEqual(component.secondaryCohorts[0].title, 'school 0 program 0 cohort 0');
    await component.secondaryCohorts[0].remove();
  });

  test('change school', async function (assert) {
    assert.expect(1);
    this.set('changeSchool', (school) => {
      assert.strictEqual(school, this.school2);
    });
    this.set('schools', [this.school1, this.school2]);
    this.set('selectedSchool', this.school1);
    await render(
      <template>
        <UserProfileCohortsManager
          @primaryCohort={{(noop)}}
          @secondaryCohorts={{this.secondaryCohorts}}
          @addSecondaryCohort={{(noop)}}
          @removeSecondaryCohort={{this.removeSecondaryCohort}}
          @setPrimaryCohort={{(noop)}}
          @schools={{this.schools}}
          @selectedSchool={{this.selectedSchool}}
          @setSchool={{this.changeSchool}}
        />
      </template>,
    );
    await component.schools.filter.select('2');
  });
});
