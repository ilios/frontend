import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import Service from '@ember/service';
import { component } from 'ilios/tests/pages/components/instructor-groups/list-item';
import a11yAudit from 'ember-a11y-testing/test-support/audit';

module('Integration | Component | instructor-groups/list-item', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    this.permissionCheckerMock = class extends Service {
      async canDeleteInstructorGroup() {
        return true;
      }
    };
    this.owner.register('service:permissionChecker', this.permissionCheckerMock);
    this.school = this.server.create('school');
    this.instructorGroup = this.server.create('instructorGroup', {
      school: this.school,
      users: this.server.createList('user', 3),
    });
  });

  test('it renders', async function (assert) {
    const instructorGroupModel = await this.owner
      .lookup('service:store')
      .findRecord('instructor-group', this.instructorGroup.id);
    this.set('instructorGroup', instructorGroupModel);
    await render(hbs`<InstructorGroups::ListItem @instructorGroup={{this.instructorGroup}} />`);
    assert.strictEqual(component.title, 'instructor group 0');
    assert.strictEqual(component.users, '3');
    assert.strictEqual(component.courses, '0');
    assert.ok(component.canBeDeleted);
    await a11yAudit(this.element);
  });

  test('no permission to delete', async function (assert) {
    this.permissionCheckerMock.reopen({
      canDeleteInstructorGroup() {
        return false;
      },
    });
    const instructorGroupModel = await this.owner
      .lookup('service:store')
      .findRecord('instructor-group', this.instructorGroup.id);
    this.set('instructorGroup', instructorGroupModel);
    await render(hbs`<InstructorGroups::ListItem @instructorGroup={{this.instructorGroup}} />`);
    assert.strictEqual(component.title, 'instructor group 0');
    assert.notOk(component.canBeDeleted);
    await a11yAudit(this.element);
  });

  test('can not delete with associated courses', async function (assert) {
    const courses = this.server.createList('course', 4);
    const session1 = this.server.create('session', { course: courses[0] });
    const session2 = this.server.create('session', { course: courses[1] });
    const session3 = this.server.create('session', { course: courses[1] });
    const session4 = this.server.create('session', { course: courses[3] });
    this.server.create('offering', {
      session: session1,
      instructorGroups: [this.instructorGroup],
    });
    this.server.create('offering', {
      session: session2,
      instructorGroups: [this.instructorGroup],
    });
    this.server.create('ilm-session', {
      session: session3,
      instructorGroups: [this.instructorGroup],
    });
    this.server.create('ilm-session', {
      session: session4,
      instructorGroups: [this.instructorGroup],
    });

    const instructorGroupModel = await this.owner
      .lookup('service:store')
      .findRecord('instructor-group', this.instructorGroup.id);
    this.set('instructorGroup', instructorGroupModel);
    await render(hbs`<InstructorGroups::ListItem @instructorGroup={{this.instructorGroup}} />`);
    assert.strictEqual(component.title, 'instructor group 0');
    assert.strictEqual(component.courses, '3');
    assert.notOk(component.canBeDeleted);
  });
});
