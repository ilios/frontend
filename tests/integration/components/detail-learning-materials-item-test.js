import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { component } from 'ilios-common/page-objects/components/detail-learning-materials-item';

module('Integration | Component | detail-learning-materials-item', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const status = this.server.createList('learning-material-status', 3);
    const roles = this.server.createList('learning-material-user-role', 3);
    const user = this.server.create('user');
    const meshDescriptors = this.server.createList('mesh-descriptor', 2);
    const learningMaterial = this.server.create('learning-material', {
      title: 'test title',
      citation: 'some text',
      owningUser: user,
      status: status[1],
      userRole: roles[0],
    });
    const clm = this.server.create('course-learning-material', {
      learningMaterial,
      required: true,
      notes: 'notes',
      meshDescriptors,
    });
    this.lm = await this.owner
      .lookup('service:store')
      .findRecord('course-learning-material', clm.id);
  });

  test('it renders', async function (assert) {
    this.set('lm', this.lm);
    await render(hbs`<DetailLearningMaterialsItem
      @editable={{true}}
      @lm={{this.lm}}
      @setManagedMaterial={{(noop)}}
      />`);
    assert.ok(component.typeIcon.isCitation);
    assert.strictEqual(component.title, 'test title');
    assert.strictEqual(component.userNameInfo.fullName, '0 guy M. Mc0son');
    assert.strictEqual(component.required, 'Yes');
    assert.strictEqual(component.notes, 'Yes');
    assert.strictEqual(component.mesh, 'descriptor 0 descriptor 1');
    assert.strictEqual(component.status, 'status 1');
    assert.ok(component.isNotePublic);
    assert.ok(component.actions.edit.isVisible);
    assert.ok(component.actions.remove.isVisible);
  });

  test('read-only', async function (assert) {
    this.set('lm', this.lm);
    await render(hbs`<DetailLearningMaterialsItem
      @editable={{false}}
      @lm={{this.lm}}
      @setManagedMaterial={{(noop)}}
      />`);
    assert.ok(component.typeIcon.isCitation);
    assert.strictEqual(component.title, 'test title');
    assert.strictEqual(component.userNameInfo.fullName, '0 guy M. Mc0son');
    assert.strictEqual(component.required, 'Yes');
    assert.strictEqual(component.notes, 'Yes');
    assert.strictEqual(component.mesh, 'descriptor 0 descriptor 1');
    assert.strictEqual(component.status, 'status 1');
    assert.ok(component.isNotePublic);
    assert.notOk(component.actions.edit.isVisible);
    assert.notOk(component.actions.remove.isVisible);
  });

  test('click to delete and cancel', async function (assert) {
    assert.expect(2);
    this.set('lm', this.lm);
    this.set('remove', { perform() {} });
    await render(hbs`<DetailLearningMaterialsItem
      @editable={{true}}
      @lm={{this.lm}}
      @setManagedMaterial={{(noop)}}
      @remove={{this.remove}}
      />`);
    assert.notOk(component.confirmRemoval.isVisible);
    await component.actions.remove.click();
    assert.ok(component.confirmRemoval.isVisible);
    await component.confirmRemoval.cancel();
  });

  test('click to delete and confirm', async function (assert) {
    assert.expect(3);
    const lm = this.lm;
    this.set('lm', this.lm);
    this.set('remove', {
      perform(deleteLm) {
        assert.strictEqual(lm, deleteLm);
      },
    });
    await render(hbs`<DetailLearningMaterialsItem
      @editable={{true}}
      @lm={{this.lm}}
      @setManagedMaterial={{(noop)}}
      @remove={{this.remove}}
      />`);
    assert.notOk(component.confirmRemoval.isVisible);
    await component.actions.remove.click();
    assert.ok(component.confirmRemoval.isVisible);
    await component.confirmRemoval.confirm();
  });

  test('click to view', async function (assert) {
    assert.expect(1);
    this.set('setManagedMaterial', (lm) => {
      assert.strictEqual(lm, this.lm);
    });
    this.set('lm', this.lm);
    await render(hbs`<DetailLearningMaterialsItem
      @editable={{true}}
      @lm={{this.lm}}
      @setManagedMaterial={{this.setManagedMaterial}}
      />`);
    await component.actions.edit.click();
  });

  test('click to edit', async function (assert) {
    assert.expect(1);
    this.set('setManagedMaterial', (lm) => {
      assert.strictEqual(lm, this.lm);
    });
    this.set('lm', this.lm);
    await render(hbs`<DetailLearningMaterialsItem
      @editable={{true}}
      @lm={{this.lm}}
      @setManagedMaterial={{this.setManagedMaterial}}
      />`);
    await component.actions.edit.click();
  });
});
