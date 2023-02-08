import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render, waitFor } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { component } from 'ilios/tests/pages/components/school/session-type-visualize-vocabulary';

module('Integration | Component | school/session-type-visualize-vocabulary', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const school = this.server.create('school');
    const course = this.server.create('course', { school });
    const sessionType = this.server.create('sessionType', { school });
    const vocabulary = this.server.create('vocabulary', { school });
    const terms = this.server.createList('term', 5, { vocabulary });
    this.server.create('session', { course, sessionType, terms: [terms[0], terms[1]] });
    this.server.create('session', { course, sessionType, terms: [terms[2]] });
    this.server.create('session', { course, sessionType, terms: [terms[0], terms[3], terms[4]] });
    this.server.create('session', { course, sessionType, terms: [terms[1], terms[3]] });
    this.server.create('session', { course, sessionType, terms: [terms[0], terms[3]] });

    this.vocabulary = await this.owner
      .lookup('service:store')
      .findRecord('vocabulary', vocabulary.id);
    this.sessionType = await this.owner
      .lookup('service:store')
      .findRecord('sessionType', sessionType.id);
  });

  test('it renders', async function (assert) {
    this.set('model', { sessionType: this.sessionType, vocabulary: this.vocabulary });

    await render(hbs`<School::SessionTypeVisualizeVocabulary @model={{this.model}} />`);

    assert.strictEqual(component.primaryTitle, 'Terms by Session Type');
    assert.strictEqual(component.secondaryTitle, 'session type 0 (Vocabulary 1)');
    assert.strictEqual(component.breadcrumb.crumbs.length, 6);
    assert.strictEqual(component.breadcrumb.crumbs[0].text, 'school 0');
    assert.strictEqual(
      component.breadcrumb.crumbs[0].link,
      '/schools/1?schoolSessionTypeDetails=true'
    );
    assert.strictEqual(component.breadcrumb.crumbs[1].text, 'Visualizations');
    assert.strictEqual(component.breadcrumb.crumbs[2].text, 'Session Types');
    assert.strictEqual(component.breadcrumb.crumbs[3].text, 'session type 0');
    assert.strictEqual(component.breadcrumb.crumbs[4].text, 'Vocabularies');
    assert.strictEqual(component.breadcrumb.crumbs[4].link, '/data/sessiontype/1/vocabularies');
    assert.strictEqual(component.breadcrumb.crumbs[5].text, 'Vocabulary 1');
    assert.dom('svg').exists({ count: 1 });
    await waitFor('.loaded');
    await waitFor('svg .slice');
    assert.strictEqual(component.termsChart.chart.slices.length, 5);
    assert.strictEqual(component.termsChart.chart.labels.length, 5);
    assert.strictEqual(component.termsChart.chart.labels[0].text, 'term 2');
    assert.strictEqual(
      component.termsChart.chart.descriptions[0].text,
      'The term "term 2" from the "Vocabulary 1" vocabulary is applied to 1 session with session-type "session type 0".'
    );
    assert.strictEqual(component.termsChart.chart.labels[1].text, 'term 4');
    assert.strictEqual(
      component.termsChart.chart.descriptions[1].text,
      'The term "term 4" from the "Vocabulary 1" vocabulary is applied to 1 session with session-type "session type 0".'
    );
    assert.strictEqual(component.termsChart.chart.labels[2].text, 'term 1');
    assert.strictEqual(
      component.termsChart.chart.descriptions[2].text,
      'The term "term 1" from the "Vocabulary 1" vocabulary is applied to 2 sessions with session-type "session type 0".'
    );
    assert.strictEqual(component.termsChart.chart.labels[3].text, 'term 0');
    assert.strictEqual(
      component.termsChart.chart.descriptions[3].text,
      'The term "term 0" from the "Vocabulary 1" vocabulary is applied to 3 sessions with session-type "session type 0".'
    );
    assert.strictEqual(component.termsChart.chart.labels[4].text, 'term 3');
    assert.strictEqual(
      component.termsChart.chart.descriptions[4].text,
      'The term "term 3" from the "Vocabulary 1" vocabulary is applied to 3 sessions with session-type "session type 0".'
    );
  });
});
