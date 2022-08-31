import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { render, waitFor } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { component } from 'ilios-common/page-objects/components/visualizer-course-vocabularies';

module('Integration | Component | visualizer-course-vocabularies', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  test('it renders', async function (assert) {
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

    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);

    this.set('course', courseModel);

    await render(hbs`<VisualizerCourseVocabularies @course={{this.course}} @isIcon={{false}} />`);
    //let the chart animations finish
    await waitFor('.loaded');
    await waitFor('svg .slice');
    assert.strictEqual(component.chart.slices.length, 2);
    assert.strictEqual(component.chart.slices[0].text, 'Standalone');
    assert.strictEqual(component.chart.slices[1].text, 'Campaign');
  });
});
