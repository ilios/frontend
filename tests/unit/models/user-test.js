import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { initialize } from '../../../initializers/replace-promise';

initialize();

module('Unit | Model | User', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let model = run(() => this.owner.lookup('service:store').createRecord('user'));
    // let store = this.store();
    assert.ok(!!model);
  });

  test('full name', function(assert) {
    let model = run(() => this.owner.lookup('service:store').createRecord('user'));
    run(()=>{
      model.set('firstName', 'first');
      model.set('lastName', 'last');
      model.set('middleName', 'middle');
      assert.equal(model.get('fullName'), 'first m. last');
    });
  });

  test('full name no middle name', function(assert) {
    let model = run(() => this.owner.lookup('service:store').createRecord('user'));
    run(()=>{
      model.set('firstName', 'first');
      model.set('lastName', 'last');
      assert.equal(model.get('fullName'), 'first last');
    });
  });

  test('gets all directed courses', async function(assert) {
    let model = run(() => this.owner.lookup('service:store').createRecord('user'));
    let store = this.owner.lookup('service:store');
    let courses = [];
    run( async () => {
      courses.pushObject(store.createRecord('course', {
        directors: [model],
        id: 1,
      }));
      courses.pushObject(store.createRecord('course', {
        directors: [model],
        id: 2
      }));
      const allRelatedCourses = await model.get('allRelatedCourses');
      assert.equal(allRelatedCourses.length, courses.length);
      courses.forEach(course => {
        assert.ok(allRelatedCourses.includes(course));
      });
    });
  });

  test('gets all administered courses', async function(assert) {
    let model = run(() => this.owner.lookup('service:store').createRecord('user'));
    let store = this.owner.lookup('service:store');
    let courses = [];
    run( async () => {
      courses.pushObject(store.createRecord('course', {
        administrators: [model],
        id: 1,
      }));
      courses.pushObject(store.createRecord('course', {
        administrators: [model],
        id: 2
      }));
      const allRelatedCourses = await model.get('allRelatedCourses');
      assert.equal(allRelatedCourses.length, courses.length);
      courses.forEach(course => {
        assert.ok(allRelatedCourses.includes(course));
      });
    });
  });

  test('gets all learner group courses', async function(assert) {
    let model = run(() => this.owner.lookup('service:store').createRecord('user'));
    let store = this.owner.lookup('service:store');
    run( async () => {
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
      const allRelatedCourses = await model.get('allRelatedCourses');
      assert.equal(allRelatedCourses.length, courses.length);
      courses.forEach(course => {
        assert.ok(allRelatedCourses.includes(course));
      });
    });
  });

  test('gets all instructor group courses', async function(assert) {
    let model = run(() => this.owner.lookup('service:store').createRecord('user'));
    let store = this.owner.lookup('service:store');
    run( async () => {
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
      const allRelatedCourses = await model.get('allRelatedCourses');
      assert.equal(allRelatedCourses.length, courses.length);
      courses.forEach(course => {
        assert.ok(allRelatedCourses.includes(course));
      });
    });
  });

  test('gets all instructed offering courses', async function(assert) {
    let model = run(() => this.owner.lookup('service:store').createRecord('user'));
    let store = this.owner.lookup('service:store');
    run( async () => {
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
      const allRelatedCourses = await model.get('allRelatedCourses');
      assert.equal(allRelatedCourses.length, courses.length);
      courses.forEach(course => {
        assert.ok(allRelatedCourses.includes(course));
      });
    });
  });

  test('gets all learner offering courses', async function(assert) {
    let model = run(() => this.owner.lookup('service:store').createRecord('user'));
    let store = this.owner.lookup('service:store');
    run( async () => {
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
      const allRelatedCourses = await model.get('allRelatedCourses');
      assert.equal(allRelatedCourses.length, courses.length);
      courses.forEach(course => {
        assert.ok(allRelatedCourses.includes(course));
      });
    });
  });

  test('gets all learner group ILMSession courses', async function(assert) {
    let model = run(() => this.owner.lookup('service:store').createRecord('user'));
    let store = this.owner.lookup('service:store');
    run( async () => {
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
      const allRelatedCourses = await model.get('allRelatedCourses');
      assert.equal(allRelatedCourses.length, courses.length);
      courses.forEach(course => {
        assert.ok(allRelatedCourses.includes(course));
      });
    });
  });

  test('gets all instructor group ILMSession courses', async function(assert) {
    let model = run(() => this.owner.lookup('service:store').createRecord('user'));
    let store = this.owner.lookup('service:store');
    run( async () => {
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
      const allRelatedCourses = await model.get('allRelatedCourses');
      assert.equal(allRelatedCourses.length, courses.length);
      courses.forEach(course => {
        assert.ok(allRelatedCourses.includes(course));
      });
    });
  });

  test('gets all learner ilm courses', async function(assert) {
    let model = run(() => this.owner.lookup('service:store').createRecord('user'));
    let store = this.owner.lookup('service:store');
    run( async () => {
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
      const allRelatedCourses = await model.get('allRelatedCourses');
      assert.equal(allRelatedCourses.length, courses.length);
      courses.forEach(course => {
        assert.ok(allRelatedCourses.includes(course));
      });
    });
  });

  test('isStudent - no roles', async function(assert){
    assert.expect(1);
    let model = run(() => this.owner.lookup('service:store').createRecord('user'));
    run( async () => {
      let isStudent = await model.get('isStudent');
      assert.notOk(isStudent);
    });
  });

  test('isStudent - roles, but no student role', async function(assert){
    assert.expect(1);
    let model = run(() => this.owner.lookup('service:store').createRecord('user'));
    let store = this.owner.lookup('service:store');
    run( async () => {
      const notAStudentRole = store.createRecord('user-role', { title: 'East-German Pie Eating Champion of 1997' });
      const notAStudentRoleEither = store.createRecord('user-role', { title: 'Alien Overlord' });
      model.get('roles').pushObjects([ notAStudentRole, notAStudentRoleEither ]);
      const isStudent = await model.get('isStudent');
      assert.notOk(isStudent);
    });
  });

  test('isStudent - has student role', async function(assert){
    assert.expect(1);
    let model = run(() => this.owner.lookup('service:store').createRecord('user'));
    let store = this.owner.lookup('service:store');
    run( async () => {
      const notAStudentRole = store.createRecord('user-role', { title: 'Non-student' });
      const studentRole = store.createRecord('user-role', { title: 'Student' });
      model.get('roles').pushObjects([ notAStudentRole, studentRole ]);
      const isStudent = await model.get('isStudent');
      assert.ok(isStudent);
    });
  });

  test('performsNonLearnerFunction - directedCourses', async function(assert){
    run(() => {
      assert.expect(1);
      let store = this.owner.lookup('service:store');
      let model = store.createRecord('user');
      store.createRecord('course', { directors: [model] });
      let performsNonLearnerFunction = model.get('performsNonLearnerFunction');
      assert.ok(performsNonLearnerFunction);
    });
  });

  test('performsNonLearnerFunction - administeredCourses', async function(assert){
    run(() => {
      assert.expect(1);
      let store = this.owner.lookup('service:store');
      let model = store.createRecord('user');
      store.createRecord('course', { administrators: [model] });
      let performsNonLearnerFunction = model.get('performsNonLearnerFunction');
      assert.ok(performsNonLearnerFunction);
    });
  });

  test('performsNonLearnerFunction - administeredSessions', async function(assert){
    run(() => {
      assert.expect(1);
      let store = this.owner.lookup('service:store');
      let model = store.createRecord('user');
      store.createRecord('session', { administrators: [model] });
      let performsNonLearnerFunction = model.get('performsNonLearnerFunction');
      assert.ok(performsNonLearnerFunction);
    });
  });

  test('performsNonLearnerFunction - instructedLearnerGroups', async function(assert){
    run(() => {
      assert.expect(1);
      let store = this.owner.lookup('service:store');
      let model = store.createRecord('user');
      store.createRecord('learner-group', { instructors: [model] });
      let performsNonLearnerFunction = model.get('performsNonLearnerFunction');
      assert.ok(performsNonLearnerFunction);
    });
  });

  test('performsNonLearnerFunction - instructorGroups', async function(assert){
    run(() => {
      assert.expect(1);
      let store = this.owner.lookup('service:store');
      let model = store.createRecord('user');
      store.createRecord('instructor-group', { users: [model] });
      let performsNonLearnerFunction = model.get('performsNonLearnerFunction');
      assert.ok(performsNonLearnerFunction);
    });
  });

  test('performsNonLearnerFunction - instructedOfferings', async function(assert){
    run(() => {
      assert.expect(1);
      let store = this.owner.lookup('service:store');
      let model = store.createRecord('user');
      store.createRecord('offering', { instructors: [model] });
      let performsNonLearnerFunction = model.get('performsNonLearnerFunction');
      assert.ok(performsNonLearnerFunction);
    });
  });

  test('performsNonLearnerFunction - directedPrograms', async function(assert){
    run(() => {
      assert.expect(1);
      let store = this.owner.lookup('service:store');
      let model = store.createRecord('user');
      store.createRecord('program', { directors: [model] });
      let performsNonLearnerFunction = model.get('performsNonLearnerFunction');
      assert.ok(performsNonLearnerFunction);
    });
  });

  test('performsNonLearnerFunction - programYears', async function(assert){
    run(() => {
      assert.expect(1);
      let store = this.owner.lookup('service:store');
      let model = store.createRecord('user');
      store.createRecord('program-year', { directors: [model] });
      let performsNonLearnerFunction = model.get('performsNonLearnerFunction');
      assert.ok(performsNonLearnerFunction);
    });
  });

  test('performsNonLearnerFunction - administeredCurriculumInventoryReports', async function(assert){
    run(() => {
      assert.expect(1);
      let store = this.owner.lookup('service:store');
      let model = store.createRecord('user');
      store.createRecord('curriculum-inventory-report', { administrators: [model] });
      let performsNonLearnerFunction = model.get('performsNonLearnerFunction');
      assert.ok(performsNonLearnerFunction);
    });
  });

  test('performsNonLearnerFunction - directedSchools', async function(assert){
    run(() => {
      assert.expect(1);
      let store = this.owner.lookup('service:store');
      let model = store.createRecord('user');
      store.createRecord('school', { directors: [model] });
      let performsNonLearnerFunction = model.get('performsNonLearnerFunction');
      assert.ok(performsNonLearnerFunction);
    });
  });

  test('isLearner - cohorts', async function(assert){
    run(() => {
      assert.expect(1);
      let store = this.owner.lookup('service:store');
      let model = store.createRecord('user');
      store.createRecord('cohort', { users: [model] });
      let isLearner = model.get('isLearner');
      assert.ok(isLearner);
    });
  });

  test('isLearner - offerings', async function(assert){
    run(() => {
      assert.expect(1);
      let store = this.owner.lookup('service:store');
      let model = store.createRecord('user');
      store.createRecord('offering', { learners: [model] });
      let isLearner = model.get('isLearner');
      assert.ok(isLearner);
    });
  });

  test('isLearner - learnerIlmSessions', async function(assert){
    run(() => {
      assert.expect(1);
      let store = this.owner.lookup('service:store');
      let model = store.createRecord('user');
      store.createRecord('ilm-session', { learners: [model] });
      let isLearner = model.get('isLearner');
      assert.ok(isLearner);
    });
  });

  test('gets all instructor ilm courses', async function(assert) {
    let model = run(() => this.owner.lookup('service:store').createRecord('user'));
    let store = this.owner.lookup('service:store');
    run( async () => {
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
      const allRelatedCourses = await model.get('allRelatedCourses');
      assert.equal(allRelatedCourses.length, courses.length);
      courses.forEach(course => {
        assert.ok(allRelatedCourses.includes(course));
      });
    });
  });

  test('find lowest group at top of tree', async function(assert) {
    assert.expect(2);
    const model = run(() => this.owner.lookup('service:store').createRecord('user'));
    const store = this.owner.lookup('service:store');
    run( async ()=>{
      const learnerGroup = store.createRecord('learnerGroup', {id: 1, users: [ model ]});
      const learnerGroup2 = store.createRecord('learnerGroup', {id: 2, parent: learnerGroup});
      const learnerGroup3 = store.createRecord('learnerGroup', {id: 3, parent: learnerGroup2});
      const tree = [ learnerGroup, learnerGroup2, learnerGroup3 ];
      model.get('learnerGroups').pushObject(learnerGroup);

      const lowestGroup = await model.getLowestMemberGroupInALearnerGroupTree(tree);

      assert.ok(lowestGroup);
      assert.equal(lowestGroup.get('id'), learnerGroup.get('id'));
    });
  });

  test('find lowest group in middle of tree', async function(assert) {
    assert.expect(2);
    const model = run(() => this.owner.lookup('service:store').createRecord('user'));
    const store = this.owner.lookup('service:store');
    run( async () => {
      const learnerGroup = store.createRecord('learnerGroup', {id: 1, users: [ model ]});
      const learnerGroup2 = store.createRecord('learnerGroup', {id: 2, parent: learnerGroup, users: [ model ]});
      const learnerGroup3 = store.createRecord('learnerGroup', {id: 3, parent: learnerGroup2});
      const tree = [ learnerGroup, learnerGroup2, learnerGroup3 ];
      model.get('learnerGroups').pushObjects([ learnerGroup, learnerGroup2 ]);

      const lowestGroup = await model.getLowestMemberGroupInALearnerGroupTree(tree);

      assert.ok(lowestGroup);
      assert.equal(lowestGroup.get('id'), learnerGroup2.get('id'));
    });
  });

  test('find lowest group in bottom of tree', async function(assert) {
    assert.expect(2);
    const model = run(() => this.owner.lookup('service:store').createRecord('user'));
    const store = this.owner.lookup('service:store');
    run( async () => {
      const learnerGroup = store.createRecord('learnerGroup', {id: 1, users: [ model ]});
      const learnerGroup2 = store.createRecord('learnerGroup', {id: 2, parent: learnerGroup, users: [ model ]});
      const learnerGroup3 = store.createRecord('learnerGroup', {id: 3, parent: learnerGroup2, users: [ model ]});
      const tree = [ learnerGroup, learnerGroup2, learnerGroup3 ];
      model.get('learnerGroups').pushObjects([ learnerGroup, learnerGroup2, learnerGroup3 ]);

      const lowestGroup = await model.getLowestMemberGroupInALearnerGroupTree(tree);

      assert.ok(lowestGroup);
      assert.equal(lowestGroup.get('id'), learnerGroup3.get('id'));
    });
  });

  test('return null when there is no group in the tree', async function(assert) {
    assert.expect(1);
    const model = run(() => this.owner.lookup('service:store').createRecord('user'));
    const store = this.owner.lookup('service:store');
    run( async () => {
      const learnerGroup = store.createRecord('learnerGroup', {id: 1});
      const learnerGroup2 = store.createRecord('learnerGroup', {id: 2, parent: learnerGroup});
      const learnerGroup3 = store.createRecord('learnerGroup', {id: 3, parent: learnerGroup2});
      const tree = [ learnerGroup, learnerGroup2, learnerGroup3 ];

      const lowestGroup = await model.getLowestMemberGroupInALearnerGroupTree(tree);
      assert.ok(lowestGroup === null);
    });
  });

  test('gets secondary cohorts (all cohorts not the primary cohort)', async function(assert) {
    assert.expect(4);
    const model = run(() => this.owner.lookup('service:store').createRecord('user'));
    const store = this.owner.lookup('service:store');
    run( async () => {
      const primaryCohort = store.createRecord('cohort', {
        users: [model]
      });
      const secondaryCohort = store.createRecord('cohort', {
        users: [model]
      });
      const anotherCohort = store.createRecord('cohort', {
        users: [model]
      });
      model.set('primaryCohort', primaryCohort);
      model.get('cohorts').pushObjects([ primaryCohort, secondaryCohort, anotherCohort ]);

      const cohorts = await model.get('secondaryCohorts');
      assert.equal(cohorts.length, 2);
      assert.ok(cohorts.includes(secondaryCohort));
      assert.ok(cohorts.includes(anotherCohort));
      assert.notOk(cohorts.includes(primaryCohort));
    });
  });

  test('allInstructedCourses gets ALL instructed courses', async function(assert) {
    const model = run(() => this.owner.lookup('service:store').createRecord('user'));
    const store = this.owner.lookup('service:store');
    run(async () => {
      const course1 = store.createRecord('course');
      const session1 = store.createRecord('session', { course: course1 });
      store.createRecord('offering', {
        session: session1,
        instructors: [model]
      });
      const course2 = store.createRecord('course');
      const session2 = store.createRecord('session', { course: course2 });
      const instructorGroup1 = store.createRecord('instructor-group', { users: [model]});
      store.createRecord('offering', {
        session: session2,
        instructorGroups: [instructorGroup1]
      });

      const course3 = store.createRecord('course');
      const session3 = store.createRecord('session', { course: course3 });
      store.createRecord('ilmSession', {
        session: session3,
        instructors: [model]
      });

      const instructorGroup2 = store.createRecord('instructor-group', { users: [model] });
      const course4 = store.createRecord('course');
      const session4 = store.createRecord('session', { course: course4 });
      store.createRecord('ilmSession', {
        session: session4,
        instructorGroups: [instructorGroup2]
      });

      const course = [course1, course2, course3, course4];
      const allInstructedCourses = await model.get('allInstructedCourses');
      assert.equal(allInstructedCourses.length, course.length);
      course.forEach(session => {
        assert.ok(allInstructedCourses.includes(session));
      });
    });
  });

  test('allInstructedSessions gets ALL instructed sessions', async function(assert) {
    const model = run(() => this.owner.lookup('service:store').createRecord('user'));
    const store = this.owner.lookup('service:store');
    run(async () => {
      const session1 = store.createRecord('session');
      store.createRecord('offering', {
        session: session1,
        instructors: [model]
      });
      const session2 = store.createRecord('session');
      const instructorGroup1 = store.createRecord('instructor-group', { users: [model]});
      store.createRecord('offering', {
        session: session2,
        instructorGroups: [instructorGroup1]
      });

      const session3 = store.createRecord('session');
      store.createRecord('ilmSession', {
        session: session3,
        instructors: [model]
      });

      const instructorGroup2 = store.createRecord('instructor-group', { users: [model] });
      const session4 = store.createRecord('session');
      store.createRecord('ilmSession', {
        session: session4,
        instructorGroups: [instructorGroup2]
      });

      const sessions = [session1, session2, session3, session4];
      const allInstructedSessions = await model.get('allInstructedSessions');
      assert.equal(allInstructedSessions.length, sessions.length);
      sessions.forEach(session => {
        assert.ok(allInstructedSessions.includes(session));
      });
    });
  });
});
