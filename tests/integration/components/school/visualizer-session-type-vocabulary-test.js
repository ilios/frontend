import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render, waitFor } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { component } from 'ilios/tests/pages/components/school/visualizer-session-type-vocabulary';

module('Integration | Component | school/visualizer-session-type-vocabulary', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  hooks.beforeEach(async function () {
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
    this.sessionType = await this.owner
      .lookup('service:store')
      .findRecord('session-type', sessionType.id);
    this.vocabulary = await this.owner
      .lookup('service:store')
      .findRecord('session-type', vocabulary.id);
  });

  test('it renders', async function (assert) {
    this.set('sessionType', this.sessionType);
    this.set('vocabulary', this.vocabulary);
    await render(
      hbs`<School::VisualizerSessionTypeVocabulary @sessionType={{this.sessionType}} @vocabulary={{this.vocabulary}} />`
    );
    await waitFor('.loaded');
    await waitFor('.chart');
    assert.strictEqual(component.chart.slices.length, 2);
    assert.strictEqual(component.chart.labels.length, 2);
    assert.strictEqual(component.chart.labels[0].text, 'term 0');
    assert.strictEqual(component.chart.labels[1].text, 'term 1');
  });
});
