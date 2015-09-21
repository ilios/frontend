import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('learnergroup-overview', 'Unit | Component | learnergroup overview', {
  unit: true
});

test('default properties are correct', function(assert) {
  assert.expect(5);

  const component = this.subject();

  const className = component.get('classNames')[1];
  const learnerGroup = component.get('learnerGroup');
  const instructorUsersSort = component.get('instructorUsersSort');
  const courseSort = component.get('courseSort');
  const multiEditModeOn = component.get('multiEditModeOn');

  assert.equal(className, 'learnergroup-overview', 'class name is correct');
  assert.equal(learnerGroup, null, 'learnerGroup is null');
  assert.deepEqual(instructorUsersSort, ['lastName', 'firstName']);
  assert.deepEqual(courseSort, ['title']);
  assert.equal(multiEditModeOn, false, 'multi-edit mode is off');
});
