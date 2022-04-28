import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupAuthentication } from 'ilios-common';
import { component } from 'ilios/tests/pages/components/user-profile-cohorts';

module('Integration | Component | user profile cohorts', function (hooks) {
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

    this.cohort1 = this.server.create('cohort', { programYear: programYear1 });
    this.cohort2 = this.server.create('cohort', { programYear: programYear2 });
    this.cohort3 = this.server.create('cohort', { programYear: programYear3 });
    this.cohort4 = this.server.create('cohort', { programYear: programYear4 });

    const user = this.server.create('user', {
      primaryCohort: this.cohort1,
      cohorts: [this.cohort1, this.cohort2],
    });
    await setupAuthentication({
      school: school1,
      administeredSchools: [school1, school2],
    });

    this.user = await this.owner.lookup('service:store').find('user', user.id);
  });

  test('it renders', async function (assert) {
    this.set('user', this.user);
    await render(hbs`<UserProfileCohorts @user={{this.user}} />`);
    assert.strictEqual(component.primaryCohort.text, 'Primary Cohort: school 0 program 0 cohort 0');
    assert.strictEqual(component.secondaryCohorts.length, 1);
    assert.strictEqual(component.secondaryCohorts[0].title, 'school 1 program 1 cohort 1');
  });

  test('clicking manage sends the action', async function (assert) {
    assert.expect(1);
    this.set('user', this.user);
    this.set('click', (what) => {
      assert.ok(what, 'recieved boolean true value');
    });
    await render(
      hbs`<UserProfileCohorts @user={{this.user}} @isManageable={{true}} @setIsManaging={{this.click}} />`
    );
    await component.manage();
  });

  test('can edit user cohorts', async function (assert) {
    assert.expect(13);
    this.set('user', this.user);
    this.server.patch('api/users/:id', (schema, request) => {
      const { data } = JSON.parse(request.requestBody);
      assert.strictEqual(
        data.relationships.primaryCohort.data.id,
        this.cohort2.id,
        'user has correct primary cohort'
      );
      const cohortIds = data.relationships.cohorts.data.mapBy('id');
      assert.notOk(cohortIds.includes(this.cohort1.id), 'cohort1 has been removed');
      assert.ok(cohortIds.includes(this.cohort2.id), 'cohort2 is still present');
      assert.ok(cohortIds.includes(this.cohort4.id), 'cohort4 has been added');
      return schema.users.find(data.id);
    });

    await render(
      hbs`<UserProfileCohorts @isManaging={{true}} @user={{this.user}} @setIsManaging={{(noop)}} />`
    );

    assert.strictEqual(component.primaryCohort.title, 'school 0 program 0 cohort 0');
    assert.strictEqual(component.secondaryCohorts.length, 1);
    assert.strictEqual(component.secondaryCohorts[0].title, 'school 1 program 1 cohort 1');
    assert.strictEqual(component.schools.filter.value, '1');
    assert.strictEqual(component.schools.filter.options.length, 2);
    assert.strictEqual(component.assignableCohorts.length, 1);
    assert.strictEqual(component.assignableCohorts[0].title, 'program 0 cohort 2');
    await component.schools.filter.select('2');
    assert.strictEqual(component.assignableCohorts.length, 1);
    assert.strictEqual(component.assignableCohorts[0].title, 'program 1 cohort 3');
    await component.secondaryCohorts[0].promote();
    await component.secondaryCohorts[0].remove();
    await component.assignableCohorts[0].add();
    await component.save();
  });
});
