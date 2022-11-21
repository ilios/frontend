import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { render, waitFor } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { component } from 'ilios-common/page-objects/components/course-visualize-instructors';

module('Integration | Component | course-visualize-instructors', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  test('it renders', async function (assert) {
    const school = this.server.create('school');
    const instructor1 = this.server.create('user', { displayName: 'Marie' });
    const instructor2 = this.server.create('user', { displayName: 'Daisy' });
    const instructor3 = this.server.create('user', { displayName: 'Duke' });
    const instructor4 = this.server.create('user', {
      displayName: 'William',
    });
    const course = this.server.create('course', { year: 2021, school });
    const session1 = this.server.create('session', {
      title: 'Berkeley Investigations',
      course,
    });
    const session2 = this.server.create('session', {
      title: 'The San Leandro Horror',
      course,
    });
    this.server.create('offering', {
      session: session1,
      startDate: new Date('2019-12-08T12:00:00'),
      endDate: new Date('2019-12-08T17:00:00'),
      instructors: [instructor1],
    });
    this.server.create('offering', {
      session: session1,
      startDate: new Date('2019-12-21T12:00:00'),
      endDate: new Date('2019-12-21T17:30:00'),
      instructors: [instructor1, instructor4],
    });
    this.server.create('offering', {
      session: session2,
      startDate: new Date('2019-12-05T18:00:00'),
      endDate: new Date('2019-12-05T21:00:00'),
      instructors: [instructor1, instructor2, instructor3, instructor4],
    });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    this.set('course', courseModel);

    await render(hbs`<CourseVisualizeInstructors @model={{this.course}} />
`);
    assert.strictEqual(component.title, 'course 0 2021');
    //let the chart animations finish
    await waitFor('.loaded');
    await waitFor('svg .bars');
    assert.strictEqual(component.instructorsChart.chart.bars.length, 4);
    assert.strictEqual(component.instructorsChart.chart.labels.length, 4);
    assert.strictEqual(component.instructorsChart.chart.labels[0].text, 'Daisy: 180 Minutes');
    assert.strictEqual(component.instructorsChart.chart.labels[1].text, 'Duke: 180 Minutes');
    assert.strictEqual(component.instructorsChart.chart.labels[2].text, 'William: 510 Minutes');
    assert.strictEqual(component.instructorsChart.chart.labels[3].text, 'Marie: 810 Minutes');
  });

  test('filter works', async function (assert) {
    const school = this.server.create('school');
    const course = this.server.create('course', { year: 2021, school });
    const session = this.server.create('session', { course });
    const instructor1 = this.server.create('user', { firstName: 'foo' });
    const instructor2 = this.server.create('user', { firstName: 'bar' });
    this.server.create('offering', {
      session,
      startDate: new Date('2021/03/01'),
      endDate: new Date('2021/03/02'),
      instructors: [instructor1, instructor2],
    });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    this.set('course', courseModel);

    await render(hbs`<CourseVisualizeInstructors @model={{this.course}} />
`);
    //let the chart animations finish
    await waitFor('.loaded');
    await waitFor('svg .bars');

    assert.strictEqual(component.title, 'course 0 2021');
    assert.strictEqual(component.instructorsChart.chart.bars.length, 2);
    assert.strictEqual(component.instructorsChart.chart.labels.length, 2);
    assert.strictEqual(
      component.instructorsChart.chart.labels[0].text,
      'foo M. Mc0son: 1440 Minutes'
    );
    assert.strictEqual(
      component.instructorsChart.chart.labels[1].text,
      'bar M. Mc1son: 1440 Minutes'
    );
    await component.filter.set('foo');
    assert.strictEqual(component.instructorsChart.chart.bars.length, 1);
    assert.strictEqual(component.instructorsChart.chart.labels.length, 1);
    assert.strictEqual(
      component.instructorsChart.chart.labels[0].text,
      'foo M. Mc0son: 1440 Minutes'
    );
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
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    this.set('course', courseModel);

    await render(hbs`<CourseVisualizeInstructors @model={{this.course}} />
`);

    assert.strictEqual(component.title, 'course 0 2021 - 2022');
  });

  test('breadcrumb', async function (assert) {
    const school = this.server.create('school');
    const course = this.server.create('course', { year: 2021, school });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    this.set('course', courseModel);

    await render(hbs`<CourseVisualizeInstructors @model={{this.course}} />
`);

    assert.strictEqual(component.breadcrumb.crumbs.length, 3);
    assert.strictEqual(component.breadcrumb.crumbs[0].text, 'course 0');
    assert.strictEqual(component.breadcrumb.crumbs[0].link, '/courses/1');
    assert.strictEqual(component.breadcrumb.crumbs[1].text, 'Visualizations');
    assert.strictEqual(component.breadcrumb.crumbs[1].link, '/data/courses/1');
    assert.strictEqual(component.breadcrumb.crumbs[2].text, 'Instructors');
  });
});
