import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, fillIn } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';

module('Integration | Component | user profile cohorts', function (hooks) {
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
    await render(hbs`<UserProfileCohorts @user={{user}} />`);
    const primaryCohort = '[data-test-primary-cohort]';
    const secondaryCohorts = '[data-test-secondary-cohorts] li';

    assert
      .dom(primaryCohort)
      .hasText('Primary Cohort: school 0 program 0 cohort 0', 'primary cohort correct');
    assert.dom(secondaryCohorts).exists({ count: 1 }, 'correct number of secondary cohorts');
    assert.dom(secondaryCohorts).hasText('school 1 program 1 cohort 1', 'cohort correct');
  });

  test('clicking manage sends the action', async function (assert) {
    assert.expect(1);
    this.set('user', this.user);
    this.set('click', (what) => {
      assert.ok(what, 'recieved boolean true value');
    });
    await render(
      hbs`<UserProfileCohorts @user={{user}} @isManageable={{true}} @setIsManaging={{action click}} />`
    );
    const manage = 'button.manage';
    await click(manage);
  });

  test('can edit user cohorts', async function (assert) {
    assert.expect(12);

    this.set('user', this.user);

    this.server.patch('api/users/:id', (schema, request) => {
      const { data } = JSON.parse(request.requestBody);
      assert.equal(
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
      hbs`<UserProfileCohorts @isManaging={{true}} @user={{user}} @setIsManaging={{noop}} />`
    );
    const primaryCohort = '[data-test-primary-cohort] [data-test-title]';
    const secondaryCohorts = '[data-test-secondary-cohorts] li';
    const firstSecondaryCohortTitle = `${secondaryCohorts}:nth-of-type(1) [data-test-title]`;
    const schoolPicker = '[data-test-school]';
    const assignableCohorts = '[data-test-assignable-cohorts] li';
    const firstAssignableCohortTitle = `${assignableCohorts}:nth-of-type(1) [data-test-title]`;
    const promoteFirstSecondaryCohort = `${secondaryCohorts}:nth-of-type(1) .add`;
    const removeFirstSecondaryCohort = `${secondaryCohorts}:nth-of-type(1) .remove`;
    const addFirstAssignableCohort = `${assignableCohorts}:nth-of-type(1) .add`;

    assert.dom(primaryCohort).hasText('school 0 program 0 cohort 0', 'primary cohort correct');
    assert.dom(secondaryCohorts).exists({ count: 1 }, 'correct number of secondary cohorts');
    assert.dom(firstSecondaryCohortTitle).hasText('school 1 program 1 cohort 1', 'cohort correct');

    assert.dom(schoolPicker).hasValue('1', 'correct school selected');
    assert.dom(assignableCohorts).exists({ count: 1 }, 'correct number of assignable cohorts');
    assert.dom(firstAssignableCohortTitle).hasText('program 0 cohort 2', 'cohort correct');

    await fillIn(schoolPicker, '2');

    assert.dom(assignableCohorts).exists({ count: 1 }, 'correct number of assignable cohorts');
    assert.dom(firstAssignableCohortTitle).hasText('program 1 cohort 3', 'cohort correct');

    await click(promoteFirstSecondaryCohort);
    await click(removeFirstSecondaryCohort);
    await click(addFirstAssignableCohort);
    await click('.bigadd');
  });
});
