import { module, skip, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMSW } from 'ilios-common/msw';
import { component } from 'frontend/tests/pages/components/reports/curriculum/course-competencies';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { graphQL } from 'frontend/tests/helpers/curriculum-report';
import CourseCompetencies from 'frontend/components/reports/curriculum/course-competencies';
import { array } from '@ember/helper';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | reports/curriculum/course-competencies', function (hooks) {
  setupRenderingTest(hooks);
  setupMSW(hooks);

  hooks.beforeEach(async function () {
    const school = await this.server.create('school');
    const program = await this.server.create('program', { school });
    const programYear = await this.server.create('programYear', {
      program,
    });
    const cohort = await this.server.create('cohort', {
      programYear,
    });
    const competency = await this.server.create('competency', {
      school,
      programYears: [programYear],
    });

    const programYearObjective = await this.server.create('programYearObjective', {
      competency,
      programYear,
    });

    const course = await this.server.create('course', {
      year: 2013,
      school,
      cohorts: [cohort],
    });
    await this.server.create('courseObjective', {
      course,
      programYearObjectives: [programYearObjective],
    });
    await this.server.create('courseObjective', {
      course,
    });

    this.getCourseCompetencyResponse = (assert) => {
      assert.step('API called');
      return () => {
        //use all the courses, getting the id filter from graphQL is a bit tricky
        const courses = this.server.db.course.all().map((c) => graphQL.buildCourse(c));
        return { data: { courses } };
      };
    };
  });

  test('it renders and is accessible', async function (assert) {
    const courseModels = await this.owner.lookup('service:store').findAll('course');
    this.set('courses', courseModels);

    this.server.post('/api/graphql', this.getCourseCompetencyResponse(assert));

    await render(
      <template>
        <CourseCompetencies
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
      'Run Course Competencies report for one course. Each competency is listed along with course and program year objectives.',
      'summary text is correct',
    );

    assert.strictEqual(component.results.length, 1, 'report results count is correct');
    assert.strictEqual(
      component.results.objectAt(0).courseTitle,
      'course 0',
      'result course title is correct',
    );
    assert.strictEqual(
      component.results.objectAt(0).courseYear,
      '2013',
      'result course year is correct',
    );
    assert.strictEqual(
      component.results.objectAt(0).courseObjectivesCount,
      '2',
      'result course objectives count is correct',
    );
    assert.strictEqual(
      component.results.objectAt(0).programYearObjectivesCount,
      '1',
      'result program year objectives count is correct',
    );
    assert.strictEqual(
      component.results.objectAt(0).competenciesCount,
      '1',
      'Competencies count is correct',
    );

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
    assert.verifySteps(['API called']);
  });

  skip('download report', async function (assert) {
    const courseModels = await this.owner.lookup('service:store').findAll('course');
    this.set('courses', courseModels);

    await render(
      <template>
        <CourseCompetencies @courses={{this.courses}} @options={{this.options}} @close={{(noop)}} />
      </template>,
    );

    assert.strictEqual(
      component.header.runSummaryText,
      'Run Course Competencies report for one course. Each competency is listed along with course and program year objectives.',
      'report header text correct',
    );

    await component.header.download.click();
    assert.ok(true, 'downloaded report');
  });
});
