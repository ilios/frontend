import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('multiedit-select', 'Unit | Component | multiedit select', {
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
  assert.expect(3);

  const component = this.subject();
  assert.equal(component.get('checked'), false);

  component.set('includeAll', true);
  assert.equal(component.get('checked'), true);

  component.set('includeAll', false);
  assert.equal(component.get('checked'), false);
});

test('`checkmarkActionUp` observer works properly and sends up actions', function(assert) {
  assert.expect(4);

  const component = this.subject({
    condition: '1234'
  });

  component.addStudent = (studentId) => {
    assert.equal(studentId, '1234');
    assert.ok(true, 'bubbles up to `addStudent` action');
  };

  component.removeStudent = (studentId) => {
    assert.equal(studentId, '1234');
    assert.ok(true, 'bubbles up to `removeStudent` action');
  };

  component.set('checked', true);
  component.set('checked', false);
});
