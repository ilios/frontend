import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { component } from 'ilios/tests/pages/components/learner-groups/list';
import Service from '@ember/service';
import a11yAudit from 'ember-a11y-testing/test-support/audit';

module('Integration | Component | learner-groups/list', function (hooks) {
  setupRenderingTest(hooks);
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
    await render(hbs`<LearnerGroups::List @learnerGroups={{this.learnerGroups}} />`);

    assert.equal(component.items.length, 3);
    assert.equal(component.items[0].title, 'learner group 0');
    assert.equal(component.items[0].users, '0');
    assert.equal(component.items[0].children, '0');
    assert.equal(component.items[1].title, 'learner group 1');
    assert.equal(component.items[1].users, '0');
    assert.equal(component.items[1].children, '3');
    assert.equal(component.items[2].title, 'learner group 2');
    assert.equal(component.items[2].users, '0');
    assert.equal(component.items[2].children, '0');
    await a11yAudit(this.element);
  });

  test('it renders empty', async function (assert) {
    await render(hbs`<LearnerGroups::List @programs={{(array)}} />`);

    assert.equal(component.items.length, 0);
    assert.ok(component.isEmpty);
  });

  test('remove', async function (assert) {
    this.server.createList('learner-group', 3, { cohort: this.cohort });
    const learnerGroupModels = await this.owner.lookup('service:store').findAll('learner-group');
    this.set('learnerGroups', learnerGroupModels);
    await render(hbs`<LearnerGroups::List @learnerGroups={{this.learnerGroups}} />`);
    assert.equal(this.server.db.learnerGroups.length, 3);
    assert.equal(component.items.length, 3);
    assert.equal(component.items[0].title, 'learner group 0');
    await component.items[0].remove();
    await component.confirmRemoval.confirm();
    assert.equal(this.server.db.learnerGroups.length, 2);
    assert.equal(component.items.length, 2);
    assert.equal(component.items[0].title, 'learner group 1');
  });

  test('cancel remove', async function (assert) {
    this.server.createList('learner-group', 3, { cohort: this.cohort });
    const learnerGroupModels = await this.owner.lookup('service:store').findAll('learner-group');
    this.set('learnerGroups', learnerGroupModels);
    await render(hbs`<LearnerGroups::List @learnerGroups={{this.learnerGroups}} />`);
    assert.equal(this.server.db.learnerGroups.length, 3);
    assert.equal(component.items.length, 3);
    assert.equal(component.items[0].title, 'learner group 0');
    await component.items[0].remove();
    await component.confirmRemoval.cancel();
    assert.equal(this.server.db.learnerGroups.length, 3);
    assert.equal(component.items.length, 3);
    assert.equal(component.items[0].title, 'learner group 0');
  });

  test('copy with learners', async function (assert) {
    assert.expect(3);
    this.server.createList('learner-group', 1, { cohort: this.cohort });
    const learnerGroupModels = await this.owner.lookup('service:store').findAll('learner-group');
    this.set('learnerGroups', learnerGroupModels);
    this.set('copyGroup', (withLearners, group) => {
      assert.ok(withLearners);
      assert.equal(group.id, 1);
    });
    await render(hbs`<LearnerGroups::List
      @learnerGroups={{this.learnerGroups}}
      @canCopyWithLearners={{true}}
      @copyGroup={{this.copyGroup}}
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
      assert.equal(group.id, 1);
    });
    await render(hbs`<LearnerGroups::List
      @learnerGroups={{this.learnerGroups}}
      @canCopyWithLearners={{true}}
      @copyGroup={{this.copyGroup}}
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
      assert.equal(group.id, 1);
    });
    await render(hbs`<LearnerGroups::List
      @learnerGroups={{this.learnerGroups}}
      @canCopyWithLearners={{false}}
      @copyGroup={{this.copyGroup}}
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
    await render(hbs`<LearnerGroups::List
      @learnerGroups={{this.learnerGroups}}
      @canCopyWithLearners={{true}}
      @copyGroup={{this.copyGroup}}
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
    await render(hbs`<LearnerGroups::List
      @learnerGroups={{this.learnerGroups}}
      @canCopyWithLearners={{false}}
      @copyGroup={{this.copyGroup}}
    />`);
    await component.items[0].copy();
    assert.ok(component.confirmCopy.isPresent);
    assert.notOk(component.confirmCopy.canCopyWithLearners);
    await component.confirmCopy.cancel();
    assert.notOk(component.confirmCopy.isPresent);
  });
});
