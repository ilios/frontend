import { moduleForComponent } from 'ember-qunit';
import { skip } from 'qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('curriculum-inventory-report-details', 'Integration | Component | curriculum inventory report details', {
  integration: true
});

skip('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{curriculum-inventory-report-details}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#curriculum-inventory-report-details}}
      template block text
    {{/curriculum-inventory-report-details}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
