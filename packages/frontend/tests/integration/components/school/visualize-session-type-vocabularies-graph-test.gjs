import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render, waitFor } from '@ember/test-helpers';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import { component } from 'frontend/tests/pages/components/school/visualize-session-type-vocabularies-graph';
import VisualizeSessionTypeVocabulariesGraph from 'frontend/components/school/visualize-session-type-vocabularies-graph';

module(
  'Integration | Component | school/visualize-session-type-vocabularies-graph',
  function (hooks) {
    setupRenderingTest(hooks);
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
        sessions: [sessions[1], sessions[2], sessions[3]],
      });
      this.server.create('term', {
        vocabulary: vocabularies[1],
        sessions: [sessions[3]],
      });
      this.server.create('term', {
        vocabulary: vocabularies[1],
        sessions: [sessions[3], sessions[4]],
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
        <template>
          <VisualizeSessionTypeVocabulariesGraph
            @sessionType={{this.sessionType}}
            @showDataTable={{true}}
          />
        </template>,
      );

      await waitFor('.loaded');
      await waitFor('svg .slice');
      assert.strictEqual(component.chart.slices.length, 2);
      assert.strictEqual(component.chart.labels.length, 2);
      assert.strictEqual(component.chart.descriptions.length, 2);
      assert.ok(component.chart.labels[0].text.startsWith('Vocabulary 1'));
      assert.strictEqual(
        component.chart.descriptions[0].text,
        '1 term from the "Vocabulary 1" vocabulary is applied to 1 session with session-type "session type 0".',
      );
      assert.ok(component.chart.labels[1].text.startsWith('Vocabulary 2'));
      assert.strictEqual(
        component.chart.descriptions[1].text,
        '3 terms from the "Vocabulary 2" vocabulary are applied to 4 sessions with session-type "session type 0".',
      );
      assert.ok(component.dataTable.actions.download.isVisible);
      assert.strictEqual(component.dataTable.rows.length, 2);
      assert.strictEqual(component.dataTable.rows[0].vocabulary.text, 'Vocabulary 1');
      assert.strictEqual(
        component.dataTable.rows[0].vocabulary.url,
        '/data/sessiontype/1/vocabulary/1',
      );
      assert.strictEqual(component.dataTable.rows[0].termsCount, '1');
      assert.strictEqual(component.dataTable.rows[0].sessionsCount, '1');
      assert.strictEqual(component.dataTable.rows[1].vocabulary.text, 'Vocabulary 2');
      assert.strictEqual(
        component.dataTable.rows[1].vocabulary.url,
        '/data/sessiontype/1/vocabulary/2',
      );
      assert.strictEqual(component.dataTable.rows[1].termsCount, '3');
      assert.strictEqual(component.dataTable.rows[1].sessionsCount, '4');
    });

    test('sort data-table by vocabulary title', async function (assert) {
      this.set('sessionType', this.sessionType);
      await render(
        <template>
          <VisualizeSessionTypeVocabulariesGraph
            @sessionType={{this.sessionType}}
            @showDataTable={{true}}
          />
        </template>,
      );

      assert.strictEqual(component.dataTable.rows[0].vocabulary.text, 'Vocabulary 1');
      assert.strictEqual(component.dataTable.rows[1].vocabulary.text, 'Vocabulary 2');
      await component.dataTable.header.vocabulary.toggle();
      assert.strictEqual(component.dataTable.rows[0].vocabulary.text, 'Vocabulary 2');
      assert.strictEqual(component.dataTable.rows[1].vocabulary.text, 'Vocabulary 1');
      await component.dataTable.header.vocabulary.toggle();
      assert.strictEqual(component.dataTable.rows[0].vocabulary.text, 'Vocabulary 1');
      assert.strictEqual(component.dataTable.rows[1].vocabulary.text, 'Vocabulary 2');
    });

    test('sort data-table by terms count', async function (assert) {
      this.set('sessionType', this.sessionType);
      await render(
        <template>
          <VisualizeSessionTypeVocabulariesGraph
            @sessionType={{this.sessionType}}
            @showDataTable={{true}}
          />
        </template>,
      );

      assert.strictEqual(component.dataTable.rows[0].termsCount, '1');
      assert.strictEqual(component.dataTable.rows[1].termsCount, '3');
      await component.dataTable.header.termsCount.toggle();
      assert.strictEqual(component.dataTable.rows[0].termsCount, '1');
      assert.strictEqual(component.dataTable.rows[1].termsCount, '3');
      await component.dataTable.header.termsCount.toggle();
      assert.strictEqual(component.dataTable.rows[0].termsCount, '3');
      assert.strictEqual(component.dataTable.rows[1].termsCount, '1');
      await component.dataTable.header.termsCount.toggle();
      assert.strictEqual(component.dataTable.rows[0].termsCount, '1');
      assert.strictEqual(component.dataTable.rows[1].termsCount, '3');
    });

    test('sort data-table by sessions count', async function (assert) {
      this.set('sessionType', this.sessionType);
      await render(
        <template>
          <VisualizeSessionTypeVocabulariesGraph
            @sessionType={{this.sessionType}}
            @showDataTable={{true}}
          />
        </template>,
      );

      assert.strictEqual(component.dataTable.rows[0].sessionsCount, '1');
      assert.strictEqual(component.dataTable.rows[1].sessionsCount, '4');
      await component.dataTable.header.sessionsCount.toggle();
      assert.strictEqual(component.dataTable.rows[0].sessionsCount, '1');
      assert.strictEqual(component.dataTable.rows[1].sessionsCount, '4');
      await component.dataTable.header.sessionsCount.toggle();
      assert.strictEqual(component.dataTable.rows[0].sessionsCount, '4');
      assert.strictEqual(component.dataTable.rows[1].sessionsCount, '1');
      await component.dataTable.header.sessionsCount.toggle();
      assert.strictEqual(component.dataTable.rows[0].sessionsCount, '1');
      assert.strictEqual(component.dataTable.rows[1].sessionsCount, '4');
    });
  },
);
