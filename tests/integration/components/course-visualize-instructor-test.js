import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { render, waitFor } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { DateTime } from 'luxon';
import { component } from 'ilios-common/page-objects/components/course-visualize-instructor';

module('Integration | Component | course-visualize-instructor', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  test('it renders', async function (assert) {
    const school = this.server.create('school');
    const course = this.server.create('course', { year: 2021, school });
    const user = this.server.create('user');
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    const userModel = await this.owner.lookup('service:store').findRecord('user', user.id);
    this.set('course', courseModel);
    this.set('user', userModel);

    await render(hbs`<CourseVisualizeInstructor @course={{this.course}} @user={{this.user}} />`);

    assert.strictEqual(component.title, 'course 0 2021');
    assert.strictEqual(component.instructorName, '0 guy M. Mc0son');
    assert.strictEqual(component.totalOfferingsTime, 'Total Instructional Time 0 Minutes');
    assert.strictEqual(component.totalIlmTime, 'Total ILM Time 0 Minutes');
  });

  test('course year is shown as range if applicable by configuration', async function (assert) {
    this.server.get('application/config', function () {
      return {
        config: {
          academicYearCrossesCalendarYearBoundaries: true,
        },
      };
    });
    const school = this.server.create('school');
    const course = this.server.create('course', { year: 2021, school });
    const user = this.server.create('user');
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    const userModel = await this.owner.lookup('service:store').findRecord('user', user.id);
    this.set('course', courseModel);
    this.set('user', userModel);

    await render(hbs`<CourseVisualizeInstructor @course={{this.course}} @user={{this.user}} />`);

    assert.strictEqual(component.title, 'course 0 2021 - 2022');
  });

  test('breadcrumb', async function (assert) {
    this.server.get('application/config', function () {
      return {
        config: {
          academicYearCrossesCalendarYearBoundaries: true,
        },
      };
    });
    const school = this.server.create('school');
    const course = this.server.create('course', { year: 2021, school });
    const user = this.server.create('user');
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    const userModel = await this.owner.lookup('service:store').findRecord('user', user.id);
    this.set('course', courseModel);
    this.set('user', userModel);

    await render(hbs`<CourseVisualizeInstructor @course={{this.course}} @user={{this.user}} />`);

    assert.strictEqual(component.breadcrumb.crumbs.length, 4);
    assert.strictEqual(component.breadcrumb.crumbs[0].text, 'course 0');
    assert.strictEqual(component.breadcrumb.crumbs[0].link, '/courses/1');
    assert.strictEqual(component.breadcrumb.crumbs[1].text, 'Visualizations');
    assert.strictEqual(component.breadcrumb.crumbs[1].link, '/data/courses/1');
    assert.strictEqual(component.breadcrumb.crumbs[2].text, 'Instructors');
    assert.strictEqual(component.breadcrumb.crumbs[2].link, '/data/courses/1/instructors');
    assert.strictEqual(component.breadcrumb.crumbs[3].text, '0 guy M. Mc0son');
  });

  test('visualizations', async function (assert) {
    const instructor = this.server.create('user');
    const vocabulary1 = this.server.create('vocabulary');
    const vocabulary2 = this.server.create('vocabulary');
    const term1 = this.server.create('term', {
      vocabulary: vocabulary1,
    });
    const term2 = this.server.create('term', {
      vocabulary: vocabulary1,
    });
    const term3 = this.server.create('term', {
      vocabulary: vocabulary2,
    });
    const sessionType1 = this.server.create('sessionType');
    const sessionType2 = this.server.create('sessionType');
    const session1 = this.server.create('session', {
      sessionType: sessionType1,
      terms: [term1],
    });
    const session2 = this.server.create('session', {
      sessionType: sessionType2,
      terms: [term2, term3],
    });
    const session3 = this.server.create('session');
    this.server.create('ilmSession', {
      session: session3,
      hours: 2,
      instructors: [instructor],
    });
    const instructorGroup1 = this.server.create('instructorGroup', {
      users: [instructor],
    });
    this.server.create('offering', {
      instructorGroups: [instructorGroup1],
      startDate: DateTime.fromISO('2022-07-20T09:00:00').toJSDate(),
      endDate: DateTime.fromISO('2022-07-20T10:00:00').toJSDate(),
      session: session1,
    });
    this.server.create('offering', {
      instructors: [instructor],
      startDate: DateTime.fromISO('2022-07-20T09:00:00').toJSDate(),
      endDate: DateTime.fromISO('2022-07-20T09:30:00').toJSDate(),
      session: session2,
    });
    const course = this.server.create('course', {
      sessions: [session1, session2, session3],
      year: 2022,
    });

    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    const userModel = await this.owner.lookup('service:store').findRecord('user', instructor.id);
    this.set('course', courseModel);
    this.set('user', userModel);

    await render(hbs`<CourseVisualizeInstructor @course={{this.course}} @user={{this.user}} />`);

    // wait for charts to load
    await waitFor('.loaded');
    await waitFor('svg .bars');
    await waitFor('svg .chart');
    assert.strictEqual(component.termsChart.chart.bars.length, 3);
    assert.strictEqual(component.termsChart.chart.labels.length, 3);
    assert.strictEqual(
      component.termsChart.chart.labels[0].text,
      'Vocabulary 1 > term 0: 60 Minutes'
    );
    assert.strictEqual(
      component.termsChart.chart.labels[1].text,
      'Vocabulary 1 > term 1: 30 Minutes'
    );
    assert.strictEqual(
      component.termsChart.chart.labels[2].text,
      'Vocabulary 2 > term 2: 30 Minutes'
    );
    assert.strictEqual(component.sessionTypesChart.chart.slices.length, 2);
    assert.strictEqual(component.sessionTypesChart.chart.slices[0].text, 'session type 0 66.7%');
    assert.strictEqual(component.sessionTypesChart.chart.slices[1].text, 'session type 1 33.3%');
  });
});
