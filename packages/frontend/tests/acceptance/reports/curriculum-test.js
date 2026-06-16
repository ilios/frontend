import { currentRouteName, currentURL } from '@ember/test-helpers';
import { module, test } from 'qunit';
import page from 'frontend/tests/pages/reports';
import { setupApplicationTest, takeScreenshot } from 'frontend/tests/helpers';
import { setupAuthentication } from 'ilios-common';
import currentAcademicYear from 'ilios-common/utils/current-academic-year';
import { graphQL } from 'frontend/tests/helpers/curriculum-report';

module('Acceptance | Reports - Curriculum Reports', function (hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(async function () {
    this.school = await this.server.create('school');
    await setupAuthentication({ school: this.school, directedSchools: [this.school] });
    await this.server.post('/api/graphql', async ({ request }) => {
      const { query } = await request.json();
      if (query.includes('courses(academicYears:')) {
        const courses = (await this.server.db.course.all()).map(
          ({ id, title, year, externalId }) => {
            return { id: id.toString(), title, year, externalId };
          },
        );
        return {
          data: {
            courses,
          },
        };
      }
    });

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

    this.getLearnerGroupsResponse = (assert) => {
      return () => {
        assert.step('API called');
        //use all the courses, getting the id filter from graphQL is a bit tricky
        const rawCourses = this.server.db.course.all().map((c) => graphQL.buildCourse(c));
        const allLearnerGroups = this.server.db.learnerGroup.all();
        const courses = rawCourses.map((course) => {
          course.sessions.forEach((session) => {
            session.offerings = session.offerings.map((offeringData) => {
              offeringData.learnerGroups = allLearnerGroups
                .filter((lg) => lg.offerings.map(({ id }) => id).includes(Number(offeringData.id)))
                .map(({ id, title }) => ({ id, title }));

              return offeringData;
            });

            if (session.ilmSession) {
              session.ilmSession.learnerGroups = allLearnerGroups
                .filter((lg) =>
                  lg.ilmSessions.map(({ id }) => id).includes(Number(session.ilmSession.id)),
                )
                .map(({ id, title }) => ({ id, title }));
            }
          });
          return course;
        });
        return { data: { courses } };
      };
    };

    this.getCourseCompetenciesResponse = (assert) => {
      return () => {
        assert.step('API called');
        //use all the courses, getting the id filter from graphQL is a bit tricky
        const courses = this.server.db.course.all().map((c) => graphQL.buildCourse(c));
        return { data: { courses } };
      };
    };
  });

  test('visiting reports with one school', async function (assert) {
    await this.server.createList('course', 2, {
      school: this.school,
      year: currentAcademicYear() - 1,
    });
    await this.server.createList('course', 2, {
      school: this.school,
      year: currentAcademicYear(),
    });
    await this.server.createList('course', 2, {
      school: this.school,
      year: currentAcademicYear() + 1,
    });
    await page.visitCurriculumReports();
    assert.strictEqual(currentRouteName(), 'reports.curriculum');
    assert.ok(page.switcher.curriculum.isActive);
    assert.notOk(page.switcher.subject.isActive);
    assert.ok(page.curriculum.isPresent);
    assert.notOk(page.curriculum.chooseCourse.hasMultipleSchools);
    assert.strictEqual(page.curriculum.chooseCourse.years.length, 3);
    assert.notOk(page.curriculum.chooseCourse.years[0].isExpanded);
    assert.ok(page.curriculum.chooseCourse.years[1].isExpanded);
    assert.notOk(page.curriculum.chooseCourse.years[2].isExpanded);

    await takeScreenshot(assert);
  });

  test('visiting reports with multiple schools', async function (assert) {
    const school = await this.server.create('school');
    await this.server.createList('course', 2, {
      school: this.school,
      year: currentAcademicYear() - 1,
    });
    await this.server.createList('course', 2, {
      school,
      year: currentAcademicYear(),
    });
    await this.server.createList('course', 2, {
      school: this.school,
      year: currentAcademicYear() + 1,
    });
    await page.visitCurriculumReports();
    assert.strictEqual(currentRouteName(), 'reports.curriculum');
    assert.ok(page.switcher.curriculum.isActive);
    assert.notOk(page.switcher.subject.isActive);
    assert.ok(page.curriculum.isPresent);
    assert.ok(page.curriculum.chooseCourse.hasMultipleSchools);
    assert.strictEqual(page.curriculum.chooseCourse.schoolSelector.options.length, 2);
    assert.strictEqual(
      page.curriculum.chooseCourse.schoolSelector.value,
      this.school.id.toString(),
    );
    assert.strictEqual(page.curriculum.chooseCourse.years.length, 2);
    assert.notOk(page.curriculum.chooseCourse.years[0].isExpanded);
    assert.notOk(page.curriculum.chooseCourse.years[1].isExpanded);
    await takeScreenshot(assert, 'default school');

    await page.curriculum.chooseCourse.schoolSelector.set(school.id);
    assert.strictEqual(page.curriculum.chooseCourse.schoolSelector.value, school.id.toString());
    assert.strictEqual(page.curriculum.chooseCourse.years.length, 1);
    assert.ok(page.curriculum.chooseCourse.years[0].isExpanded);
    await takeScreenshot(assert, 'school with current year');
  });

  test('run session objectives report, single school', async function (assert) {
    const course = await this.server.create('course', {
      school: this.school,
      year: currentAcademicYear(),
    });
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

    //handle both requests so we have two
    this.server.post('/api/graphql', this.getSessionObjectiveResponse(assert));
    this.server.post('/api/graphql', this.getSessionObjectiveResponse(assert));
    const so = page.curriculum.sessionObjectivesResult;

    await page.visitCurriculumReports();
    await page.curriculum.chooseCourse.years[0].toggleAll.click();
    await page.curriculum.header.reportSelector.set('sessionObjectives');
    assert.ok(
      so.header.runSummaryText.includes(
        'Each session objective is listed along with instructors and course data.',
      ),
      'Session objective summary text is correct',
    );
    await takeScreenshot(assert, 'selected courses');

    await page.curriculum.header.runReport.click();
    await takeScreenshot(assert, 'session objectives report results');
    assert.strictEqual(so.results.length, 1, 'Test has 1 report result');
    assert.strictEqual(so.results.objectAt(0).courseTitle, 'course 0', 'Test title is correct');
    assert.strictEqual(so.results.objectAt(0).sessionCount, '1', 'Course session count is correct');
    assert.strictEqual(
      so.results.objectAt(0).instructorCount,
      '4',
      'Course instructor count is correct',
    );
    assert.strictEqual(
      so.results.objectAt(0).objectiveCount,
      '1',
      'Course objective count is correct',
    );

    assert.strictEqual(
      currentURL(),
      '/reports/curriculum?courses=1&report=sessionObjectives&run=true',
      'current URL is correct',
    );
    assert.verifySteps(['API called', 'API called']);
  });

  test('run session objectives report, multiple schools', async function (assert) {
    const course = await this.server.create('course', {
      school: this.school,
      year: currentAcademicYear(),
    });
    const school = await this.server.create('school');
    await this.server.createList('course', 2, {
      school: this.school,
      year: currentAcademicYear() - 1,
    });
    await this.server.createList('course', 2, {
      school: school,
      year: currentAcademicYear(),
    });
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

    //handle both requests so we have two
    this.server.post('/api/graphql', this.getSessionObjectiveResponse(assert));
    this.server.post('/api/graphql', this.getSessionObjectiveResponse(assert));
    const so = page.curriculum.sessionObjectivesResult;

    await page.visitCurriculumReports();

    await page.curriculum.chooseCourse.years[0].courses[0].pick();
    await page.curriculum.chooseCourse.schoolSelector.set(school.id);
    await page.curriculum.chooseCourse.years[0].courses[0].pick();
    await page.curriculum.header.reportSelector.set('sessionObjectives');
    assert.ok(
      so.header.runSummaryText.includes(
        'Each session objective is listed along with instructors and course data.',
      ),
      'Session objective summary text is correct',
    );
    await takeScreenshot(assert, 'selected courses');

    await page.curriculum.header.runReport.click();
    await takeScreenshot(assert, 'session objectives report results');

    assert.strictEqual(so.resultsMultiSchool.length, 5, 'There are 5 report results');
    assert.strictEqual(
      so.resultsMultiSchool.objectAt(0).schoolTitle,
      'school 0',
      'Result 1 school title is correct',
    );
    assert.strictEqual(
      so.resultsMultiSchool.objectAt(0).courseTitle,
      'course 0',
      'Result 1 course title is correct',
    );
    assert.strictEqual(
      so.resultsMultiSchool.objectAt(0).sessionCount,
      '1',
      'Result 1 session count is correct',
    );
    assert.strictEqual(
      so.resultsMultiSchool.objectAt(0).instructorCount,
      '4',
      'Result 1 instructor count is correct',
    );
    assert.strictEqual(
      so.resultsMultiSchool.objectAt(0).objectiveCount,
      '1',
      'Result 1 objective count is correct',
    );

    assert.strictEqual(
      so.resultsMultiSchool.objectAt(4).schoolTitle,
      'school 1',
      'Result 2 school title is correct',
    );
    assert.strictEqual(
      so.resultsMultiSchool.objectAt(4).courseTitle,
      'course 4',
      'Result 2 course title is correct',
    );
    assert.strictEqual(
      so.resultsMultiSchool.objectAt(4).sessionCount,
      '0',
      'Result 2 session count is correct',
    );
    assert.strictEqual(
      so.resultsMultiSchool.objectAt(4).instructorCount,
      '0',
      'Result 2 instructor count is correct',
    );
    assert.strictEqual(
      so.resultsMultiSchool.objectAt(4).objectiveCount,
      '0',
      'Result 2 objective count is correct',
    );
    assert.strictEqual(
      currentURL(),
      '/reports/curriculum?courses=1-4&report=sessionObjectives&run=true',
      'current URL is correct',
    );
    assert.verifySteps(['API called', 'API called']);
  });

  test('run learner groups report, single school', async function (assert) {
    const course = await this.server.create('course', {
      school: this.school,
      year: currentAcademicYear(),
    });
    const sessionType = await this.server.create('session-type');
    const session = await this.server.create('session', { course, sessionType });
    const learnerGroups = await this.server.createList('learner-group', 5);
    const offering = await this.server.create('offering', {
      session,
      learnerGroups: [learnerGroups[0], learnerGroups[3]],
    });
    const offeringInstructorGroup = await this.server.create('instructor-group', {
      offerings: [offering],
    });
    await this.server.create('user', { instructorGroups: [offeringInstructorGroup] });
    await this.server.create('user', { instructedOfferings: [offering] });

    const ilmSession = await this.server.create('ilm-session', {
      session,
      learnerGroups: [learnerGroups[1], learnerGroups[2]],
    });
    const ilmSessionInstructorGroup = await this.server.create('instructor-group', {
      ilmSessions: [ilmSession],
    });
    await this.server.create('user', { instructorGroups: [ilmSessionInstructorGroup] });
    await this.server.create('user', { instructorIlmSessions: [ilmSession] });
    this.server.post('/api/graphql', this.getLearnerGroupsResponse(assert));
    this.server.post('/api/graphql', this.getLearnerGroupsResponse(assert));
    const lg = page.curriculum.learnerGroupsResult;

    await page.visitCurriculumReports();
    await page.curriculum.chooseCourse.years[0].toggleAll.click();
    await page.curriculum.header.reportSelector.set('learnerGroups');
    assert.ok(
      lg.header.runSummaryText.includes(
        'Each attached learner group is listed along with instructors and course data.',
      ),
    );
    await takeScreenshot(assert, 'selected courses');

    await page.curriculum.header.runReport.click();
    await takeScreenshot(assert, 'learner group report results');
    assert.strictEqual(lg.results.length, 1, 'There is 1 report result');
    assert.strictEqual(
      lg.results.objectAt(0).courseTitle,
      'course 0',
      'Result 1 course title is correct',
    );
    assert.strictEqual(
      lg.results.objectAt(0).sessionCount,
      '1',
      'Result 1 session count is correct',
    );
    assert.strictEqual(
      lg.results.objectAt(0).instructorCount,
      '4',
      'Result 1 instructor count is correct',
    );
    assert.strictEqual(
      lg.results.objectAt(0).learnerGroupCount,
      '4',
      'Result 1 learner group count is correct',
    );

    assert.strictEqual(
      currentURL(),
      '/reports/curriculum?courses=1&report=learnerGroups&run=true',
      'current URL is correct',
    );
    assert.verifySteps(['API called', 'API called']);
  });

  test('run learner groups report, multiple schools', async function (assert) {
    const course = await this.server.create('course', {
      school: this.school,
      year: currentAcademicYear(),
    });
    const school = await this.server.create('school');
    await this.server.createList('course', 2, {
      school: this.school,
      year: currentAcademicYear() - 1,
    });
    await this.server.createList('course', 2, {
      school: school,
      year: currentAcademicYear(),
    });
    const sessionType = await this.server.create('session-type');
    const session = await this.server.create('session', { course, sessionType });
    const learnerGroups = await this.server.createList('learner-group', 5);
    const offering = await this.server.create('offering', {
      session,
      learnerGroups: [learnerGroups[0], learnerGroups[3]],
    });
    const offeringInstructorGroup = await this.server.create('instructor-group', {
      offerings: [offering],
    });
    await this.server.create('user', { instructorGroups: [offeringInstructorGroup] });
    await this.server.create('user', { instructedOfferings: [offering] });

    const ilmSession = await this.server.create('ilm-session', {
      session,
      learnerGroups: [learnerGroups[1], learnerGroups[2]],
    });
    const ilmSessionInstructorGroup = await this.server.create('instructor-group', {
      ilmSessions: [ilmSession],
    });
    await this.server.create('user', { instructorGroups: [ilmSessionInstructorGroup] });
    await this.server.create('user', { instructorIlmSessions: [ilmSession] });
    this.server.post('/api/graphql', this.getLearnerGroupsResponse(assert));
    this.server.post('/api/graphql', this.getLearnerGroupsResponse(assert));
    const lg = page.curriculum.learnerGroupsResult;

    await page.visitCurriculumReports();
    await page.curriculum.chooseCourse.years[0].courses[0].pick();
    await page.curriculum.chooseCourse.schoolSelector.set(school.id);
    await page.curriculum.chooseCourse.years[0].courses[0].pick();
    await page.curriculum.header.reportSelector.set('learnerGroups');
    assert.ok(
      lg.header.runSummaryText.includes(
        'Each attached learner group is listed along with instructors and course data.',
      ),
    );
    await takeScreenshot(assert, 'selected courses');

    await page.curriculum.header.runReport.click();
    await takeScreenshot(assert, 'learner group report results');

    assert.strictEqual(lg.resultsMultiSchool.length, 5, 'There are 5 report results');
    assert.strictEqual(
      lg.resultsMultiSchool.objectAt(0).schoolTitle,
      'school 0',
      'Result 1 school title is correct',
    );
    assert.strictEqual(
      lg.resultsMultiSchool.objectAt(0).courseTitle,
      'course 0',
      'Result 1 course title is correct',
    );
    assert.strictEqual(
      lg.resultsMultiSchool.objectAt(0).sessionCount,
      '1',
      'Result 1 session count is correct',
    );
    assert.strictEqual(
      lg.resultsMultiSchool.objectAt(0).instructorCount,
      '4',
      'Result 1 instructor count is correct',
    );
    assert.strictEqual(
      lg.resultsMultiSchool.objectAt(0).learnerGroupCount,
      '4',
      'Result 1 learner group count is correct',
    );

    assert.strictEqual(
      lg.resultsMultiSchool.objectAt(4).schoolTitle,
      'school 1',
      'Result 2 school title is correct',
    );
    assert.strictEqual(
      lg.resultsMultiSchool.objectAt(4).courseTitle,
      'course 4',
      'Result 2 course title is correct',
    );
    assert.strictEqual(
      lg.resultsMultiSchool.objectAt(4).sessionCount,
      '0',
      'Result 2 session count is correct',
    );
    assert.strictEqual(
      lg.resultsMultiSchool.objectAt(4).instructorCount,
      '0',
      'Result 2 instructor count is correct',
    );
    assert.strictEqual(
      lg.resultsMultiSchool.objectAt(4).learnerGroupCount,
      '0',
      'Result 2 learner group count is correct',
    );

    assert.strictEqual(
      currentURL(),
      '/reports/curriculum?courses=1-4&report=learnerGroups&run=true',
      'current URL is correct',
    );
    assert.verifySteps(['API called', 'API called']);
  });

  test('run course competencies report, single school', async function (assert) {
    const program = await this.server.create('program', { school: this.school });
    const programYear = await this.server.create('programYear', {
      program,
    });
    const cohort = await this.server.create('cohort', {
      programYear,
    });
    const competency1 = await this.server.create('competency', {
      school: this.school,
      programYears: [programYear],
    });
    const competency2 = await this.server.create('competency', {
      school: this.school,
      programYears: [programYear],
    });

    const programYearObjective1 = await this.server.create('programYearObjective', {
      competency: competency1,
      programYear,
    });
    const programYearObjective2 = await this.server.create('programYearObjective', {
      competency: competency1,
      programYear,
    });
    const programYearObjective3 = await this.server.create('programYearObjective', {
      competency: competency2,
      programYear,
    });
    const programYearObjective4 = await this.server.create('programYearObjective', {
      programYear,
    });

    const course1 = await this.server.create('course', {
      year: 2013,
      school: this.school,
      cohorts: [cohort],
    });
    const course2 = await this.server.create('course', {
      year: 2013,
      school: this.school,
      cohorts: [cohort],
    });
    await this.server.create('courseObjective', {
      course: course1,
      programYearObjectives: [programYearObjective1],
    });
    await this.server.create('courseObjective', {
      course: course1,
      programYearObjectives: [programYearObjective1, programYearObjective2],
    });
    await this.server.create('courseObjective', {
      course: course1,
      programYearObjectives: [programYearObjective3],
    });
    await this.server.create('courseObjective', {
      course: course1,
      programYearObjectives: [programYearObjective4],
    });
    await this.server.create('courseObjective', {
      course: course2,
    });

    //handle both requests so we have two
    this.server.post('/api/graphql', this.getCourseCompetenciesResponse(assert));
    this.server.post('/api/graphql', this.getCourseCompetenciesResponse(assert));
    const cc = page.curriculum.courseCompetenciesResult;

    await page.visitCurriculumReports();
    await page.curriculum.chooseCourse.years[0].toggleAll.click();

    await page.curriculum.header.reportSelector.set('courseCompetencies');
    assert.ok(
      cc.header.runSummaryText.includes(
        'Each competency is listed along with course and program year objectives.',
      ),
      'Course competency summary text is correct',
    );
    await takeScreenshot(assert, 'selected courses');

    await page.curriculum.header.runReport.click();
    await takeScreenshot(assert, 'course competencies report results');

    assert.strictEqual(cc.results.length, 2, 'Test has 2 report results');
    assert.strictEqual(cc.results.objectAt(0).courseTitle, 'course 0', 'Result 1 title is correct');
    assert.strictEqual(
      cc.results.objectAt(0).courseObjectivesCount,
      '4',
      'Result 1 course objectives count is correct',
    );
    assert.strictEqual(
      cc.results.objectAt(0).programYearObjectivesCount,
      '5',
      'Result 1 program year objectives count is correct',
    );
    assert.strictEqual(
      cc.results.objectAt(0).competenciesCount,
      '2',
      'Result 1 competencies count is correct',
    );

    assert.strictEqual(cc.results.objectAt(1).courseTitle, 'course 1', 'Result 2 title is correct');
    assert.strictEqual(
      cc.results.objectAt(1).courseObjectivesCount,
      '1',
      'Result 2 course objectives count is correct',
    );
    assert.strictEqual(
      cc.results.objectAt(1).programYearObjectivesCount,
      '0',
      'Result 2 program year objectives count is correct',
    );
    assert.strictEqual(
      cc.results.objectAt(1).competenciesCount,
      '0',
      'Result 2 competencies count is correct',
    );

    assert.strictEqual(
      currentURL(),
      '/reports/curriculum?courses=1-2&report=courseCompetencies&run=true',
      'current URL is correct',
    );
    assert.verifySteps(['API called', 'API called']);
  });

  test('run course competencies report, multiple schools', async function (assert) {
    const school = await this.server.create('school');
    const program = await this.server.create('program', { school: this.school });
    const programYear = await this.server.create('programYear', {
      program,
    });
    const cohort = await this.server.create('cohort', {
      programYear,
    });
    const competency = await this.server.create('competency', {
      school: this.school,
      programYears: [programYear],
    });

    const programYearObjective = await this.server.create('programYearObjective', {
      competency,
      programYear,
    });

    const course = await this.server.create('course', {
      year: currentAcademicYear(),
      school: this.school,
      cohorts: [cohort],
    });
    await this.server.createList('course', 2, {
      school: this.school,
      year: currentAcademicYear() - 1,
    });
    await this.server.createList('course', 2, {
      school: school,
      year: currentAcademicYear(),
    });
    await this.server.create('courseObjective', {
      course,
      programYearObjectives: [programYearObjective],
    });
    await this.server.create('courseObjective', {
      course,
    });

    //handle both requests so we have two
    this.server.post('/api/graphql', this.getCourseCompetenciesResponse(assert));
    this.server.post('/api/graphql', this.getCourseCompetenciesResponse(assert));
    const cc = page.curriculum.courseCompetenciesResult;

    await page.visitCurriculumReports();

    await page.curriculum.chooseCourse.years[0].courses[0].pick();
    await page.curriculum.chooseCourse.schoolSelector.set(school.id);
    await page.curriculum.chooseCourse.years[0].courses[0].pick();
    await page.curriculum.header.reportSelector.set('courseCompetencies');
    assert.ok(
      cc.header.runSummaryText.includes(
        'Each competency is listed along with course and program year objectives.',
      ),
      'Session objective summary text is correct',
    );
    await takeScreenshot(assert, 'selected courses');

    await page.curriculum.header.runReport.click();
    await takeScreenshot(assert, 'course competencies report results');

    assert.strictEqual(cc.resultsMultiSchool.length, 5, 'There are 5 report results');
    assert.strictEqual(
      cc.resultsMultiSchool.objectAt(0).schoolTitle,
      'school 0',
      'Result 1 school title is correct',
    );
    assert.strictEqual(
      cc.resultsMultiSchool.objectAt(0).courseTitle,
      'course 0',
      'Result 1 course title is correct',
    );
    assert.strictEqual(
      cc.resultsMultiSchool.objectAt(0).courseObjectivesCount,
      '2',
      'Result 1 course objectives count is correct',
    );
    assert.strictEqual(
      cc.resultsMultiSchool.objectAt(0).programYearObjectivesCount,
      '1',
      'Result 1 program year objectives count is correct',
    );
    assert.strictEqual(
      cc.results.objectAt(0).competenciesCount,
      '1',
      'Result 1 competencies count is correct',
    );

    assert.strictEqual(
      cc.resultsMultiSchool.objectAt(4).schoolTitle,
      'school 1',
      'Result 2 school title is correct',
    );
    assert.strictEqual(
      cc.resultsMultiSchool.objectAt(4).courseTitle,
      'course 4',
      'Result 2 course title is correct',
    );
    assert.strictEqual(
      cc.resultsMultiSchool.objectAt(4).courseObjectivesCount,
      '0',
      'Result 2 course objectives count is correct',
    );
    assert.strictEqual(
      cc.resultsMultiSchool.objectAt(4).programYearObjectivesCount,
      '0',
      'Result 2 program year objectives count is correct',
    );
    assert.strictEqual(
      cc.results.objectAt(4).competenciesCount,
      '0',
      'Result 2 competencies count is correct',
    );

    assert.strictEqual(
      currentURL(),
      '/reports/curriculum?courses=1-4&report=courseCompetencies&run=true',
      'current URL is correct',
    );
    assert.verifySteps(['API called', 'API called']);
  });

  test('copy url changes if report type changes', async function (assert) {
    // Skip the copy test if we can't access the clipboard
    if (!navigator.clipboard) {
      assert.expect(0);
      return;
    }
    const course = await this.server.create('course', {
      school: this.school,
      year: currentAcademicYear(),
    });
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
    this.server.post('/api/graphql', this.getSessionObjectiveResponse(assert));
    await page.visitCurriculumReports();
    await page.curriculum.chooseCourse.years[0].toggleAll.click();

    // Make sure copy button is grabbing correct report type
    const writeText = navigator.clipboard.writeText;
    navigator.clipboard.writeText = () => {
      assert.step('navigator.clipboard.writeText called');
      const hasCorrectReportType = currentURL().includes('report=sessionObjectives');
      assert.ok(hasCorrectReportType, 'Correct report type was copied to clipboard');
      return Promise.resolve();
    };
    await page.curriculum.header.reportSelector.set('sessionObjectives');
    await page.curriculum.header.copy.click();
    navigator.clipboard.writeText = () => {
      assert.step('navigator.clipboard.writeText called');
      const hasCorrectReportType = currentURL().includes('report=learnerGroups');
      assert.ok(hasCorrectReportType, 'Correct report type was copied to clipboard');
      return Promise.resolve();
    };
    await page.curriculum.header.reportSelector.set('learnerGroups');
    await page.curriculum.header.copy.click();
    navigator.clipboard.writeText = () => {
      assert.step('navigator.clipboard.writeText called');
      const hasCorrectReportType = currentURL().includes('report=sessionObjectives');
      assert.ok(hasCorrectReportType, 'Correct report type was copied to clipboard');
      return Promise.resolve();
    };
    await page.curriculum.header.reportSelector.set('sessionObjectives');
    await page.curriculum.header.copy.click();

    navigator.clipboard.writeText = writeText;
    assert.verifySteps(['API called', ...Array(3).fill('navigator.clipboard.writeText called')]);
  });

  test('toggling years updates url', async function (assert) {
    let years = '';

    await this.server.createList('course', 2, {
      school: this.school,
      year: currentAcademicYear(),
    });
    await this.server.createList('course', 2, {
      school: this.school,
      year: currentAcademicYear() - 1,
    });
    await this.server.createList('course', 2, {
      school: this.school,
      year: currentAcademicYear() - 2,
    });
    await page.visitCurriculumReports();

    assert.strictEqual(currentRouteName(), 'reports.curriculum');
    assert.strictEqual(currentURL(), `/reports/curriculum`, 'current URL is correct');

    assert.ok(page.curriculum.chooseCourse.years[0].isExpanded);
    assert.notOk(page.curriculum.chooseCourse.years[1].isExpanded);
    assert.notOk(page.curriculum.chooseCourse.years[2].isExpanded);

    years = `?years=${currentAcademicYear() - 1}-${currentAcademicYear()}`;

    await page.curriculum.chooseCourse.years[1].toggle();
    assert.ok(page.curriculum.chooseCourse.years[0].isExpanded);
    assert.ok(page.curriculum.chooseCourse.years[1].isExpanded);
    assert.notOk(page.curriculum.chooseCourse.years[2].isExpanded);
    assert.strictEqual(currentURL(), `/reports/curriculum${years}`, 'current URL is correct');

    years = `?years=${currentAcademicYear() - 2}-${currentAcademicYear() - 1}-${currentAcademicYear()}`;

    await page.curriculum.chooseCourse.years[2].toggle();
    assert.ok(page.curriculum.chooseCourse.years[0].isExpanded);
    assert.ok(page.curriculum.chooseCourse.years[1].isExpanded);
    assert.ok(page.curriculum.chooseCourse.years[2].isExpanded);
    assert.strictEqual(currentURL(), `/reports/curriculum${years}`, 'current URL is correct');

    years = `?years=${currentAcademicYear() - 2}-${currentAcademicYear()}`;

    await page.curriculum.chooseCourse.years[1].toggle();
    assert.ok(page.curriculum.chooseCourse.years[0].isExpanded);
    assert.notOk(page.curriculum.chooseCourse.years[1].isExpanded);
    assert.ok(page.curriculum.chooseCourse.years[2].isExpanded);
    assert.strictEqual(currentURL(), `/reports/curriculum${years}`, 'current URL is correct');

    years = '';

    await page.curriculum.chooseCourse.years[2].toggle();
    assert.ok(page.curriculum.chooseCourse.years[0].isExpanded);
    assert.notOk(page.curriculum.chooseCourse.years[1].isExpanded);
    assert.notOk(page.curriculum.chooseCourse.years[2].isExpanded);
    assert.strictEqual(currentURL(), `/reports/curriculum${years}`, 'current URL is correct');
  });

  test('querystring toggles years', async function (assert) {
    await this.server.createList('course', 2, {
      school: this.school,
      year: currentAcademicYear(),
    });
    await this.server.createList('course', 2, {
      school: this.school,
      year: currentAcademicYear() - 1,
    });
    await this.server.createList('course', 2, {
      school: this.school,
      year: currentAcademicYear() - 2,
    });
    await page.visitCurriculumReports();

    assert.strictEqual(currentRouteName(), 'reports.curriculum');

    assert.ok(page.curriculum.chooseCourse.years[0].isExpanded);
    assert.notOk(page.curriculum.chooseCourse.years[1].isExpanded);
    assert.notOk(page.curriculum.chooseCourse.years[2].isExpanded);

    await page.visitCurriculumReports2025();

    assert.notOk(page.curriculum.chooseCourse.years[0].isExpanded);
    assert.ok(page.curriculum.chooseCourse.years[1].isExpanded);
    assert.notOk(page.curriculum.chooseCourse.years[2].isExpanded);

    await page.visitCurriculumReports2024_2025();

    assert.notOk(page.curriculum.chooseCourse.years[0].isExpanded);
    assert.ok(page.curriculum.chooseCourse.years[1].isExpanded);
    assert.ok(page.curriculum.chooseCourse.years[2].isExpanded);

    await page.visitCurriculumReports2026();

    assert.ok(page.curriculum.chooseCourse.years[0].isExpanded);
    assert.notOk(page.curriculum.chooseCourse.years[1].isExpanded);
    assert.notOk(page.curriculum.chooseCourse.years[2].isExpanded);
  });
});
