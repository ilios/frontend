import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { click, render, findAll, waitFor } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | visualizer-course-instructors', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const instructor1 = this.server.create('user', { displayName: 'Marie' });
    const instructor2 = this.server.create('user', { displayName: 'Daisy' });
    const instructor3 = this.server.create('user', { displayName: 'Duke' });
    const instructor4 = this.server.create('user', {
      displayName: 'William',
    });

    const course = this.server.create('course');
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

    this.courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
  });

  test('it renders', async function (assert) {
    this.set('course', this.courseModel);

    await render(hbs`<VisualizerCourseInstructors @course={{this.course}} @isIcon={{false}} />`);
    //let the chart animations finish
    await waitFor('.loaded');
    await waitFor('svg .bars');

    const chartLabels = 'svg .bars text';
    assert.dom(chartLabels).exists({ count: 4 });
    assert.dom(findAll(chartLabels)[0]).containsText('Daisy 13.0%');
    assert.dom(findAll(chartLabels)[1]).containsText('Duke 13.0%');
    assert.dom(findAll(chartLabels)[2]).containsText('Marie 37.0%');
    assert.dom(findAll(chartLabels)[3]).containsText('William 37.0%');
  });

  test('filter applies', async function (assert) {
    this.set('name', 'Marie');
    this.set('course', this.courseModel);

    await render(
      hbs`<VisualizerCourseInstructors @course={{this.course}} @filter={{this.name}} @isIcon={{false}} />`
    );
    //let the chart animations finish
    await waitFor('.loaded');
    await waitFor('svg .bars');

    const chartLabels = 'svg .bars text';
    assert.dom(chartLabels).exists({ count: 1 });
    assert.dom(findAll(chartLabels)[0]).containsText('Marie 37.0%');
  });

  test('it renders as donut chart', async function (assert) {
    this.set('course', this.courseModel);

    await render(
      hbs`<VisualizerCourseInstructors @course={{this.course}} @isIcon={{false}} @chartType="donut" />`
    );
    //let the chart animations finish
    await waitFor('.loaded');
    await waitFor('svg .slice');

    const chartLabels = 'svg .slice text';
    assert.dom(chartLabels).exists({ count: 4 });
  });

  test('on-click transition fires', async function (assert) {
    assert.expect(3);
    class RouterMock extends Service {
      transitionTo(route, courseId, termId) {
        assert.strictEqual(route, 'course-visualize-instructor');
        assert.strictEqual(parseInt(courseId, 10), 1);
        assert.strictEqual(parseInt(termId, 10), 2);
      }
    }
    this.owner.register('service:router', RouterMock);
    this.set('course', this.courseModel);

    await render(hbs`<VisualizerCourseInstructors @course={{this.course}} @isIcon={{false}} />`);
    //let the chart animations finish
    await waitFor('.loaded');
    await waitFor('svg .bars');

    await click('svg .bars rect:nth-of-type(1)');
  });
});
