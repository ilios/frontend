import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { DateTime, Duration } from 'luxon';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import { component } from 'frontend/tests/pages/components/my-profile';
import { freezeDateAt, unfreezeDate } from 'ilios-common';
import MyProfile from 'frontend/components/my-profile';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | my profile', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.afterEach(() => {
    unfreezeDate();
  });

  test('it renders', async function (assert) {
    const school = this.server.create('school');
    const program1 = this.server.create('program', { school });
    const program2 = this.server.create('program', { school });
    const programYear1 = this.server.create('program-year', { program: program1 });
    const programYear2 = this.server.create('program-year', { program: program1 });
    const programYear3 = this.server.create('program-year', { program: program2 });
    const cohort1 = this.server.create('cohort', {
      title: 'test cohort',
      programYear: programYear1,
    });
    const cohort2 = this.server.create('cohort', {
      title: 'second cohort',
      programYear: programYear2,
    });
    const cohort3 = this.server.create('cohort', {
      title: 'a third cohort',
      programYear: programYear3,
    });
    const studentRole = this.server.create('user-role', {
      title: 'Student',
    });
    const user = this.server.create('user', {
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
    const user = this.server.create('user', {
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

  test('generates token when asked with good expiration date', async function (assert) {
    this.server.get(`/auth/token`, (scheme, { queryParams }) => {
      assert.step('API called');
      assert.ok('ttl' in queryParams);
      const duration = Duration.fromISO(queryParams.ttl);
      assert.strictEqual(duration.days, 14);
      assert.ok(duration.hours < 24);
      assert.ok(duration.minutes < 60);
      assert.ok(duration.seconds < 60);

      return {
        jwt: 'new token',
      };
    });

    const school = this.server.create('school');
    const user = this.server.create('user', { school });
    const userModel = await this.owner.lookup('service:store').findRecord('user', user.id);

    this.set('user', userModel);
    await render(
      <template>
        <MyProfile
          @user={{this.user}}
          @showCreateNewToken={{true}}
          @toggleShowCreateNewToken={{(noop)}}
          @toggleShowInvalidateTokens={{(noop)}}
        />
      </template>,
    );

    await component.newTokenForm.submit();
    assert.strictEqual(component.newTokenResult.value, 'new token');
    assert.verifySteps(['API called']);
  });

  test('clear and reset from new token screen', async function (assert) {
    this.server.get(`/auth/token`, () => {
      assert.step('API called');
      return {
        jwt: 'new token',
      };
    });

    const school = this.server.create('school');
    const user = this.server.create('user', { school });
    const userModel = await this.owner.lookup('service:store').findRecord('user', user.id);

    this.set('user', userModel);
    this.set('toggle', () => {
      assert.step('toggle called');
    });
    await render(
      <template>
        <MyProfile
          @user={{this.user}}
          @showCreateNewToken={{true}}
          @toggleShowCreateNewToken={{this.toggle}}
        />
      </template>,
    );

    await component.newTokenForm.submit();
    assert.strictEqual(component.newTokenResult.value, 'new token');
    assert.notOk(component.newTokenForm.isVisible);
    await component.newTokenResult.reset();
    assert.verifySteps(['API called', 'toggle called']);
  });

  test('clicking button fires show token event', async function (assert) {
    const school = this.server.create('school');
    const user = this.server.create('user', { school });
    const userModel = await this.owner.lookup('service:store').findRecord('user', user.id);

    this.set('user', userModel);
    this.set('toggle', () => {
      assert.step('toggle called');
    });
    await render(
      <template>
        <MyProfile
          @user={{this.user}}
          @toggleShowCreateNewToken={{this.toggle}}
          @toggleShowInvalidateTokens={{(noop)}}
        />
      </template>,
    );

    await component.showCreateNewTokenForm();
    assert.verifySteps(['toggle called']);
  });

  test('Setting date changes request length', async function (assert) {
    this.server.get(`/auth/token`, (scheme, { queryParams }) => {
      assert.step('API called');
      assert.ok('ttl' in queryParams);
      const duration = Duration.fromISO(queryParams.ttl);
      assert.strictEqual(duration.days, 41);
      assert.ok(duration.hours < 24);
      assert.ok(duration.minutes < 60);
      assert.ok(duration.seconds < 60);

      return {
        jwt: 'new token',
      };
    });

    const school = this.server.create('school');
    const user = this.server.create('user', { school });
    const userModel = await this.owner.lookup('service:store').findRecord('user', user.id);

    this.set('user', userModel);
    await render(
      <template>
        <MyProfile
          @user={{this.user}}
          @showCreateNewToken={{true}}
          @toggleShowCreateNewToken={{(noop)}}
          @toggleShowInvalidateTokens={{(noop)}}
        />
      </template>,
    );

    const dt = DateTime.fromObject({ hours: 8 }).plus({ days: 41 }).toJSDate();
    await component.newTokenForm.setDate(dt);
    await component.newTokenForm.submit();
    assert.verifySteps(['API called']);
  });

  test('clicking button fires invalidate tokens event', async function (assert) {
    const school = this.server.create('school');
    const user = this.server.create('user', { school });
    const userModel = await this.owner.lookup('service:store').findRecord('user', user.id);

    this.set('user', userModel);
    this.set('toggle', () => {
      assert.step('toggle called');
    });
    await render(
      <template>
        <MyProfile
          @user={{this.user}}
          @toggleShowCreateNewToken={{(noop)}}
          @toggleShowInvalidateTokens={{this.toggle}}
        />
      </template>,
    );

    await component.showInvalidateTokensForm();
    assert.verifySteps(['toggle called']);
  });

  test('invalidate tokens when asked', async function (assert) {
    this.server.get(`/auth/invalidatetokens`, () => {
      assert.step('API called');
      return {
        jwt: 'new token',
      };
    });
    class SessionMock extends Service {
      authenticate(how, obj) {
        assert.step('session.authenticate called');
        assert.strictEqual(how, 'authenticator:ilios-jwt');
        assert.ok(obj.jwt);
        assert.strictEqual(obj.jwt, 'new token');
      }
    }
    this.owner.register('service:session', SessionMock);
    this.session = this.owner.lookup('service:session');
    this.flashMessages = this.owner.lookup('service:flashMessages');
    const school = this.server.create('school');
    const user = this.server.create('user', { school });
    const userModel = await this.owner.lookup('service:store').findRecord('user', user.id);

    this.set('user', userModel);
    await render(
      <template>
        <MyProfile
          @user={{this.user}}
          @showInvalidateTokens={{true}}
          @toggleShowCreateNewToken={{(noop)}}
          @toggleShowInvalidateTokens={{(noop)}}
        />
      </template>,
    );

    await component.invalidateTokensForm.submit();
    assert.verifySteps(['API called', 'session.authenticate called']);
  });

  test('works close to midnight ilios/ilios#5976', async function (assert) {
    freezeDateAt(
      DateTime.fromObject({
        hour: 23,
        minute: 11,
        seconds: 24,
      }).toJSDate(),
    );

    this.server.get(`/auth/token`, (scheme, { queryParams }) => {
      assert.step('API called');
      assert.ok('ttl' in queryParams);
      assert.strictEqual(queryParams.ttl, 'P14DT48M35S');
      return {
        jwt: 'new token',
      };
    });

    const school = this.server.create('school');
    const user = this.server.create('user', { school });
    const userModel = await this.owner.lookup('service:store').findRecord('user', user.id);

    this.set('user', userModel);
    await render(
      <template>
        <MyProfile
          @user={{this.user}}
          @showCreateNewToken={{true}}
          @toggleShowCreateNewToken={{(noop)}}
          @toggleShowInvalidateTokens={{(noop)}}
        />
      </template>,
    );

    await component.newTokenForm.submit();
    assert.strictEqual(component.newTokenResult.value, 'new token');
    assert.verifySteps(['API called']);
  });

  test('works after midnight ilios/ilios#5976', async function (assert) {
    freezeDateAt(
      DateTime.fromObject({
        hour: 1,
        minute: 6,
        seconds: 24,
      }).toJSDate(),
    );

    this.server.get(`/auth/token`, (scheme, { queryParams }) => {
      assert.step('API called');
      assert.ok('ttl' in queryParams);
      assert.strictEqual(queryParams.ttl, 'P14DT22H53M35S');
      return {
        jwt: 'new token',
      };
    });

    const school = this.server.create('school');
    const user = this.server.create('user', { school });
    const userModel = await this.owner.lookup('service:store').findRecord('user', user.id);

    this.set('user', userModel);
    await render(
      <template>
        <MyProfile
          @user={{this.user}}
          @showCreateNewToken={{true}}
          @toggleShowCreateNewToken={{(noop)}}
          @toggleShowInvalidateTokens={{(noop)}}
        />
      </template>,
    );

    await component.newTokenForm.submit();
    assert.strictEqual(component.newTokenResult.value, 'new token');
    assert.verifySteps(['API called']);
  });
});
