import { module, test, skip } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMSW } from 'ilios-common/msw';
import { component } from 'frontend/tests/pages/components/reports/curriculum/session-objectives';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { graphQL } from 'frontend/tests/helpers/curriculum-report';
import SessionObjectives from 'frontend/components/reports/curriculum/session-objectives';
import { array } from '@ember/helper';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | reports/curriculum/session-objectives', function (hooks) {
  setupRenderingTest(hooks);
  setupMSW(hooks);

  hooks.beforeEach(async function () {
    this.school = await this.server.create('school');
    const course = await this.server.create('course', { school: this.school });
    const sessionType = await this.server.create('sessionType');
    const session = await this.server.create('session', { course, sessionType });
    await this.server.create('sessionObjective', { session });
    const offering = await this.server.create('offering', { session });
    const offeringInstructorGroup = await this.server.create('instructorGroup', {
      offerings: [offering],
    });
    await this.server.create('user', { instructorGroups: [offeringInstructorGroup] });
    await this.server.create('user', { instructedOfferings: [offering] });

    const ilmSession = await this.server.create('ilmSession', { session });
    const ilmSessionInstructorGroup = await this.server.create('instructorGroup', {
      ilmSessions: [ilmSession],
    });
    await this.server.create('user', { instructorGroups: [ilmSessionInstructorGroup] });
    await this.server.create('user', { instructorIlmSessions: [ilmSession] });

    this.getSessionObjectiveResponse = (assert) => {
      return () => {
        assert.step('API called');
        //use all the courses, getting the id filter from graphQL is a bit tricky
        const rawCourses = this.server.db.course.all().map((c) => graphQL.buildCourse(c));
        const courses = rawCourses.map((course) => {
          course.sessions.forEach((session) => {
            session.sessionObjectives = this.server.db.sessionObjective
              .findMany((q) => q.where({ session: (s) => s.id === session.id }))
              .map(({ id, title }) => ({ id, title }));
          });

          return course;
        });
        return { data: { courses } };
      };
    };
  });

  test('it renders and is accessible', async function (assert) {
    const courseModels = await this.owner.lookup('service:store').findAll('course');
    this.set('courses', courseModels);

    this.server.post('/api/graphql', this.getSessionObjectiveResponse(assert));

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
      'report summary text correct',
    );

    assert.strictEqual(component.results.length, 1, 'result count correct');
    assert.strictEqual(
      component.results.objectAt(0).courseTitle,
      'course 0',
      'result course title correct',
    );
    assert.strictEqual(
      component.results.objectAt(0).sessionCount,
      '1',
      'result session count correct',
    );
    assert.strictEqual(
      component.results.objectAt(0).instructorCount,
      '4',
      'result instructor count correct',
    );
    assert.strictEqual(
      component.results.objectAt(0).objectiveCount,
      '1',
      'result objective count correct',
    );

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
    assert.verifySteps(['API called']);
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
