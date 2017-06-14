import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('common-dashboard', 'Integration | Component | common dashboard', {
  integration: true
});

test('it renders', function(assert) {
  this.set('nothing', parseInt);
  this.render(hbs`{{common-dashboard
    show='week'
    setShow=(action nothing)
  }}`);
  assert.ok(this.$().text().includes('Week at a Glance'));
  assert.ok(this.$().text().includes('Activities'));
  assert.ok(this.$().text().includes('Materials'));
  assert.ok(this.$().text().includes('Calendar'));
});
