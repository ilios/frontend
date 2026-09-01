import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { DateTime, Duration } from 'luxon';
import { setupMSW } from 'ilios-common/msw';
import { component } from 'frontend/tests/pages/components/user-profile/token-maintenance';
import { freezeDateAt, unfreezeDate } from 'ilios-common';
import TokenMaintenance from 'frontend/components/user-profile/token-maintenance';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | user-profile/token-maintenance', function (hooks) {
  setupRenderingTest(hooks);
  setupMSW(hooks);

  hooks.afterEach(() => {
    unfreezeDate();
  });

  test('it renders', async function (assert) {
    await render(
      <template>
        <TokenMaintenance
          @toggleShowCreateNewToken={{(noop)}}
          @toggleShowInvalidateTokens={{(noop)}}
        />
      </template>,
    );

    assert.ok(component.tokenInfoLink.includes('/api'));
  });

  test('generates token when asked with good expiration date', async function (assert) {
    this.server.get(`/auth/token`, ({ request }) => {
      const { searchParams } = new URL(request.url);
      assert.ok(searchParams.has('ttl'));
      const duration = Duration.fromISO(searchParams.get('ttl'));
      assert.strictEqual(duration.days, 14);
      assert.ok(duration.hours < 24);
      assert.ok(duration.minutes < 60);
      assert.ok(duration.seconds < 60);

      assert.step('API called');
      return {
        jwt: 'new token',
      };
    });
    await render(
      <template>
        <TokenMaintenance
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
    this.set('toggle', () => {
      assert.step('toggle called');
    });
    await render(
      <template>
        <TokenMaintenance @showCreateNewToken={{true}} @toggleShowCreateNewToken={{this.toggle}} />
      </template>,
    );

    await component.newTokenForm.submit();
    assert.strictEqual(component.newTokenResult.value, 'new token');
    assert.notOk(component.newTokenForm.isVisible);
    await component.newTokenResult.reset();
    assert.verifySteps(['API called', 'toggle called']);
  });

  test('clicking button fires show token event', async function (assert) {
    this.set('toggle', () => {
      assert.step('toggle called');
    });
    await render(
      <template>
        <TokenMaintenance
          @toggleShowCreateNewToken={{this.toggle}}
          @toggleShowInvalidateTokens={{(noop)}}
        />
      </template>,
    );

    await component.showCreateNewTokenForm();
    assert.verifySteps(['toggle called']);
  });

  test('Setting date changes request length', async function (assert) {
    this.server.get(`/auth/token`, ({ request }) => {
      const { searchParams } = new URL(request.url);
      assert.ok(searchParams.has('ttl'));
      const duration = Duration.fromISO(searchParams.get('ttl'));
      assert.strictEqual(duration.days, 41);
      assert.ok(duration.hours < 24);
      assert.ok(duration.minutes < 60);
      assert.ok(duration.seconds < 60);

      assert.step('API called');
      return {
        jwt: 'new token',
      };
    });

    await render(
      <template>
        <TokenMaintenance
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
    this.set('toggle', () => {
      assert.step('toggle called');
    });
    await render(
      <template>
        <TokenMaintenance
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
    await render(
      <template>
        <TokenMaintenance
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

    this.server.get(`/auth/token`, ({ request }) => {
      const { searchParams } = new URL(request.url);
      assert.ok(searchParams.has('ttl'));
      assert.strictEqual(searchParams.get('ttl'), 'P14DT48M35S');
      assert.step('API called');
      return {
        jwt: 'new token',
      };
    });

    await render(
      <template>
        <TokenMaintenance
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

    this.server.get(`/auth/token`, ({ request }) => {
      const { searchParams } = new URL(request.url);
      assert.ok(searchParams.has('ttl'));
      assert.strictEqual(searchParams.get('ttl'), 'P14DT22H53M35S');
      assert.step('API called');
      return {
        jwt: 'new token',
      };
    });

    await render(
      <template>
        <TokenMaintenance
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
