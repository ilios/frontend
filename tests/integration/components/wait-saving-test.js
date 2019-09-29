import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupIntl } from 'ember-intl/test-support';

module('Integration | Component | wait saving', function(hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks);

  test('it renders', async function(assert) {
    assert.expect(1);
    let modalDialogService = this.owner.lookup('service:modal-dialog');
    modalDialogService.set('destinationElementId', 'modal-testing-div');
    await render(hbs`<div id="modal-testing-div"></div><WaitSaving />`);

    assert.dom(this.element).hasText('saving... one moment...');
  });
});
