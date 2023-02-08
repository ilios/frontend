import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render, waitFor } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { component } from 'ilios/tests/pages/components/school/visualizer-session-type-vocabularies';

module('Integration | Component | school/visualizer-session-type-vocabularies', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  hooks.beforeEach(async function () {
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
    this.sessionType = await this.owner
      .lookup('service:store')
      .findRecord('session-type', sessionType.id);
  });

  test('it renders', async function (assert) {
    this.set('sessionType', this.sessionType);
    await render(
      hbs`<School::VisualizerSessionTypeVocabularies @sessionType={{this.sessionType}} />`
    );

    assert.dom('svg').exists({ count: 1 });
    await waitFor('.loaded');
    await waitFor('svg .slice');
    assert.strictEqual(component.chart.slices.length, 2);
    assert.strictEqual(component.chart.labels.length, 2);
    assert.strictEqual(component.chart.descriptions.length, 2);
    assert.strictEqual(component.chart.labels[0].text, 'Vocabulary 1');
    assert.strictEqual(
      component.chart.descriptions[0].text,
      '1 term from the "Vocabulary 1" vocabulary is applied to 1 session with session-type "session type 0".'
    );
    assert.strictEqual(component.chart.labels[1].text, 'Vocabulary 2');
    assert.strictEqual(
      component.chart.descriptions[1].text,
      '3 terms from the "Vocabulary 2" vocabulary are applied to 3 sessions with session-type "session type 0".'
    );
  });
});
