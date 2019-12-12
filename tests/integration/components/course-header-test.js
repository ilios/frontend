import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { component } from 'ilios-common/page-objects/components/course-header';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | course-header', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    this.store = this.owner.lookup('service:store');
  });

  test('it renders and is accessible', async function (assert) {
    const course = this.server.create('course', {
      published: true
    });
    const courseModel = await this.store.find('course', course.id);
    this.set('course', courseModel);
    await render(hbs`<CourseHeader @course={{course}} @editable={{true}} />`);
    await a11yAudit(this.element);
    assert.ok(true, 'not a11y violations');
  });

  test('it renders and is accessible when not editable', async function (assert) {
    const course = this.server.create('course', {
      published: true
    });
    const courseModel = await this.store.find('course', course.id);
    this.set('course', courseModel);
    await render(hbs`<CourseHeader @course={{course}} @editable={{false}} />`);
    await a11yAudit(this.element);
    assert.ok(true, 'not a11y violations');
  });

  test('course title validation fails if value is empty', async function(assert) {
    const course = this.server.create('course');
    const courseModel = await this.store.find('course', course.id);
    this.set('course', courseModel);
    await render(hbs`<CourseHeader @course={{course}} @editable={{true}} />`);

    assert.ok(component.title.isVisible);
    assert.equal(component.title.value, 'course 0');
    await component.title.edit();
    assert.notOk(component.title.hasError);
    await component.title.set('');
    await component.title.save();
    assert.ok(component.title.hasError);
  });

  test('course title validation fails if value is too short', async function(assert) {
    const course = this.server.create('course');
    const courseModel = await this.store.find('course', course.id);
    this.set('course', courseModel);
    await render(hbs`<CourseHeader @course={{course}} @editable={{true}} />`);

    assert.ok(component.title.isVisible);
    assert.equal(component.title.value, 'course 0');
    await component.title.edit();
    assert.notOk(component.title.hasError);
    await component.title.set('a');
    await component.title.save();
    assert.ok(component.title.hasError);
  });

  test('course title validation fails if value is too long', async function (assert) {
    const course = this.server.create('course');
    const courseModel = await this.store.find('course', course.id);
    this.set('course', courseModel);
    await render(hbs`<CourseHeader @course={{course}} @editable={{true}} />`);

    assert.ok(component.title.isVisible);
    assert.equal(component.title.value, 'course 0');
    await component.title.edit();
    assert.notOk(component.title.hasError);
    await component.title.set('tooLong'.repeat(50));
    await component.title.save();
    assert.ok(component.title.hasError);
  });

  test('cancel course title changes', async function(assert) {
    const course = this.server.create('course');
    const courseModel = await this.store.find('course', course.id);
    this.set('course', courseModel);
    await render(hbs`<CourseHeader @course={{course}} @editable={{true}} />`);

    assert.ok(component.title.isVisible);
    assert.equal(component.title.value, 'course 0');
    await component.title.edit();
    await component.title.set('blue fish');
    await component.title.cancel();
    assert.equal(component.title.value, 'course 0');
  });
});
