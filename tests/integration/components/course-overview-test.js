import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { component } from 'ilios-common/page-objects/components/course-overview';
import { DateTime } from 'luxon';

module('Integration | Component | course overview', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  hooks.beforeEach(function () {
    const permissionCheckerMock = Service.extend({
      async canCreateCourse() {
        return true;
      },
    });
    this.owner.register('service:permissionChecker', permissionCheckerMock);
    this.store = this.owner.lookup('service:store');
  });

  test('course external id validation fails if value is too short', async function (assert) {
    const course = this.server.create('course');
    this.server.create('course-clerkship-type', {
      courses: [course],
    });
    const courseModel = await this.store.findRecord('course', course.id);
    this.set('course', courseModel);
    await render(hbs`<CourseOverview @course={{this.course}} @editable={{true}} />`);

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
    await render(hbs`<CourseOverview @course={{this.course}} @editable={{true}} />`);

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
      startDate: DateTime.fromObject({ hour: 8 }).toJSDate(),
      endDate: DateTime.fromObject({ hour: 9 }).toJSDate(),
    });
    const courseModel = await this.store.findRecord('course', course.id);
    this.set('course', courseModel);
    await render(hbs`<CourseOverview @course={{this.course}} @editable={{true}} />`);

    assert.ok(component.startDate.isVisible);
    await component.startDate.edit();
    assert.notOk(component.startDate.hasError);
    await component.startDate.datePicker.set(DateTime.now().plus({ day: 1 }).toJSDate());
    await component.startDate.save();
    assert.ok(component.startDate.hasError);
  });

  test('end date validation fails when before start date', async function (assert) {
    const course = this.server.create('course', {
      startDate: DateTime.fromObject({ hour: 8 }).toJSDate(),
      endDate: DateTime.fromObject({ hour: 9 }).toJSDate(),
    });
    const courseModel = await this.store.findRecord('course', course.id);
    this.set('course', courseModel);
    await render(hbs`<CourseOverview @course={{this.course}} @editable={{true}} />`);

    assert.ok(component.endDate.isVisible);
    await component.endDate.edit();
    assert.notOk(component.endDate.hasError);
    await component.endDate.datePicker.set(DateTime.fromObject({ hour: 7 }).toJSDate());
    await component.endDate.save();
    assert.ok(component.endDate.hasError);
  });
});
