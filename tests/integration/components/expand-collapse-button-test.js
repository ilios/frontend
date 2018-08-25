import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('expand-collapse-button', 'Integration | Component | expand collapse button', {
  integration: true
});

test('clicking changes the icon and sends the action', function(assert) {
  assert.expect(5);

  this.set('value', false);
  this.on('click', () => {
    assert.ok(true, 'button was clicked');
    this.set('value', !this.get('value'));
  });
  this.render(hbs`{{expand-collapse-button value=value action='click'}}`);
  assert.ok(this.$('svg').hasClass('fa-plus'));

  this.$('svg').click();
  assert.ok(this.$('svg').hasClass('fa-minus'));

  this.$('svg').click();
  assert.ok(this.$('svg').hasClass('fa-plus'));

});
