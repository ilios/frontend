import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render, waitFor } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | visualizer-course-objectives', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  test('it renders', async function (assert) {
    assert.expect(4);
    const course = this.server.create('course');
    const courseObjectives = this.server.createList('courseObjective', 3, {
      course,
    });
    const session1 = this.server.create('session', {
      title: 'Berkeley Investigations',
      course,
    });
    const session2 = this.server.create('session', {
      title: 'The San Leandro Horror',
      course,
    });
    const session3 = this.server.create('session', {
      title: 'Empty Session',
      course,
    });
    this.server.create('sessionObjective', {
      session: session1,
      courseObjectives: [courseObjectives[0]],
    });
    this.server.create('sessionObjective', {
      session: session2,
      courseObjectives: [courseObjectives[1]],
    });
    this.server.create('sessionObjective', {
      session: session3,
      courseObjectives: [courseObjectives[2]],
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

    const courseModel = await this.owner.lookup('service:store').find('course', course.id);

    this.set('course', courseModel);

    await render(hbs`<VisualizerCourseObjectives @course={{this.course}} @isIcon={{false}} />`);
    //let the chart animations finish
    await waitFor('.loaded');
    await waitFor('svg .slice');

    const chart = 'svg';
    const chartLabels = `${chart} .slice text`;
    const untaughtObjectives = `.zero-hours`;
    assert.dom(chartLabels).exists({ count: 2 });
    assert.dom(chart).containsText('22.2%');
    assert.dom(chart).containsText('77.8%');
    assert.dom(untaughtObjectives).containsText('course objective 2');
  });
});
