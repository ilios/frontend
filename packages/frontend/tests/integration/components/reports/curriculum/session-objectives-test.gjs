import { module, test, skip } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import { component } from 'frontend/tests/pages/components/reports/curriculum/session-objectives';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { graphQL } from 'frontend/tests/helpers/curriculum-report';
import SessionObjectives from 'frontend/components/reports/curriculum/session-objectives';
import { array } from '@ember/helper';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | reports/curriculum/session-objectives', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    this.school = this.server.create('school');
    const course = this.server.create('course', { school: this.school });
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
      const rawCourses = courseIds.map((id) => graphQL.fetchCourse(schema.db, id));
      const courses = rawCourses.map((course) => {
        course.sessions.forEach((session) => {
          session.sessionObjectives = schema.db.sessionObjectives
            .where({ sessionId: session.id })
            .map(({ id, title }) => ({ id, title }));
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
      <template>
        <SessionObjectives
          @courses={{this.courses}}
          @selectedSchoolIds={{array "1"}}
          @countSelectedSchools={{1}}
          @hasMultipleSchools={{false}}
          @close={{(noop)}}
        />
      </template>,
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
      <template><SessionObjectives @courses={{this.courses}} @close={{(noop)}} /></template>,
    );

    assert.strictEqual(
      component.header.runSummaryText,
      'Run Session Objectives report for one course. Each session objective is listed along with instructors and course data.',
    );

    await component.header.download.click();
    assert.ok(true, 'downloaded report');
  });
});
