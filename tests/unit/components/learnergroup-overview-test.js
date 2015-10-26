import { moduleForComponent, test } from 'ember-qunit';
import {a as testgroup} from 'ilios/tests/helpers/test-groups';
import Ember from 'ember';

const { run } = Ember;
const { next } = run;

moduleForComponent('learnergroup-overview' + testgroup, 'Unit | Component | learnergroup overview', {
  unit: true
});

test('default properties are correct', function(assert) {
  assert.expect(6);

  const component = this.subject();

  const className = component.get('classNames')[1];
  const learnerGroup = component.get('learnerGroup');
  const instructorsSort = component.get('instructorsSort');
  const courseSort = component.get('courseSort');
  const multiEditModeOn = component.get('multiEditModeOn');
  const includeAll = component.get('includeAll');

  assert.equal(className, 'learnergroup-overview', 'class name is correct');
  assert.equal(learnerGroup, null, 'learnerGroup is null');
  assert.deepEqual(instructorsSort, ['lastName', 'firstName']);
  assert.deepEqual(courseSort, ['title']);
  assert.equal(multiEditModeOn, false, 'multi-edit mode is off');
  assert.equal(includeAll, false, 'check-all box is unchecked');
});

test('`resetCheckBox` observer works properly', function(assert) {
  assert.expect(1);

  run(this, function() {
    const component = this.subject({
      multiEditModeOn: true,
      includeAll: true
    });

    component.set('multiEditModeOn', false);

    next(component, function() {
      assert.equal(component.get('includeAll'), false);
    });
  });
});
