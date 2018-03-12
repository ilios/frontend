import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('update-notification', 'Integration | Component | update notification', {
  integration: true
});

test('it renders', function(assert) {
  this.render(hbs`{{update-notification}}`);
  assert.equal(this.$().text().trim(), "Huzzah! We've made Ilios better. You will get the new stuff on your next login, or click to update now.");
});
