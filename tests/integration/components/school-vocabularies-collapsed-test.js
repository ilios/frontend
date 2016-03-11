import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('school-vocabularies-collapsed', 'Integration | Component | school vocabularies collapsed', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{school-vocabularies-collapsed}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#school-vocabularies-collapsed}}
      template block text
    {{/school-vocabularies-collapsed}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
