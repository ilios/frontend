import { currentURL, currentRouteName } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'dummy/tests/helpers';
import { setupAuthentication } from 'ilios-common';
import { t } from 'ember-intl/test-support';
import page from 'ilios-common/page-objects/course';
import { DateTime } from 'luxon';

module('Acceptance | Course - Overview', function (hooks) {
  setupApplicationTest(hooks);
  hooks.beforeEach(async function () {
    this.user = await setupAuthentication();
    this.school = this.server.create('school');
    this.server.createList('courseClerkshipType', 2);
  });

  module('check fields', function (hooks2) {
    hooks2.beforeEach(function () {
      this.user.update({ administeredSchools: [this.school] });
      this.clerkshipType = this.server.create('courseClerkshipType');
      this.course = this.server.create('course', {
        year: 2013,
        school: this.school,
        clerkshipType: this.clerkshipType,
        externalId: 123,
        level: 3,
      });
      this.server.create('user', {
        firstName: 'A',
        lastName: 'Director',
        directedCourses: [this.course],
      });
    });

    test('collapsed', async function (assert) {
      const courseModel = await this.owner
        .lookup('service:store')
        .findRecord('course', this.course.id);
      const clerkshipTypeModel = await this.owner
        .lookup('service:store')
        .findRecord('courseClerkshipType', this.clerkshipType.id);
      await page.visit({ courseId: courseModel.id });
      assert.strictEqual(
        page.details.overview.startDate.text,
        'Start: ' + this.intl.formatDate(courseModel.startDate)
      );
      assert.strictEqual(page.details.overview.externalId.text, 'Course ID: 123');
      assert.strictEqual(page.details.overview.level.text, 'Level: 3');
      assert.strictEqual(
        page.details.overview.endDate.text,
        'End: ' + this.intl.formatDate(courseModel.endDate)
      );
      assert.strictEqual(page.details.overview.universalLocator, 'ILIOS' + courseModel.id);
      assert.strictEqual(
        page.details.overview.clerkshipType.text,
        `Clerkship Type: ${clerkshipTypeModel.title}`
      );
    });

    test('expanded', async function (assert) {
      const courseModel = await this.owner
        .lookup('service:store')
        .findRecord('course', this.course.id);
      const clerkshipTypeModel = await this.owner
        .lookup('service:store')
        .findRecord('courseClerkshipType', this.clerkshipType.id);
      await page.visit({ courseId: courseModel.id, details: true });
      assert.strictEqual(
        page.details.overview.startDate.text,
        'Start: ' + this.intl.formatDate(courseModel.startDate)
      );
      assert.strictEqual(page.details.overview.externalId.text, 'Course ID: 123');
      assert.strictEqual(page.details.overview.level.text, 'Level: 3');
      assert.strictEqual(
        page.details.overview.endDate.text,
        'End: ' + this.intl.formatDate(courseModel.endDate)
      );
      assert.strictEqual(page.details.overview.universalLocator, 'ILIOS' + courseModel.id);
      assert.strictEqual(
        page.details.overview.clerkshipType.text,
        `Clerkship Type: ${clerkshipTypeModel.title}`
      );
    });

    test('open and close details', async function (assert) {
      const courseModel = await this.owner
        .lookup('service:store')
        .findRecord('course', this.course.id);
      await page.visit({ courseId: courseModel.id });
      assert.strictEqual(page.details.titles, 2);
      assert.strictEqual(currentURL(), '/courses/1');
      await page.details.collapseControl();
      assert.ok(page.details.titles > 2);
      assert.strictEqual(currentURL(), '/courses/1?details=true');
      await page.details.collapseControl();
      assert.strictEqual(page.details.titles, 2);
      assert.strictEqual(currentURL(), '/courses/1');
    });
  });

  test('pick clerkship type', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    const course = this.server.create('course', {
      year: 2013,
      school: this.school,
    });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    await page.visit({ courseId: courseModel.id, details: true });
    assert.strictEqual(
      page.details.overview.clerkshipType.text,
      'Clerkship Type: ' + t('general.notAClerkship')
    );
    await page.details.overview.clerkshipType.edit();
    assert.strictEqual(page.details.overview.clerkshipType.value, 'null');
    await page.details.overview.clerkshipType.set(2);
    await page.details.overview.clerkshipType.save();
    assert.strictEqual(
      page.details.overview.clerkshipType.text,
      'Clerkship Type: clerkship type 1'
    );
  });

  test('remove clerkship type', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    const clerkshipType = this.server.create('courseClerkshipType');
    const course = this.server.create('course', {
      year: 2013,
      school: this.school,
      clerkshipType,
    });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    await page.visit({ courseId: courseModel.id, details: true });
    assert.strictEqual(
      page.details.overview.clerkshipType.text,
      'Clerkship Type: clerkship type 2'
    );
    await page.details.overview.clerkshipType.edit();
    assert.strictEqual(page.details.overview.clerkshipType.value, '3');
    await page.details.overview.clerkshipType.set(0);
    await page.details.overview.clerkshipType.save();
    assert.strictEqual(
      page.details.overview.clerkshipType.text,
      'Clerkship Type: ' + t('general.notAClerkship')
    );
  });

  test('change title', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    const course = this.server.create('course', {
      year: 2013,
      school: this.school,
    });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    await page.visit({ courseId: courseModel.id, details: true });
    assert.strictEqual(page.details.header.title.value, 'course 0');
    await page.details.header.title.edit();
    await page.details.header.title.set('test new title');
    await page.details.header.title.save();
    assert.strictEqual(page.details.header.title.value, 'test new title');
  });

  test('change start date', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    const course = this.server.create('course', {
      year: 2013,
      startDate: new Date(Date.UTC(2013, 3, 23, 8, 0)),
      endDate: new Date(Date.UTC(2015, 4, 22, 8, 0)),
      school: this.school,
    });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    await page.visit({ courseId: courseModel.id, details: true });
    const newDate = DateTime.fromJSDate(course.startDate).plus({ years: 1, months: 1 }).toJSDate();
    assert.strictEqual(
      page.details.overview.startDate.text,
      'Start: ' + this.intl.formatDate(course.startDate)
    );
    await page.details.overview.startDate.edit();
    assert.strictEqual(
      page.details.overview.startDate.datePicker.value,
      this.intl.formatDate(course.startDate)
    );
    await page.details.overview.startDate.datePicker.set(newDate);
    await page.details.overview.startDate.save();
    assert.strictEqual(
      page.details.overview.startDate.text,
      'Start: ' + this.intl.formatDate(newDate)
    );
  });

  test('start date validation', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    const course = this.server.create('course', {
      year: 2013,
      startDate: new Date(Date.UTC(2013, 3, 23, 8, 0)),
      endDate: new Date(Date.UTC(2013, 4, 22, 8, 0)),
      school: this.school,
    });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    await page.visit({ courseId: courseModel.id, details: true });
    const startDate = this.intl.formatDate(courseModel.startDate);
    const newDate = DateTime.fromJSDate(courseModel.startDate).plus({ years: 1 }).toJSDate();

    assert.strictEqual(page.details.overview.startDate.text, `Start: ${startDate}`);
    assert.notOk(page.details.overview.startDate.hasError);
    await page.details.overview.startDate.edit();
    assert.strictEqual(page.details.overview.startDate.datePicker.value, startDate);
    await page.details.overview.startDate.datePicker.set(newDate);
    await page.details.overview.startDate.save();
    assert.ok(page.details.overview.startDate.hasError);
  });

  test('change end date', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    const course = this.server.create('course', {
      year: 2013,
      startDate: new Date(Date.UTC(2013, 3, 23, 8, 0)),
      endDate: new Date(Date.UTC(2015, 4, 22, 8, 0)),
      school: this.school,
    });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    await page.visit({ courseId: courseModel.id, details: true });
    const endDate = this.intl.formatDate(courseModel.endDate);
    const newDate = DateTime.fromJSDate(course.endDate).plus({ years: 1, months: 1 }).toJSDate();

    assert.strictEqual(page.details.overview.endDate.text, `End: ${endDate}`);
    await page.details.overview.endDate.edit();
    assert.strictEqual(page.details.overview.endDate.datePicker.value, endDate);
    await page.details.overview.endDate.datePicker.set(newDate);
    await page.details.overview.endDate.save();
    assert.strictEqual(page.details.overview.endDate.text, 'End: ' + this.intl.formatDate(newDate));
  });

  test('end date validation', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    const course = this.server.create('course', {
      year: 2013,
      startDate: new Date(Date.UTC(2013, 3, 23, 8, 0)),
      endDate: new Date(Date.UTC(2013, 4, 22, 8, 0)),
      school: this.school,
    });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    await page.visit({ courseId: courseModel.id, details: true });
    const endDate = this.intl.formatDate(courseModel.endDate);
    const newDate = DateTime.fromJSDate(course.endDate).minus({ years: 1 }).toJSDate();

    assert.strictEqual(page.details.overview.endDate.text, 'End: ' + endDate);
    assert.notOk(page.details.overview.endDate.hasError);
    await page.details.overview.endDate.edit();
    assert.strictEqual(page.details.overview.endDate.datePicker.value, endDate);
    await page.details.overview.endDate.datePicker.set(newDate);
    await page.details.overview.endDate.save();
    assert.ok(page.details.overview.endDate.hasError);
  });

  test('change externalId', async function (assert) {
    const externalId = 'abc123';
    this.user.update({ administeredSchools: [this.school] });
    const course = this.server.create('course', {
      year: 2013,
      school: this.school,
      externalId,
    });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    await page.visit({ courseId: courseModel.id, details: true });
    const newValue = 'new id';
    assert.strictEqual(page.details.overview.externalId.text, `Course ID: ${externalId}`);
    await page.details.overview.externalId.edit();
    assert.strictEqual(page.details.overview.externalId.value, externalId);
    await page.details.overview.externalId.set(newValue);
    await page.details.overview.externalId.save();
    assert.strictEqual(page.details.overview.externalId.text, `Course ID: ${newValue}`);
  });

  test('change to empty externalId', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    const course = this.server.create('course', {
      year: 2013,
      school: this.school,
      externalId: 'abc123',
    });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    await page.visit({ courseId: courseModel.id, details: true });
    assert.strictEqual(
      page.details.overview.externalId.text,
      `Course ID: ${courseModel.externalId}`
    );
    await page.details.overview.externalId.edit();
    await page.details.overview.externalId.set('');
    await page.details.overview.externalId.save();
    assert.strictEqual(
      page.details.overview.externalId.text,
      'Course ID: ' + t('general.clickToEdit')
    );
  });

  test('renders with empty externalId', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    const course = this.server.create('course', {
      year: 2013,
      school: this.school,
    });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    await page.visit({ courseId: courseModel.id, details: true });
    assert.strictEqual(
      page.details.overview.externalId.text,
      'Course ID: ' + t('general.clickToEdit')
    );
  });

  test('change level', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    const course = this.server.create('course', {
      year: 2013,
      school: this.school,
      level: 3,
    });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    await page.visit({ courseId: courseModel.id, details: true });
    const newValue = 1;
    assert.strictEqual(page.details.overview.level.text, `Level: ${courseModel.level}`);
    await page.details.overview.level.edit();
    assert.strictEqual(parseInt(page.details.overview.level.value, 10), courseModel.level);
    await page.details.overview.level.set(newValue);
    await page.details.overview.level.save();
    assert.strictEqual(page.details.overview.level.text, `Level: ${newValue}`);
  });

  test('click rollover', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    const course = this.server.create('course', {
      year: 2013,
      school: this.school,
    });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    await page.visit({ courseId: courseModel.id, details: true });
    assert.ok(page.details.overview.rollover.isVisible);
    await page.details.overview.rollover.visit();

    assert.strictEqual(currentRouteName(), 'course.rollover');
  });

  test('rollover hidden from unprivileged users', async function (assert) {
    const course = this.server.create('course', {
      year: 2013,
      school: this.school,
    });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    await page.visit({ courseId: courseModel.id, details: true });
    assert.notOk(page.details.overview.rollover.isVisible);
  });

  test('rollover visible to privileged users', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    const course = this.server.create('course', {
      year: 2013,
      school: this.school,
    });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    await page.visit({ courseId: courseModel.id, details: true });
    assert.ok(page.details.overview.rollover.isVisible);
  });

  test('rollover hidden on rollover route', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    const course = this.server.create('course', {
      year: 2013,
      school: this.school,
    });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    await page.visit({ courseId: courseModel.id, details: true });
    assert.ok(page.details.overview.rollover.isVisible);
    await page.details.overview.rollover.visit();
    assert.notOk(page.details.overview.rollover.isVisible);
  });
});
