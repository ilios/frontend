import { moduleForComponent, test } from 'ember-qunit';
import {a as testgroup} from 'ilios/tests/helpers/test-groups';

moduleForComponent('multiedit-select', 'Unit | Component | multiedit select ' + testgroup, {
  needs: ['component:boolean-check'],
  unit: true
});

test('default properties are correct', function(assert) {
  assert.expect(2);

  const component = this.subject();

  const displayValueOverride = component.get('displayValueOverride');
  const checked = component.get('checked');

  assert.equal(displayValueOverride, null);
  assert.equal(checked, false);
});

test('`displayValue` computed property works properly', function(assert) {
  assert.expect(2);

  const component = this.subject();

  assert.equal(component.get('displayValue'), undefined);

  component.set('displayValueOverride', 'BMB Entire Class');
  assert.equal(component.get('displayValue'), 'BMB Entire Class');
});

test('`checkAll` observer works properly', function(assert) {
  assert.expect(7);

  const component = this.subject();

  component.send = (action) => {
    assert.ok(true, '`sendActionUp` was called');
    assert.equal(action, 'sendActionUp');
  };

  assert.equal(component.get('checked'), false);

  component.set('includeAll', true);
  assert.equal(component.get('checked'), true);

  component.set('includeAll', false);
  assert.equal(component.get('checked'), false);
});

test('`toggleCheckBox` action is called', function(assert) {
  assert.expect(2);

  const component = this.subject();

  component.send = (action) => {
    assert.ok(true, 'primary action get called');
    assert.equal(action, 'toggleCheckBox');
  };

  this.render();

  component.$('.checkbox').click();
});
