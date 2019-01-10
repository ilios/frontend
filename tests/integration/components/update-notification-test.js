import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | update notification', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    await render(hbs`{{update-notification}}`);
    assert.dom(this.element).hasText(
      'Huzzah! We\'ve made Ilios better. You will get the new stuff on your next login, or click to update now.'
    );
  });
});
