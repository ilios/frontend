import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { a11yAudit } from 'ember-a11y-testing/test-support';
import { component } from 'ilios-common/page-objects/components/course/header';
import { setupMirage } from 'test-app/tests/test-support/mirage';
import Header from 'ilios-common/components/course/header';

module('Integration | Component | course/header', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    this.store = this.owner.lookup('service:store');
  });

  test('it renders and is accessible', async function (assert) {
    const course = this.server.create('course', {
      published: true,
    });
    const courseModel = await this.store.findRecord('course', course.id);
    this.set('course', courseModel);
    await render(<template><Header @course={{this.course}} @editable={{true}} /></template>);
    await a11yAudit(this.element);
    assert.ok(true, 'not a11y violations');
  });

  test('it renders and is accessible when not editable', async function (assert) {
    const course = this.server.create('course', {
      published: true,
    });
    const courseModel = await this.store.findRecord('course', course.id);
    this.set('course', courseModel);
    await render(<template><Header @course={{this.course}} @editable={{false}} /></template>);
    await a11yAudit(this.element);
    assert.ok(true, 'not a11y violations');
  });

  test('course title validation fails if value is empty', async function (assert) {
    const course = this.server.create('course');
    const courseModel = await this.store.findRecord('course', course.id);
    this.set('course', courseModel);
    await render(<template><Header @course={{this.course}} @editable={{true}} /></template>);

    assert.ok(component.title.isVisible);
    assert.strictEqual(component.title.value, 'course 0');
    await component.title.edit();
    assert.notOk(component.title.hasError);
    await component.title.set('');
    await component.title.save();
    assert.ok(component.title.hasError);
  });

  test('course title validation fails if value is too short', async function (assert) {
    const course = this.server.create('course');
    const courseModel = await this.store.findRecord('course', course.id);
    this.set('course', courseModel);
    await render(<template><Header @course={{this.course}} @editable={{true}} /></template>);

    assert.ok(component.title.isVisible);
    assert.strictEqual(component.title.value, 'course 0');
    await component.title.edit();
    assert.notOk(component.title.hasError);
    await component.title.set('a');
    await component.title.save();
    assert.ok(component.title.hasError);
  });

  test('course title validation fails if value is too long', async function (assert) {
    const course = this.server.create('course');
    const courseModel = await this.store.findRecord('course', course.id);
    this.set('course', courseModel);
    await render(<template><Header @course={{this.course}} @editable={{true}} /></template>);

    assert.ok(component.title.isVisible);
    assert.strictEqual(component.title.value, 'course 0');
    await component.title.edit();
    assert.notOk(component.title.hasError);
    await component.title.set('tooLong'.repeat(50));
    await component.title.save();
    assert.ok(component.title.hasError);
  });

  test('course title validation fails if value is too short, ignoring whitespace', async function (assert) {
    const course = this.server.create('course');
    const courseModel = await this.store.findRecord('course', course.id);
    this.set('course', courseModel);
    await render(<template><Header @course={{this.course}} @editable={{true}} /></template>);

    assert.ok(component.title.isVisible);
    assert.strictEqual(component.title.value, 'course 0');
    await component.title.edit();
    assert.notOk(component.title.hasError);
    await component.title.set('         ab              ');
    await component.title.save();
    assert.ok(component.title.hasError);
  });

  test('course title validation fails if value is blank string of any length', async function (assert) {
    const course = this.server.create('course');
    const courseModel = await this.store.findRecord('course', course.id);
    this.set('course', courseModel);
    await render(<template><Header @course={{this.course}} @editable={{true}} /></template>);

    assert.ok(component.title.isVisible);
    assert.strictEqual(component.title.value, 'course 0');
    await component.title.edit();
    assert.notOk(component.title.hasError);
    await component.title.set('                       ');
    await component.title.save();
    assert.ok(component.title.hasError);
  });

  test('cancel course title changes', async function (assert) {
    const course = this.server.create('course');
    const courseModel = await this.store.findRecord('course', course.id);
    this.set('course', courseModel);
    await render(<template><Header @course={{this.course}} @editable={{true}} /></template>);

    assert.ok(component.title.isVisible);
    assert.strictEqual(component.title.value, 'course 0');
    await component.title.edit();
    await component.title.set('blue fish');
    await component.title.cancel();
    assert.strictEqual(component.title.value, 'course 0');
  });

  test('course academic year', async function (assert) {
    const course = this.server.create('course', { year: 2021 });
    const courseModel = await this.store.findRecord('course', course.id);
    this.set('course', courseModel);
    await render(<template><Header @course={{this.course}} @editable={{true}} /></template>);
    assert.strictEqual(component.academicYear, '2021');
  });

  test('course academic year shows range if applicable by configuration', async function (assert) {
    this.server.get('application/config', function () {
      return {
        config: {
          academicYearCrossesCalendarYearBoundaries: true,
        },
      };
    });
    const course = this.server.create('course', { year: 2021 });
    const courseModel = await this.store.findRecord('course', course.id);
    this.set('course', courseModel);
    await render(<template><Header @course={{this.course}} @editable={{true}} /></template>);
    assert.strictEqual(component.academicYear, '2021 - 2022');
  });

  test('#i6159 validation status', async function (assert) {
    const course = this.server.create('course');
    const courseModel = await this.store.findRecord('course', course.id);
    this.set('course', courseModel);
    await render(<template><Header @course={{this.course}} @editable={{true}} /></template>);

    assert.ok(component.title.isVisible);
    assert.strictEqual(component.title.value, 'course 0');
    await component.title.edit();
    await component.title.set('');
    await component.title.save();
    assert.ok(component.title.hasError);
    await component.title.cancel();
    assert.strictEqual(component.title.value, 'course 0');
    await component.title.edit();
    assert.notOk(component.title.hasError);
    assert.strictEqual(component.title.inputValue, 'course 0');
    await component.title.blur();
    assert.notOk(component.title.hasError);
  });
});
