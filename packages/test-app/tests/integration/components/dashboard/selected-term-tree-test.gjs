import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMirage } from 'test-app/tests/test-support/mirage';
import { component } from 'ilios-common/page-objects/components/dashboard/selected-term-tree';
import SelectedTermTree from 'ilios-common/components/dashboard/selected-term-tree';
import noop from 'ilios-common/helpers/noop';
import { array } from '@ember/helper';

module('Integration | Component | dashboard/SelectedTermTree', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const vocabulary = this.server.create('vocabulary');
    const root = this.server.create('term', {
      title: 'top-level term',
      vocabulary,
    });
    this.server.create('term', {
      title: 'sub-term 1',
      parent: root,
      vocabulary,
    });
    const term2 = this.server.create('term', {
      title: 'sub-term 2',
      parent: root,
      vocabulary,
    });
    this.server.create('term', {
      title: 'sub-term 2 sub-sub-term 1',
      parent: term2,
      vocabulary,
    });
    this.rootTerm = await this.owner.lookup('service:store').findRecord('term', root.id);
  });

  test('it renders a tree', async function (assert) {
    this.set('term', this.rootTerm);
    this.set('selectedTermIds', ['4']);
    await render(
      <template>
        <SelectedTermTree
          @term={{this.term}}
          @selectedTermIds={{this.selectedTermIds}}
          @add={{(noop)}}
          @remove={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(component.checkboxes.length, 4);
    assert.strictEqual(component.children[0].children.length, 0);
    assert.strictEqual(component.children[1].children.length, 1);
    assert.strictEqual(component.checkboxes[0].text, 'top-level term');
    assert.notOk(component.checkboxes[0].isChecked);
    assert.strictEqual(component.checkboxes[1].text, 'sub-term 1');
    assert.notOk(component.checkboxes[1].isChecked);
    assert.strictEqual(component.checkboxes[2].text, 'sub-term 2');
    assert.notOk(component.checkboxes[2].isChecked);
    assert.strictEqual(component.checkboxes[3].text, 'sub-term 2 sub-sub-term 1');
    assert.ok(component.checkboxes[3].isChecked);
    assert.strictEqual(component.children.length, 2);
  });

  test('clicking unchecked checkbox fires add', async function (assert) {
    this.set('term', this.rootTerm);
    this.set('add', (id) => {
      assert.step('add called');
      assert.strictEqual(id, '1');
    });
    await render(
      <template>
        <SelectedTermTree
          @term={{this.term}}
          @selectedTermIds={{(array)}}
          @add={{this.add}}
          @remove={{(noop)}}
        />
      </template>,
    );
    await component.checkboxes[0].click();
    assert.verifySteps(['add called']);
  });

  test('clicking checked checkbox fires add', async function (assert) {
    this.set('term', this.rootTerm);
    this.set('selectedTermIds', ['1']);
    this.set('remove', (id) => {
      assert.step('remove called');
      assert.strictEqual(id, '1');
    });
    await render(
      <template>
        <SelectedTermTree
          @term={{this.term}}
          @selectedTermIds={{this.selectedTermIds}}
          @add={{(noop)}}
          @remove={{this.remove}}
        />
      </template>,
    );
    await component.checkboxes[0].click();
    assert.verifySteps(['remove called']);
  });
});
