import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { click, render, waitFor } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { component } from 'ilios-common/page-objects/components/visualizer-course-vocabulary';

module('Integration | Component | visualizer-course-vocabulary', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const vocabulary = this.server.create('vocabulary');
    const term1 = this.server.create('term', {
      vocabulary,
      title: 'Standalone',
    });
    const term2 = this.server.create('term', {
      vocabulary,
      title: 'Campaign',
    });
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

    this.courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    this.vocabularyModel = await this.owner
      .lookup('service:store')
      .findRecord('vocabulary', vocabulary.id);
  });

  test('it renders', async function (assert) {
    this.set('course', this.courseModel);
    this.set('vocabulary', this.vocabularyModel);

    await render(
      hbs`<VisualizerCourseVocabulary @course={{this.course}} @vocabulary={{this.vocabulary}} @isIcon={{false}} />`
    );
    //let the chart animations finish
    await waitFor('.loaded');
    await waitFor('svg .bars');

    assert.strictEqual(component.chart.bars.length, 2);
    assert.strictEqual(component.chart.labels.length, 2);
    assert.strictEqual(component.chart.labels[0].text, 'Campaign: 180 Minutes');
    assert.strictEqual(component.chart.labels[1].text, 'Standalone: 630 Minutes');
  });

  test('on-click transition fires', async function (assert) {
    assert.expect(3);
    class RouterMock extends Service {
      transitionTo(route, courseId, termId) {
        assert.strictEqual(route, 'course-visualize-term');
        assert.strictEqual(parseInt(courseId, 10), 1);
        assert.strictEqual(parseInt(termId, 10), 2);
      }
    }
    this.owner.register('service:router', RouterMock);
    this.set('course', this.courseModel);
    this.set('vocabulary', this.vocabularyModel);

    await render(
      hbs`<VisualizerCourseVocabulary @course={{this.course}} @vocabulary={{this.vocabulary}} @isIcon={{false}} />`
    );
    //let the chart animations finish
    await waitFor('.loaded');
    await waitFor('svg .bars');

    await click('svg .bars rect:nth-of-type(1)');
  });
});
