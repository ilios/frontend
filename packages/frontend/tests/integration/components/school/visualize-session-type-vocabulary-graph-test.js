import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render, waitFor } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import { component } from 'frontend/tests/pages/components/school/visualize-session-type-vocabulary-graph';

module(
  'Integration | Component | school/visualize-session-type-vocabulary-graph',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);

    hooks.beforeEach(async function () {
      const sessionType = this.server.create('session-type');
      const course = this.server.create('course');
      const sessions = this.server.createList('session', 5, { course, sessionType });
      const vocabulary = this.server.create('vocabulary');
      const rootTerm = this.server.create('term', { vocabulary });
      this.server.create('term', {
        vocabulary,
        sessions: [sessions[0], sessions[1]],
        parent: rootTerm,
      });
      this.server.create('term', {
        vocabulary,
        sessions: [sessions[1], sessions[2], sessions[3], sessions[4]],
        parent: rootTerm,
      });
      this.server.create('term', {
        vocabulary,
        sessions: [sessions[2]],
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
        hbs`<School::VisualizeSessionTypeVocabularyGraph
  @sessionType={{this.sessionType}}
  @vocabulary={{this.vocabulary}}
  @showDataTable={{true}}
/>`,
      );
      await waitFor('.loaded');
      await waitFor('.chart');
      assert.strictEqual(component.chart.slices.length, 3);
      assert.strictEqual(component.chart.labels.length, 3);
      assert.strictEqual(component.chart.descriptions.length, 3);
      assert.ok(component.chart.labels[0].text.startsWith('term 3'));
      assert.strictEqual(
        component.chart.descriptions[0].text,
        'The term "term 3" from the "session type 0" vocabulary is applied to 1 session with session-type "session type 0".',
      );
      assert.ok(component.chart.labels[1].text.startsWith('term 0 > term 1'));
      assert.strictEqual(
        component.chart.descriptions[1].text,
        'The term "term 0 > term 1" from the "session type 0" vocabulary is applied to 2 sessions with session-type "session type 0".',
      );
      assert.ok(component.chart.labels[2].text.startsWith('term 0 > term 2'));
      assert.strictEqual(
        component.chart.descriptions[2].text,
        'The term "term 0 > term 2" from the "session type 0" vocabulary is applied to 4 sessions with session-type "session type 0".',
      );
      assert.ok(component.dataTable.actions.download.isVisible);
      assert.strictEqual(component.dataTable.rows.length, 3);
      assert.strictEqual(component.dataTable.rows[0].term, 'term 0 > term 1');
      assert.strictEqual(component.dataTable.rows[0].sessionsCount, '2');
      assert.strictEqual(component.dataTable.rows[1].term, 'term 0 > term 2');
      assert.strictEqual(component.dataTable.rows[1].sessionsCount, '4');
      assert.strictEqual(component.dataTable.rows[2].term, 'term 3');
      assert.strictEqual(component.dataTable.rows[2].sessionsCount, '1');
    });

    test('sort data-table by term title', async function (assert) {
      this.set('sessionType', this.sessionType);
      this.set('vocabulary', this.vocabulary);
      await render(
        hbs`<School::VisualizeSessionTypeVocabularyGraph
  @sessionType={{this.sessionType}}
  @vocabulary={{this.vocabulary}}
  @showDataTable={{true}}
/>`,
      );

      assert.strictEqual(component.dataTable.rows[0].term, 'term 0 > term 1');
      assert.strictEqual(component.dataTable.rows[1].term, 'term 0 > term 2');
      assert.strictEqual(component.dataTable.rows[2].term, 'term 3');
      await component.dataTable.header.term.toggle();
      assert.strictEqual(component.dataTable.rows[0].term, 'term 3');
      assert.strictEqual(component.dataTable.rows[1].term, 'term 0 > term 2');
      assert.strictEqual(component.dataTable.rows[2].term, 'term 0 > term 1');
      await component.dataTable.header.term.toggle();
      assert.strictEqual(component.dataTable.rows[0].term, 'term 0 > term 1');
      assert.strictEqual(component.dataTable.rows[1].term, 'term 0 > term 2');
      assert.strictEqual(component.dataTable.rows[2].term, 'term 3');
    });

    test('sort data-table by sessions count', async function (assert) {
      this.set('sessionType', this.sessionType);
      this.set('vocabulary', this.vocabulary);
      await render(
        hbs`<School::VisualizeSessionTypeVocabularyGraph
  @sessionType={{this.sessionType}}
  @vocabulary={{this.vocabulary}}
  @showDataTable={{true}}
/>`,
      );

      assert.strictEqual(component.dataTable.rows[0].sessionsCount, '2');
      assert.strictEqual(component.dataTable.rows[1].sessionsCount, '4');
      assert.strictEqual(component.dataTable.rows[2].sessionsCount, '1');
      await component.dataTable.header.sessionsCount.toggle();
      assert.strictEqual(component.dataTable.rows[0].sessionsCount, '1');
      assert.strictEqual(component.dataTable.rows[1].sessionsCount, '2');
      assert.strictEqual(component.dataTable.rows[2].sessionsCount, '4');
      await component.dataTable.header.sessionsCount.toggle();
      assert.strictEqual(component.dataTable.rows[0].sessionsCount, '4');
      assert.strictEqual(component.dataTable.rows[1].sessionsCount, '2');
      assert.strictEqual(component.dataTable.rows[2].sessionsCount, '1');
    });
  },
);
