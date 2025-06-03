import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import Service from '@ember/service';
import { render } from '@ember/test-helpers';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { component } from 'frontend/tests/pages/components/login-form';
import LoginForm from 'frontend/components/login-form';

module('Integration | Component | login-form', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(<template><LoginForm /></template>);
    assert.strictEqual(component.errors.length, 0);
    assert.ok(component.form.isPresent);
    assert.strictEqual(component.form.username.label, 'Username:');
    assert.strictEqual(component.form.username.value, '');
    assert.strictEqual(component.form.password.label, 'Password:');
    assert.strictEqual(component.form.password.value, '');
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('no account exists error message', async function (assert) {
    const accountName = 'Al';
    this.set('account', accountName);
    this.set('error', true);
    await render(
      <template>
        <LoginForm @noAccountExistsError={{this.error}} @noAccountExistsAccount={{this.account}} />
      </template>,
    );
    assert.strictEqual(component.errors.length, 1);
    assert.strictEqual(
      component.errors[0].text,
      `Your account ${accountName} does not match any user records in Ilios. If you need further assistance, please contact your school’s Ilios administrator.`,
    );
    assert.notOk(component.form.isPresent);
  });

  test('submit and fail', async function (assert) {
    const username = 'Foo';
    const password = 'Bar';
    const sessionMock = class extends Service {
      authenticate() {
        const err = new Error();
        err.json = {
          errors: ['badCredentials'],
        };
        throw err;
      }
    };
    this.owner.register('service:session', sessionMock);
    await render(<template><LoginForm /></template>);
    assert.strictEqual(component.errors.length, 0);
    await component.form.username.set(username);
    await component.form.password.set(password);
    await component.form.submit();
    assert.strictEqual(component.errors.length, 1);
    assert.strictEqual(component.errors[0].text, 'Incorrect username or password');
  });

  test('submit and succeed', async function (assert) {
    assert.expect(4);
    const username = 'Foo';
    const password = 'Bar';
    const sessionMock = class extends Service {
      authenticate() {
        assert.strictEqual(arguments[1].username, username);
        assert.strictEqual(arguments[1].password, password);
      }
    };
    this.owner.register('service:session', sessionMock);
    await render(<template><LoginForm /></template>);
    assert.strictEqual(component.errors.length, 0);
    await component.form.username.set(username);
    await component.form.password.set(password);
    await component.form.submit();
    assert.strictEqual(component.errors.length, 0);
  });

  test('submit by pressing enter in username field', async function (assert) {
    assert.expect(2);
    const username = 'Foo';
    const password = 'Bar';
    const sessionMock = class extends Service {
      authenticate() {
        assert.strictEqual(arguments[1].username, username);
        assert.strictEqual(arguments[1].password, password);
      }
    };
    this.owner.register('service:session', sessionMock);
    await render(<template><LoginForm /></template>);
    await component.form.username.set(username);
    await component.form.password.set(password);
    await component.form.username.submit();
  });

  test('submit by pressing enter in password field', async function (assert) {
    assert.expect(2);
    const username = 'Foo';
    const password = 'Bar';
    const sessionMock = class extends Service {
      authenticate() {
        assert.strictEqual(arguments[1].username, username);
        assert.strictEqual(arguments[1].password, password);
      }
    };
    this.owner.register('service:session', sessionMock);
    await render(<template><LoginForm /></template>);
    await component.form.username.set(username);
    await component.form.password.set(password);
    await component.form.password.submit();
  });

  test('input validation', async function (assert) {
    const username = 'Foo';
    const password = 'Bar';
    const sessionMock = class extends Service {
      authenticate() {
        assert.strictEqual(arguments[1].username, username);
        assert.strictEqual(arguments[1].password, password);
      }
    };
    this.owner.register('service:session', sessionMock);
    await render(<template><LoginForm /></template>);
    assert.notOk(component.form.username.hasError);
    assert.notOk(component.form.password.hasError);
    await component.form.password.submit();
    assert.strictEqual(component.form.username.error, 'Username can not be blank');
    assert.strictEqual(component.form.password.error, 'Password can not be blank');
    await component.form.username.set(username);
    await component.form.password.set(password);
    await component.form.password.submit();
    assert.notOk(component.form.username.hasError);
    assert.notOk(component.form.password.hasError);
  });
});
