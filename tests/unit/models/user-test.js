import {
  moduleForModel,
  test
} from 'ember-qunit';
import {a as testgroup} from 'ilios/tests/helpers/test-groups';
import Ember from 'ember';
import modelList from '../../helpers/model-list';

moduleForModel('user', 'Unit | Model | User' + testgroup, {
  needs: modelList
});

test('it exists', function(assert) {
  var model = this.subject();
  // var store = this.store();
  assert.ok(!!model);
});

test('gets all directed courses', function(assert) {
  let model = this.subject();
  let store = this.store();
  let courses = [];
  Ember.run(()=>{
    courses.pushObject(store.createRecord('course', {
      directors: [model]
    }));
    courses.pushObject(store.createRecord('course', {
      directors: [model]
    }));
    model.get('allRelatedCourses').then(allRelatedCourses => {
      assert.equal(allRelatedCourses.length, courses.length);
      courses.forEach(course => {
        assert.ok(allRelatedCourses.contains(course));
      });
    });
  });
  
});

test('gets all learner group courses', function(assert) {
  let model = this.subject();
  let store = this.store();
  Ember.run(()=>{
    let course1 = store.createRecord('course');
    let session1 = store.createRecord('session', {
      course: course1
    });
    let offering1 = store.createRecord('offering', {
      session: session1
    });
    let offering2 = store.createRecord('offering', {
      session: session1
    });
    store.createRecord('learnerGroup', {
      offerings: [offering1, offering2],
      users: [model]
    });
    let course2 = store.createRecord('course');
    let session2 = store.createRecord('session', {
      course: course2
    });
    let offering3 = store.createRecord('offering', {
      session: session2
    });
    store.createRecord('learnerGroup', {
      offerings: [offering3],
      users: [model]
    });
    
    let courses = [course1, course2];
    model.get('allRelatedCourses').then(allRelatedCourses => {
      assert.equal(allRelatedCourses.length, courses.length);
      courses.forEach(course => {
        assert.ok(allRelatedCourses.contains(course));
      });
    });
  });
  
});

test('gets all instructor group courses', function(assert) {
  let model = this.subject();
  let store = this.store();
  Ember.run(()=>{
    let course1 = store.createRecord('course');
    let session1 = store.createRecord('session', {
      course: course1
    });
    let offering1 = store.createRecord('offering', {
      session: session1
    });
    let offering2 = store.createRecord('offering', {
      session: session1
    });
    store.createRecord('instructorGroup', {
      offerings: [offering1, offering2],
      users: [model]
    });
    let course2 = store.createRecord('course');
    let session2 = store.createRecord('session', {
      course: course2
    });
    let offering3 = store.createRecord('offering', {
      session: session2
    });
    store.createRecord('instructorGroup', {
      offerings: [offering3],
      users: [model]
    });
    
    let courses = [course1, course2];
    model.get('allRelatedCourses').then(allRelatedCourses => {
      assert.equal(allRelatedCourses.length, courses.length);
      courses.forEach(course => {
        assert.ok(allRelatedCourses.contains(course));
      });
    });
  });
  
});

test('gets all instructed offering courses', function(assert) {
  let model = this.subject();
  let store = this.store();
  Ember.run(()=>{
    let course1 = store.createRecord('course');
    let session1 = store.createRecord('session', {
      course: course1
    });
    store.createRecord('offering', {
      session: session1,
      instructors: [model]
    });
    store.createRecord('offering', {
      session: session1,
      instructors: [model]
    });
    let course2 = store.createRecord('course');
    let session2 = store.createRecord('session', {
      course: course2
    });
    store.createRecord('offering', {
      session: session2,
      instructors: [model]
    });
    
    let courses = [course1, course2];
    model.get('allRelatedCourses').then(allRelatedCourses => {
      assert.equal(allRelatedCourses.length, courses.length);
      courses.forEach(course => {
        assert.ok(allRelatedCourses.contains(course));
      });
    });
  });
  
});

test('gets all learner offering courses', function(assert) {
  let model = this.subject();
  let store = this.store();
  Ember.run(()=>{
    let course1 = store.createRecord('course');
    let session1 = store.createRecord('session', {
      course: course1
    });
    store.createRecord('offering', {
      session: session1,
      learners: [model]
    });
    store.createRecord('offering', {
      session: session1,
      learners: [model]
    });
    let course2 = store.createRecord('course');
    let session2 = store.createRecord('session', {
      course: course2
    });
    store.createRecord('offering', {
      session: session2,
      learners: [model]
    });
    
    let courses = [course1, course2];
    model.get('allRelatedCourses').then(allRelatedCourses => {
      assert.equal(allRelatedCourses.length, courses.length);
      courses.forEach(course => {
        assert.ok(allRelatedCourses.contains(course));
      });
    });
  });
  
});

test('gets all learner group ILMSession courses', function(assert) {
  let model = this.subject();
  let store = this.store();
  Ember.run(()=>{
    let course1 = store.createRecord('course');
    let session1 = store.createRecord('session', {
      course: course1,
    });
    let ilm1 = store.createRecord('ilmSession', {
      session: session1
    });
    let ilm2 = store.createRecord('ilmSession', {
      session: session1
    });
    store.createRecord('learnerGroup', {
      ilmSessions: [ilm1, ilm2],
      users: [model]
    });
    let course2 = store.createRecord('course');
    let session2 = store.createRecord('session', {
      course: course2
    });
    let ilm3 = store.createRecord('ilmSession', {
      session: session2
    });
    store.createRecord('learnerGroup', {
      ilmSessions: [ilm3],
      users: [model]
    });
    
    let courses = [course1, course2];
    model.get('allRelatedCourses').then(allRelatedCourses => {
      assert.equal(allRelatedCourses.length, courses.length);
      courses.forEach(course => {
        assert.ok(allRelatedCourses.contains(course));
      });
    });
  });
  
});

test('gets all instructor group ILMSession courses', function(assert) {
  let model = this.subject();
  let store = this.store();
  Ember.run(()=>{
    let course1 = store.createRecord('course');
    let session1 = store.createRecord('session', {
      course: course1,
    });
    let ilm1 = store.createRecord('ilmSession', {
      session: session1
    });
    let ilm2 = store.createRecord('ilmSession', {
      session: session1
    });
    store.createRecord('instructorGroup', {
      ilmSessions: [ilm1, ilm2],
      users: [model]
    });
    let course2 = store.createRecord('course');
    let session2 = store.createRecord('session', {
      course: course2
    });
    let ilm3 = store.createRecord('ilmSession', {
      session: session2
    });
    store.createRecord('instructorGroup', {
      ilmSessions: [ilm3],
      users: [model]
    });
    
    let courses = [course1, course2];
    model.get('allRelatedCourses').then(allRelatedCourses => {
      assert.equal(allRelatedCourses.length, courses.length);
      courses.forEach(course => {
        assert.ok(allRelatedCourses.contains(course));
      });
    });
  });
  
});

test('gets all learner ilm courses', function(assert) {
  let model = this.subject();
  let store = this.store();
  Ember.run(()=>{
    let course1 = store.createRecord('course');
    let session1 = store.createRecord('session', {
      course: course1
    });
    store.createRecord('ilmSession', {
      session: session1,
      learners: [model]
    });
    store.createRecord('ilmSession', {
      session: session1,
      learners: [model]
    });
    let course2 = store.createRecord('course');
    let session2 = store.createRecord('session', {
      course: course2
    });
    store.createRecord('ilmSession', {
      session: session2,
      learners: [model]
    });
    
    let courses = [course1, course2];
    model.get('allRelatedCourses').then(allRelatedCourses => {
      assert.equal(allRelatedCourses.length, courses.length);
      courses.forEach(course => {
        assert.ok(allRelatedCourses.contains(course));
      });
    });
  });
  
});

test('gets all instructor ilm courses', function(assert) {
  let model = this.subject();
  let store = this.store();
  Ember.run(()=>{
    let course1 = store.createRecord('course');
    let session1 = store.createRecord('session', {
      course: course1
    });
    store.createRecord('ilmSession', {
      session: session1,
      instructors: [model]
    });
    store.createRecord('ilmSession', {
      session: session1,
      instructors: [model]
    });
    let course2 = store.createRecord('course');
    let session2 = store.createRecord('session', {
      course: course2
    });
    store.createRecord('ilmSession', {
      session: session2,
      instructors: [model]
    });
    
    let courses = [course1, course2];
    model.get('allRelatedCourses').then(allRelatedCourses => {
      assert.equal(allRelatedCourses.length, courses.length);
      courses.forEach(course => {
        assert.ok(allRelatedCourses.contains(course));
      });
    });
  });
  
});
