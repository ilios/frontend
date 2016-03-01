import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('school-competencies-collapsed', 'Integration | Component | school competencies collapsed', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });"

  this.render(hbs`{{school-competencies-collapsed}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:"
  this.render(hbs`
    {{#school-competencies-collapsed}}
      template block text
    {{/school-competencies-collapsed}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
