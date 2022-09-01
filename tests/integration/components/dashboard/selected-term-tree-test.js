import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { component } from 'ilios-common/page-objects/components/dashboard/selected-term-tree';

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
    const termModel1 = await this.owner.lookup('service:store').findRecord('term', term1.id);
    const termModel2 = await this.owner.lookup('service:store').findRecord('term', term2.id);
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
    assert.strictEqual(component.checkboxes.length, 3);
    assert.strictEqual(component.checkboxes[0].text, 'top 1');
    assert.notOk(component.checkboxes[0].isChecked);
    assert.strictEqual(component.checkboxes[1].text, 'top 2');
    assert.notOk(component.checkboxes[1].isChecked);
    assert.strictEqual(component.checkboxes[2].text, 'top 2 child 1');
    assert.ok(component.checkboxes[2].isChecked);
    assert.strictEqual(component.children.length, 1);
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
    await component.checkboxes[0].click();
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
    await component.checkboxes[0].click();
  });
});
