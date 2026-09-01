import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMSW } from 'ilios-common/msw';
import { component } from 'frontend/tests/pages/components/my-profile';
import MyProfile from 'frontend/components/my-profile';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | my profile', function (hooks) {
  setupRenderingTest(hooks);
  setupMSW(hooks);

  test('it renders', async function (assert) {
    const school = await this.server.create('school');
    const program1 = await this.server.create('program', { school });
    const program2 = await this.server.create('program', { school });
    const programYear1 = await this.server.create('program-year', { program: program1 });
    const programYear2 = await this.server.create('program-year', { program: program1 });
    const programYear3 = await this.server.create('program-year', { program: program2 });
    const cohort1 = await this.server.create('cohort', {
      title: 'test cohort',
      programYear: programYear1,
    });
    const cohort2 = await this.server.create('cohort', {
      title: 'second cohort',
      programYear: programYear2,
    });
    const cohort3 = await this.server.create('cohort', {
      title: 'a third cohort',
      programYear: programYear3,
    });
    const studentRole = await this.server.create('user-role', {
      title: 'Student',
    });
    const user = await this.server.create('user', {
      displayName: 'test name',
      roles: [studentRole],
      school,
      primaryCohort: cohort1,
      cohorts: [cohort1, cohort2, cohort3],
    });
    const userModel = await this.owner.lookup('service:store').findRecord('user', user.id);

    this.set('user', userModel);
    await render(
      <template>
        <MyProfile
          @user={{this.user}}
          @toggleShowCreateNewToken={{(noop)}}
          @toggleShowInvalidateTokens={{(noop)}}
        />
      </template>,
    );

    assert.strictEqual(component.name, 'test name');
    assert.ok(component.userIsStudent);
    assert.strictEqual(component.primarySchool, 'school 0');
    assert.strictEqual(component.primaryCohort, 'test cohort');
    assert.strictEqual(component.secondaryCohorts.length, 2);
    assert.strictEqual(component.secondaryCohorts[0].text, 'a third cohort program 1');
    assert.strictEqual(component.secondaryCohorts[1].text, 'second cohort program 0');
    assert.ok(component.tokenInfoLink.includes('/api'));
  });

  test('it renders all no', async function (assert) {
    const user = await this.server.create('user', {
      displayName: 'test name',
      userSyncIgnore: false,
    });
    const userModel = await this.owner.lookup('service:store').findRecord('user', user.id);

    this.set('user', userModel);
    await render(
      <template>
        <MyProfile
          @user={{this.user}}
          @toggleShowCreateNewToken={{(noop)}}
          @toggleShowInvalidateTokens={{(noop)}}
        />
      </template>,
    );

    assert.notOk(component.userIsStudent);
    assert.strictEqual(component.primaryCohort, 'Unassigned');
    assert.strictEqual(component.secondaryCohorts.length, 1);
    assert.strictEqual(component.secondaryCohorts[0].text, 'Unassigned');
  });
});
