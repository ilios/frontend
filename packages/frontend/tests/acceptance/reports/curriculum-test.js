import { currentRouteName, currentURL } from '@ember/test-helpers';
import { module, test } from 'qunit';
import page from 'frontend/tests/pages/reports';
import { setupApplicationTest } from 'frontend/tests/helpers';
import { setupAuthentication } from 'ilios-common';
import percySnapshot from '@percy/ember';
import { getUniqueName } from '../../helpers/percy-snapshot-name';
import currentAcademicYear from 'ilios-common/utils/current-academic-year';
import { graphQL } from 'frontend/tests/helpers/curriculum-report';

module('Acceptance | Reports - Curriculum Reports', function (hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(async function () {
    this.school = this.server.create('school');
    await setupAuthentication({ school: this.school }, true);
    this.server.post('api/graphql', ({ db }, { requestBody }) => {
      const { query } = JSON.parse(requestBody);
      if (query.includes('courses(academicYears:')) {
        const courses = db.courses.map(({ id, title, year, externalId }) => {
          return { id, title, year, externalId };
        });
        return {
          data: {
            courses,
          },
        };
      }
    });
  });

  test('visiting reports with one school', async function (assert) {
    assert.expect(9);
    this.server.createList('course', 2, {
      school: this.school,
      year: currentAcademicYear() - 1,
    });
    this.server.createList('course', 2, {
      school: this.school,
      year: currentAcademicYear(),
    });
    this.server.createList('course', 2, {
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

    await percySnapshot(assert);
  });

  test('visiting reports with multiple schools', async function (assert) {
    assert.expect(13);
    const school = this.server.create('school');
    this.server.createList('course', 2, {
      school: this.school,
      year: currentAcademicYear() - 1,
    });
    this.server.createList('course', 2, {
      school,
      year: currentAcademicYear(),
    });
    this.server.createList('course', 2, {
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
    assert.strictEqual(page.curriculum.chooseCourse.schoolSelector.value, this.school.id);
    assert.strictEqual(page.curriculum.chooseCourse.years.length, 2);
    assert.notOk(page.curriculum.chooseCourse.years[0].isExpanded);
    assert.notOk(page.curriculum.chooseCourse.years[1].isExpanded);
    await percySnapshot(getUniqueName(assert, 'default school'));

    await page.curriculum.chooseCourse.schoolSelector.set(school.id);
    assert.strictEqual(page.curriculum.chooseCourse.schoolSelector.value, school.id);
    assert.strictEqual(page.curriculum.chooseCourse.years.length, 1);
    assert.ok(page.curriculum.chooseCourse.years[0].isExpanded);
    await percySnapshot(getUniqueName(assert, 'school with current year'));
  });

  test('run session objectives report, single school', async function (assert) {
    assert.expect(8);
    const course = this.server.create('course', {
      school: this.school,
      year: currentAcademicYear(),
    });
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
    await percySnapshot(getUniqueName(assert, 'selected courses'));

    await page.curriculum.header.runReport.click();
    await percySnapshot(getUniqueName(assert, 'session objectives report results'));
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

    // Make sure copy button is grabbing correct report type
    const writeText = navigator.clipboard.writeText;
    navigator.clipboard.writeText = (text) => {
      const reportType = text.split('report=')[1];
      assert.strictEqual(
        reportType,
        'sessionObjectives',
        'Correct report type was copied to clipboard',
      );
      return Promise.resolve();
    };
    await page.curriculum.header.copy.click();
    navigator.clipboard.writeText = writeText;
  });

  test('run session objectives report, multiple schools', async function (assert) {
    assert.expect(14);
    const course = this.server.create('course', {
      school: this.school,
      year: currentAcademicYear(),
    });
    const school = this.server.create('school');
    this.server.createList('course', 2, {
      school: this.school,
      year: currentAcademicYear() - 1,
    });
    this.server.createList('course', 2, {
      school: school,
      year: currentAcademicYear(),
    });
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
    await percySnapshot(getUniqueName(assert, 'selected courses'));

    await page.curriculum.header.runReport.click();
    await percySnapshot(getUniqueName(assert, 'session objectives report results'));

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
    //localhost:4301/tests?nocontainer=&moduleId=1582286f&report=sessionObjectives
    assert.strictEqual(
      currentURL(),
      '/reports/curriculum?courses=1-4&report=sessionObjectives&run=true',
      'current URL is correct',
    );

    // Make sure copy button is grabbing correct report type
    const writeText = navigator.clipboard.writeText;
    navigator.clipboard.writeText = (text) => {
      const reportType = text.split('report=')[1];
      assert.strictEqual(
        reportType,
        'sessionObjectives',
        'Correct report type was copied to clipboard',
      );
      return Promise.resolve();
    };
    await page.curriculum.header.copy.click();
    navigator.clipboard.writeText = writeText;
  });

  test('run learner groups report, single school', async function (assert) {
    assert.expect(8);
    const course = this.server.create('course', {
      school: this.school,
      year: currentAcademicYear(),
    });
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
    const lg = page.curriculum.learnerGroupsResult;

    await page.visitCurriculumReports();
    await page.curriculum.chooseCourse.years[0].toggleAll.click();
    await page.curriculum.header.reportSelector.set('learnerGroups');
    assert.ok(
      lg.header.runSummaryText.includes(
        'Each attached learner group is listed along with instructors and course data.',
      ),
    );
    await percySnapshot(getUniqueName(assert, 'selected courses'));

    await page.curriculum.header.runReport.click();
    await percySnapshot(getUniqueName(assert, 'learner group report results'));
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

    // Make sure copy button is grabbing correct report type
    const writeText = navigator.clipboard.writeText;
    navigator.clipboard.writeText = (text) => {
      const reportType = text.split('report=')[1];
      assert.strictEqual(
        reportType,
        'learnerGroups',
        'Correct report type was copied to clipboard',
      );
      return Promise.resolve();
    };
    await page.curriculum.header.copy.click();
    navigator.clipboard.writeText = writeText;
  });

  test('run learner groups report, multiple schools', async function (assert) {
    assert.expect(14);
    const course = this.server.create('course', {
      school: this.school,
      year: currentAcademicYear(),
    });
    const school = this.server.create('school');
    this.server.createList('course', 2, {
      school: this.school,
      year: currentAcademicYear() - 1,
    });
    this.server.createList('course', 2, {
      school: school,
      year: currentAcademicYear(),
    });
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
    await percySnapshot(getUniqueName(assert, 'selected courses'));

    await page.curriculum.header.runReport.click();
    await percySnapshot(getUniqueName(assert, 'learner group report results'));

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

    // Make sure copy button is grabbing correct report type
    const writeText = navigator.clipboard.writeText;
    navigator.clipboard.writeText = (text) => {
      const reportType = text.split('report=')[1];
      assert.strictEqual(
        reportType,
        'learnerGroups',
        'Correct report type was copied to clipboard',
      );
      return Promise.resolve();
    };
    await page.curriculum.header.copy.click();
    navigator.clipboard.writeText = writeText;
  });

  test('copy url changes if report type changes', async function (assert) {
    assert.expect(3);
    const course = this.server.create('course', {
      school: this.school,
      year: currentAcademicYear(),
    });
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
    await page.visitCurriculumReports();
    await page.curriculum.chooseCourse.years[0].toggleAll();

    // Make sure copy button is grabbing correct report type
    const writeText = navigator.clipboard.writeText;
    navigator.clipboard.writeText = (text) => {
      const reportType = text.split('report=')[1];
      assert.strictEqual(
        reportType,
        'sessionObjectives',
        'Correct report type was copied to clipboard',
      );
      return Promise.resolve();
    };
    await page.curriculum.header.reportSelector.set('sessionObjectives');
    await page.curriculum.header.copy.click();
    navigator.clipboard.writeText = (text) => {
      const reportType = text.split('report=')[1];
      assert.strictEqual(
        reportType,
        'learnerGroups',
        'Correct report type was copied to clipboard',
      );
      return Promise.resolve();
    };
    await page.curriculum.header.reportSelector.set('learnerGroups');
    await page.curriculum.header.copy.click();
    navigator.clipboard.writeText = (text) => {
      const reportType = text.split('report=')[1];
      assert.strictEqual(
        reportType,
        'sessionObjectives',
        'Correct report type was copied to clipboard',
      );
      return Promise.resolve();
    };
    await page.curriculum.header.reportSelector.set('sessionObjectives');
    await page.curriculum.header.copy.click();

    navigator.clipboard.writeText = writeText;
  });
});
