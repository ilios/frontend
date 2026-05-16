import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMSW } from 'ilios-common/msw';
import { component } from 'ilios-common/page-objects/components/detail-learning-materials';
import DetailLearningMaterials from 'ilios-common/components/detail-learning-materials';
import { formatJsonApi } from 'ilios-common/msw/utils/json-api-formatter.js';

module('Integration | Component | detail learning materials', function (hooks) {
  setupRenderingTest(hooks);
  setupMSW(hooks);

  hooks.beforeEach(async function () {
    this.status = await this.server.createList('learning-material-status', 3);
    this.roles = await this.server.createList('learning-material-user-role', 3);
    this.user = await this.server.create('user');
  });

  test('lm table items', async function (assert) {
    const learningMaterial = await this.server.create('learning-material', {
      title: 'test title',
      citation: 'some text',
      owningUser: this.user,
      status: this.status[1],
      userRole: this.roles[0],
    });

    const clm = await this.server.create('course-learning-material', {
      learningMaterial,
      required: true,
      notes: 'notes',
    });

    const course = await this.server.create('course', {
      learningMaterials: [clm],
    });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);

    this.set('subject', courseModel);

    await render(
      <template>
        <DetailLearningMaterials @subject={{this.subject}} @isCourse={{true}} @editable={{true}} />
      </template>,
    );
    assert.strictEqual(component.current.length, 1);
    assert.ok(component.current[0].typeIcon.isCitation);
    assert.strictEqual(component.current[0].title, 'test title');
    assert.strictEqual(component.current[0].userNameInfo.fullName, '0 guy M. Mc0son');
    assert.strictEqual(component.current[0].required, 'Yes');
    assert.strictEqual(component.current[0].notes, 'Yes');
    assert.strictEqual(component.current[0].mesh, 'None');
    assert.strictEqual(component.current[0].status, 'status 1');
    assert.ok(component.current[0].isNotePublic);
    assert.notOk(component.current[0].isTimedRelease);
  });

  test('custom user display name', async function (assert) {
    const user = await this.server.create('user', { displayName: 'Clem Chowder' });

    const learningMaterial = await this.server.create('learning-material', {
      title: 'test title',
      citation: 'some text',
      owningUser: user,
      status: this.status[1],
      userRole: this.roles[0],
    });

    const clm = await this.server.create('course-learning-material', {
      learningMaterial,
      required: true,
      notes: 'notes',
    });

    const course = await this.server.create('course', {
      learningMaterials: [clm],
    });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);

    this.set('subject', courseModel);

    await render(
      <template>
        <DetailLearningMaterials @subject={{this.subject}} @isCourse={{true}} @editable={{true}} />
      </template>,
    );
    assert.strictEqual(component.current[0].userNameInfo.fullName, 'Clem Chowder');
    assert.notOk(component.current[0].userNameInfo.isTooltipVisible);
    await component.current[0].userNameInfo.expandTooltip();
    assert.ok(component.current[0].userNameInfo.isTooltipVisible);
    assert.strictEqual(
      component.current[0].userNameInfo.tooltipContents,
      'Campus name of record: 1 guy M, Mc1son',
    );
    await component.current[0].userNameInfo.closeTooltip();
    assert.notOk(component.current[0].userNameInfo.isTooltipVisible);
  });

  test('sort button visible when lm list has 2+ items and editing is allowed', async function (assert) {
    const learningMaterial = await this.server.create('learning-material', {
      owningUser: this.user,
      status: this.status[1],
      userRole: this.roles[0],
    });

    const learningMaterials = await this.server.createList('course-learning-material', 2, {
      learningMaterial,
    });

    const course = await this.server.create('course', {
      learningMaterials,
    });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    this.set('subject', courseModel);

    await render(
      <template>
        <DetailLearningMaterials @subject={{this.subject}} @isCourse={{true}} @editable={{true}} />
      </template>,
    );

    assert.ok(component.canSort);
  });

  test('sort button not visible when in read-only mode', async function (assert) {
    const learningMaterial = await this.server.create('learning-material', {
      owningUser: this.user,
      status: this.status[1],
      userRole: this.roles[0],
    });

    const learningMaterials = await this.server.createList('course-learning-material', 2, {
      learningMaterial,
    });

    const course = await this.server.create('course', {
      learningMaterials,
    });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    this.set('subject', courseModel);

    await render(
      <template>
        <DetailLearningMaterials @subject={{this.subject}} @isCourse={{true}} @editable={{false}} />
      </template>,
    );

    assert.notOk(component.canSort);
  });

  test('sort button not visible when lm list is empty', async function (assert) {
    const course = await this.server.create('course');
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    this.set('subject', courseModel);

    await render(
      <template>
        <DetailLearningMaterials @subject={{this.subject}} @isCourse={{true}} @editable={{true}} />
      </template>,
    );

    assert.notOk(component.canSort);
  });

  test('sort button not visible when lm list only contains one item', async function (assert) {
    const learningMaterial = await this.server.create('learning-material', {
      owningUser: this.user,
      status: this.status[1],
      userRole: this.roles[0],
    });

    const clm = await this.server.create('course-learning-material', {
      learningMaterial,
      required: true,
      notes: 'notes',
    });

    const course = await this.server.create('course', {
      learningMaterials: [clm],
    });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);

    this.set('subject', courseModel);

    await render(
      <template>
        <DetailLearningMaterials @subject={{this.subject}} @isCourse={{true}} @editable={{true}} />
      </template>,
    );

    assert.notOk(component.canSort);
  });

  test('click sort button, then cancel', async function (assert) {
    const learningMaterial = await this.server.create('learning-material', {
      owningUser: this.user,
      status: this.status[1],
      userRole: this.roles[0],
    });

    const learningMaterials = await this.server.createList('course-learning-material', 2, {
      learningMaterial,
    });

    const course = await this.server.create('course', {
      learningMaterials,
    });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    this.set('subject', courseModel);
    await render(
      <template>
        <DetailLearningMaterials @subject={{this.subject}} @isCourse={{true}} @editable={{true}} />
      </template>,
    );
    assert.ok(component.canSort);
    assert.notOk(component.sortManager.isVisible);
    await component.sort();
    assert.notOk(component.canSort);
    assert.ok(component.sortManager.isVisible);
    await component.sortManager.cancel();
    assert.ok(component.canSort);
    assert.notOk(component.sortManager.isVisible);
  });

  test('click sort button, then save', async function (assert) {
    const learningMaterial = await this.server.create('learning-material', {
      owningUser: this.user,
      status: this.status[1],
      userRole: this.roles[0],
    });

    const learningMaterials = await this.server.createList('course-learning-material', 2, {
      learningMaterial,
    });
    const course = await this.server.create('course', {
      learningMaterials,
    });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    this.set('subject', courseModel);
    this.server.patch('/api/courselearningmaterials/1', () => {
      const cLm = this.server.db.courseLearningMaterial.findFirst((q) => q.where({ id: 1 }));
      assert.step('API called');
      return formatJsonApi(cLm, 'courseLearningMaterial');
    });
    this.server.patch('/api/courselearningmaterials/2', () => {
      const cLm = this.server.db.courseLearningMaterial.findFirst((q) => q.where({ id: 2 }));
      assert.step('API called');
      return formatJsonApi(cLm, 'courseLearningMaterial');
    });

    await render(
      <template>
        <DetailLearningMaterials @subject={{this.subject}} @isCourse={{true}} @editable={{true}} />
      </template>,
    );
    await component.sort();
    await component.sortManager.save();
    assert.verifySteps(['API called', 'API called']);
  });
});
