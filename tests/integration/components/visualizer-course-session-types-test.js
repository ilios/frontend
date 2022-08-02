import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render, waitFor } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { component } from 'ilios-common/page-objects/components/visualizer-course-session-types';

module('Integration | Component | visualizer-course-session-types', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const sessionType1 = this.server.create('session-type', {
      title: 'Standalone',
    });
    const sessionType2 = this.server.create('session-type', {
      title: 'Campaign',
    });
    const course = this.server.create('course');
    const session1 = this.server.create('session', {
      title: 'Berkeley Investigations',
      course,
      sessionType: sessionType1,
    });
    const session2 = this.server.create('session', {
      title: 'The San Leandro Horror',
      course,
      sessionType: sessionType2,
    });
    this.server.create('offering', {
      session: session1,
      startDate: new Date('2019-12-08T12:00:00'),
      endDate: new Date('2019-12-08T17:00:00'),
    });
    this.server.create('offering', {
      session: session1,
      startDate: new Date('2019-12-21T12:00:00'),
      endDate: new Date('2019-12-21T17:30:00'),
    });
    this.server.create('offering', {
      session: session2,
      startDate: new Date('2019-12-05T18:00:00'),
      endDate: new Date('2019-12-05T21:00:00'),
    });

    this.courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
  });

  test('it renders as bar chart by default', async function (assert) {
    this.set('course', this.courseModel);

    await render(hbs`<VisualizerCourseSessionTypes @course={{this.course}} @isIcon={{false}} />`);
    //let the chart animations finish
    await waitFor('.loaded');
    await waitFor('svg .bars');

    assert.strictEqual(component.chart.bars.length, 2);
    assert.strictEqual(component.chart.labels.length, 2);
    assert.strictEqual(component.chart.labels[0].text, 'Campaign: 180 Minutes');
    assert.strictEqual(component.chart.labels[1].text, 'Standalone: 630 Minutes');
  });

  test('it renders as donut chart', async function (assert) {
    this.set('course', this.courseModel);

    await render(
      hbs`<VisualizerCourseSessionTypes @course={{this.course}} @isIcon={{false}} @chartType="donut" />`
    );
    //let the chart animations finish
    await waitFor('.loaded');
    await waitFor('svg .slice');

    assert.strictEqual(component.chart.slices.length, 2);
    assert.strictEqual(component.chart.slices[0].text, 'Campaign: 180 Minutes');
    assert.strictEqual(component.chart.slices[1].text, 'Standalone: 630 Minutes');
  });

  test('filter applies', async function (assert) {
    this.set('title', 'Campaign');
    this.set('course', this.courseModel);

    await render(
      hbs`<VisualizerCourseSessionTypes @course={{this.course}} @filter={{this.title}} @isIcon={{false}} />`
    );
    //let the chart animations finish
    await waitFor('.loaded');
    await waitFor('svg .bars');

    assert.strictEqual(component.chart.bars.length, 1);
    assert.strictEqual(component.chart.labels.length, 1);
    assert.strictEqual(component.chart.labels[0].text, 'Campaign: 180 Minutes');
  });
});
