import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('course-loading', 'Integration | Component | course loading', {
  integration: true
});

test('it renders', function(assert) {
  this.render(hbs`{{course-loading}}`);

  assert.equal(this.$().text().trim(), 'Back to Courses List');
});
