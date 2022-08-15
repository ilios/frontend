import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { component } from 'ilios/tests/pages/components/instructor-group/root';

module('Integration | Component | instructor-group/root', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const user1 = this.server.create('user', { firstName: 'Anton', lastName: 'Alpha' });
    const user2 = this.server.create('user', {
      firstName: 'Zack',
      lastName: 'Zebra',
      displayName: 'Aardvark',
    });
    const school = this.server.create('school');
    const course1 = this.server.create('course', { title: 'Foundations 1' });
    const course2 = this.server.create('course', { title: 'Introduction 101' });
    const session1 = this.server.create('session', { course: course1 });
    const session2 = this.server.create('session', { course: course2 });
    const offering1 = this.server.create('offering', { session: session1 });
    const offering2 = this.server.create('offering', { session: session2 });
    const instructorGroup = this.server.create('instructorGroup', {
      users: [user1, user2],
      offerings: [offering1, offering2],
      school,
    });
    this.instructorGroup = await this.owner
      .lookup('service:store')
      .find('instructorGroup', instructorGroup.id);
  });

  test('it renders', async function (assert) {
    this.set('group', this.instructorGroup);
    await render(
      hbs`<InstructorGroup::Root @instructorGroup={{this.group}} @canUpdate={{true}} />`
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
    assert.strictEqual(component.courses.title, 'Associated Courses (2)');
    assert.strictEqual(component.courses.courses.length, 2);
    assert.strictEqual(component.courses.courses[0].text, 'Foundations 1');
    assert.strictEqual(component.courses.courses[1].text, 'Introduction 101');
  });

  test('it renders in read-only mode', async function (assert) {
    this.set('group', this.instructorGroup);
    await render(
      hbs`<InstructorGroup::Root @instructorGroup={{this.group}} @canUpdate={{false}} />`
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
    assert.strictEqual(component.courses.title, 'Associated Courses (2)');
    assert.strictEqual(component.courses.courses.length, 2);
    assert.strictEqual(component.courses.courses[0].text, 'Foundations 1');
    assert.strictEqual(component.courses.courses[1].text, 'Introduction 101');
  });
});
