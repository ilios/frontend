import { currentURL } from '@ember/test-helpers';
import moment from 'moment';
import {
  module,
  test
} from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';
import { currentRouteName } from '@ember/test-helpers';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import page from 'ilios/tests/pages/course';

module('Acceptance: Course - Overview', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  hooks.beforeEach(async function () {
    this.user = await setupAuthentication();
    this.server.create('school');
    this.server.createList('courseClerkshipType', 2);
  });

  module('check fields', function(hooks) {
    hooks.beforeEach(function() {
      let director = this.server.create('userRole', {
        title: 'course director'
      });
      this.server.db.users.update(this.user.id, {roles: [director]});
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
        roles: [director],
        directedCourses: [this.course]
      });
    });

    test('collapsed', async function (assert) {
      await page.visit({ courseId: 1 });
      assert.equal(page.overview.startDate.value, moment.utc(this.course.startDate).format('L'));
      assert.equal(page.overview.externalId.value, '123');
      assert.equal(page.overview.level.value, '3');
      assert.equal(page.overview.endDate.value, moment.utc(this.course.endDate).format('L'));
      assert.equal(page.overview.universalLocator, 'ILIOS' + this.course.id);
      assert.equal(page.overview.clerkshipType.value, this.clerkshipType.title);
      assert.equal(page.overview.courseDirectors.selected().count, 1);
      assert.equal(page.overview.courseDirectors.selected(0).name, 'A M. Director');
      assert.equal(page.overview.rollover.link, '/courses/1/rollover');
    });

    test('expanded', async function (assert) {
      await page.visit({ courseId: 1, details: true });
      assert.equal(page.overview.startDate.value, moment.utc(this.course.startDate).format('L'));
      assert.equal(page.overview.externalId.value, '123');
      assert.equal(page.overview.level.value, '3');
      assert.equal(page.overview.endDate.value, moment.utc(this.course.endDate).format('L'));
      assert.equal(page.overview.universalLocator, 'ILIOS' + this.course.id);
      assert.equal(page.overview.clerkshipType.value, this.clerkshipType.title);
      assert.equal(page.overview.courseDirectors.selected().count, 1);
      assert.equal(page.overview.courseDirectors.selected(0).name, 'A M. Director');
      assert.equal(page.overview.rollover.link, '/courses/1/rollover?details=true');
    });

    test('open and close details', async function(assert) {
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

  test('pick clerkship type', async function(assert) {
    this.server.create('course', {
      year: 2013,
      schoolId: 1,
    });
    await page.visit({ courseId: 1, details: true });
    assert.equal(page.overview.clerkshipType.value, 'Not a Clerkship');
    await page.overview.clerkshipType.edit();
    await page.overview.clerkshipType.set(2);
    await page.overview.clerkshipType.save();
    assert.equal(page.overview.clerkshipType.value, 'clerkship type 1');
  });

  test('remove clerkship type', async function(assert) {
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
    assert.equal(page.overview.clerkshipType.value, 'Not a Clerkship');
  });


  test('change title', async function (assert) {
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
    let course = this.server.create('course', {
      year: 2013,
      startDate: new Date('2013-04-23'),
      endDate: new Date('2015-05-22'),
      schoolId: 1,
    });
    await page.visit({ courseId: 1, details: true });
    const startDate = moment.utc(course.startDate).format('L');
    const newDate = moment(course.startDate).add(1, 'year').add(1, 'month');
    assert.equal(page.overview.startDate.value, startDate);

    await page.overview.startDate.edit();
    await page.overview.startDate.set(newDate.toDate());
    await page.overview.startDate.save();
    assert.equal(page.overview.startDate.value, newDate.format('L'));
  });

  test('start date validation', async function(assert) {
    assert.expect(3);
    let course = this.server.create('course', {
      year: 2013,
      startDate: new Date('2013-04-23'),
      endDate: new Date('2013-05-22'),
      schoolId: 1,
    });
    await page.visit({ courseId: 1, details: true });
    const startDate = moment.utc(course.startDate).format('L');
    const newDate = moment(course.startDate).add(1, 'year');
    assert.equal(page.overview.startDate.value, startDate);
    assert.notOk(page.overview.startDate.hasError);

    await page.overview.startDate.edit();
    await page.overview.startDate.set(newDate.toDate());
    await page.overview.startDate.save();
    assert.ok(page.overview.startDate.hasError);
  });

  test('change end date', async function (assert) {
    let course = this.server.create('course', {
      year: 2013,
      startDate: new Date('2013-04-23'),
      endDate: new Date('2015-05-22'),
      schoolId: 1,
    });
    await page.visit({ courseId: 1, details: true });
    const endDate = moment.utc(course.endDate).format('L');
    const newDate = moment(course.endDate).add(1, 'year').add(1, 'month');
    assert.equal(page.overview.endDate.value, endDate);

    await page.overview.endDate.edit();
    await page.overview.endDate.set(newDate.toDate());
    await page.overview.endDate.save();
    assert.equal(page.overview.endDate.value, newDate.format('L'));
  });

  test('end date validation', async function(assert) {
    assert.expect(3);
    let course = this.server.create('course', {
      year: 2013,
      startDate: new Date('2013-04-23'),
      endDate: new Date('2013-05-22'),
      schoolId: 1,
    });
    await page.visit({ courseId: 1, details: true });
    const endDate = moment.utc(course.endDate).format('L');
    const newDate = moment(course.endDate).subtract(1, 'year');
    assert.equal(page.overview.endDate.value, endDate);
    assert.notOk(page.overview.endDate.hasError);

    await page.overview.endDate.edit();
    await page.overview.endDate.set(newDate.toDate());
    await page.overview.endDate.save();
    assert.ok(page.overview.endDate.hasError);
  });

  test('change externalId', async function (assert) {
    let course = this.server.create('course', {
      year: 2013,
      schoolId: 1,
      externalId: 'abc123'
    });
    await page.visit({ courseId: 1, details: true });
    const newValue = 'new id';
    assert.equal(page.overview.externalId.value, course.externalId);

    await page.overview.externalId.edit();
    await page.overview.externalId.set(newValue);
    await page.overview.externalId.save();
    assert.equal(page.overview.externalId.value, newValue);
  });

  test('change level', async function (assert) {
    let course = this.server.create('course', {
      year: 2013,
      schoolId: 1,
      level: 3
    });
    await page.visit({ courseId: 1, details: true });
    const newValue = 1;
    assert.equal(page.overview.level.value, course.level);

    await page.overview.level.edit();
    await page.overview.level.set(newValue);
    await page.overview.level.save();
    assert.equal(page.overview.level.value, newValue);
  });

  test('remove director', async function (assert) {
    this.server.create('user', {
      firstName: 'A',
      lastName: 'Director'
    });
    this.server.create('course', {
      year: 2013,
      schoolId: 1,
      externalId: 123,
      level: 3,
      directorIds: [2]
    });
    await page.visit({ courseId: 1, details: true });
    assert.equal(page.overview.courseDirectors.selected().count, 1);
    await page.overview.courseDirectors.manage();
    await page.overview.courseDirectors.manager.selected(0).remove();
    await page.overview.courseDirectors.manager.save();
    assert.equal(page.overview.courseDirectors.selected().count, 0);
  });

  test('manage directors', async function (assert) {
    let directorRole = this.server.create('userRole', {
      title: 'Course Director'
    });
    let addedGuy = this.server.create('user', {
      firstName: 'Added',
      lastName: 'Guy',
      roles: [directorRole]
    });
    this.server.create('user', {
      firstName: 'Disabled',
      lastName: 'Guy',
      enabled: false,
      roles: [directorRole]
    });
    this.server.db.users.update(this.user.id, {roles: [directorRole]});

    let secondRole = this.server.create('userRole');
    this.server.create('user', {
      firstName: 'Not a director',
      lastName: 'Guy',
      roles: [secondRole]
    });

    this.server.create('course', {
      year: 2013,
      schoolId: 1,
      externalId: 123,
      level: 3,
      directors: [addedGuy]
    });
    await page.visit({ courseId: 1, details: true });
    assert.equal(page.overview.courseDirectors.selected().count, 1);
    await page.overview.courseDirectors.manage();
    await page.overview.courseDirectors.manager.search('guy');
    assert.equal(page.overview.courseDirectors.manager.searchResults().count, 3);
    assert.equal(page.overview.courseDirectors.manager.searchResults(0).name, '0 guy M. Mc0son user@example.edu');
    assert.ok(page.overview.courseDirectors.manager.searchResults(0).isActive);
    assert.equal(page.overview.courseDirectors.manager.searchResults(1).name, 'Added M. Guy user@example.edu');
    assert.ok(page.overview.courseDirectors.manager.searchResults(1).inactive);
    assert.equal(page.overview.courseDirectors.manager.searchResults(2).name, 'Disabled M. Guy user@example.edu');
    assert.ok(page.overview.courseDirectors.manager.searchResults(2).inactive);

    await page.overview.courseDirectors.manager.selected(0).remove();
    await page.overview.courseDirectors.manager.searchResults(0).add();
    assert.ok(page.overview.courseDirectors.manager.searchResults(0).inactive);
    assert.ok(page.overview.courseDirectors.manager.searchResults(1).isActive);
    await page.overview.courseDirectors.manager.save();
    assert.equal(page.overview.courseDirectors.selected().count, 1);
    assert.equal(page.overview.courseDirectors.selected(0).name, '0 guy M. Mc0son');
  });

  // //test for a bug where the search results were not cleared between searches
  test('search twice and list should be correct', async function(assert) {
    const directorRole = this.server.create('userRole');
    let user = this.server.create('user', {
      firstName: 'Added',
      lastName: 'Guy',
      roles: [directorRole]
    });
    this.server.create('course', {
      year: 2013,
      schoolId: 1,
      externalId: 123,
      level: 3,
      directors: [user]
    });
    this.server.db.users.update(this.user.id, {roles: [directorRole]});

    await page.visit({ courseId: 1, details: true });
    assert.equal(page.overview.courseDirectors.selected().count, 1);
    await page.overview.courseDirectors.manage();
    await page.overview.courseDirectors.manager.search('guy');
    assert.equal(page.overview.courseDirectors.manager.searchResults().count, 2);
    assert.equal(page.overview.courseDirectors.manager.searchResults(0).name, '0 guy M. Mc0son user@example.edu');
    assert.equal(page.overview.courseDirectors.manager.searchResults(1).name, 'Added M. Guy user@example.edu');
    await page.overview.courseDirectors.manager.searchResults(0).add();
    await page.overview.courseDirectors.manager.search('');
    await page.overview.courseDirectors.manager.search('guy');
    assert.equal(page.overview.courseDirectors.manager.searchResults().count, 2);
    assert.equal(page.overview.courseDirectors.manager.searchResults(0).name, '0 guy M. Mc0son user@example.edu');
    assert.equal(page.overview.courseDirectors.manager.searchResults(1).name, 'Added M. Guy user@example.edu');
  });

  test('click rollover', async function(assert) {
    const directorRole = this.server.create('userRole', {
      title: 'course director'
    });
    this.server.create('course', {
      year: 2013,
      schoolId: 1,
    });
    this.server.db.users.update(this.user.id, {roles: [directorRole]});
    await page.visit({ courseId: 1, details: true });
    assert.ok(page.overview.rollover.isVisible);
    await page.overview.rollover.visit();

    assert.equal(currentRouteName(), 'course.rollover');
  });

  test('rollover hidden from instructors', async function(assert) {
    const role = this.server.create('userRole', {
      title: 'instructor'
    });
    this.server.create('course', {
      year: 2013,
      schoolId: 1,
    });
    this.server.db.users.update(this.user.id, {roles: [role]});
    await page.visit({ courseId: 1, details: true });
    assert.notOk(page.overview.rollover.isVisible);
  });

  test('rollover visible to developers', async function(assert) {
    const role = this.server.create('userRole', {
      title: 'developer'
    });
    this.server.create('course', {
      year: 2013,
      schoolId: 1,
    });
    this.server.db.users.update(this.user.id, {roles: [role]});
    await page.visit({ courseId: 1, details: true });
    assert.ok(page.overview.rollover.isVisible);
  });

  test('rollover visible to course directors', async function(assert) {
    const role = this.server.create('userRole', {
      title: 'course director'
    });
    this.server.create('course', {
      year: 2013,
      schoolId: 1,
    });
    this.server.db.users.update(this.user.id, {roles: [role]});
    await page.visit({ courseId: 1, details: true });
    assert.ok(page.overview.rollover.isVisible);
  });

  test('rollover hidden on rollover route', async function(assert) {
    const role = this.server.create('userRole', {
      title: 'course director'
    });
    this.server.create('course', {
      year: 2013,
      schoolId: 1,
    });
    this.server.db.users.update(this.user.id, {roles: [role]});
    await page.visit({ courseId: 1, details: true });
    assert.ok(page.overview.rollover.isVisible);
    await page.overview.rollover.visit();
    assert.notOk(page.overview.rollover.isVisible);
  });
});
