import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import tHelper from "ember-i18n/helper";

moduleForComponent('wait-saving', 'Integration | Component | wait saving', {
  integration: true,
  beforeEach: function() {
    this.container.lookup('service:i18n').set('locale', 'en');
    this.register('helper:t', tHelper);
  }
});

test('it renders', function(assert) {
  assert.expect(1);
  let modalDialogService = this.container.lookup('service:modal-dialog');
  modalDialogService.destinationElementId = 'modal-testing-div';
  this.render(hbs`<div id='modal-testing-div'></div>{{wait-saving}}`);

  assert.equal(this.$().text().trim(), 'saving... one moment...');
});
