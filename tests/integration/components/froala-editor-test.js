import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('froala-editor', 'Integration | Component | froala editor', {
  integration: true
});

test('it renders', function(assert) {
  this.render(hbs`{{froala-editor}}`);

  assert.equal(this.$().text().trim(), 'BoldItalicSubscriptSuperscriptOrdered ListUnordered ListInsert Link');
});
