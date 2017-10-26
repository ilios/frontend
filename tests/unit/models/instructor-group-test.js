import {
  moduleForModel,
  test
} from 'ember-qunit';
import Ember from 'ember';
import modelList from '../../helpers/model-list';

const { run } = Ember;

moduleForModel('instructor-group', 'Unit | Model | InstructorGroup', {
  needs: modelList
});

test('list courses', async function(assert) {
  assert.expect(3);
  run(async ()=> {
    const model = this.subject();
    const store = model.store;
    const course1 = store.createRecord('course', {title:'course1', id: 1});
    const course2 = store.createRecord('course', {title:'course2', id: 2});
    const session1 = store.createRecord('session', {course: course1});
    const session2 = store.createRecord('session', {course: course1});
    const session3 = store.createRecord('session', {course: course2});
    model.get('offerings').pushObjects([
      store.createRecord('offering', {session: session1}),
      store.createRecord('offering', {session: session1}),
      store.createRecord('offering', {session: session1}),
      store.createRecord('offering', {session: session2}),
      store.createRecord('offering', {session: session2}),
      store.createRecord('offering', {session: session3}),
    ]);

    const courses = await model.get('courses');
    assert.equal(courses.length, 2);
    assert.equal(courses.objectAt(0).get('title'), 'course1');
    assert.equal(courses.objectAt(1).get('title'), 'course2');
  });
});
