import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | visualizer-course-vocabularies', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function (assert) {
    assert.expect(3);
    const vocabulary1 = this.server.create('vocabulary', {
      title: 'Standalone',
    });
    const vocabulary2 = this.server.create('vocabulary', {
      title: 'Campaign',
    });
    const term1 = this.server.create('term', { vocabulary: vocabulary1 });
    const term2 = this.server.create('term', { vocabulary: vocabulary2 });
    const course = this.server.create('course');
    const session1 = this.server.create('session', {
      title: 'Berkeley Investigations',
      course,
      terms: [term1],
    });
    const session2 = this.server.create('session', {
      title: 'The San Leandro Horror',
      course,
      terms: [term2],
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

    await render(hbs`<VisualizerCourseVocabularies @course={{this.course}} @isIcon={{false}} />`);
    const chart = 'svg';
    const chartLabels = `${chart} .slice text`;
    assert.dom(chartLabels).exists({ count: 2 });
    assert.dom(chart).containsText('Standalone');
    assert.dom(chart).containsText('Campaign');
  });
});
