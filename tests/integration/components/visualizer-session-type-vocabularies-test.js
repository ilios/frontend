import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render, waitFor } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Integration | Component | visualizer session type vocabularies', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  test('it renders', async function (assert) {
    const sessionType = this.server.create('session-type');
    const course = this.server.create('course');
    const sessions = this.server.createList('session', 5, { course, sessionType });
    const vocabularies = this.server.createList('vocabulary', 2);
    this.server.create('term', {
      vocabulary: vocabularies[0],
      sessions: [sessions[0]],
    });
    this.server.create('term', {
      vocabulary: vocabularies[1],
      sessions: [sessions[1]],
    });
    this.server.create('term', {
      vocabulary: vocabularies[1],
      sessions: [sessions[2]],
    });
    this.server.create('term', {
      vocabulary: vocabularies[1],
      sessions: [sessions[3]],
    });
    this.server.create('term', {
      vocabulary: vocabularies[0],
      courses: [course],
    });
    const sessionTypeModel = await this.owner
      .lookup('service:store')
      .find('session-type', sessionType.id);
    this.set('sessionType', sessionTypeModel);
    await render(hbs`<VisualizerSessionTypeVocabularies @sessionType={{this.sessionType}} />`);

    assert.dom('svg').exists({ count: 1 });
    await waitFor('.loaded');
    await waitFor('svg .slice');
    assert.dom('svg g.slice').exists({ count: 2 });
    assert.dom('svg g.slice:nth-of-type(1)').hasText('66.7%');
    assert.dom('svg g.slice:nth-of-type(2)').hasText('33.3%');
  });
});
