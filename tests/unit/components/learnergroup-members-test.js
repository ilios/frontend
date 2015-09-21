import { moduleForComponent, test } from 'ember-qunit';
import Ember from 'ember';

const { run } = Ember;
const { next } = run;

moduleForComponent('learnergroup-members', 'Unit | Component | learnergroup members', {
  unit: true
});

test('`resetProperties` observer works properly', function(assert) {
  assert.expect(2);

  run(this, function() {
    const component = this.subject({
      multiEditModeOn: true,
      valueChanged: true,
      buffer: -1
    });

    component.set('multiEditModeOn', false);

    next(component, function() {
      assert.equal(component.get('valueChanged'), false);
      assert.equal(component.get('buffer'), null);
    });
  });
});
