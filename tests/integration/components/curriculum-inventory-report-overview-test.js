import { moduleForComponent } from 'ember-qunit';
import { skip } from 'qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('curriculum-inventory-report-overview', 'Integration | Component | curriculum inventory report overview', {
  integration: true
});

skip('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{curriculum-inventory-report-overview}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#curriculum-inventory-report-overview}}
      template block text
    {{/curriculum-inventory-report-overview}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
