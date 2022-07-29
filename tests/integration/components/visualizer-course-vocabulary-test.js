import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { click, render, findAll, waitFor } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupMirage } from 'ember-cli-mirage/test-support';

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

    const chartLabels = 'svg .bars text';
    assert.dom(chartLabels).exists({ count: 2 });
    assert.dom(findAll(chartLabels)[0]).hasText('Campaign 22.2%');
    assert.dom(findAll(chartLabels)[1]).hasText('Standalone 77.8%');
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
