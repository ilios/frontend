import {
  moduleForModel,
  test
} from 'ember-qunit';
import Ember from 'ember';
import modelList from '../../helpers/model-list';

moduleForModel('user', 'Unit | Model | User', {
  needs: modelList
});

test('it exists', function(assert) {
  var model = this.subject();
  // var store = this.store();
  assert.ok(!!model);
});

test('full name', function(assert) {
  let model = this.subject();
  Ember.run(()=>{
    model.set('firstName', 'first');
    model.set('lastName', 'last');
    model.set('middleName', 'middle');
    assert.equal(model.get('fullName'), 'first m. last');
  });
});

test('full name no middle name', function(assert) {
  let model = this.subject();
  Ember.run(()=>{
    model.set('firstName', 'first');
    model.set('lastName', 'last');
    assert.equal(model.get('fullName'), 'first last');
  });
});

test('gets all directed courses', function(assert) {
  let model = this.subject();
  let store = this.store();
  let courses = [];
  Ember.run(()=>{
    courses.pushObject(store.createRecord('course', {
      directors: [model],
      id: 1,
    }));
    courses.pushObject(store.createRecord('course', {
      directors: [model],
      id: 2
    }));
    model.get('allRelatedCourses').then(allRelatedCourses => {
      assert.equal(allRelatedCourses.length, courses.length);
      courses.forEach(course => {
        assert.ok(allRelatedCourses.includes(course));
      });
    });
  });

});

test('gets all learner group courses', function(assert) {
  let model = this.subject();
  let store = this.store();
  Ember.run(()=>{
    let course1 = store.createRecord('course', {id: 1});
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
    let course2 = store.createRecord('course', {id: 2});
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
      assert.equal(allRelatedCourses.length, courses.length, 'all expected courses returned');
      courses.forEach(course => {
        assert.ok(allRelatedCourses.includes(course), `course ${course.id} returned`);
      });
    });
  });

});

test('gets all instructor group courses', function(assert) {
  let model = this.subject();
  let store = this.store();
  Ember.run(()=>{
    let course1 = store.createRecord('course', {id: 1});
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
    let course2 = store.createRecord('course', {id: 2});
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
        assert.ok(allRelatedCourses.includes(course));
      });
    });
  });

});

test('gets all instructed offering courses', function(assert) {
  let model = this.subject();
  let store = this.store();
  Ember.run(()=>{
    let course1 = store.createRecord('course', {id: 1});
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
    let course2 = store.createRecord('course', {id: 2});
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
        assert.ok(allRelatedCourses.includes(course));
      });
    });
  });

});

test('gets all learner offering courses', function(assert) {
  let model = this.subject();
  let store = this.store();
  Ember.run(()=>{
    let course1 = store.createRecord('course', {id: 1});
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
    let course2 = store.createRecord('course', {id: 2});
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
        assert.ok(allRelatedCourses.includes(course));
      });
    });
  });

});

test('gets all learner group ILMSession courses', function(assert) {
  let model = this.subject();
  let store = this.store();
  Ember.run(()=>{
    let course1 = store.createRecord('course', {id: 1});
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
    let course2 = store.createRecord('course', {id: 2});
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
        assert.ok(allRelatedCourses.includes(course));
      });
    });
  });

});

test('gets all instructor group ILMSession courses', function(assert) {
  let model = this.subject();
  let store = this.store();
  Ember.run(()=>{
    let course1 = store.createRecord('course', {id: 1});
    let session1 = store.createRecord('session', {
      course: course1,
    });
    let session2 = store.createRecord('session', {
      course: course1,
    });
    let ilm1 = store.createRecord('ilmSession', {
      id: 1,
      session: session1
    });
    let ilm2 = store.createRecord('ilmSession', {
      id: 2,
      session: session2
    });
    store.createRecord('instructorGroup', {
      ilmSessions: [ilm1, ilm2],
      users: [model]
    });
    let course2 = store.createRecord('course', {id: 2});
    let session3 = store.createRecord('session', {
      course: course2
    });
    let ilm3 = store.createRecord('ilmSession', {
      id: 3,
      session: session3
    });
    store.createRecord('instructorGroup', {
      ilmSessions: [ilm3],
      users: [model]
    });

    let courses = [course1, course2];
    model.get('allRelatedCourses').then(allRelatedCourses => {
      assert.equal(allRelatedCourses.length, courses.length);
      courses.forEach(course => {
        assert.ok(allRelatedCourses.includes(course));
      });
    });
  });

});

test('gets all learner ilm courses', function(assert) {
  let model = this.subject();
  let store = this.store();
  Ember.run(()=>{
    let course1 = store.createRecord('course', {id: 1});
    let session1 = store.createRecord('session', {
      course: course1
    });
    store.createRecord('ilmSession', {
      session: session1,
      learners: [model]
    });
    let course2 = store.createRecord('course', {id: 2});
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
        assert.ok(allRelatedCourses.includes(course));
      });
    });
  });

});

test('gets all instructor ilm courses', function(assert) {
  let model = this.subject();
  let store = this.store();
  Ember.run(()=>{
    let course1 = store.createRecord('course', {id: 1});
    let session1 = store.createRecord('session', {
      course: course1
    });
    store.createRecord('ilmSession', {
      session: session1,
      instructors: [model]
    });
    let course2 = store.createRecord('course', {id: 2});
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
        assert.ok(allRelatedCourses.includes(course));
      });
    });
  });

});

test('find lowest group at top of tree', function(assert) {
  let model = this.subject();
  let store = this.store();
  Ember.run(()=>{
    let learnerGroup = store.createRecord('learnerGroup', {id: 1, users: [model]});
    let learnerGroup2 = store.createRecord('learnerGroup', {id: 2, parent: learnerGroup});
    let learnerGroup3 = store.createRecord('learnerGroup', {id: 3, parent: learnerGroup2});
    let tree = [learnerGroup, learnerGroup2, learnerGroup3];

    model.set('learerGroups', [learnerGroup]);

    model.getLowestMemberGroupInALearnerGroupTree(tree).then(lowestGroup => {
      assert.ok(lowestGroup);
      assert.equal(lowestGroup.get('id'), learnerGroup.get('id'));
    });
  });

});

test('find lowest group in middle of tree', function(assert) {
  let model = this.subject();
  let store = this.store();
  Ember.run(()=>{
    let learnerGroup = store.createRecord('learnerGroup', {id: 1, users: [model]});
    let learnerGroup2 = store.createRecord('learnerGroup', {id: 2, parent: learnerGroup, users: [model]});
    let learnerGroup3 = store.createRecord('learnerGroup', {id: 3, parent: learnerGroup2});
    let tree = [learnerGroup, learnerGroup2, learnerGroup3];

    model.set('learerGroups', [learnerGroup, learnerGroup2]);

    model.getLowestMemberGroupInALearnerGroupTree(tree).then(lowestGroup => {
      assert.ok(lowestGroup);
      assert.equal(lowestGroup.get('id'), learnerGroup2.get('id'));
    });
  });

});

test('find lowest group in bottom of tree', function(assert) {
  let model = this.subject();
  let store = this.store();
  Ember.run(()=>{
    let learnerGroup = store.createRecord('learnerGroup', {id: 1, users: [model]});
    let learnerGroup2 = store.createRecord('learnerGroup', {id: 2, parent: learnerGroup, users: [model]});
    let learnerGroup3 = store.createRecord('learnerGroup', {id: 3, parent: learnerGroup2, users: [model]});
    let tree = [learnerGroup, learnerGroup2, learnerGroup3];

    model.set('learerGroups', [learnerGroup, learnerGroup2, learnerGroup3]);

    model.getLowestMemberGroupInALearnerGroupTree(tree).then(lowestGroup => {
      assert.ok(lowestGroup);
      assert.equal(lowestGroup.get('id'), learnerGroup3.get('id'));
    });
  });

});

test('return null when there is no group in the tree', function(assert) {
  let model = this.subject();
  let store = this.store();
  Ember.run(()=>{
    let learnerGroup = store.createRecord('learnerGroup', {id: 1});
    let learnerGroup2 = store.createRecord('learnerGroup', {id: 2, parent: learnerGroup});
    let learnerGroup3 = store.createRecord('learnerGroup', {id: 3, parent: learnerGroup2});
    let tree = [learnerGroup, learnerGroup2, learnerGroup3];

    model.getLowestMemberGroupInALearnerGroupTree(tree).then(lowestGroup => {
      assert.ok(lowestGroup == null);
    });
  });

});

test('gets secondary cohorts (all cohorts not the primary cohort)', function(assert) {
  let model = this.subject();
  let store = this.store();
  Ember.run(()=>{
    let primaryCohort = store.createRecord('cohort', {
      users: [model]
    });
    let secondaryCohort = store.createRecord('cohort', {
      users: [model]
    });
    let anotherCohort = store.createRecord('cohort', {
      users: [model]
    });
    model.set('primaryCohort', primaryCohort);
    model.set('cohorts', [primaryCohort, secondaryCohort, anotherCohort]);

    model.get('secondaryCohorts').then(cohorts => {
      assert.equal(cohorts.length, 2);
      assert.ok(cohorts.includes(secondaryCohort));
      assert.ok(cohorts.includes(anotherCohort));
      assert.notOk(cohorts.includes(primaryCohort));
    });
  });

});
