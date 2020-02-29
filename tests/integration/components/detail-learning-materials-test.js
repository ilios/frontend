import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { component } from 'ilios-common/page-objects/components/learning-materials';

module('Integration | Component | detail learning materials', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    this.status = this.server.createList('learning-material-status', 3);
    this.roles = this.server.createList('learning-material-user-role', 3);
    this.user = this.server.create('user');
  });

  test('lm table items', async function(assert) {
    assert.expect(10);

    const learningMaterial = this.server.create('learning-material', {
      title: 'test title',
      citation: 'some text',
      owningUser: this.user,
      status: this.status[1],
      userRole: this.roles[0],
    });

    const clm = this.server.create('course-learning-material', {
      learningMaterial,
      required: true,
      notes: 'notes',
    });

    const course = this.server.create('course', {
      learningMaterials: [clm]
    });
    const courseModel = await this.owner.lookup('service:store').find('course', course.id);

    this.set('subject', courseModel);

    await render(hbs`<DetailLearningMaterials
      @subject={{this.subject}}
      @isCourse={{true}}
      @isCourse={{true}}
      @editable={{true}}
    />`);
    assert.equal(component.current.length, 1);
    assert.equal(component.current[0].type, 'Citation');
    assert.equal(component.current[0].title, 'test title');
    assert.equal(component.current[0].owner, '0 guy M. Mc0son');
    assert.equal(component.current[0].required, 'Yes');
    assert.equal(component.current[0].notes, 'Yes');
    assert.equal(component.current[0].mesh, 'None');
    assert.equal(component.current[0].status, 'status 1');
    assert.ok(component.current[0].isNotePublic);
    assert.notOk(component.current[0].isTimedRelease);
  });

  test('sort button visible when lm list has 2+ items and editing is allowed', async function(assert) {
    assert.expect(1);

    const learningMaterial = this.server.create('learning-material', {
      owningUser: this.user,
      status: this.status[1],
      userRole: this.roles[0],
    });

    const learningMaterials = this.server.createList('course-learning-material', 2, {
      learningMaterial,
    });

    const course = this.server.create('course', {
      learningMaterials
    });
    const courseModel = await this.owner.lookup('service:store').find('course', course.id);
    this.set('subject', courseModel);

    await render(hbs`<DetailLearningMaterials
      @subject={{this.subject}}
      @isCourse={{true}}
      @editable={{true}}
    />`);

    assert.ok(component.canSort);
  });

  test('sort button not visible when in read-only mode', async function(assert) {
    assert.expect(1);

    const learningMaterial = this.server.create('learning-material', {
      owningUser: this.user,
      status: this.status[1],
      userRole: this.roles[0],
    });

    const learningMaterials = this.server.createList('course-learning-material', 2, {
      learningMaterial,
    });

    const course = this.server.create('course', {
      learningMaterials
    });
    const courseModel = await this.owner.lookup('service:store').find('course', course.id);
    this.set('subject', courseModel);

    await render(hbs`<DetailLearningMaterials
      @subject={{this.subject}}
      @isCourse={{true}}
      @editable={{false}}
    />`);

    assert.notOk(component.canSort);
  });

  test('sort button not visible when lm list is empty', async function(assert) {
    assert.expect(1);

    const course = this.server.create('course');
    const courseModel = await this.owner.lookup('service:store').find('course', course.id);
    this.set('subject', courseModel);

    await render(hbs`<DetailLearningMaterials
      @subject={{this.subject}}
      @isCourse={{true}}
      @editable={{true}}
    />`);

    assert.notOk(component.canSort);
  });

  test('sort button not visible when lm list only contains one item', async function (assert) {
    const learningMaterial = this.server.create('learning-material', {
      owningUser: this.user,
      status: this.status[1],
      userRole: this.roles[0],
    });

    const clm = this.server.create('course-learning-material', {
      learningMaterial,
      required: true,
      notes: 'notes',
    });

    const course = this.server.create('course', {
      learningMaterials: [clm]
    });
    const courseModel = await this.owner.lookup('service:store').find('course', course.id);

    this.set('subject', courseModel);

    await render(hbs`<DetailLearningMaterials
      @subject={{this.subject}}
      @isCourse={{true}}
      @editable={{true}}
    />`);

    assert.notOk(component.canSort);
  });

  test('click sort button, then cancel', async function(assert) {
    assert.expect(6);

    const learningMaterial = this.server.create('learning-material', {
      owningUser: this.user,
      status: this.status[1],
      userRole: this.roles[0],
    });

    const learningMaterials = this.server.createList('course-learning-material', 2, {
      learningMaterial,
    });

    const course = this.server.create('course', {
      learningMaterials
    });
    const courseModel = await this.owner.lookup('service:store').find('course', course.id);
    this.set('subject', courseModel);
    await render(hbs`<DetailLearningMaterials
      @subject={{this.subject}}
      @isCourse={{true}}
      @editable={{true}}
    />`);
    assert.ok(component.canSort);
    assert.notOk(component.sortManager.isVisible);
    await component.sort();
    assert.notOk(component.canSort);
    assert.ok(component.sortManager.isVisible);
    await component.sortManager.cancel();
    assert.ok(component.canSort);
    assert.notOk(component.sortManager.isVisible);
  });

  test('click sort button, then save', async function(assert) {
    assert.expect(2);

    const learningMaterial = this.server.create('learning-material', {
      owningUser: this.user,
      status: this.status[1],
      userRole: this.roles[0],
    });

    const learningMaterials = this.server.createList('course-learning-material', 2, {
      learningMaterial,
    });
    const course = this.server.create('course', {
      learningMaterials
    });
    const courseModel = await this.owner.lookup('service:store').find('course', course.id);
    this.set('subject', courseModel);
    this.server.put('/api/courselearningmaterials/1', () => {
      assert.ok(true);
    });
    this.server.put('/api/courselearningmaterials/2', () => {
      assert.ok(true);
    });

    await render(hbs`<DetailLearningMaterials
      @subject={{this.subject}}
      @isCourse={{true}}
      @editable={{true}}
    />`);
    await component.sort();
    this.server.logging = true;
    await component.sortManager.save();
  });
});
