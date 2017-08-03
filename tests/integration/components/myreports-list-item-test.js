import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('myreports-list-item', 'Integration | Component | myreports list item', {
  integration: true
});

test('it renders', function(assert) {

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{myreports-list-item}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#myreports-list-item}}
      template block text
    {{/myreports-list-item}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
