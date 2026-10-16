import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { component } from 'frontend/tests/pages/components/school/vocabulary-terms-list';
import { setupMSW } from 'frontend/tests/msw';
import VocabularyTermsList from 'frontend/components/school/vocabulary-terms-list';
import noop from 'frontend/helpers/noop';
import noopTask from 'frontend/helpers/noop-task';

module('Integration | Component | school/vocabulary-terms-list', function (hooks) {
  setupRenderingTest(hooks);
  setupMSW(hooks);

  test('it renders', async function (assert) {
    const vocabulary = await this.server.create('vocabulary');
    const term1 = await this.server.create('term', { vocabulary, title: 'Anatomy', active: true });
    const term2 = await this.server.create('term', { vocabulary, title: 'Biology', active: false });
    await this.server.create('term', { vocabulary, parent: term1, title: 'Brain' });
    await this.server.create('term', { vocabulary, parent: term2, title: 'Biochemistry' });

    const store = this.owner.lookup('service:store');
    const term1Model = await store.findRecord('term', term1.id);
    const term2Model = await store.findRecord('term', term2.id);

    this.set('terms', [term1Model, term2Model]);

    await render(
      <template>
        <VocabularyTermsList
          @terms={{this.terms}}
          @manageTerm={{(noop)}}
          @createTerm={{(noop)}}
          @deleteTerm={{(noopTask)}}
        />
      </template>,
    );

    assert.strictEqual(component.items.length, 2);
    assert.strictEqual(component.items[0].title, 'Anatomy');
    assert.notOk(component.items[0].isLabeledAsInactive);
    assert.strictEqual(component.nestedLists[0].items[0].title, 'Brain');
    assert.strictEqual(component.items[1].title, 'Biology');
    assert.ok(component.items[1].isLabeledAsInactive);
    assert.strictEqual(component.nestedLists[1].items[0].title, 'Biochemistry');
  });

  test('terms are sorted alphabetically', async function (assert) {
    const vocabulary = await this.server.create('vocabulary');
    const term1 = await this.server.create('term', { vocabulary, title: 'Zebra' });
    const term2 = await this.server.create('term', { vocabulary, title: 'Apple' });

    const store = this.owner.lookup('service:store');
    const t1 = await store.findRecord('term', term1.id);
    const t2 = await store.findRecord('term', term2.id);

    this.set('terms', [t1, t2]);

    await render(
      <template>
        <VocabularyTermsList
          @terms={{this.terms}}
          @manageTerm={{(noop)}}
          @createTerm={{(noop)}}
          @deleteTerm={{(noopTask)}}
        />
      </template>,
    );

    assert.strictEqual(component.items[0].title, 'Apple');
    assert.strictEqual(component.items[1].title, 'Zebra');
  });

  test('clicking list item does nothing if not permitted to update', async function (assert) {
    const vocabulary = await this.server.create('vocabulary');
    const term = await this.server.create('term', { vocabulary, title: 'Root' });

    const store = this.owner.lookup('service:store');
    const termModel = await store.findRecord('term', term.id);

    this.set('terms', [termModel]);

    await render(
      <template>
        <VocabularyTermsList
          @terms={{this.terms}}
          @manageTerm={{(noop)}}
          @createTerm={{(noop)}}
          @deleteTerm={{(noopTask)}}
          @canUpdate={{false}}
        />
      </template>,
    );

    assert.notOk(component.items[0].hasEditTermForm);
    await component.items[0].click();
    assert.notOk(component.items[0].hasEditTermForm);
  });

  test('clicking list item toggles inline edit-term form if @canUpdate', async function (assert) {
    const vocabulary = await this.server.create('vocabulary');
    const term = await this.server.create('term', { vocabulary, title: 'Root' });

    const store = this.owner.lookup('service:store');
    const termModel = await store.findRecord('term', term.id);

    this.set('terms', [termModel]);

    await render(
      <template>
        <VocabularyTermsList
          @terms={{this.terms}}
          @manageTerm={{(noop)}}
          @createTerm={{(noop)}}
          @deleteTerm={{(noopTask)}}
          @canUpdate={{true}}
        />
      </template>,
    );

    assert.notOk(component.items[0].hasEditTermForm);
    await component.items[0].click();
    assert.ok(component.items[0].hasEditTermForm);
    await component.items[0].click();
    assert.notOk(component.items[0].hasEditTermForm);
  });
});
