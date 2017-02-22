import Ember from 'ember';
import SortableByPositionMixin from 'ilios/mixins/sortable-by-position';
import { module, test } from 'qunit';
const { Object } = Ember;

module('Unit | Mixin | sortable by position');

test('position sorting callback', function(assert) {
  const SortableByPositionObject = Object.extend(SortableByPositionMixin);
  const subject = SortableByPositionObject.create();

  const obj1 = Object.create({
    id: 1,
    position: 3,
  });

  const obj2 = Object.create({
    id: 2,
    position: 2,
  });
  const obj3 = Object.create({
    id: 3,
    position: 1,
  });
  const obj4 = Object.create({
    id: 4,
    position: 2
  });

  let objects = [ obj1, obj2, obj3, obj4 ];

  let sortedObjects = objects.sort(subject.get('positionSortingCallback'));

  assert.equal(sortedObjects.length, objects.length);
  assert.equal(sortedObjects[0], obj3);
  assert.equal(sortedObjects[1], obj4);
  assert.equal(sortedObjects[2], obj2);
  assert.equal(sortedObjects[3], obj1);
});
