import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupAuthentication } from 'ilios-common';
import { component } from 'frontend/tests/pages/components/user-profile-cohorts-manager';

module('Integration | Component | user-profile-cohorts-manager', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
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

    await setupAuthentication({
      school: school1,
      administeredSchools: [school1, school2],
    });
  });

  test('it renders', async function (assert) {
    this.set('primaryCohort', this.cohort1);
    this.set('secondaryCohorts', [this.cohort1, this.cohort2, this.cohort3]);
    await render(hbs`<UserProfileCohortsManager
      @primaryCohort={{this.primaryCohort}}
      @secondaryCohorts={{this.secondaryCohorts}}
      @addSecondaryCohortToBuffer={{(noop)}}
      @removeSecondaryCohortFromBuffer={{(noop)}}
      @setPrimaryCohortBuffer={{(noop)}}
    />`);

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
    await component.schools.filter.select('2');
    assert.strictEqual(component.assignableCohorts.length, 1);
    assert.strictEqual(component.assignableCohorts[0].title, 'program 1 cohort 3');
  });

  test('it renders without selected cohorts', async function (assert) {
    await render(hbs`<UserProfileCohortsManager
      @primaryCohort={{null}}
      @secondaryCohorts={{(array)}}
      @addSecondaryCohortToBuffer={{(noop)}}
      @removeSecondaryCohortFromBuffer={{(noop)}}
      @setPrimaryCohortBuffer={{(noop)}}
    />`);

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
    await component.schools.filter.select('2');
    assert.strictEqual(component.assignableCohorts.length, 2);
    assert.strictEqual(component.assignableCohorts[0].title, 'program 1 cohort 1');
    assert.strictEqual(component.assignableCohorts[1].title, 'program 1 cohort 3');
  });

  test('promote secondary cohort to primary cohort', async function (assert) {
    assert.expect(2);
    this.set('secondaryCohorts', [this.cohort1]);
    this.set('setPrimaryCohort', (cohort) => {
      assert.strictEqual(cohort, this.cohort1);
    });
    await render(hbs`<UserProfileCohortsManager
      @primaryCohort={{null}}
      @secondaryCohorts={{this.secondaryCohorts}}
      @addSecondaryCohortToBuffer={{(noop)}}
      @removeSecondaryCohortFromBuffer={{(noop)}}
      @setPrimaryCohortBuffer={{this.setPrimaryCohort}}
    />`);

    assert.strictEqual(component.secondaryCohorts[0].title, 'school 0 program 0 cohort 0');
    await component.secondaryCohorts[0].promote();
  });

  test('remove primary cohort', async function (assert) {
    assert.expect(2);
    this.set('primaryCohort', this.cohort1);
    this.set('setPrimaryCohort', (cohort) => {
      assert.strictEqual(cohort, null);
    });
    await render(hbs`<UserProfileCohortsManager
      @primaryCohort={{this.primaryCohort}}
      @secondaryCohorts={{(array)}}
      @addSecondaryCohortToBuffer={{(noop)}}
      @removeSecondaryCohortFromBuffer={{(noop)}}
      @setPrimaryCohortBuffer={{this.setPrimaryCohort}}
    />`);

    assert.strictEqual(component.primaryCohort.title, 'school 0 program 0 cohort 0');
    await component.primaryCohort.remove();
  });

  test('add secondary cohort', async function (assert) {
    assert.expect(2);
    this.set('addSecondaryCohortToBuffer', (cohort) => {
      assert.strictEqual(cohort, this.cohort1);
    });
    await render(hbs`<UserProfileCohortsManager
      @primaryCohort={{(noop)}}
      @secondaryCohorts={{(array)}}
      @addSecondaryCohortToBuffer={{this.addSecondaryCohortToBuffer}}
      @removeSecondaryCohortFromBuffer={{(noop)}}
      @setPrimaryCohortBuffer={{(noop)}}
    />`);

    assert.strictEqual(component.assignableCohorts[0].title, 'program 0 cohort 0');
    await component.assignableCohorts[0].add();
  });

  test('remove secondary cohort', async function (assert) {
    assert.expect(2);
    this.set('removeSecondaryCohortFromBuffer', (cohort) => {
      assert.strictEqual(cohort, this.cohort1);
    });
    this.set('secondaryCohorts', [this.cohort1]);
    await render(hbs`<UserProfileCohortsManager
      @primaryCohort={{(noop)}}
      @secondaryCohorts={{this.secondaryCohorts}}
      @addSecondaryCohortToBuffer={{(noop)}}
      @removeSecondaryCohortFromBuffer={{this.removeSecondaryCohortFromBuffer}}
      @setPrimaryCohortBuffer={{(noop)}}
    />`);

    assert.strictEqual(component.secondaryCohorts[0].title, 'school 0 program 0 cohort 0');
    await component.secondaryCohorts[0].remove();
  });
});
