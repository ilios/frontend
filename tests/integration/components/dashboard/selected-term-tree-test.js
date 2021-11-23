import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | dashboard/SelectedTermTree', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const vocabulary = this.server.create('vocabulary');
    const term1 = this.server.create('term', {
      title: 'top 1',
      vocabulary,
    });
    const term2 = this.server.create('term', {
      title: 'top 2',
      vocabulary,
    });
    this.server.create('term', {
      title: 'top 2 child 1',
      parent: term2,
      vocabulary,
    });
    const termModel1 = await this.owner.lookup('service:store').find('term', term1.id);
    const termModel2 = await this.owner.lookup('service:store').find('term', term2.id);
    this.topLevelTerms = [termModel1, termModel2];
  });

  test('it renders a tree', async function (assert) {
    this.set('terms', this.topLevelTerms);
    this.set('selectedTermIds', ['3']);
    await render(hbs`<Dashboard::SelectedTermTree
      @terms={{this.terms}}
      @selectedTermIds={{this.selectedTermIds}}
      @add={{(noop)}}
      @remove={{(noop)}}
    />`);
    const topTerms = 'ul:nth-of-type(1) > li';
    const firstTopTerm = `${topTerms}:nth-of-type(1)`;
    const firstTopTermCheckbox = `${firstTopTerm} input`;
    const secondTopTerm = `${topTerms}:nth-of-type(2)`;
    const firstTopTermChildren = `${firstTopTerm} ul > li`;
    const secondTopTermChildren = `${secondTopTerm} ul > li`;
    const secondTopTermFirstChildCheckbox = `${secondTopTermChildren}:nth-of-type(1) input`;

    assert.dom(firstTopTerm).hasText('top 1');
    assert.dom(firstTopTermCheckbox).isNotChecked();
    assert.dom(secondTopTerm).hasText('top 2 top 2 child 1');
    assert.dom(firstTopTermChildren).doesNotExist();
    assert.dom(secondTopTermChildren).hasText('top 2 child 1');
    assert.dom(secondTopTermFirstChildCheckbox).isChecked();
  });

  test('clicking unchecked checkbox fires add', async function (assert) {
    assert.expect(1);
    this.set('terms', this.topLevelTerms);
    this.set('add', (id) => {
      assert.strictEqual(id, '1');
    });
    await render(hbs`<Dashboard::SelectedTermTree
      @terms={{this.terms}}
      @selectedTermIds={{(array)}}
      @add={{this.add}}
      @remove={{(noop)}}
    />`);
    await click('[data-test-target]:nth-of-type(1)');
  });

  test('clicking checked checkbox fires add', async function (assert) {
    assert.expect(1);
    this.set('terms', this.topLevelTerms);
    this.set('selectedTermIds', ['1']);
    this.set('remove', (id) => {
      assert.strictEqual(id, '1');
    });
    await render(hbs`<Dashboard::SelectedTermTree
      @terms={{this.terms}}
      @selectedTermIds={{this.selectedTermIds}}
      @add={{(noop)}}
      @remove={{this.remove}}
    />`);
    await click('[data-test-target]:nth-of-type(1)');
  });
});
