import { moduleForComponent, test } from 'ember-qunit';
import {a as testgroup} from 'ilios/tests/helpers/test-groups';
import Ember from 'ember';

moduleForComponent('offering-editor-learnergroups', 'Unit | Component | offering editor learnergroups ' + testgroup, {
  unit: true
});

test('`revisedLearnerGroups` & `sortedLearnerGroups` computed property works properly', function(assert) {
  assert.expect(10);

  const group1 = Ember.Object.create({
    title: 'BMB 1',
    allParentTitles: ['Parent Title']
  });

  const group2 = Ember.Object.create({
    title: 'BMB 2',
    allParentTitles: ['Parent Title']
  });

  const cohort = { id: 12 };
  const learnerGroups = { '12': [ group2, group1 ] };

  const component = this.subject({ cohort, learnerGroups });

  let revisedLearnerGroups = component.get('revisedLearnerGroups');

  assert.equal(revisedLearnerGroups[0].sortName, 'Parent Title > BMB 2');
  assert.equal(revisedLearnerGroups[0].group.title, 'BMB 2');
  assert.deepEqual(revisedLearnerGroups[0].group.allParentTitles, ['Parent Title']);

  assert.equal(revisedLearnerGroups[1].sortName, 'Parent Title > BMB 1');
  assert.equal(revisedLearnerGroups[1].group.title, 'BMB 1');
  assert.deepEqual(revisedLearnerGroups[1].group.allParentTitles, ['Parent Title']);

  let sortedLearnerGroups = component.get('sortedLearnerGroups');

  assert.equal(sortedLearnerGroups[0].sortName, 'Parent Title > BMB 1');
  assert.equal(sortedLearnerGroups[0].group.title, 'BMB 1');

  assert.equal(sortedLearnerGroups[1].sortName, 'Parent Title > BMB 2');
  assert.equal(sortedLearnerGroups[1].group.title, 'BMB 2');
});
