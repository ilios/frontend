import { module, test, skip } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import { component } from 'frontend/tests/pages/components/reports/curriculum/session-objectives';
import a11yAudit from 'ember-a11y-testing/test-support/audit';

module('Integration | Component | reports/curriculum/session-objectives', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  const fetchCourse = (db, courseId) => {
    const { id, title, year } = db.courses.find(courseId);
    const sessions = db.sessions.where({ courseId }).map((session) => fetchSession(db, session.id));
    return { id, title, year, sessions };
  };

  const fetchSession = (db, sessionId) => {
    const { id, title, sessionTypeId } = db.sessions.find(sessionId);
    const { title: sessionTypeTitle } = db.sessionTypes.find(sessionTypeId);
    const sessionObjectives = db.sessionObjectives
      .where({ sessionId })
      .map(({ id, title }) => ({ id, title }));
    const offerings = db.offerings
      .where({ sessionId })
      .map((offering) => fetchOffering(db, offering));
    const ilmSession = fetchIlmSession(db, db.ilmSessions.findBy({ sessionId }));
    return {
      id,
      title,
      sessionType: { title: sessionTypeTitle },
      sessionObjectives,
      offerings,
      ilmSession,
    };
  };

  const fetchIlmSession = (db, ilmSession) => {
    if (!ilmSession) {
      return null;
    }
    const { id, dueDate, hours, instructorIds, instructorGroupIds } = ilmSession;
    const { instructors, instructorGroups } = fetchInstructors(
      db,
      instructorIds,
      instructorGroupIds,
    );
    return { id, dueDate, hours, instructors, instructorGroups };
  };

  const fetchOffering = (db, offering) => {
    const { id, startDate, endDate, instructorIds, instructorGroupIds } = offering;
    const { instructors, instructorGroups } = fetchInstructors(
      db,
      instructorIds,
      instructorGroupIds,
    );
    return { id, startDate, endDate, instructors, instructorGroups };
  };

  const fetchInstructors = (db, instructorIds, instructorGroupIds) => {
    const instructors = db.users.find(instructorIds);
    const instructorGroups = db.instructorGroups.find(instructorGroupIds);
    const instructorData = instructors.map((instructor) => fetchUser(db, instructor.id));
    const instructorGroupData = instructorGroups.map((ig) => {
      const users = ig.userIds.map((id) => fetchUser(db, id));
      return { id: ig.id, users };
    });
    return { instructors: instructorData, instructorGroups: instructorGroupData };
  };

  const fetchUser = (db, userId) => {
    const { id, firstName, lastName, middleName, displayName } = db.users.find(userId);
    return { id, firstName, lastName, middleName, displayName };
  };

  hooks.beforeEach(function () {
    const course = this.server.create('course');
    const sessionType = this.server.create('sessionType');
    const session = this.server.create('session', { course, sessionType });
    this.server.create('sessionObjective', { session });
    const offering = this.server.create('offering', { session });
    const offeringInstructorGroup = this.server.create('instructorGroup', {
      offerings: [offering],
    });
    this.server.create('user', { instructorGroups: [offeringInstructorGroup] });
    this.server.create('user', { instructedOfferings: [offering] });

    const ilmSession = this.server.create('ilmSession', { session });
    const ilmSessionInstructorGroup = this.server.create('instructorGroup', {
      ilmSessions: [ilmSession],
    });
    this.server.create('user', { instructorGroups: [ilmSessionInstructorGroup] });
    this.server.create('user', { instructorIlmSessions: [ilmSession] });
    this.server.post('api/graphql', (schema) => {
      //use all the courses, getting the id filter from graphQL is a bit tricky
      const courseIds = schema.db.courses.map((c) => c.id);
      const courses = courseIds.map((id) => fetchCourse(schema.db, id));
      return { data: { courses } };
    });
  });

  test('it renders and is accessible', async function (assert) {
    const courseModels = await this.owner.lookup('service:store').findAll('course');
    this.set('courses', courseModels);

    await render(
      hbs`<Reports::Curriculum::SessionObjectives @courses={{this.courses}} @close={{(noop)}} />`,
    );

    assert.strictEqual(
      component.header.runSummaryText,
      'Run Session Objectives report for one course. Each session objective is listed along with instructors and course data.',
    );

    assert.strictEqual(component.results.length, 1);
    assert.strictEqual(component.results.objectAt(0).courseTitle, 'course 0');
    assert.strictEqual(component.results.objectAt(0).sessionCount, '1');
    assert.strictEqual(component.results.objectAt(0).instructorCount, '4');
    assert.strictEqual(component.results.objectAt(0).objectiveCount, '1');

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  skip('download report', async function (assert) {
    const courseModels = await this.owner.lookup('service:store').findAll('course');
    this.set('courses', courseModels);

    await render(
      hbs`<Reports::Curriculum::SessionObjectives @courses={{this.courses}} @close={{(noop)}} />`,
    );

    assert.strictEqual(
      component.header.runSummaryText,
      'Run Session Objectives report for one course. Each session objective is listed along with instructors and course data.',
    );

    await component.header.download.click();
    assert.ok(true, 'downloaded report');
  });
});
