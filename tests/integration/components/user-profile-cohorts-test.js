import { resolve } from 'rsvp';
import Service from '@ember/service';
import { run } from "@ember/runloop";
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled, click, find, findAll, fillIn } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Integration | Component | user profile cohorts', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function() {
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
      cohorts: [this.cohort1, this.cohort2]
    });
    const user2 = this.server.create('user', {
      school: school1
    });

    this.user = await run(() => this.owner.lookup('service:store').find('user', user.id));
    const sessionUser = await run(() => this.owner.lookup('service:store').find('user', user2.id));

    const currentUserMock = Service.extend({
      model: resolve(sessionUser),
      getRolesInSchool() {
        return resolve(['SCHOOL_ADMINISTRATOR']);
      },
    });
    this.owner.register('service:currentUser', currentUserMock);
  });

  test('it renders', async function(assert) {
    this.set('user', this.user);
    await render(hbs`{{user-profile-cohorts user=user}}`);
    const primaryCohort = '[data-test-primary-cohort]';
    const secondaryCohorts = '[data-test-secondary-cohorts] li';
    await settled();

    assert.equal(find(primaryCohort).textContent.replace(/[\n\s]+/g, " ").trim(), 'Primary Cohort: school 0 program 0 cohort 0', 'primary cohort correct');
    assert.equal(findAll(secondaryCohorts).length, 1, 'correct number of secondary cohorts');
    assert.equal(find(secondaryCohorts).textContent.trim(), 'school 1 program 1 cohort 1', 'cohort correct');
  });

  test('clicking manage sends the action', async function(assert) {
    assert.expect(1);
    this.set('user', this.user);
    this.set('click', (what) =>{
      assert.ok(what, 'recieved boolean true value');
    });
    await render(hbs`{{user-profile-cohorts user=user isManageable=true setIsManaging=(action click)}}`);
    const manage = 'button.manage';
    await click(manage);
  });

  test('can edit user cohorts', async function(assert) {
    assert.expect(12);

    this.set('user', this.user);
    this.set('nothing', parseInt);

    this.server.put('api/users/:id', ({ db }, request) => {
      let attrs = JSON.parse(request.requestBody);
      assert.equal(attrs.user.primaryCohort, this.cohort2.id, 'user has correct primary cohort');

      assert.ok(!attrs.user.cohorts.includes(this.cohort1.id), 'cohort1 has been removed');
      assert.ok(attrs.user.cohorts.includes(this.cohort2.id), 'cohort2 is still present');
      assert.ok(attrs.user.cohorts.includes(this.cohort4.id), 'cohort4 has been added');

      const user = db.users.update(attrs);

      return resolve(user);
    });

    await render(hbs`{{user-profile-cohorts isManaging=true user=user setIsManaging=(action nothing)}}`);
    const primaryCohort = '[data-test-primary-cohort]';
    const secondaryCohorts = '[data-test-secondary-cohorts] li';
    const schoolPicker = '[data-test-school]';
    const assignableCohorts = '[data-test-assignable-cohorts] li';
    const promoteFirstSecondaryCohort = `${secondaryCohorts}:nth-of-type(1) i.add`;
    const removeFirstSecondaryCohort = `${secondaryCohorts}:nth-of-type(1) i.remove`;
    const addFirstAssignableCohort = `${assignableCohorts}:nth-of-type(1) i.add`;

    assert.equal(find(primaryCohort).textContent.replace(/[\n\s]+/g, " ").trim(), 'Primary Cohort: school 0 program 0 cohort 0', 'primary cohort correct');
    assert.equal(findAll(secondaryCohorts).length, 1, 'correct number of secondary cohorts');
    assert.equal(find(secondaryCohorts).textContent.trim(), 'school 1 program 1 cohort 1', 'cohort correct');

    assert.equal(find(schoolPicker).value, '1', 'correct school selected');
    assert.equal(findAll(assignableCohorts).length, 1, 'correct number of assignable cohorts');
    assert.equal(find(assignableCohorts).textContent.trim(), 'program 0 cohort 2', 'cohort correct');

    await fillIn(schoolPicker, '2');

    assert.equal(findAll(assignableCohorts).length, 1, 'correct number of assignable cohorts');
    assert.equal(find(assignableCohorts).textContent.trim(), 'program 1 cohort 3', 'cohort correct');

    await click(promoteFirstSecondaryCohort);
    await click(removeFirstSecondaryCohort);
    await click(addFirstAssignableCohort);
    await click('.bigadd');
  });
});
