import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('toggle-onoff', 'Unit | Component | toggle onoff ', {
  unit: true
});

test('default properties are correct', function(assert) {
  assert.expect(3);

  const component = this.subject();

  const className = component.get('classNames')[1];
  const label = component.get('label');
  const on = component.get('on');

  assert.equal(className, 'toggle-onoff', 'class name is correct');
  assert.equal(label, null, 'label is null');
  assert.equal(on, false, 'default checked is false');
});
