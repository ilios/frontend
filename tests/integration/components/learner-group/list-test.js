import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { component } from 'ilios/tests/pages/components/learner-group/list';
import Service from '@ember/service';
import a11yAudit from 'ember-a11y-testing/test-support/audit';

module('Integration | Component | learner-group/list', function (hooks) {
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
  });

  test('it renders', async function (assert) {
    this.server.createList('learner-group', 3, { cohort: this.cohort });
    this.server.createList('learner-group', 3, { cohort: this.cohort, parentId: 2 });
    this.server.createList('learner-group', 3, { cohort: this.cohort, parentId: 5 });
    const store = this.owner.lookup('service:store');
    const learnerGroupModels = [
      await store.findRecord('learner-group', 1),
      await store.findRecord('learner-group', 2),
      await store.findRecord('learner-group', 3),
    ];
    this.set('learnerGroups', learnerGroupModels);
    await render(hbs`<LearnerGroup::List
      @learnerGroups={{this.learnerGroups}}
      @sortBy="title"
      @setSortBy={{(noop)}}
    />`);

    assert.strictEqual(component.items.length, 3);
    assert.strictEqual(component.items[0].title, 'learner group 0');
    assert.strictEqual(component.items[0].users, '0');
    assert.strictEqual(component.items[0].children, '0');
    assert.strictEqual(component.items[1].title, 'learner group 1');
    assert.strictEqual(component.items[1].users, '0');
    assert.strictEqual(component.items[1].children, '3');
    assert.strictEqual(component.items[2].title, 'learner group 2');
    assert.strictEqual(component.items[2].users, '0');
    assert.strictEqual(component.items[2].children, '0');
    await a11yAudit(this.element);
  });

  test('sort', async function (assert) {
    const group1 = this.server.create('learner-group', {
      cohort: this.cohort,
      users: this.server.createList('user', 5),
    });
    const group2 = this.server.create('learner-group', {
      cohort: this.cohort,
      users: this.server.createList('user', 3),
    });
    const group3 = this.server.create('learner-group', {
      cohort: this.cohort,
      users: this.server.createList('user', 4),
    });
    this.server.createList('learner-group', 2, { parent: group1 });
    this.server.createList('learner-group', 5, { parent: group2 });
    this.server.createList('learner-group', 4, { parent: group3 });
    const store = this.owner.lookup('service:store');
    const learnerGroupModels = [
      await store.findRecord('learner-group', group1.id),
      await store.findRecord('learner-group', group2.id),
      await store.findRecord('learner-group', group3.id),
    ];
    this.set('learnerGroups', learnerGroupModels);
    this.set('sortBy', 'title');
    await render(hbs`<LearnerGroup::List
      @learnerGroups={{this.learnerGroups}}
      @sortBy={{this.sortBy}}
      @setSortBy={{set this.sortBy}}
    />`);

    assert.strictEqual(component.items.length, 3);
    assert.ok(component.header.title.isSortedAscending);
    assert.ok(component.header.users.isNotSorted);
    assert.ok(component.header.children.isNotSorted);
    assert.strictEqual(component.items[0].title, 'learner group 0');
    assert.strictEqual(component.items[0].users, '5');
    assert.strictEqual(component.items[0].children, '2');
    assert.strictEqual(component.items[1].title, 'learner group 1');
    assert.strictEqual(component.items[1].users, '3');
    assert.strictEqual(component.items[1].children, '5');
    assert.strictEqual(component.items[2].title, 'learner group 2');
    assert.strictEqual(component.items[2].users, '4');
    assert.strictEqual(component.items[2].children, '4');

    await component.header.title.click();
    assert.ok(component.header.title.isSortedDescending);
    assert.ok(component.header.users.isNotSorted);
    assert.ok(component.header.children.isNotSorted);
    assert.strictEqual(component.items[0].title, 'learner group 2');
    assert.strictEqual(component.items[1].title, 'learner group 1');
    assert.strictEqual(component.items[2].title, 'learner group 0');

    await component.header.users.click();
    assert.ok(component.header.title.isNotSorted);
    assert.ok(component.header.users.isSortedAscending);
    assert.ok(component.header.children.isNotSorted);
    assert.strictEqual(component.items[0].users, '3');
    assert.strictEqual(component.items[1].users, '4');
    assert.strictEqual(component.items[2].users, '5');

    await component.header.users.click();
    assert.ok(component.header.title.isNotSorted);
    assert.ok(component.header.users.isSortedDescending);
    assert.ok(component.header.children.isNotSorted);
    assert.strictEqual(component.items[0].users, '5');
    assert.strictEqual(component.items[1].users, '4');
    assert.strictEqual(component.items[2].users, '3');

    await component.header.children.click();
    assert.ok(component.header.title.isNotSorted);
    assert.ok(component.header.users.isNotSorted);
    assert.ok(component.header.children.isSortedAscending);
    assert.strictEqual(component.items[0].children, '2');
    assert.strictEqual(component.items[1].children, '4');
    assert.strictEqual(component.items[2].children, '5');

    await component.header.children.click();
    assert.ok(component.header.title.isNotSorted);
    assert.ok(component.header.users.isNotSorted);
    assert.ok(component.header.children.isSortedDescending);
    assert.strictEqual(component.items[0].children, '5');
    assert.strictEqual(component.items[1].children, '4');
    assert.strictEqual(component.items[2].children, '2');
  });

  test('remove', async function (assert) {
    this.server.createList('learner-group', 3, { cohort: this.cohort });
    const learnerGroupModels = await this.owner.lookup('service:store').findAll('learner-group');
    this.set('learnerGroups', learnerGroupModels);
    await render(hbs`<LearnerGroup::List
      @learnerGroups={{this.learnerGroups}}
      @sortBy="title"
      @setSortBy={{(noop)}}
    />`);
    assert.strictEqual(this.server.db.learnerGroups.length, 3);
    assert.strictEqual(component.items.length, 3);
    assert.strictEqual(component.items[0].title, 'learner group 0');
    await component.items[0].remove();
    await component.confirmRemoval.confirm();
    assert.strictEqual(this.server.db.learnerGroups.length, 2);
    assert.strictEqual(component.items.length, 2);
    assert.strictEqual(component.items[0].title, 'learner group 1');
  });

  test('cancel remove', async function (assert) {
    this.server.createList('learner-group', 3, { cohort: this.cohort });
    const learnerGroupModels = await this.owner.lookup('service:store').findAll('learner-group');
    this.set('learnerGroups', learnerGroupModels);
    await render(hbs`<LearnerGroup::List
      @learnerGroups={{this.learnerGroups}}
      @sortBy="title"
      @setSortBy={{(noop)}}
    />`);
    assert.strictEqual(this.server.db.learnerGroups.length, 3);
    assert.strictEqual(component.items.length, 3);
    assert.strictEqual(component.items[0].title, 'learner group 0');
    await component.items[0].remove();
    await component.confirmRemoval.cancel();
    assert.strictEqual(this.server.db.learnerGroups.length, 3);
    assert.strictEqual(component.items.length, 3);
    assert.strictEqual(component.items[0].title, 'learner group 0');
  });

  test('copy with learners', async function (assert) {
    assert.expect(3);
    this.server.createList('learner-group', 1, { cohort: this.cohort });
    const learnerGroupModels = await this.owner.lookup('service:store').findAll('learner-group');
    this.set('learnerGroups', learnerGroupModels);
    this.set('copyGroup', (withLearners, group) => {
      assert.ok(withLearners);
      assert.strictEqual(parseInt(group.id, 10), 1);
    });
    await render(hbs`<LearnerGroup::List
      @learnerGroups={{this.learnerGroups}}
      @canCopyWithLearners={{true}}
      @copyGroup={{this.copyGroup}}
      @sortBy="title"
      @setSortBy={{(noop)}}
    />`);
    await component.items[0].copy();
    assert.ok(component.confirmCopy.canCopyWithLearners);
    await component.confirmCopy.copyWithLearners();
  });

  test('copy without learners when with learners is enabled', async function (assert) {
    assert.expect(3);
    this.server.createList('learner-group', 1, { cohort: this.cohort });
    const learnerGroupModels = await this.owner.lookup('service:store').findAll('learner-group');
    this.set('learnerGroups', learnerGroupModels);
    this.set('copyGroup', (withLearners, group) => {
      assert.notOk(withLearners);
      assert.strictEqual(parseInt(group.id, 10), 1);
    });
    await render(hbs`<LearnerGroup::List
      @learnerGroups={{this.learnerGroups}}
      @canCopyWithLearners={{true}}
      @copyGroup={{this.copyGroup}}
      @sortBy="title"
      @setSortBy={{(noop)}}
    />`);
    await component.items[0].copy();
    assert.ok(component.confirmCopy.canCopyWithLearners);
    await component.confirmCopy.copyWithoutLearners();
  });

  test('copy without learners', async function (assert) {
    assert.expect(3);
    this.server.createList('learner-group', 1, { cohort: this.cohort });
    const learnerGroupModels = await this.owner.lookup('service:store').findAll('learner-group');
    this.set('learnerGroups', learnerGroupModels);
    this.set('copyGroup', (withLearners, group) => {
      assert.notOk(withLearners);
      assert.strictEqual(parseInt(group.id, 10), 1);
    });
    await render(hbs`<LearnerGroup::List
      @learnerGroups={{this.learnerGroups}}
      @canCopyWithLearners={{false}}
      @copyGroup={{this.copyGroup}}
      @sortBy="title"
      @setSortBy={{(noop)}}
    />`);
    await component.items[0].copy();
    assert.notOk(component.confirmCopy.canCopyWithLearners);
    await component.confirmCopy.copyWithoutLearners();
  });

  test('cancel copy with learners enabled', async function (assert) {
    assert.expect(3);
    this.server.createList('learner-group', 1, { cohort: this.cohort });
    const learnerGroupModels = await this.owner.lookup('service:store').findAll('learner-group');
    this.set('learnerGroups', learnerGroupModels);
    this.set('copyGroup', () => {
      assert.ok(false);
    });
    await render(hbs`<LearnerGroup::List
      @learnerGroups={{this.learnerGroups}}
      @canCopyWithLearners={{true}}
      @copyGroup={{this.copyGroup}}
      @sortBy="title"
      @setSortBy={{(noop)}}
    />`);
    await component.items[0].copy();
    assert.ok(component.confirmCopy.isPresent);
    assert.ok(component.confirmCopy.canCopyWithLearners);
    await component.confirmCopy.cancel();
    assert.notOk(component.confirmCopy.isPresent);
  });

  test('cancel copy with learners disabled', async function (assert) {
    assert.expect(3);
    this.server.createList('learner-group', 1, { cohort: this.cohort });
    const learnerGroupModels = await this.owner.lookup('service:store').findAll('learner-group');
    this.set('learnerGroups', learnerGroupModels);
    this.set('copyGroup', () => {
      assert.ok(false);
    });
    await render(hbs`<LearnerGroup::List
      @learnerGroups={{this.learnerGroups}}
      @canCopyWithLearners={{false}}
      @copyGroup={{this.copyGroup}}
      @sortBy="title"
      @setSortBy={{(noop)}}
    />`);
    await component.items[0].copy();
    assert.ok(component.confirmCopy.isPresent);
    assert.notOk(component.confirmCopy.canCopyWithLearners);
    await component.confirmCopy.cancel();
    assert.notOk(component.confirmCopy.isPresent);
  });
});
