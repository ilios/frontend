import { module, test, skip } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import { component } from 'frontend/tests/pages/components/reports/curriculum/learner-groups';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { graphQL } from 'frontend/tests/helpers/curriculum-report';

module('Integration | Component | reports/curriculum/learner-groups', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    const course = this.server.create('course');
    const sessionType = this.server.create('session-type');
    const session = this.server.create('session', { course, sessionType });
    const learnerGroups = this.server.createList('learner-group', 5);
    const offering = this.server.create('offering', {
      session,
      learnerGroups: [learnerGroups[0], learnerGroups[3]],
    });
    const offeringInstructorGroup = this.server.create('instructor-group', {
      offerings: [offering],
    });
    this.server.create('user', { instructorGroups: [offeringInstructorGroup] });
    this.server.create('user', { instructedOfferings: [offering] });

    const ilmSession = this.server.create('ilm-session', {
      session,
      learnerGroups: [learnerGroups[1], learnerGroups[2]],
    });
    const ilmSessionInstructorGroup = this.server.create('instructor-group', {
      ilmSessions: [ilmSession],
    });
    this.server.create('user', { instructorGroups: [ilmSessionInstructorGroup] });
    this.server.create('user', { instructorIlmSessions: [ilmSession] });
    this.server.post('api/graphql', ({ db }) => {
      //use all the courses, getting the id filter from graphQL is a bit tricky
      const courseIds = db.courses.map((c) => c.id);
      const rawCourses = courseIds.map((id) => graphQL.fetchCourse(db, id));
      const courses = rawCourses.map((course) => {
        course.sessions.forEach((session) => {
          session.offerings.forEach((offering) => {
            offering.learnerGroups = graphQL.fetchLearnerGroups(
              db,
              db.offerings.find(offering.id).learnerGroupIds,
            );
          });
          if (session.ilmSession) {
            const ilm = db.ilmSessions.find(session.ilmSession.id);
            session.ilmSession.learnerGroups = graphQL.fetchLearnerGroups(db, ilm.learnerGroupIds);
          }
        });

        return course;
      });

      return { data: { courses } };
    });
  });

  test('it renders and is accessible', async function (assert) {
    const courseModels = await this.owner.lookup('service:store').findAll('course');
    this.set('courses', courseModels);

    await render(
      hbs`<Reports::Curriculum::LearnerGroups @courses={{this.courses}} @close={{(noop)}} />`,
    );

    assert.strictEqual(
      component.header.runSummaryText,
      'Run Learner Groups report for one course. Each attached learner group is listed along with instructors and course data.',
    );

    assert.strictEqual(component.results.length, 1);
    assert.strictEqual(component.results.objectAt(0).courseTitle, 'course 0');
    assert.strictEqual(component.results.objectAt(0).sessionCount, '1');
    assert.strictEqual(component.results.objectAt(0).instructorCount, '4');
    assert.strictEqual(component.results.objectAt(0).learnerGroupCount, '4');

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  skip('download report', async function (assert) {
    const courseModels = await this.owner.lookup('service:store').findAll('course');
    this.set('courses', courseModels);

    await render(
      hbs`<Reports::Curriculum::LearnerGroups @courses={{this.courses}} @close={{(noop)}} />`,
    );

    assert.strictEqual(
      component.header.runSummaryText,
      'Run Session Objectives report for one course. Each session objective is listed along with instructors and course data.',
    );

    await component.header.download.click();
    assert.ok(true, 'downloaded report');
  });
});
