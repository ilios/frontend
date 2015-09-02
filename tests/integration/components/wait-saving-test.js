import { moduleForComponent, test } from 'ember-qunit';
// import hbs from 'htmlbars-inline-precompile';
import tHelper from "ember-i18n/helper";

moduleForComponent('wait-saving', 'Integration | Component | wait saving', {
  integration: true,
  beforeEach: function() {
    this.container.lookup('service:i18n').set('locale', 'en');
    this.registry.register('helper:t', tHelper);
  }
});

test('it renders', function(assert) {
  assert.expect(1);
  assert.ok(true);
  
  //waiting for resolution of https://github.com/yapplabs/ember-modal-dialog/issues/78
  // this.render(hbs`{{wait-saving}}`);
  // 
  // assert.equal(this.$().text().trim(), 'saving... one moment...');
});
