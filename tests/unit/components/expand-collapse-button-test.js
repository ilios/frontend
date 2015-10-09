import { moduleForComponent, test } from 'ember-qunit';
import Ember from 'ember';

const { run } = Ember;
const { next } = run;

moduleForComponent('expand-collapse-button', 'Unit | Component | expand collapse button', {
  needs: ['helper:fa-icon'],
  unit: true
});

test('it works properly', function(assert) {
  assert.expect(5);

  run(this, () => {
    const component = this.subject();

    assert.equal(component.get('value'), false, 'value is false by default');

    this.render();

    assert.ok(this.$('.expand-button i').hasClass('fa-plus'));

    component.click = () => {
      assert.ok(true, 'button was clicked');
      component.set('value', !component.get('value'));
    };

    component.click();

    next(component, () => {
      assert.equal(component.get('value'), true);
      assert.ok(this.$('.collapse-button i').hasClass('fa-minus'));
    });
  });
});
