import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { component } from 'frontend/tests/pages/components/school/vocabulary-terms-list-item';
import { setupMSW } from 'frontend/tests/msw';
import VocabularyTermsListItem from 'frontend/components/school/vocabulary-terms-list-item';
import noop from 'frontend/helpers/noop';
import noopTask from 'frontend/helpers/noop-task';

module('Integration | Component | school/vocabulary-terms-list-item', function (hooks) {
  setupRenderingTest(hooks);
  setupMSW(hooks);

  hooks.beforeEach(async function () {
    const vocabulary = await this.server.create('vocabulary');
    const term = await this.server.create('term', {
      vocabulary,
      active: true,
    });

    const store = this.owner.lookup('service:store');
    this.termModel = await store.findRecord('term', term.id);

    this.set('term', this.termModel);
  });

  test('it renders', async function (assert) {
    await render(
      <template>
        <VocabularyTermsListItem
          @term={{this.term}}
          @manageTerm={{(noop)}}
          @createTerm={{(noop)}}
          @deleteTerm={{(noopTask)}}
        />
      </template>,
    );

    assert.strictEqual(component.title, 'term 0');
    assert.notOk(component.isLabeledAsInactive);
  });

  test('inactive term', async function (assert) {
    const vocabulary = await this.server.create('vocabulary');
    const term = await this.server.create('term', {
      vocabulary,
      active: false,
    });

    const store = this.owner.lookup('service:store');
    const termModel = await store.findRecord('term', term.id);

    await render(
      <template>
        <VocabularyTermsListItem
          @term={{termModel}}
          @manageTerm={{(noop)}}
          @createTerm={{(noop)}}
          @deleteTerm={{(noopTask)}}
        />
      </template>,
    );

    assert.strictEqual(component.title, 'term 1');
    assert.ok(component.isLabeledAsInactive);
  });

  test('read-only list item unclickable', async function (assert) {
    const term = await this.server.create('term', { vocabulary: this.vocabulary });

    const store = this.owner.lookup('service:store');
    const termModel = await store.findRecord('term', term.id);

    this.set('term', [termModel]);

    await render(
      <template>
        <VocabularyTermsListItem
          @term={{this.term}}
          @manageTerm={{(noop)}}
          @createTerm={{(noop)}}
          @deleteTerm={{(noopTask)}}
          @canUpdate={{false}}
        />
      </template>,
    );

    assert.notOk(component.hasEditTermForm);
    await component.click();
    assert.notOk(component.hasEditTermForm);
  });

  test('clicking list item toggles inline edit-term form if permitted', async function (assert) {
    await render(
      <template>
        <VocabularyTermsListItem
          @term={{this.term}}
          @manageTerm={{(noop)}}
          @createTerm={{(noop)}}
          @deleteTerm={{(noopTask)}}
          @canUpdate={{true}}
        />
      </template>,
    );

    assert.notOk(component.hasEditTermForm);
    await component.click();
    assert.ok(component.hasEditTermForm);
    await component.click();
    assert.notOk(component.hasEditTermForm);
  });
});
