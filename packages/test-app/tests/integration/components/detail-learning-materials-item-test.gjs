import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMSW } from 'ilios-common/msw';
import { component } from 'ilios-common/page-objects/components/detail-learning-materials-item';
import DetailLearningMaterialsItem from 'ilios-common/components/detail-learning-materials-item';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | detail-learning-materials-item', function (hooks) {
  setupRenderingTest(hooks);
  setupMSW(hooks);

  hooks.beforeEach(async function () {
    const status = await this.server.createList('learning-material-status', 3);
    const roles = await this.server.createList('learning-material-user-role', 3);
    const user = await this.server.create('user');
    const meshDescriptors = await this.server.createList('mesh-descriptor', 2);
    const learningMaterial = await this.server.create('learning-material', {
      title: 'test title',
      citation: 'some text',
      owningUser: user,
      status: status[1],
      userRole: roles[0],
    });
    const clm = await this.server.create('course-learning-material', {
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
    await render(
      <template>
        <DetailLearningMaterialsItem
          @editable={{true}}
          @lm={{this.lm}}
          @setManagedMaterial={{(noop)}}
        />
      </template>,
    );
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
    assert.notOk(component.actions.remove.isDisabled);
  });

  test('read-only', async function (assert) {
    this.set('lm', this.lm);
    await render(
      <template>
        <DetailLearningMaterialsItem
          @editable={{false}}
          @lm={{this.lm}}
          @setManagedMaterial={{(noop)}}
        />
      </template>,
    );
    assert.ok(component.typeIcon.isCitation);
    assert.strictEqual(component.title, 'test title');
    assert.strictEqual(component.userNameInfo.fullName, '0 guy M. Mc0son');
    assert.strictEqual(component.required, 'Yes');
    assert.strictEqual(component.notes, 'Yes');
    assert.strictEqual(component.mesh, 'descriptor 0 descriptor 1');
    assert.strictEqual(component.status, 'status 1');
    assert.ok(component.isNotePublic);
    assert.notOk(component.actions.edit.isVisible, 'edit icon is not visible');
    assert.ok(component.actions.remove.isVisible, 'remove icon is visible');
    assert.ok(component.actions.remove.isDisabled, 'remove icon is disabled');
  });

  test('click to delete and cancel', async function (assert) {
    this.set('lm', this.lm);
    this.set('remove', {
      perform() {
        assert.step('remove.perform called');
      },
    });
    await render(
      <template>
        <DetailLearningMaterialsItem
          @editable={{true}}
          @lm={{this.lm}}
          @setManagedMaterial={{(noop)}}
          @remove={{this.remove}}
        />
      </template>,
    );
    assert.notOk(component.confirmRemoval.isVisible);
    await component.actions.remove.click();
    assert.ok(component.confirmRemoval.isVisible);
    await component.confirmRemoval.cancel();
    assert.verifySteps([]);
  });

  test('click to delete and confirm', async function (assert) {
    const lm = this.lm;
    this.set('lm', this.lm);
    this.set('remove', {
      perform(deleteLm) {
        assert.step('remove.perform called');
        assert.strictEqual(lm, deleteLm);
      },
    });
    await render(
      <template>
        <DetailLearningMaterialsItem
          @editable={{true}}
          @lm={{this.lm}}
          @setManagedMaterial={{(noop)}}
          @remove={{this.remove}}
        />
      </template>,
    );
    assert.notOk(component.confirmRemoval.isVisible);
    await component.actions.remove.click();
    assert.ok(component.confirmRemoval.isVisible);
    await component.confirmRemoval.confirm();
    assert.verifySteps(['remove.perform called']);
  });

  test('click to view', async function (assert) {
    this.set('setManagedMaterial', (lm) => {
      assert.strictEqual(lm, this.lm);
    });
    this.set('lm', this.lm);
    await render(
      <template>
        <DetailLearningMaterialsItem
          @editable={{true}}
          @lm={{this.lm}}
          @setManagedMaterial={{this.setManagedMaterial}}
        />
      </template>,
    );
    await component.actions.edit.click();
  });

  test('click to edit', async function (assert) {
    this.set('setManagedMaterial', (lm) => {
      assert.step('setManagedMaterial called');
      assert.strictEqual(lm, this.lm);
    });
    this.set('lm', this.lm);
    await render(
      <template>
        <DetailLearningMaterialsItem
          @editable={{true}}
          @lm={{this.lm}}
          @setManagedMaterial={{this.setManagedMaterial}}
        />
      </template>,
    );
    await component.actions.edit.click();
    assert.verifySteps(['setManagedMaterial called']);
  });
});
