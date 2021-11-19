import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import Service from '@ember/service';
import { component } from 'ilios/tests/pages/components/learner-groups/list-item';
import a11yAudit from 'ember-a11y-testing/test-support/audit';

module('Integration | Component | learner-groups/list-item', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    this.permissionCheckerMock = class extends Service {
      async canDeleteLearnerGroup() {
        return true;
      }
      async canCreateLearnerGroup() {
        return true;
      }
    };
    this.owner.register('service:permissionChecker', this.permissionCheckerMock);
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const programYear = this.server.create('program-year', { program });
    this.cohort = this.server.create('cohort', { programYear });
    this.learnerGroup = this.server.create('learnerGroup', {
      cohort: this.cohort,
    });
  });

  test('it renders', async function (assert) {
    this.server.createList('learner-group', 3, {
      parent: this.learnerGroup,
    });
    const learnerGroupModel = await this.owner
      .lookup('service:store')
      .find('learner-group', this.learnerGroup.id);
    this.set('learnerGroup', learnerGroupModel);
    await render(hbs`<LearnerGroups::ListItem @learnerGroup={{this.learnerGroup}} />`);
    assert.strictEqual(component.title, 'learner group 0');
    assert.strictEqual(component.users, '0');
    assert.strictEqual(component.children, '3');
    assert.ok(component.canBeDeleted);
    assert.ok(component.canBeCopied);
    await a11yAudit(this.element);
  });

  test('no permission to delete', async function (assert) {
    this.permissionCheckerMock.reopen({
      canDeleteLearnerGroup() {
        return false;
      },
    });
    const learnerGroupModel = await this.owner
      .lookup('service:store')
      .find('learner-group', this.learnerGroup.id);
    this.set('learnerGroup', learnerGroupModel);
    await render(hbs`<LearnerGroups::ListItem @learnerGroup={{this.learnerGroup}} />`);
    assert.strictEqual(component.title, 'learner group 0');
    assert.notOk(component.canBeDeleted);
    assert.ok(component.canBeCopied);
    await a11yAudit(this.element);
  });

  test('no permission to copy', async function (assert) {
    this.permissionCheckerMock.reopen({
      canCreateLearnerGroup() {
        return false;
      },
    });
    const learnerGroupModel = await this.owner
      .lookup('service:store')
      .find('learner-group', this.learnerGroup.id);
    this.set('learnerGroup', learnerGroupModel);
    await render(hbs`<LearnerGroups::ListItem @learnerGroup={{this.learnerGroup}} />`);
    assert.strictEqual(component.title, 'learner group 0');
    assert.ok(component.canBeDeleted);
    assert.notOk(component.canBeCopied);
    await a11yAudit(this.element);
  });

  test('can not delete with users in group', async function (assert) {
    this.server.create('user', { learnerGroups: [this.learnerGroup] });

    const learnerGroupModel = await this.owner
      .lookup('service:store')
      .find('learner-group', this.learnerGroup.id);
    this.set('learnerGroup', learnerGroupModel);
    await render(hbs`<LearnerGroups::ListItem @learnerGroup={{this.learnerGroup}} />`);
    assert.strictEqual(component.title, 'learner group 0');
    assert.strictEqual(component.users, '1');
    assert.notOk(component.canBeDeleted);
  });

  test('can not delete with users in subgroup', async function (assert) {
    const parent = this.server.create('learner-group', { parent: this.learnerGroup });
    this.server.create('learner-group', {
      parent,
      users: [this.server.create('user')],
    });

    const learnerGroupModel = await this.owner
      .lookup('service:store')
      .find('learner-group', this.learnerGroup.id);
    this.set('learnerGroup', learnerGroupModel);
    await render(hbs`<LearnerGroups::ListItem @learnerGroup={{this.learnerGroup}} />`);
    assert.strictEqual(component.title, 'learner group 0');
    assert.strictEqual(component.children, '1');
    assert.strictEqual(component.users, '0');
    assert.notOk(component.canBeDeleted);
  });

  test('can start delete with associated courses', async function (assert) {
    const courses = this.server.createList('course', 4);
    const session1 = this.server.create('session', { course: courses[0] });
    const session2 = this.server.create('session', { course: courses[1] });
    const session3 = this.server.create('session', { course: courses[1] });
    const session4 = this.server.create('session', { course: courses[3] });
    this.server.create('offering', {
      session: session1,
      learnerGroups: [this.learnerGroup],
    });
    this.server.create('offering', {
      session: session2,
      learnerGroups: [this.learnerGroup],
    });
    this.server.create('ilm-session', {
      session: session3,
      learnerGroups: [this.learnerGroup],
    });
    this.server.create('ilm-session', {
      session: session4,
      learnerGroups: [this.learnerGroup],
    });

    const learnerGroupModel = await this.owner
      .lookup('service:store')
      .find('learner-group', this.learnerGroup.id);
    this.set('learnerGroup', learnerGroupModel);
    await render(hbs`<LearnerGroups::ListItem @learnerGroup={{this.learnerGroup}} />`);
    assert.strictEqual(component.title, 'learner group 0');
    assert.ok(component.canBeDeleted);
  });
});
