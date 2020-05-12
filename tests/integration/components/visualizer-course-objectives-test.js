import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | visualizer-course-objectives', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function(assert) {
    assert.expect(4);
    const course = this.server.create('course');
    const objectiveInCourse1 = this.server.create('objective', { title: 'Course Objective 1' });
    const objectiveInCourse2 = this.server.create('objective', { title: 'Course Objective 2' });
    const objectiveInCourse3 = this.server.create('objective', { title: 'Course Objective 3' });
    this.server.create('course-objective', { course, objective: objectiveInCourse1 });
    this.server.create('course-objective', { course, objective: objectiveInCourse2 });
    this.server.create('course-objective', { course, objective: objectiveInCourse3 });

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
    const objectiveInSession1 = this.server.create('objective', { title: 'Session Objective 1', parents: [objectiveInCourse1] });
    const objectiveInSession2 = this.server.create('objective', { title: 'Session Objective 2', parents: [objectiveInCourse2] });
    const objectiveInSession3 = this.server.create('objective', { title: 'Session Objective 3', parents: [objectiveInCourse3] });
    this.server.create('session-objective', { session: session1, objective: objectiveInSession1 });
    this.server.create('session-objective', { session: session2, objective: objectiveInSession2 });
    this.server.create('session-objective', { session: session3, objective: objectiveInSession3 });

    this.server.create('offering', {
      session:session1,
      startDate: new Date('2019-12-08T12:00:00'),
      endDate: new Date('2019-12-08T17:00:00'),
    });
    this.server.create('offering', {
      session:session1,
      startDate: new Date('2019-12-21T12:00:00'),
      endDate: new Date('2019-12-21T17:30:00'),
    });
    this.server.create('offering', {
      session:session2,
      startDate: new Date('2019-12-05T18:00:00'),
      endDate: new Date('2019-12-05T21:00:00'),
    });

    const courseModel = await this.owner.lookup('service:store').find('course', course.id);

    this.set('course', courseModel);

    await render(hbs`<VisualizerCourseObjectives @course={{course}} @isIcon={{false}} />`);

    const chart = 'svg';
    const chartLabels = `${chart} .slice text`;
    const untaughtObjectives = `.zero-hours`;
    assert.dom(chartLabels).exists({ count: 2 });
    assert.dom(chart).containsText('22.2%');
    assert.dom(chart).containsText('77.8%');
    assert.dom(untaughtObjectives).containsText('Course Objective 3');
  });
});
