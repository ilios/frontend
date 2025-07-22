import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { component } from 'frontend/tests/pages/components/instructor-group/root';
import Root from 'frontend/components/instructor-group/root';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | instructor-group/root', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const user1 = this.server.create('user', { firstName: 'Anton', lastName: 'Alpha' });
    const user2 = this.server.create('user', {
      firstName: 'Zack',
      lastName: 'Zebra',
      displayName: 'Aardvark',
    });
    const school = this.server.create('school');
    const courses = this.server.createList('course', 2, { school });
    const session1 = this.server.create('session', { course: courses[0] });
    const session2 = this.server.create('session', { course: courses[1] });
    const offering1 = this.server.create('offering', { session: session1 });
    const offering2 = this.server.create('offering', { session: session2 });
    const instructorGroup = this.server.create('instructor-group', {
      users: [user1, user2],
      offerings: [offering1, offering2],
      school,
    });
    this.instructorGroup = await this.owner
      .lookup('service:store')
      .findRecord('instructor-group', instructorGroup.id);
  });

  test('it renders', async function (assert) {
    this.set('group', this.instructorGroup);
    await render(
      <template>
        <Root
          @instructorGroup={{this.group}}
          @canUpdate={{true}}
          @showCourseAssociations={{false}}
          @setShowCourseAssociations={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(component.header.title.text, 'instructor group 0');
    assert.strictEqual(component.header.members, 'Members: 2');
    assert.strictEqual(component.header.breadcrumb.crumbs.length, 3);
    assert.strictEqual(component.header.breadcrumb.crumbs[0].text, 'Instructor Groups');
    assert.strictEqual(component.header.breadcrumb.crumbs[1].text, 'school 0');
    assert.strictEqual(component.header.breadcrumb.crumbs[2].text, 'instructor group 0');
    assert.strictEqual(component.users.title, 'Instructors (2)');
    assert.ok(component.users.manage.isVisible);
    assert.strictEqual(component.users.users.length, 2);
    assert.strictEqual(component.users.users[0].userNameInfo.fullName, 'Aardvark');
    assert.ok(component.users.users[0].userNameInfo.hasAdditionalInfo);
    assert.strictEqual(component.users.users[1].userNameInfo.fullName, 'Anton M. Alpha');
    assert.notOk(component.users.users[1].userNameInfo.hasAdditionalInfo);
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders in read-only mode', async function (assert) {
    this.set('group', this.instructorGroup);
    await render(
      <template>
        <Root
          @instructorGroup={{this.group}}
          @canUpdate={{false}}
          @showCourseAssociations={{false}}
          @setShowCourseAssociations={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(component.header.title.text, 'instructor group 0');
    assert.strictEqual(component.header.members, 'Members: 2');
    assert.strictEqual(component.header.breadcrumb.crumbs.length, 3);
    assert.strictEqual(component.header.breadcrumb.crumbs[0].text, 'Instructor Groups');
    assert.strictEqual(component.header.breadcrumb.crumbs[1].text, 'school 0');
    assert.strictEqual(component.header.breadcrumb.crumbs[2].text, 'instructor group 0');
    assert.strictEqual(component.users.title, 'Instructors (2)');
    assert.notOk(component.users.manage.isVisible);
    assert.strictEqual(component.users.users.length, 2);
    assert.strictEqual(component.users.users[0].userNameInfo.fullName, 'Aardvark');
    assert.ok(component.users.users[0].userNameInfo.hasAdditionalInfo);
    assert.strictEqual(component.users.users[1].userNameInfo.fullName, 'Anton M. Alpha');
    assert.notOk(component.users.users[1].userNameInfo.hasAdditionalInfo);
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders course associations collapsed, and expand action fires', async function (assert) {
    assert.expect(4);
    this.set('group', this.instructorGroup);
    this.set('toggle', (value) => {
      assert.ok(value);
    });
    await render(
      <template>
        <Root
          @instructorGroup={{this.group}}
          @canUpdate={{true}}
          @showCourseAssociations={{false}}
          @setShowCourseAssociations={{this.toggle}}
        />
      </template>,
    );
    assert.strictEqual(component.courseAssociations.header.title, 'Associated Courses (2)');
    assert.ok(component.courseAssociations.header.toggle.isCollapsed);
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
    await component.courseAssociations.header.toggle.click();
  });

  test('it renders course associations expanded, and collapse action fires', async function (assert) {
    assert.expect(4);
    this.set('group', this.instructorGroup);
    this.set('toggle', (value) => {
      assert.notOk(value);
    });
    await render(
      <template>
        <Root
          @instructorGroup={{this.group}}
          @canUpdate={{true}}
          @showCourseAssociations={{true}}
          @setShowCourseAssociations={{this.toggle}}
        />
      </template>,
    );
    assert.strictEqual(component.courseAssociations.header.title, 'Associated Courses (2)');
    assert.ok(component.courseAssociations.header.toggle.isExpanded);
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
    await component.courseAssociations.header.toggle.click();
  });
});
