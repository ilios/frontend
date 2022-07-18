import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | IlmSession', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    const model = this.owner.lookup('service:store').createRecord('ilm-session');
    assert.ok(!!model);
  });

  test('getAllInstructors', async function (assert) {
    const store = this.owner.lookup('service:store');
    const instructor1 = store.createRecord('user');
    const instructor2 = store.createRecord('user');
    const instructor3 = store.createRecord('user');
    const instructor4 = store.createRecord('user');
    const instructorGroup1 = store.createRecord('instructorGroup', {
      users: [instructor1, instructor2],
    });
    const instructorGroup2 = store.createRecord('instructorGroup', {
      users: [instructor3],
    });
    const model = store.createRecord('ilm-session', {
      instructorGroups: [instructorGroup1, instructorGroup2],
      instructors: [instructor1, instructor3, instructor4],
    });
    const allInstructors = await model.getAllInstructors();
    assert.strictEqual(allInstructors.length, 4);
    assert.ok(allInstructors.includes(instructor1));
    assert.ok(allInstructors.includes(instructor2));
    assert.ok(allInstructors.includes(instructor3));
    assert.ok(allInstructors.includes(instructor4));
  });

  test('getAllInstructors - no instructors', async function (assert) {
    const store = this.owner.lookup('service:store');
    const model = store.createRecord('ilm-session');
    const allInstructors = await model.getAllInstructors();
    assert.strictEqual(allInstructors.length, 0);
  });
});
