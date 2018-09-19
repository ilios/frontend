import Service from '@ember/service';
import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';
import { resolve } from 'rsvp';

module('Integration | Component | course summary header', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    let currentUserMock = Service.extend({
      userIsCourseDirector: true,
    });
    this.owner.register('service:currentUser', currentUserMock);
  });

  test('it renders', async function(assert) {
    let school = EmberObject.create({});
    let permissionCheckerMock = Service.extend({
      canCreateCourse(inSchool) {
        assert.equal(school, inSchool);
        return resolve(true);
      }
    });
    this.owner.register('service:permissionChecker', permissionCheckerMock);
    let course = EmberObject.create({
      title: 'title',
      school: resolve(school),
      startDate: new Date(2020, 4, 6, 12),
      endDate: new Date(2020, 11, 11, 12),
      externalId: 'abc',
      level: 3,
      isPublished: true,
      isSchedule: false,
    });
    this.set('course', course);
    await render(hbs`{{course-summary-header course=course}}`);
    const title = 'h2';
    const actions = '.course-summary-actions';
    const materialsIcon = `${actions} a:nth-of-type(1) svg`;
    const printIcon = `${actions} a:nth-of-type(2) svg`;
    const rolloverIcon = `${actions} a:nth-of-type(3) svg`;
    const blocks = '.course-summary-content .block';
    const start = `${blocks}:nth-of-type(1) span`;
    const externalId = `${blocks}:nth-of-type(2) span`;
    const end = `${blocks}:nth-of-type(3) span`;
    const level = `${blocks}:nth-of-type(4) span`;
    const status = `${blocks}:nth-of-type(5) span:nth-of-type(1)`;

    assert.dom(title).hasText('title');
    assert.dom(materialsIcon).hasClass('fa-archive');
    assert.dom(printIcon).hasClass('fa-print');
    assert.dom(rolloverIcon).hasClass('fa-random');
    assert.dom(start).hasText(moment(course.startDate).format('L'));
    assert.dom(externalId).hasText('abc');
    assert.dom(end).hasText(moment(course.endDate).format('L'));
    assert.dom(level).hasText('3');
    assert.dom(status).hasText('Published');
  });

  test('no link to materials when that is the current route', async function(assert) {
    let school = EmberObject.create({});
    let permissionCheckerMock = Service.extend({
      canCreateCourse(inSchool) {
        assert.equal(school, inSchool);
        return resolve(true);
      }
    });
    this.owner.register('service:permissionChecker', permissionCheckerMock);
    let routerMock = Service.extend({
      currentRouteName: 'course-materials',
      generateURL(){},
    });
    this.owner.register('service:-routing', routerMock);

    let course = EmberObject.create({
      title: 'title',
      school: resolve(school),
      startDate: new Date(2020, 4, 6, 12),
      endDate: new Date(2020, 11, 11, 12),
    });
    this.set('course', course);
    await render(hbs`{{course-summary-header course=course}}`);
    const actions = '.course-summary-actions a';
    const printIcon = `${actions}:nth-of-type(1) svg`;
    const rolloverIcon = `${actions}:nth-of-type(2) svg`;

    assert.ok(findAll(actions).length, 2);
    assert.dom(printIcon).hasClass('fa-print');
    assert.dom(rolloverIcon).hasClass('fa-random');
  });

  test('no link to rollover when that is the current route', async function(assert) {
    let routerMock = Service.extend({
      currentRouteName: 'course.rollover',
      generateURL(){},
    });
    this.owner.register('service:-routing', routerMock);

    let course = EmberObject.create({
      title: 'title',
      startDate: new Date(2020, 4, 6, 12),
      endDate: new Date(2020, 11, 11, 12),
    });
    this.set('course', course);
    await render(hbs`{{course-summary-header course=course}}`);
    const actions = '.course-summary-actions a';
    const materialsIcon = `${actions}:nth-of-type(1) svg`;
    const printIcon = `${actions}:nth-of-type(2) svg`;

    assert.ok(findAll(actions).length, 2);
    assert.dom(printIcon).hasClass('fa-print');
    assert.dom(materialsIcon).hasClass('fa-archive');
  });

  test('no link to rollover when user cannot edit the course', async function(assert) {
    let school = EmberObject.create({});
    let routerMock = Service.extend({
      currentRouteName: 'course.rollover',
      generateURL(){},
    });
    this.owner.register('service:-routing', routerMock);
    let permissionCheckerMock = Service.extend({
      canCreateCourse(inSchool) {
        assert.equal(school, inSchool);
        return resolve(false);
      }
    });
    this.owner.register('service:permissionChecker', permissionCheckerMock);

    let course = EmberObject.create({
      title: 'title',
      school: resolve(school),
      startDate: new Date(2020, 4, 6, 12),
      endDate: new Date(2020, 11, 11, 12),
    });
    this.set('course', course);
    await render(hbs`{{course-summary-header course=course}}`);
    const actions = '.course-summary-actions a';
    const materialsIcon = `${actions}:nth-of-type(1) svg`;
    const printIcon = `${actions}:nth-of-type(2) svg`;

    assert.ok(findAll(actions).length, 2);
    assert.dom(printIcon).hasClass('fa-print');
    assert.dom(materialsIcon).hasClass('fa-archive');
  });
});
