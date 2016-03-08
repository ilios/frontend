import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('school-competencies-manager', 'Integration | Component | school competencies manager', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });"

  this.render(hbs`{{school-competencies-manager}}`);


  assert.equal(this.$('label').text().trim(), 'New Domain');
  assert.equal(this.$('button').text().trim(), 'Add');
});

test('add new domain', function(assert) {
  assert.expect(1);
  this.on('add', (value) => {
    assert.equal(value, 'new domain');
  });
  this.render(hbs`{{school-competencies-manager add=(action 'add')}}`);
  this.$('input').val('new domain');
  this.$('input').trigger('change');
  this.$('button').click();

});
