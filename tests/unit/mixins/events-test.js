import EmberObject from '@ember/object';
import RSVP from 'rsvp';
import { run } from '@ember/runloop';
import EventsMixin from 'ilios-common/mixins/events';
import { module, test } from 'qunit';

const { resolve } = RSVP;

let course, session, intermediary, storeMock;

module('Unit | Mixin | events', function(hooks) {
  hooks.beforeEach(function() {
    this.subject = function() {
      const EventsMixinObject = EmberObject.extend(EventsMixin);
      return EventsMixinObject.create({
        store: storeMock
      });
    };
  });

  hooks.beforeEach(function() {
    const term1 =  EmberObject.create({
      id: 1,
    });
    const term2 = EmberObject.create({
      id: 2,
    });

    const term3 = EmberObject.create({
      id: 3,
    });

    const sessionType = EmberObject.create({
      id: 10,
    });

    const cohort1 = EmberObject.create({
      id: 10
    });
    const cohort2 = EmberObject.create({
      id: 20
    });
    const cohort3 = EmberObject.create({
      id: 30
    });

    course = EmberObject.create({
      id: 22,
      level: 4,
      terms: resolve([term1, term2]),
      cohorts: resolve([cohort1, cohort2, cohort3])
    });

    session = EmberObject.create({
      terms: resolve([term1, term3]),
      course: resolve(course),
      sessionType: resolve(sessionType)
    });

    intermediary = EmberObject.create({
      session: resolve(session)
    });
    storeMock = EmberObject.create({
      findRecord(what){
        if ([ 'offering', 'ilmSession' ].includes(what)) {
          return resolve(intermediary);
        }
        throw 'Unsupported model type requested.';
      },
    });
  });

  test('getSessionForEvent from offering-event', async function(assert) {
    assert.expect(1);
    const subject = this.subject();
    const event = { offering: 1 };
    run( async () => {
      const sessionForEvent = await subject.getSessionForEvent(event);
      assert.equal(sessionForEvent, session);
    });
  });

  test('getSessionForEvent from ILM-event', async function(assert) {
    assert.expect(1);
    const subject = this.subject();
    const event = { ilmSession: 1 };
    run( async () => {
      const sessionForEvent = await subject.getSessionForEvent(event);
      assert.equal(sessionForEvent, session);
    });
  });

  test('getCourseForEvent', async function(assert) {
    assert.expect(1);
    const subject = this.subject();
    const event = { offering: 1 };
    run( async () => {
      const courseForEvent = await subject.getCourseForEvent(event);
      assert.equal(courseForEvent, course);
    });
  });

  test('getTermIdsForEvent', async function(assert) {
    assert.expect(4);
    const subject = this.subject();
    const event = { offering: 1 };
    run( async () => {
      const termIds = await subject.getTermIdsForEvent(event);
      assert.equal(termIds.length, 3);
      assert.ok(termIds.includes(1));
      assert.ok(termIds.includes(2));
      assert.ok(termIds.includes(3));
    });
  });

  test('getSessionTypeIdForEvent', async function(assert) {
    assert.expect(1);
    const subject = this.subject();
    const event = { offering: 1 };
    run( async () => {
      const sessionTypeId = await subject.getSessionTypeIdForEvent(event);
      assert.equal(sessionTypeId, 10);
    });
  });

  test('getCourseLevelForEvent', async function(assert) {
    assert.expect(1);
    const subject = this.subject();
    const event = { offering: 1 };
    run( async () => {
      const courseLevel = await subject.getCourseLevelForEvent(event);
      assert.equal(courseLevel, 4);
    });
  });

  test('getCourseIdForEvent', async function(assert) {
    assert.expect(1);
    const subject = this.subject();
    const event = { offering: 1 };
    run( async () => {
      const courseId = await subject.getCourseIdForEvent(event);
      assert.equal(courseId, 22);
    });
  });

  test('getCohortIdsForEvent', async function(assert) {
    assert.expect(4);
    const subject = this.subject();
    const event = { offering: 1 };
    run( async () => {
      const cohortIds = await subject.getCohortIdsForEvent(event);
      assert.equal(cohortIds.length, 3);
      assert.ok(cohortIds.includes(10));
      assert.ok(cohortIds.includes(20));
      assert.ok(cohortIds.includes(30));
    });
  });
});
