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

  test('it renders', async function (assert) {
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
    const group = this.server.create('instructorGroup', {
      users: [user1, user2],
      offerings: [offering1, offering2],
      school,
    });
    const groupModel = await this.owner.lookup('service:store').find('instructorGroup', group.id);
    this.set('group', groupModel);
    this.set('canUpdate', true);

    await render(
      hbs`<InstructorGroup::Root @instructorGroup={{this.group}} @canUpdate={{this.canUpdate}} />`
    );

    assert.strictEqual(component.header.title.text, 'instructor group 0');
    assert.strictEqual(component.header.members, 'Members: 2');
    assert.strictEqual(component.header.breadcrumb.crumbs.length, 3);
    assert.strictEqual(component.header.breadcrumb.crumbs[0].text, 'Instructor Groups');
    assert.strictEqual(component.header.breadcrumb.crumbs[1].text, 'school 0');
    assert.strictEqual(component.header.breadcrumb.crumbs[2].text, 'instructor group 0');
    assert.strictEqual(component.overview.users.length, 2);
    assert.strictEqual(component.overview.users[0].userNameInfo.fullName, 'Aardvark');
    assert.ok(component.overview.users[0].userNameInfo.hasAdditionalInfo);
    assert.strictEqual(component.overview.users[1].userNameInfo.fullName, 'Anton M. Alpha');
    assert.notOk(component.overview.users[1].userNameInfo.hasAdditionalInfo);
    assert.strictEqual(component.overview.courses.length, 2);
    assert.strictEqual(component.overview.courses[0].text, 'Foundations 1');
    assert.strictEqual(component.overview.courses[1].text, 'Introduction 101');
  });

  test('add user to group', async function (assert) {
    this.server.createList('user', 3);
    const group = this.server.create('instructorGroup');
    const groupModel = await this.owner.lookup('service:store').find('instructorGroup', group.id);
    this.set('group', groupModel);
    this.set('canUpdate', true);

    await render(
      hbs`<InstructorGroup::Root @instructorGroup={{this.group}} @canUpdate={{this.canUpdate}} />`
    );

    assert.strictEqual(component.overview.users.length, 0);
    await component.overview.search.searchBox.set('user');
    assert.strictEqual(component.overview.search.results.items.length, 3);
    await component.overview.search.results.items[0].click();
    assert.strictEqual(component.overview.users.length, 1);
    assert.strictEqual(component.overview.users[0].userNameInfo.fullName, '0 guy M. Mc0son');
  });

  test('remove user from group', async function (assert) {
    const user = this.server.create('user');
    const group = this.server.create('instructorGroup', { users: [user] });
    const groupModel = await this.owner.lookup('service:store').find('instructorGroup', group.id);
    this.set('group', groupModel);
    this.set('canUpdate', true);

    await render(
      hbs`<InstructorGroup::Root @instructorGroup={{this.group}} @canUpdate={{this.canUpdate}} />`
    );

    assert.strictEqual(component.overview.users.length, 1);
    assert.strictEqual(component.overview.users[0].userNameInfo.fullName, '0 guy M. Mc0son');
    await component.overview.users[0].remove();
    assert.strictEqual(component.overview.users.length, 0);
  });
});
