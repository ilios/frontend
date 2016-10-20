import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('curriculum-inventory-report-rollover', 'Integration | Component | curriculum inventory report rollover', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{curriculum-inventory-report-rollover}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#curriculum-inventory-report-rollover}}
      template block text
    {{/curriculum-inventory-report-rollover}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
