import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { setupMSW } from 'ilios-common/msw';
import { render } from '@ember/test-helpers';
import Service from '@ember/service';
import { component } from 'frontend/tests/pages/components/courses/list-item';
import ListItem from 'frontend/components/courses/list-item';
import { array } from '@ember/helper';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | courses/list-item', function (hooks) {
  setupRenderingTest(hooks);
  setupMSW(hooks);

  hooks.beforeEach(async function () {
    const course = await this.server.create('course', {
      title: 'Test Course',
      level: 2,
      startDate: '2023-04-23',
      endDate: '2023-05-30',
      published: false,
      publishedAsTbd: false,
      locked: false,
    });
    this.permissionCheckerMock = class extends Service {
      async canUpdateCourse() {
        return true;
      }
      async canUnlockCourse() {
        return true;
      }
      async canDeleteCourse() {
        return true;
      }
    };
    this.owner.register('service:permissionChecker', this.permissionCheckerMock);
    this.course = await this.owner.lookup('service:store').findRecord('course', course.id);
  });

  test('it renders', async function (assert) {
    await render(
      <template>
        <ListItem
          @course={{this.course}}
          @coursesForRemovalConfirmation={{(array)}}
          @savingCourseIds={{(array)}}
          @lockCourse={{(noop)}}
          @unlockCourse={{(noop)}}
          @confirmRemoval={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(component.title, 'Test Course');
    assert.strictEqual(component.level, '2');
    assert.strictEqual(component.startDate, '04/23/2023');
    assert.strictEqual(component.endDate, '05/30/2023');
    assert.strictEqual(component.publicationStatus.icon.title, 'Not Published');
    assert.ok(component.status.isUnlocked);
    assert.notOk(component.status.isLocked);
    assert.ok(component.status.isUnlocked);
    assert.ok(component.status.isUnlocked);
  });

  test('lock', async function (assert) {
    this.set('lock', (course) => {
      assert.step('lock called');
      assert.strictEqual(course, this.course);
    });
    await render(
      <template>
        <ListItem
          @course={{this.course}}
          @coursesForRemovalConfirmation={{(array)}}
          @savingCourseIds={{(array)}}
          @lockCourse={{this.lock}}
          @unlockCourse={{(array)}}
          @confirmRemoval={{(noop)}}
        />
      </template>,
    );
    assert.ok(component.status.isUnlocked);
    assert.notOk(component.status.isLocked);
    assert.ok(component.status.canLock);
    await component.status.lock();
    assert.verifySteps(['lock called']);
  });

  test('unlock', async function (assert) {
    this.course.locked = true;
    this.set('unlock', (course) => {
      assert.step('unlock called');
      assert.strictEqual(course, this.course);
    });
    await render(
      <template>
        <ListItem
          @course={{this.course}}
          @coursesForRemovalConfirmation={{(array)}}
          @savingCourseIds={{(array)}}
          @lockCourse={{(noop)}}
          @unlockCourse={{this.unlock}}
          @confirmRemoval={{(noop)}}
        />
      </template>,
    );
    assert.notOk(component.status.isUnlocked);
    assert.ok(component.status.isLocked);
    assert.ok(component.status.canUnlock);
    await component.status.unLock();
    assert.verifySteps(['unlock called']);
  });

  test('confirm removal', async function (assert) {
    this.set('confirmRemoval', (course) => {
      assert.step('confirmRemoval called');
      assert.strictEqual(course, this.course);
    });
    await render(
      <template>
        <ListItem
          @course={{this.course}}
          @coursesForRemovalConfirmation={{(array)}}
          @savingCourseIds={{(array)}}
          @lockCourse={{(noop)}}
          @unlockCourse={{(noop)}}
          @confirmRemoval={{this.confirmRemoval}}
        />
      </template>,
    );
    assert.ok(component.status.canRemove);
    await component.status.remove();
    assert.verifySteps(['confirmRemoval called']);
  });

  test('cannot unlock', async function (assert) {
    this.permissionCheckerMock.reopen({
      canUnlockCourse() {
        return false;
      },
    });
    this.course.locked = true;
    await render(
      <template>
        <ListItem
          @course={{this.course}}
          @coursesForRemovalConfirmation={{(array)}}
          @savingCourseIds={{(array)}}
          @lockCourse={{(noop)}}
          @unlockCourse={{(noop)}}
          @confirmRemoval={{(noop)}}
        />
      </template>,
    );
    assert.ok(component.status.isLocked);
    assert.notOk(component.status.canUnlock);
  });

  test('cannot lock', async function (assert) {
    this.permissionCheckerMock.reopen({
      canUpdateCourse() {
        return false;
      },
    });
    await render(
      <template>
        <ListItem
          @course={{this.course}}
          @coursesForRemovalConfirmation={{(array)}}
          @savingCourseIds={{(array)}}
          @lockCourse={{(noop)}}
          @unlockCourse={{(noop)}}
          @confirmRemoval={{(noop)}}
        />
      </template>,
    );
    assert.ok(component.status.isUnlocked);
    assert.notOk(component.status.canLock);
  });

  test('cannot delete b/c course has been rolled over', async function (assert) {
    const course2 = await this.server.create('course');
    const courseModel2 = await this.owner.lookup('service:store').findRecord('course', course2.id);
    this.course.descendants = [courseModel2];
    await render(
      <template>
        <ListItem
          @course={{this.course}}
          @coursesForRemovalConfirmation={{(array)}}
          @savingCourseIds={{(array)}}
          @lockCourse={{(noop)}}
          @unlockCourse={{(noop)}}
          @confirmRemoval={{(noop)}}
        />
      </template>,
    );
    assert.notOk(component.canRemove);
  });

  test('cannot delete b/c course is scheduled', async function (assert) {
    this.course.publishedAsTbd = true;
    await render(
      <template>
        <ListItem
          @course={{this.course}}
          @coursesForRemovalConfirmation={{(array)}}
          @savingCourseIds={{(array)}}
          @lockCourse={{(noop)}}
          @unlockCourse={{(noop)}}
          @confirmRemoval={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(component.publicationStatus.icon.title, 'Scheduled');
    assert.notOk(component.canRemove);
  });

  test('cannot delete b/c course is published', async function (assert) {
    this.course.published = true;
    await render(
      <template>
        <ListItem
          @course={{this.course}}
          @coursesForRemovalConfirmation={{(array)}}
          @savingCourseIds={{(array)}}
          @lockCourse={{(noop)}}
          @unlockCourse={{(noop)}}
          @confirmRemoval={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(component.publicationStatus.icon.title, 'Published');
    assert.notOk(component.canRemove);
  });

  test('cannot delete b/c permission denied', async function (assert) {
    this.permissionCheckerMock.reopen({
      canDeleteCourse() {
        return false;
      },
    });
    await render(
      <template>
        <ListItem
          @course={{this.course}}
          @coursesForRemovalConfirmation={{(array)}}
          @savingCourseIds={{(array)}}
          @lockCourse={{(noop)}}
          @unlockCourse={{(noop)}}
          @confirmRemoval={{(noop)}}
        />
      </template>,
    );
    assert.notOk(component.canRemove);
  });
});
