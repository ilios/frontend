import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('school-vocabularies-expanded', 'Integration | Component | school vocabularies expanded', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{school-vocabularies-expanded}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#school-vocabularies-expanded}}
      template block text
    {{/school-vocabularies-expanded}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
