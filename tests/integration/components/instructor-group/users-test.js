import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { component } from 'ilios/tests/pages/components/instructor-group/users';

module('Integration | Component | instructor-group/users', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  test('it renders', async function (assert) {
    const users = this.server.createList('user', 3);
    const instructorGroup = this.server.create('instructor-group', { users });
    const instructorGroupModel = await this.owner
      .lookup('service:store')
      .findRecord('instructor-group', instructorGroup.id);
    this.set('instructorGroup', instructorGroupModel);
    await render(
      hbs`<InstructorGroup::Users @instructorGroup={{this.instructorGroup}} @canUpdate={{true}} />`
    );
    assert.strictEqual(component.title, 'Instructors (3)');
    assert.ok(component.manage.isVisible);
    assert.strictEqual(component.manage.text, 'Manage Instructors');
    assert.notOk(component.save.isVisible);
    assert.notOk(component.cancel.isVisible);
    assert.notOk(component.manager.isVisible);
    assert.strictEqual(component.users.length, 3);
    assert.strictEqual(component.users[0].userNameInfo.fullName, '0 guy M. Mc0son');
    assert.strictEqual(component.users[1].userNameInfo.fullName, '1 guy M. Mc1son');
    assert.strictEqual(component.users[2].userNameInfo.fullName, '2 guy M. Mc2son');
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('read-only', async function (assert) {
    const users = this.server.createList('user', 3);
    const instructorGroup = this.server.create('instructor-group', { users });
    const instructorGroupModel = await this.owner
      .lookup('service:store')
      .findRecord('instructor-group', instructorGroup.id);
    this.set('instructorGroup', instructorGroupModel);
    await render(
      hbs`<InstructorGroup::Users @instructorGroup={{this.instructorGroup}} @canUpdate={{false}} />`
    );
    assert.strictEqual(component.title, 'Instructors (3)');
    assert.notOk(component.manage.isVisible);
    assert.notOk(component.save.isVisible);
    assert.notOk(component.cancel.isVisible);
    assert.notOk(component.manager.isVisible);
    assert.strictEqual(component.users.length, 3);
    assert.strictEqual(component.users[0].userNameInfo.fullName, '0 guy M. Mc0son');
    assert.strictEqual(component.users[1].userNameInfo.fullName, '1 guy M. Mc1son');
    assert.strictEqual(component.users[2].userNameInfo.fullName, '2 guy M. Mc2son');
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('no users', async function (assert) {
    const instructorGroup = this.server.create('instructor-group');
    const instructorGroupModel = await this.owner
      .lookup('service:store')
      .findRecord('instructor-group', instructorGroup.id);
    this.set('instructorGroup', instructorGroupModel);
    await render(
      hbs`<InstructorGroup::Users @instructorGroup={{this.instructorGroup}} @canUpdate={{true}} />`
    );
    assert.strictEqual(component.title, 'Instructors (0)');
    assert.ok(component.manage.isVisible);
    assert.strictEqual(component.manage.text, 'Manage Instructors');
    assert.notOk(component.save.isVisible);
    assert.notOk(component.cancel.isVisible);
    assert.notOk(component.manager.isVisible);
    assert.strictEqual(component.users.length, 0);
  });

  test('remove user, then cancel', async function (assert) {
    const users = this.server.createList('user', 3);
    const instructorGroup = this.server.create('instructor-group', { users });
    const instructorGroupModel = await this.owner
      .lookup('service:store')
      .findRecord('instructor-group', instructorGroup.id);
    this.set('instructorGroup', instructorGroupModel);
    await render(hbs`<InstructorGroup::Users
      @instructorGroup={{this.instructorGroup}}
      @canUpdate={{true}}
    />`);
    assert.strictEqual(component.users.length, 3);
    assert.strictEqual(component.title, 'Instructors (3)');
    await component.manage.click();
    assert.strictEqual(component.title, 'Manage Instructors');
    assert.notOk(component.manage.isVisible);
    assert.ok(component.save.isVisible);
    assert.ok(component.cancel.isVisible);
    assert.notOk(component.users.isVisible);
    assert.strictEqual(component.manager.selectedInstructors.users.length, 3);
    await component.manager.selectedInstructors.users[0].remove();
    assert.strictEqual(component.manager.selectedInstructors.users.length, 2);
    await component.cancel.click();
    assert.strictEqual(component.users.length, 3);
    assert.strictEqual(component.title, 'Instructors (3)');
  });

  test('remove user, then save', async function (assert) {
    const users = this.server.createList('user', 3);
    const instructorGroup = this.server.create('instructor-group', { users });
    const instructorGroupModel = await this.owner
      .lookup('service:store')
      .findRecord('instructor-group', instructorGroup.id);
    this.set('instructorGroup', instructorGroupModel);
    await render(hbs`<InstructorGroup::Users
      @instructorGroup={{this.instructorGroup}}
      @canUpdate={{true}}
    />`);
    assert.strictEqual(component.users.length, 3);
    assert.strictEqual(component.title, 'Instructors (3)');
    await component.manage.click();
    assert.strictEqual(component.title, 'Manage Instructors');
    assert.notOk(component.manage.isVisible);
    assert.ok(component.save.isVisible);
    assert.ok(component.cancel.isVisible);
    assert.notOk(component.users.isVisible);
    assert.strictEqual(component.manager.selectedInstructors.users.length, 3);
    await component.manager.selectedInstructors.users[0].remove();
    assert.strictEqual(component.manager.selectedInstructors.users.length, 2);
    await component.save.click();
    assert.strictEqual(component.users.length, 2);
    assert.strictEqual(component.title, 'Instructors (2)');
  });

  test('add user, then cancel', async function (assert) {
    const users = this.server.createList('user', 3);
    const instructorGroup = this.server.create('instructor-group', {
      users: [users[0], users[1]],
    });
    const instructorGroupModel = await this.owner
      .lookup('service:store')
      .findRecord('instructor-group', instructorGroup.id);
    this.set('instructorGroup', instructorGroupModel);
    await render(hbs`<InstructorGroup::Users
      @instructorGroup={{this.instructorGroup}}
      @canUpdate={{true}}
    />`);
    assert.strictEqual(component.users.length, 2);
    assert.strictEqual(component.title, 'Instructors (2)');
    await component.manage.click();
    assert.strictEqual(component.title, 'Manage Instructors');
    assert.notOk(component.manage.isVisible);
    assert.ok(component.save.isVisible);
    assert.ok(component.cancel.isVisible);
    assert.notOk(component.users.isVisible);
    assert.strictEqual(component.manager.selectedInstructors.users.length, 2);
    await component.manager.availableInstructors.userSearch.searchBox.set('Mc2son');
    await component.manager.availableInstructors.userSearch.results.items[0].click();
    assert.strictEqual(component.manager.selectedInstructors.users.length, 3);
    await component.cancel.click();
    assert.strictEqual(component.users.length, 2);
    assert.strictEqual(component.title, 'Instructors (2)');
  });

  test('add user, then save', async function (assert) {
    const users = this.server.createList('user', 3);
    const instructorGroup = this.server.create('instructor-group', {
      users: [users[0], users[1]],
    });
    const instructorGroupModel = await this.owner
      .lookup('service:store')
      .findRecord('instructor-group', instructorGroup.id);
    this.set('instructorGroup', instructorGroupModel);
    await render(hbs`<InstructorGroup::Users
      @instructorGroup={{this.instructorGroup}}
      @canUpdate={{true}}
    />`);
    assert.strictEqual(component.users.length, 2);
    assert.strictEqual(component.title, 'Instructors (2)');
    await component.manage.click();
    assert.strictEqual(component.title, 'Manage Instructors');
    assert.notOk(component.manage.isVisible);
    assert.ok(component.save.isVisible);
    assert.ok(component.cancel.isVisible);
    assert.notOk(component.users.isVisible);
    assert.strictEqual(component.manager.selectedInstructors.users.length, 2);
    await component.manager.availableInstructors.userSearch.searchBox.set('Mc2son');
    await component.manager.availableInstructors.userSearch.results.items[0].click();
    assert.strictEqual(component.manager.selectedInstructors.users.length, 3);
    await component.save.click();
    assert.strictEqual(component.users.length, 3);
    assert.strictEqual(component.title, 'Instructors (3)');
  });
});
