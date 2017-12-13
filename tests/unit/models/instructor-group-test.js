import { run } from '@ember/runloop';
import {
  moduleForModel,
  test
} from 'ember-qunit';
import modelList from '../../helpers/model-list';
import { initialize } from '../../../initializers/replace-promise';

initialize();
moduleForModel('instructor-group', 'Unit | Model | InstructorGroup', {
  needs: modelList
});

test('list courses', async function(assert) {
  assert.expect(4);
  run( async () => {
    const model = this.subject();
    const store = model.store;
    const course1 = store.createRecord('course', { title:'course1', id: 1 });
    const course2 = store.createRecord('course', { title:'course2', id: 2 });
    const course3 = store.createRecord('course', { title:'course3', id: 3 });
    const session1 = store.createRecord('session', { course: course1 });
    const session2 = store.createRecord('session', { course: course1 });
    const session3 = store.createRecord('session', { course: course2 });
    const session4 = store.createRecord('session', { course: course3 });

    model.get('offerings').pushObjects([
      store.createRecord('offering', { session: session1 }),
      store.createRecord('offering', { session: session1 }),
      store.createRecord('offering', { session: session1 }),
      store.createRecord('offering', { session: session2 }),
      store.createRecord('offering', { session: session2 }),
      store.createRecord('offering', { session: session3 })
    ]);
    model.get('ilmSessions').pushObjects([
      store.createRecord('ilmSession', { session: session3 }),
      store.createRecord('ilmSession', { session: session4 })
    ]);
    const courses = await model.get('courses');
    assert.equal(courses.length, 3);
    assert.ok(courses.includes(course1));
    assert.ok(courses.includes(course2));
    assert.ok(courses.includes(course3));
  });
});
