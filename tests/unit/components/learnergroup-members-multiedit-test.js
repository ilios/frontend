import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('learnergroup-members-multiedit', 'Unit | Component | learnergroup members multiedit', {
  unit: true
});

test('default properties are correct', function(assert) {
  assert.expect(6);

  const component = this.subject();

  const tagName = component.get('tagName');
  const buffer = component.get('buffer');
  const includeAll = component.get('includeAll');
  const toBulkSave = component.get('toBulkSave');
  const optionLabelPath = component.get('optionLabelPath');
  const optionValuePath = component.get('optionValuePath');

  assert.equal(tagName, 'section');
  assert.equal(buffer, null);
  assert.equal(includeAll, false);
  assert.deepEqual(toBulkSave, []);
  assert.equal(optionLabelPath, 'title');
  assert.equal(optionValuePath, 'id');
});

test('`noneChecked` & `someChecked` computed properties work properly', function(assert) {
  assert.expect(6);

  const component = this.subject();

  assert.equal(component.get('noneChecked'), true);
  assert.equal(component.get('someChecked'), false);

  component.get('toBulkSave').pushObject('1234');
  assert.equal(component.get('noneChecked'), false);
  assert.equal(component.get('someChecked'), true);

  component.get('toBulkSave').removeObject('1234');
  assert.equal(component.get('noneChecked'), true);
  assert.equal(component.get('someChecked'), false);
});
