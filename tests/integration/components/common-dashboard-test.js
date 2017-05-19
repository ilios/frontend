import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('common-dashboard', 'Integration | Component | common dashboard', {
  integration: true
});

test('it renders', function(assert) {
  this.set('nothing', parseInt);
  this.render(hbs`{{common-dashboard
    setShow=(action nothing)
  }}`);

  assert.equal(this.$().text().trim(), '');
});
