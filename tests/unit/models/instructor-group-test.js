import {
  moduleForModel,
  test
} from 'ember-qunit';
import Ember from 'ember';
import modelList from '../../helpers/model-list';

const { RSVP, run } = Ember;
const { Promise } = RSVP;

moduleForModel('instructor-group', 'Unit | Model | InstructorGroup', {
  needs: modelList
});

test('it exists', function(assert) {
  let model = this.subject();
  // let store = this.store();
  assert.ok(!!model);
});

test('list courses', function(assert) {
  assert.expect(3);
  return new Promise(resolve => {
    run(()=> {
      let model = this.subject();
      let store = model.store;
      let course1 = store.createRecord('course', {title:'course1', id: 1});
      let course2 = store.createRecord('course', {title:'course2', id: 2});
      let session1 = store.createRecord('session', {course: course1});
      let session2 = store.createRecord('session', {course: course1});
      let session3 = store.createRecord('session', {course: course2});
      model.get('offerings').then(function(offerings){
        offerings.pushObject(store.createRecord('offering', {session: session1}));
        offerings.pushObject(store.createRecord('offering', {session: session1}));
        offerings.pushObject(store.createRecord('offering', {session: session1}));
        offerings.pushObject(store.createRecord('offering', {session: session2}));
        offerings.pushObject(store.createRecord('offering', {session: session2}));
        offerings.pushObject(store.createRecord('offering', {session: session3}));
      });
      model.get('courses').then(function(courses){
        assert.equal(courses.length, 2);
        assert.equal(courses.objectAt(0).get('title'), 'course1');
        assert.equal(courses.objectAt(1).get('title'), 'course2');

        resolve();
      });
    });
  });

});
