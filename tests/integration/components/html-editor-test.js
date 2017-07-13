import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('html-editor', 'Integration | Component | html editor', {
  integration: true
});

test('it renders', function(assert) {
  this.render(hbs`{{html-editor}}`);

  assert.equal(this.$().text().trim(), 'BoldItalicSubscriptSuperscriptOrdered ListUnordered ListInsert Link');

});
