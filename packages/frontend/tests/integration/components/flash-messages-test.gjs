import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { component } from 'frontend/tests/pages/components/flash-messages';
import FlashMessages from 'frontend/components/flash-messages';

module('Integration | Component | flash-messages', function (hooks) {
  setupRenderingTest(hooks);

  // @link https://github.com/poteto/ember-cli-flash#acceptance--integration-tests
  hooks.beforeEach(function () {
    const typesUsed = ['info', 'warning', 'success'];
    this.owner.lookup('service:flash-messages').registerTypes(typesUsed);
  });

  test('it renders', async function (assert) {
    const flashMessages = this.owner.lookup('service:flash-messages');
    flashMessages.success('general.course');
    await render(<template><FlashMessages /></template>);
    assert.strictEqual(component.messages.length, 1);
    assert.strictEqual(component.messages[0].text, 'Course');
  });
});
