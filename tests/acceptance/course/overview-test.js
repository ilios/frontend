import { currentURL, currentRouteName } from '@ember/test-helpers';
import moment from 'moment';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupAuthentication } from 'ilios-common';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupMirage } from 'ember-cli-mirage/test-support';
import page from 'ilios-common/page-objects/course';

module('Acceptance | Course - Overview', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);
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
        schoolId: 1,
        clerkshipTypeId: 3,
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
      await page.visit({ courseId: 1 });
      assert.equal(page.overview.startDate.value, this.intl.formatDate(this.course.startDate));
      assert.equal(page.overview.externalId.value, '123');
      assert.equal(page.overview.level.value, '3');
      assert.equal(page.overview.endDate.value, this.intl.formatDate(this.course.endDate));
      assert.equal(page.overview.universalLocator, 'ILIOS' + this.course.id);
      assert.equal(page.overview.clerkshipType.value, this.clerkshipType.title);
    });

    test('expanded', async function (assert) {
      await page.visit({ courseId: 1, details: true });
      assert.equal(page.overview.startDate.value, this.intl.formatDate(this.course.startDate));
      assert.equal(page.overview.externalId.value, '123');
      assert.equal(page.overview.level.value, '3');
      assert.equal(page.overview.endDate.value, this.intl.formatDate(this.course.endDate));
      assert.equal(page.overview.universalLocator, 'ILIOS' + this.course.id);
      assert.equal(page.overview.clerkshipType.value, this.clerkshipType.title);
    });

    test('open and close details', async function (assert) {
      await page.visit({ courseId: 1 });
      assert.equal(page.titles, 2);
      assert.equal(currentURL(), '/courses/1');
      await page.collapseControl();
      assert.ok(page.titles > 2);
      assert.equal(currentURL(), '/courses/1?details=true');
      await page.collapseControl();
      assert.equal(page.titles, 2);
      assert.equal(currentURL(), '/courses/1');
    });
  });

  test('pick clerkship type', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    this.server.create('course', {
      year: 2013,
      schoolId: 1,
    });
    await page.visit({ courseId: 1, details: true });
    assert.equal(page.overview.clerkshipType.value, t('general.notAClerkship'));
    await page.overview.clerkshipType.edit();
    await page.overview.clerkshipType.set(2);
    await page.overview.clerkshipType.save();
    assert.equal(page.overview.clerkshipType.value, 'clerkship type 1');
  });

  test('remove clerkship type', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    this.server.create('courseClerkshipType');
    this.server.create('course', {
      year: 2013,
      schoolId: 1,
      clerkshipTypeId: 3,
    });
    await page.visit({ courseId: 1, details: true });
    assert.equal(page.overview.clerkshipType.value, 'clerkship type 2');
    await page.overview.clerkshipType.edit();
    await page.overview.clerkshipType.set(0);
    await page.overview.clerkshipType.save();
    assert.equal(page.overview.clerkshipType.value, t('general.notAClerkship'));
  });

  test('change title', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    this.server.create('course', {
      year: 2013,
      schoolId: 1,
    });
    await page.visit({ courseId: 1, details: true });
    assert.equal(page.header.title, 'course 0');
    await page.header.edit();
    await page.header.set('test new title');
    await page.header.save();
    assert.equal(page.header.title, 'test new title');
  });

  test('change start date', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    const course = this.server.create('course', {
      year: 2013,
      startDate: moment('2013-04-23').toDate(),
      endDate: moment('2015-05-22').toDate(),
      schoolId: 1,
    });
    await page.visit({ courseId: 1, details: true });
    const newDate = moment(course.startDate).add(1, 'year').add(1, 'month');
    assert.equal(page.overview.startDate.value, this.intl.formatDate(course.startDate));

    await page.overview.startDate.edit();
    await page.overview.startDate.set(newDate.toDate());
    await page.overview.startDate.save();
    assert.equal(page.overview.startDate.value, this.intl.formatDate(newDate));
  });

  test('start date validation', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(3);
    const course = this.server.create('course', {
      year: 2013,
      startDate: moment('2013-04-23').toDate(),
      endDate: moment('2013-05-22').toDate(),
      schoolId: 1,
    });
    await page.visit({ courseId: 1, details: true });
    const startDate = this.intl.formatDate(course.startDate);
    const newDate = moment(course.startDate).add(1, 'year');
    assert.equal(page.overview.startDate.value, startDate);
    assert.notOk(page.overview.startDate.hasError);

    await page.overview.startDate.edit();
    await page.overview.startDate.set(newDate.toDate());
    await page.overview.startDate.save();
    assert.ok(page.overview.startDate.hasError);
  });

  test('change end date', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    const course = this.server.create('course', {
      year: 2013,
      startDate: moment('2013-04-23').toDate(),
      endDate: moment('2015-05-22').toDate(),
      schoolId: 1,
    });
    await page.visit({ courseId: 1, details: true });
    const endDate = this.intl.formatDate(course.endDate);
    const newDate = moment(course.endDate).add(1, 'year').add(1, 'month');
    assert.equal(page.overview.endDate.value, endDate);

    await page.overview.endDate.edit();
    await page.overview.endDate.set(newDate.toDate());
    await page.overview.endDate.save();
    assert.equal(page.overview.endDate.value, this.intl.formatDate(newDate));
  });

  test('end date validation', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(3);
    const course = this.server.create('course', {
      year: 2013,
      startDate: moment('2013-04-23').toDate(),
      endDate: moment('2013-05-22').toDate(),
      schoolId: 1,
    });
    await page.visit({ courseId: 1, details: true });
    const endDate = this.intl.formatDate(course.endDate);
    const newDate = moment(course.endDate).subtract(1, 'year');
    assert.equal(page.overview.endDate.value, endDate);
    assert.notOk(page.overview.endDate.hasError);

    await page.overview.endDate.edit();
    await page.overview.endDate.set(newDate.toDate());
    await page.overview.endDate.save();
    assert.ok(page.overview.endDate.hasError);
  });

  test('change externalId', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    const course = this.server.create('course', {
      year: 2013,
      schoolId: 1,
      externalId: 'abc123',
    });
    await page.visit({ courseId: 1, details: true });
    const newValue = 'new id';
    assert.equal(page.overview.externalId.value, course.externalId);

    await page.overview.externalId.edit();
    await page.overview.externalId.set(newValue);
    await page.overview.externalId.save();
    assert.equal(page.overview.externalId.value, newValue);
  });

  test('change to empty externalId', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    const course = this.server.create('course', {
      year: 2013,
      schoolId: 1,
      externalId: 'abc123',
    });
    await page.visit({ courseId: 1, details: true });
    assert.equal(page.overview.externalId.value, course.externalId);

    await page.overview.externalId.edit();
    await page.overview.externalId.set('');
    await page.overview.externalId.save();
    assert.equal(page.overview.externalId.value, t('general.clickToEdit'));
  });

  test('renders with empty externalId', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    this.server.create('course', {
      year: 2013,
      schoolId: 1,
    });
    await page.visit({ courseId: 1, details: true });
    assert.equal(page.overview.externalId.value, t('general.clickToEdit'));
  });

  test('change level', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    const course = this.server.create('course', {
      year: 2013,
      schoolId: 1,
      level: 3,
    });
    await page.visit({ courseId: 1, details: true });
    const newValue = 1;
    assert.equal(page.overview.level.value, course.level);

    await page.overview.level.edit();
    await page.overview.level.set(newValue);
    await page.overview.level.save();
    assert.equal(page.overview.level.value, newValue);
  });

  test('click rollover', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    this.server.create('course', {
      year: 2013,
      schoolId: 1,
    });
    await page.visit({ courseId: 1, details: true });
    assert.ok(page.overview.rollover.isVisible);
    await page.overview.rollover.visit();

    assert.equal(currentRouteName(), 'course.rollover');
  });

  test('rollover hidden from unprivileged users', async function (assert) {
    this.server.create('course', {
      year: 2013,
      schoolId: 1,
    });
    await page.visit({ courseId: 1, details: true });
    assert.notOk(page.overview.rollover.isVisible);
  });

  test('rollover visible to privileged users', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    this.server.create('course', {
      year: 2013,
      schoolId: 1,
    });
    await page.visit({ courseId: 1, details: true });
    assert.ok(page.overview.rollover.isVisible);
  });

  test('rollover hidden on rollover route', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    this.server.create('course', {
      year: 2013,
      schoolId: 1,
    });
    await page.visit({ courseId: 1, details: true });
    assert.ok(page.overview.rollover.isVisible);
    await page.overview.rollover.visit();
    assert.notOk(page.overview.rollover.isVisible);
  });
});
