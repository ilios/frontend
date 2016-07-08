import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('school-competencies-manager', 'Integration | Component | school competencies manager', {
  integration: true
});

test('it renders', function(assert) {
  this.render(hbs`{{school-competencies-manager}}`);
  assert.ok(false);
});
