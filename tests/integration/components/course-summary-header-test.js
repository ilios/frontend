import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { render, findAll } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | course summary header', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  hooks.beforeEach(function () {
    const currentUserMock = Service.extend({
      userIsCourseDirector: true,
    });
    this.owner.register('service:currentUser', currentUserMock);

    class PermissionCheckerStub extends Service {
      async canCreateCourse() {
        return true;
      }
    }

    this.owner.register('service:permissionChecker', PermissionCheckerStub);
  });

  test('it renders', async function (assert) {
    assert.expect(10);

    class PermissionCheckerStub extends Service {
      async canCreateCourse(inSchool) {
        assert.strictEqual(school.id, inSchool.id);
        return true;
      }
    }

    this.owner.register('service:permissionChecker', PermissionCheckerStub);
    const school = this.server.create('school');
    const course = this.server.create('course', {
      school: school,
      externalId: 'abc',
      level: 3,
      published: true,
    });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    this.set('course', courseModel);
    await render(hbs`<CourseSummaryHeader @course={{this.course}} />`);
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
    const status = `${blocks}:nth-of-type(5) span:nth-of-type(1) [data-test-text]`;

    assert.dom(title).hasText('course 0');
    assert.dom(materialsIcon).hasClass('fa-box-archive');
    assert.dom(printIcon).hasClass('fa-print');
    assert.dom(rolloverIcon).hasClass('fa-shuffle');
    assert.dom(start).hasText(this.intl.formatDate(course.startDate));
    assert.dom(externalId).hasText('abc');
    assert.dom(end).hasText(this.intl.formatDate(course.endDate));
    assert.dom(level).hasText('3');
    assert.dom(status).hasText('Published');
  });

  test('no link to materials when that is the current route', async function (assert) {
    const school = this.server.create('school');
    const routerMock = Service.extend({
      currentRouteName: 'course-materials',
      generateURL() {},
    });
    this.owner.register('service:router', routerMock);

    const course = this.server.create('course', {
      school,
    });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    this.set('course', courseModel);
    await render(hbs`<CourseSummaryHeader @course={{this.course}} />`);
    const actions = '.course-summary-actions a';
    const printIcon = `${actions}:nth-of-type(1) svg`;
    const rolloverIcon = `${actions}:nth-of-type(2) svg`;

    assert.ok(findAll(actions).length, 2);
    assert.dom(printIcon).hasClass('fa-print');
    assert.dom(rolloverIcon).hasClass('fa-shuffle');
  });

  test('no link to rollover when that is the current route', async function (assert) {
    const routerMock = Service.extend({
      currentRouteName: 'course.rollover',
      generateURL() {},
    });
    this.owner.register('service:router', routerMock);

    const course = this.server.create('course');
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    this.set('course', courseModel);
    await render(hbs`<CourseSummaryHeader @course={{this.course}} />`);
    const actions = '.course-summary-actions a';
    const materialsIcon = `${actions}:nth-of-type(1) svg`;
    const printIcon = `${actions}:nth-of-type(2) svg`;

    assert.ok(findAll(actions).length, 2);
    assert.dom(printIcon).hasClass('fa-print');
    assert.dom(materialsIcon).hasClass('fa-box-archive');
  });

  test('no link to rollover when user cannot edit the course', async function (assert) {
    const school = this.server.create('school', {});
    const routerMock = Service.extend({
      currentRouteName: 'course.rollover',
      generateURL() {},
    });
    this.owner.register('service:router', routerMock);

    const course = this.server.create('course', {
      school,
    });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    this.set('course', courseModel);
    await render(hbs`<CourseSummaryHeader @course={{this.course}} />`);
    const actions = '.course-summary-actions a';
    const materialsIcon = `${actions}:nth-of-type(1) svg`;
    const printIcon = `${actions}:nth-of-type(2) svg`;

    assert.ok(findAll(actions).length, 2);
    assert.dom(printIcon).hasClass('fa-print');
    assert.dom(materialsIcon).hasClass('fa-box-archive');
  });
});
