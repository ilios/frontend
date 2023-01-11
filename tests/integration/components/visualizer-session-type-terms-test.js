import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render, waitFor } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Integration | Component | visualizer session type terms', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  test('it renders', async function (assert) {
    const sessionType = this.server.create('session-type');
    const course = this.server.create('course');
    const sessions = this.server.createList('session', 2, { course, sessionType });
    const vocabulary = this.server.create('vocabulary');
    this.server.create('term', {
      vocabulary,
      sessions: [sessions[0]],
    });
    this.server.create('term', {
      vocabulary,
      sessions: [sessions[1]],
    });
    this.server.create('term', {
      vocabulary,
      courses: [course],
    });
    const sessionTypeModel = await this.owner
      .lookup('service:store')
      .findRecord('session-type', sessionType.id);
    this.set('sessionType', sessionTypeModel);
    const vocabularyModel = await this.owner
      .lookup('service:store')
      .findRecord('session-type', vocabulary.id);
    this.set('vocabulary', vocabularyModel);
    await render(
      hbs`<VisualizerSessionTypeTerms @sessionType={{this.sessionType}} @vocabulary={{this.vocabulary}} />`
    );

    assert.dom('svg').exists({ count: 1 });
    await waitFor('.loaded');
    await waitFor('svg .slice');
    assert.dom('svg g.slice').exists({ count: 3 });
    assert.dom('svg g.slice:nth-of-type(1)').hasText('25.0%');
    assert.dom('svg g.slice:nth-of-type(2)').hasText('25.0%');
    assert.dom('svg g.slice:nth-of-type(3)').hasText('50.0%');
  });
});
