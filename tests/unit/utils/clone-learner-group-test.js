import EmberObject from '@ember/object';
import RSVP from 'rsvp';
import cloneLearnerGroup from 'ilios/utils/clone-learner-group';
import { module, test } from 'qunit';

const { resolve } = RSVP;

module('Unit | Utility | clone learner group', function () {
  test('clones empty group', async function (assert) {
    assert.expect(11);
    const store = EmberObject.create({
      createRecord(what, { title, location: loc }) {
        assert.strictEqual(what, 'learner-group');
        assert.strictEqual(title, 'to clone');
        assert.strictEqual(loc, 'over the rainbow');

        return EmberObject.create({ title, location: loc });
      },
    });
    const instructor = EmberObject.create();
    const group = EmberObject.create({
      title: 'to clone',
      location: 'over the rainbow',
      children: resolve([]),
      instructors: resolve([instructor]),
    });
    const cohort = EmberObject.create({});
    const groups = await cloneLearnerGroup(store, group, cohort, false);
    assert.strictEqual(groups.length, 1);
    const result = groups[0];
    assert.ok(result);
    assert.strictEqual(result.get('title'), group.get('title'), 'title was copied');
    assert.strictEqual(result.get('location'), group.get('location'), 'locationw as copied');
    assert.strictEqual(result.get('cohort'), cohort, 'cohort was copied');
    assert.strictEqual(result.get('instructors').length, 1);
    assert.deepEqual(result.get('instructors'), [instructor], 'instructors were copied');
    assert.strictEqual(result.get('parent'), undefined, 'there was no parent');
  });
});
