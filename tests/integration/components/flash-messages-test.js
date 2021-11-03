import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { component } from 'ilios/tests/pages/components/flash-messages';

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
    await render(hbs`<FlashMessages />`);
    assert.strictEqual(component.messages.length, 1);
    assert.strictEqual(component.messages[0].text, 'Course');
  });
});
