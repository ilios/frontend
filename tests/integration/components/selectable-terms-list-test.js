import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { component } from 'ilios-common/page-objects/components/selectable-terms-list';

module('Integration | Component | selectable terms list', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const vocabulary = this.server.create('vocabulary');
    const term1 = this.server.create('term', {
      title: 'Alpha',
      active: true,
      vocabulary,
    });
    const term2 = this.server.create('term', {
      title: 'Beta',
      active: true,
      vocabulary,
    });
    const term3 = this.server.create('term', {
      title: 'Gamma',
      active: true,
      vocabulary,
    });
    const term4 = this.server.create('term', {
      title: 'First',
      active: true,
      vocabulary,
      children: [term1, term2],
    });
    const term5 = this.server.create('term', {
      title: 'Second',
      active: true,
      vocabulary,
      children: [term3],
    });
    const root = this.server.create('term', {
      title: 'root',
      active: true,
      vocabulary,
      children: [term4, term5],
    });

    this.rootTerm = await this.owner.lookup('service:store').findRecord('term', root.id);
    this.term1 = await this.owner.lookup('service:store').findRecord('term', term1.id);
    this.term2 = await this.owner.lookup('service:store').findRecord('term', term2.id);
    this.term3 = await this.owner.lookup('service:store').findRecord('term', term3.id);
    this.term4 = await this.owner.lookup('service:store').findRecord('term', term4.id);
    this.term5 = await this.owner.lookup('service:store').findRecord('term', term5.id);
  });

  test('it renders', async function (assert) {
    this.set('selectedTerms', []);
    this.set('term', this.rootTerm);
    await render(hbs`<SelectableTermsList
      @selectedTerms={{this.selectedTerms}}
      @parent={{this.term}}
      @add={{(noop)}}
      @remove={{(noop)}}
    />
`);
    assert.strictEqual(component.items.length, 2);
    assert.strictEqual(component.items[0].title, 'First');
    assert.strictEqual(component.items[1].title, 'Second');
    assert.strictEqual(component.lists.length, 2);
    assert.strictEqual(component.lists[0].items.length, 2);
    assert.strictEqual(component.lists[0].items[0].title, 'Alpha');
    assert.strictEqual(component.lists[0].items[1].title, 'Beta');
    assert.strictEqual(component.lists[1].items.length, 1);
    assert.strictEqual(component.lists[1].items[0].title, 'Gamma');
  });

  test('inactive terms are not rendered', async function (assert) {
    this.term2.set('active', false);
    this.term3.set('active', false);
    this.term5.set('active', false);

    this.set('selectedTerms', []);
    this.set('term', this.rootTerm);
    await render(hbs`<SelectableTermsList
      @selectedTerms={{this.selectedTerms}}
      @parent={{this.term}}
      @add={{(noop)}}
      @remove={{(noop)}}
    />
`);
    assert.strictEqual(component.items.length, 1);
    assert.strictEqual(component.items[0].title, 'First');
    assert.strictEqual(component.lists.length, 1);
    assert.strictEqual(component.lists[0].items.length, 1);
    assert.strictEqual(component.lists[0].items[0].title, 'Alpha');
  });

  test('select/deselect term', async function (assert) {
    assert.expect(5);
    this.set('selectedTerms', []);
    this.set('term', this.rootTerm);
    this.set('add', (term) => {
      assert.strictEqual(term, this.term4);
      this.set('selectedTerms', [...this.selectedTerms, term]);
    });
    this.set('remove', (term) => {
      assert.strictEqual(term, this.term4);
      this.set(
        'selectedTerms',
        this.selectedTerms.filter((t) => t !== term)
      );
    });
    await render(hbs`<SelectableTermsList
      @selectedTerms={{this.selectedTerms}}
      @parent={{this.term}}
      @add={{this.add}}
      @remove={{this.remove}}
    />
`);
    assert.notOk(component.items[0].isSelected);
    await component.items[0].click();
    assert.ok(component.items[0].isSelected);
    await component.items[0].click();
    assert.notOk(component.items[0].isSelected);
  });

  test('filter terms', async function (assert) {
    this.set('selectedTerms', []);
    this.set('term', this.rootTerm);
    this.set('termFilter', 'Gamma');
    await render(hbs`<SelectableTermsList
      @selectedTerms={{this.selectedTerms}}
      @parent={{this.term}}
      @add={{(noop)}}
      @remove={{(noop)}}
      @termFilter={{this.termFilter}}
    />
`);
    assert.strictEqual(component.items.length, 1);
    assert.strictEqual(component.items[0].title, 'Second');
    assert.strictEqual(component.lists[0].items.length, 1);
    assert.strictEqual(component.lists[0].items[0].title, 'Gamma');
  });

  test('filter terms - partial match', async function (assert) {
    this.set('selectedTerms', []);
    this.set('term', this.rootTerm);
    this.set('termFilter', 'amma');
    await render(hbs`<SelectableTermsList
      @selectedTerms={{this.selectedTerms}}
      @parent={{this.term}}
      @add={{(noop)}}
      @remove={{(noop)}}
      @termFilter={{this.termFilter}}
    />
`);
    assert.strictEqual(component.items.length, 1);
    assert.strictEqual(component.items[0].title, 'Second');
    assert.strictEqual(component.lists[0].items.length, 1);
    assert.strictEqual(component.lists[0].items[0].title, 'Gamma');
  });
});
