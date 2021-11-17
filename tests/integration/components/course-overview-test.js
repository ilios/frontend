import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { component } from 'ilios-common/page-objects/components/course-overview';
import moment from 'moment';

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
    const courseModel = await this.store.find('course', course.id);
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
    const courseModel = await this.store.find('course', course.id);
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
      startDate: moment().hour(8).format(),
      endDate: moment().hour(9).format(),
    });
    const courseModel = await this.store.find('course', course.id);
    this.set('course', courseModel);
    await render(hbs`<CourseOverview @course={{this.course}} @editable={{true}} />`);

    assert.ok(component.startDate.isVisible);
    await component.startDate.edit();
    assert.notOk(component.startDate.hasError);
    await component.startDate.datePicker.set(moment().add(1, 'day').toDate());
    await component.startDate.save();
    assert.ok(component.startDate.hasError);
  });

  test('end date validation fails when before start date', async function (assert) {
    const course = this.server.create('course', {
      startDate: moment().hour(8).format(),
      endDate: moment().hour(9).format(),
    });
    const courseModel = await this.store.find('course', course.id);
    this.set('course', courseModel);
    await render(hbs`<CourseOverview @course={{this.course}} @editable={{true}} />`);

    assert.ok(component.endDate.isVisible);
    await component.endDate.edit();
    assert.notOk(component.endDate.hasError);
    await component.endDate.datePicker.set(moment().hour(7).toDate());
    await component.endDate.save();
    assert.ok(component.endDate.hasError);
  });
});
