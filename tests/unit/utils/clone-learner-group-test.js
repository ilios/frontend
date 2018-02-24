import EmberObject from '@ember/object';
import RSVP from 'rsvp';
import cloneLearnerGroup from 'ilios/utils/clone-learner-group';
import { module, test } from 'qunit';

const { resolve } = RSVP;

module('Unit | Utility | clone learner group', function() {
  test('clones empty group', async function (assert) {
    const store = EmberObject.create({
      createRecord(what, {title, location:loc}) {
        assert.equal(what, 'learner-group');
        assert.equal(title, 'to clone');
        assert.equal(loc, 'over the rainbow');

        return EmberObject.create({ title, location: loc});
      }
    });
    const instructor = EmberObject.create();
    const group = EmberObject.create({
      title: 'to clone',
      location: 'over the rainbow',
      children: resolve([]),
      instructors: resolve([instructor]),
    });
    const cohort = EmberObject.create({

    });
    let groups = await cloneLearnerGroup(store, group, cohort, false);
    assert.equal(groups.length, 1);
    const result = groups[0];
    assert.ok(result);
    assert.equal(result.get('title'), group.get('title'), 'title was copied');
    assert.equal(result.get('location'), group.get('location'), 'locationw as copied');
    assert.equal(result.get('cohort'), cohort, 'cohort was copied');
    assert.equal(result.get('instructors').length, 1);
    assert.deepEqual(result.get('instructors'), [instructor], 'instructors were copied');
    assert.equal(result.get('parent'), null, 'there was no parent');
  });
});