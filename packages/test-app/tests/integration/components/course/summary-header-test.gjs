import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render, findAll } from '@ember/test-helpers';
import { setupMirage } from 'test-app/tests/test-support/mirage';
import SummaryHeader from 'ilios-common/components/course/summary-header';

module('Integration | Component | course summary header', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    class CurrentUserMock extends Service {
      userIsCourseDirector = true;
    }
    this.owner.register('service:currentUser', CurrentUserMock);

    class PermissionCheckerStub extends Service {
      async canCreateCourse() {
        return true;
      }
    }

    this.owner.register('service:permissionChecker', PermissionCheckerStub);
  });

  test('it renders', async function (assert) {
    class PermissionCheckerStub extends Service {
      async canCreateCourse(inSchool) {
        assert.step('canCreateCourse called');
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
    await render(<template><SummaryHeader @course={{this.course}} /></template>);
    const title = 'h2';
    const actions = '.course-summary-actions';
    const printIcon = `${actions} a:nth-of-type(1) svg`;
    const rolloverIcon = `${actions} a:nth-of-type(2) svg`;
    const blocks = '.course-summary-content .block';
    const start = `${blocks}:nth-of-type(1) span`;
    const externalId = `${blocks}:nth-of-type(2) span`;
    const end = `${blocks}:nth-of-type(3) span`;
    const level = `${blocks}:nth-of-type(4) span`;
    const status = `${blocks}:nth-of-type(5) span:nth-of-type(1) [data-test-publication-status]`;
    const statusTitle = `${status} title`;

    assert.dom(title).hasText('course 0');
    assert.dom(printIcon).hasClass('fa-print');
    assert.dom(rolloverIcon).hasClass('fa-shuffle');
    assert.dom(start).hasText('06/24/2005');
    assert.dom(externalId).hasText('abc');
    assert.dom(end).hasText('08/12/2005');
    assert.dom(level).hasText('3');
    assert.dom(statusTitle).hasText('Published');
    assert.verifySteps(['canCreateCourse called']);
  });

  test('no link to rollover when user cannot edit the course', async function (assert) {
    const school = this.server.create('school', {});
    const course = this.server.create('course', {
      school,
    });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    this.set('course', courseModel);
    await render(<template><SummaryHeader @course={{this.course}} /></template>);
    const actions = '.course-summary-actions a';
    const printIcon = `${actions}:nth-of-type(1) svg`;

    assert.ok(findAll(actions).length, 2);
    assert.dom(printIcon).hasClass('fa-print');
  });

  test('no link to rollover if course is locked', async function (assert) {
    const school = this.server.create('school', {});
    const course = this.server.create('course', {
      school,
      locked: true,
    });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    this.set('course', courseModel);
    await render(<template><SummaryHeader @course={{this.course}} /></template>);
    const actions = '.course-summary-actions a';
    const printIcon = `${actions}:nth-of-type(1) svg`;

    assert.ok(findAll(actions).length, 2);
    assert.dom(printIcon).hasClass('fa-print');
  });
});
