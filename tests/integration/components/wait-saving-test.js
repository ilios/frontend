import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import tHelper from "ember-i18n/helper";

module('Integration | Component | wait saving', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.owner.lookup('service:i18n').set('locale', 'en');
    this.owner.register('helper:t', tHelper);
  });

  test('it renders', async function(assert) {
    assert.expect(1);
    let modalDialogService = this.owner.lookup('service:modal-dialog');
    modalDialogService.set('destinationElementId', 'modal-testing-div');
    await render(hbs`<div id='modal-testing-div'></div>{{wait-saving}}`);

    assert.equal(this.element.textContent.trim(), 'saving... one moment...');
  });
});
