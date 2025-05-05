import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render, waitFor } from '@ember/test-helpers';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import { component } from 'frontend/tests/pages/components/school/session-type-visualize-vocabularies';
import SessionTypeVisualizeVocabularies from 'frontend/components/school/session-type-visualize-vocabularies';

module('Integration | Component | school/session-type-visualize-vocabularies', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const school = this.server.create('school');
    const course = this.server.create('course', { school });
    const sessionType = this.server.create('session-type', { school });
    const vocabularies = this.server.createList('vocabulary', 2, { school });
    const termsVocab1 = this.server.createList('term', 5, {
      vocabulary: vocabularies[0],
    });
    const termVocab2 = this.server.create('term', {
      vocabulary: vocabularies[1],
    });
    this.server.createList('session', 10, { course, sessionType, terms: termsVocab1 });
    this.server.create('session', { course, sessionType, terms: [termVocab2] });

    this.sessionType = await this.owner
      .lookup('service:store')
      .findRecord('session-type', sessionType.id);
  });

  test('it renders', async function (assert) {
    this.set('model', this.sessionType);

    await render(<template><SessionTypeVisualizeVocabularies @model={{this.model}} /></template>);

    assert.strictEqual(component.primaryTitle, 'Vocabularies by Session Type');
    assert.strictEqual(component.secondaryTitle, 'session type 0');
    assert.strictEqual(component.breadcrumb.crumbs.length, 5);
    assert.strictEqual(component.breadcrumb.crumbs[0].text, 'school 0');
    assert.strictEqual(
      component.breadcrumb.crumbs[0].link,
      '/schools/1?schoolSessionTypeDetails=true',
    );
    assert.strictEqual(component.breadcrumb.crumbs[1].text, 'Visualizations');
    assert.strictEqual(component.breadcrumb.crumbs[2].text, 'Session Types');
    assert.strictEqual(component.breadcrumb.crumbs[3].text, 'session type 0');
    assert.strictEqual(component.breadcrumb.crumbs[4].text, 'Vocabularies');

    await waitFor('.loaded');
    await waitFor('svg .slice');
    assert.strictEqual(component.vocabulariesChart.chart.slices.length, 2);
    assert.strictEqual(component.vocabulariesChart.chart.labels.length, 2);
    assert.ok(component.vocabulariesChart.chart.labels[0].text.startsWith('Vocabulary 2'));
    assert.strictEqual(
      component.vocabulariesChart.chart.descriptions[0].text,
      '1 term from the "Vocabulary 2" vocabulary is applied to 1 session with session-type "session type 0".',
    );
    assert.ok(component.vocabulariesChart.chart.labels[1].text.startsWith('Vocabulary 1'));
    assert.strictEqual(
      component.vocabulariesChart.chart.descriptions[1].text,
      '5 terms from the "Vocabulary 1" vocabulary are applied to 10 sessions with session-type "session type 0".',
    );
  });
});
