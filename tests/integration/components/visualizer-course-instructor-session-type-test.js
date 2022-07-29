import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render, waitFor } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { component } from 'ilios-common/page-objects/components/visualizer-course-instructor-session-type';

module('Integration | Component | visualizer-course-instructor-session-type', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  test('it renders', async function (assert) {
    const instructor = this.server.create('user');
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
      instructors: [instructor],
    });
    this.server.create('offering', {
      session: session1,
      startDate: new Date('2019-12-21T12:00:00'),
      endDate: new Date('2019-12-21T17:30:00'),
      instructors: [instructor],
    });
    this.server.create('offering', {
      session: session2,
      startDate: new Date('2019-12-05T18:00:00'),
      endDate: new Date('2019-12-05T21:00:00'),
      instructors: [instructor],
    });

    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    const instructorModel = await this.owner
      .lookup('service:store')
      .findRecord('user', instructor.id);

    this.set('course', courseModel);
    this.set('instructor', instructorModel);

    await render(
      hbs`<VisualizerCourseInstructorSessionType @course={{this.course}} @user={{this.instructor}} @isIcon={{false}} />`
    );

    //let the chart animations finish
    await waitFor('.loaded');
    await waitFor('svg .chart .slice');

    assert.strictEqual(component.chart.slices.length, 2);
    assert.strictEqual(component.chart.slices[0].text, 'Standalone 77.8%');
    assert.strictEqual(component.chart.slices[1].text, 'Campaign 22.2%');
  });
});
