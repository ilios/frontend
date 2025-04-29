import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'test-app/tests/test-support/mirage';
import { component } from 'ilios-common/page-objects/components/course/overview';

module('Integration | Component | course overview', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    this.intl = this.owner.lookup('service:intl');
    class PermissionCheckerMock extends Service {
      async canCreateCourse() {
        return true;
      }
    }
    this.owner.register('service:permissionChecker', PermissionCheckerMock);
    this.store = this.owner.lookup('service:store');
  });

  test('course external id validation fails if value is too short', async function (assert) {
    const course = this.server.create('course');
    this.server.create('course-clerkship-type', {
      courses: [course],
    });
    const courseModel = await this.store.findRecord('course', course.id);
    this.set('course', courseModel);
    await render(hbs`<Course::Overview @course={{this.course}} @editable={{true}} />`);

    assert.ok(component.externalId.isVisible);
    assert.strictEqual(component.externalId.text, 'Course ID: Click to edit');
    await component.externalId.edit();
    assert.notOk(component.externalId.hasError);
    await component.externalId.set('a');
    await component.externalId.save();
    assert.ok(component.externalId.hasError);
  });

  test('course external id validation fails if value is too long', async function (assert) {
    const course = this.server.create('course');
    this.server.create('course-clerkship-type', {
      courses: [course],
    });
    const courseModel = await this.store.findRecord('course', course.id);
    this.set('course', courseModel);
    await render(hbs`<Course::Overview @course={{this.course}} @editable={{true}} />`);

    assert.ok(component.externalId.isVisible);
    assert.strictEqual(component.externalId.text, 'Course ID: Click to edit');
    await component.externalId.edit();
    assert.notOk(component.externalId.hasError);
    await component.externalId.set('tooLong'.repeat(50));
    await component.externalId.save();
    assert.ok(component.externalId.hasError);
  });

  test('start date validation fails when after end date', async function (assert) {
    const course = this.server.create('course', {
      startDate: '2024-01-01',
      endDate: '2024-06-30',
    });
    const courseModel = await this.store.findRecord('course', course.id);
    this.set('course', courseModel);
    await render(hbs`<Course::Overview @course={{this.course}} @editable={{true}} />`);

    assert.ok(component.startDate.isVisible);
    await component.startDate.edit();
    assert.notOk(component.startDate.hasError);
    await component.startDate.datePicker.set('2024-08-01');
    await component.startDate.save();
    assert.ok(component.startDate.hasError);
    // verify that validation error clears after edit-mode has been cancelled.
    await component.startDate.cancel();
    assert.notOk(component.startDate.hasError);
  });

  test('end date validation fails when before start date', async function (assert) {
    const course = this.server.create('course', {
      startDate: '2024-01-01',
      endDate: '2024-06-30',
    });
    const courseModel = await this.store.findRecord('course', course.id);
    this.set('course', courseModel);
    await render(hbs`<Course::Overview @course={{this.course}} @editable={{true}} />`);
    assert.ok(component.endDate.isVisible);
    await component.endDate.edit();
    assert.notOk(component.endDate.hasError);
    await component.endDate.datePicker.set('2023-12-11');
    await component.endDate.save();
    assert.ok(component.endDate.hasError);
    // verify that validation error clears after edit-mode has been cancelled.
    await component.endDate.cancel();
    assert.notOk(component.endDate.hasError);
  });
});
