import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMSW } from 'ilios-common/msw';
import { component } from 'ilios-common/page-objects/components/course/summary-header';
import SummaryHeader from 'ilios-common/components/course/summary-header';

module('Integration | Component | course summary header', function (hooks) {
  setupRenderingTest(hooks);
  setupMSW(hooks);

  test('it renders', async function (assert) {
    class PermissionCheckerStub extends Service {
      async canCreateCourse(inSchool) {
        assert.step('canCreateCourse called');
        assert.strictEqual(school.id, inSchool.id);
        return true;
      }
    }

    this.owner.register('service:permissionChecker', PermissionCheckerStub);
    const school = await this.server.create('school');
    const course = await this.server.create('course', {
      school: school,
      externalId: 'abc',
      level: 3,
      published: true,
    });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    this.set('course', courseModel);
    await render(<template><SummaryHeader @course={{this.course}} /></template>);
    assert.deepEqual(component.title, 'course 0');
    assert.ok(component.actions.canPrint);
    assert.ok(component.actions.canRollover);
    assert.deepEqual(component.start, '06/24/2005');
    assert.deepEqual(component.externalId, 'abc');
    assert.deepEqual(component.end, '08/12/2005');
    assert.deepEqual(component.level, '3');
    assert.deepEqual(component.status, 'Published');
    assert.verifySteps(['canCreateCourse called']);
  });

  test('no link to rollover when user cannot edit the course', async function (assert) {
    class PermissionCheckerStub extends Service {
      async canCreateCourse(inSchool) {
        assert.step('canCreateCourse called');
        assert.strictEqual(school.id, inSchool.id);
        return false;
      }
    }

    this.owner.register('service:permissionChecker', PermissionCheckerStub);
    const school = await this.server.create('school', {});
    const course = await this.server.create('course', {
      school,
    });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    this.set('course', courseModel);
    await render(<template><SummaryHeader @course={{this.course}} /></template>);
    assert.ok(component.actions.count, 1);
    assert.ok(component.actions.canPrint);
    assert.notOk(component.actions.canRollover);
    assert.verifySteps(['canCreateCourse called']);
  });

  test('no link to rollover if course is locked', async function (assert) {
    const school = await this.server.create('school', {});
    const course = await this.server.create('course', {
      school,
      locked: true,
    });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    this.set('course', courseModel);
    await render(<template><SummaryHeader @course={{this.course}} /></template>);
    assert.ok(component.actions.count, 1);
    assert.ok(component.actions.canPrint);
    assert.notOk(component.actions.canRollover);
  });
});
