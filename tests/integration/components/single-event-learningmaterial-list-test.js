import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { a11yAudit } from 'ember-a11y-testing/test-support';

module(
  'Integration | Component | ilios calendar single event learningmaterial list',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en-us');

    test('it renders', async function (assert) {
      this.set('learningMaterials', [
        {
          title: 'first one',
          mimetype: 'application/pdf',
          absoluteFileUri: 'http://firstlink',
          startDate: new Date(2003, 10, 12),
          endDate: new Date(2003, 10, 18),
        },
        {
          title: 'second one',
          mimetype: 'audio/wav',
          absoluteFileUri: 'http://secondlink',
        },
        {
          title: 'third one',
          endDate: new Date('2013-03-01T01:10:00'),
          isBlanked: true,
        },
      ]);
      await render(
        hbs`<SingleEventLearningmaterialList @learningMaterials={{this.learningMaterials}} />`
      );

      assert
        .dom('li:nth-of-type(1) .single-event-learningmaterial-item-title')
        .hasText('first one');
      assert.dom('li:nth-of-type(1) .fa-file-pdf').exists('LM type icon is present.');
      assert.dom('li:nth-of-type(1) a').hasAttribute('href', 'http://firstlink?inline');
      assert
        .dom('li:nth-of-type(1) a:nth-of-type(1)')
        .hasAttribute('href', 'http://firstlink?inline');
      assert.dom('li:nth-of-type(1) a:nth-of-type(2) .fa-download').exists();
      assert.dom('li:nth-of-type(1) .timed-release-schedule').hasAnyText();
      assert
        .dom('li:nth-of-type(2) .single-event-learningmaterial-item-title')
        .hasText('second one');
      assert.dom('li:nth-of-type(2) .fa-file-audio').exists('LM type icon is present.');
      assert.dom('li:nth-of-type(2) a').hasAttribute('href', 'http://secondlink');
      assert.dom('li:nth-of-type(2) .timed-release-schedule').hasNoText();

      assert
        .dom('li:nth-of-type(3) .single-event-learningmaterial-item-title')
        .hasText('third one');
      assert.dom('li:nth-of-type(3) .timed-release-schedule').hasAnyText();
      await a11yAudit(this.element);
      assert.ok(true, 'no a11y errors found!');
    });

    test('displays `None` when provided no content', async function (assert) {
      assert.expect(2);

      this.set('learningMaterials', []);
      await render(
        hbs`<SingleEventLearningmaterialList @learningMaterials={{this.learningMaterials}} />`
      );

      assert.dom('.no-content').hasText('None');
      await a11yAudit(this.element);
      assert.ok(true, 'no a11y errors found!');
    });
  }
);
