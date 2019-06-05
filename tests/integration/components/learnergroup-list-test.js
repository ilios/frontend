import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { component } from 'ilios/tests/pages/components/learnergroup-list';

module('Integration | Component | learner group list', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function (assert) {
    const users = this.server.createList('user', 2);
    const firstGroup = this.server.create('learner-group');
    const secondGroup = this.server.create('learner-group', {
      users
    });
    this.server.createList('learner-group', 2, { parent: firstGroup });
    const firstGroupModel = await this.owner.lookup('service:store').find('learner-group', firstGroup.id);
    const secondGroupModel = await this.owner.lookup('service:store').find('learner-group', secondGroup.id);

    this.set('learnerGroups', [firstGroupModel, secondGroupModel]);
    await render(hbs`{{learnergroup-list learnerGroups=learnerGroups}}`);

    assert.equal(component.headings[0].text, 'Learner Group Title');
    assert.equal(component.headings[1].text, 'Members');
    assert.equal(component.headings[2].text, 'Subgroups');
    assert.equal(component.headings[3].text, 'Courses');
    assert.equal(component.headings[4].text, 'Actions');

    assert.equal(component.groups.length, 2);

    assert.equal(component.groups[0].title, 'learner group 0');
    assert.equal(component.groups[0].members, '0');
    assert.equal(component.groups[0].subgroups, '2');
    assert.equal(component.groups[0].courses, '0');

    assert.equal(component.groups[1].title, 'learner group 1');
    assert.equal(component.groups[1].members, '2');
    assert.equal(component.groups[1].subgroups, '0');
    assert.equal(component.groups[1].courses, '0');
  });

  test('can remove group', async function (assert) {
    assert.expect(4);
    const parent = this.server.create('learner-group');

    this.server.createList('learner-group', 2, { parent });
    const model = await this.owner.lookup('service:store').find('learner-group', parent.id);

    this.set('remove', ({ id }) => {
      assert.equal(id, model.id);
    });
    this.set('learnerGroups', [model]);
    await render(hbs`{{learnergroup-list learnerGroups=learnerGroups remove=remove canDelete=true}}`);

    assert.equal(component.groups.length, 1);
    assert.ok(component.groups[0].actions.canRemove);
    await component.groups[0].actions.remove();
    assert.ok(component.confirmRemoval.confirmation.includes('Are you sure'));
    await component.confirmRemoval.confirm();
  });

  test('cannot remove group with users', async function (assert) {
    assert.expect(2);
    const users = this.server.createList('user', 2);
    const parent = this.server.create('learner-group', { users });

    this.server.createList('learner-group', 2, { parent });
    const model = await this.owner.lookup('service:store').find('learner-group', parent.id);
    this.set('learnerGroups', [model]);
    await render(hbs`{{learnergroup-list learnerGroups=learnerGroups remove=remove canDelete=true}}`);

    assert.equal(component.groups.length, 1);
    assert.notOk(component.groups[0].actions.canRemove);
  });

  test('cannot remove group with users in subgroup', async function (assert) {
    assert.expect(2);
    const users = this.server.createList('user', 2);
    const parent = this.server.create('learner-group');

    this.server.createList('learner-group', 2, { parent, users });
    const model = await this.owner.lookup('service:store').find('learner-group', parent.id);
    this.set('learnerGroups', [model]);
    await render(hbs`{{learnergroup-list learnerGroups=learnerGroups remove=remove canDelete=true}}`);

    assert.equal(component.groups.length, 1);
    assert.notOk(component.groups[0].actions.canRemove);
  });

  test('cannot remove group with courses', async function(assert) {
    assert.expect(2);
    const course = this.server.create('course');
    const session = this.server.create('session', { course });
    const offering = this.server.create('offering', { session });
    const parent = this.server.create('learner-group', { offerings: [offering] });

    this.server.createList('learner-group', 2, { parent });
    const model = await this.owner.lookup('service:store').find('learner-group', parent.id);
    this.set('learnerGroups', [model]);
    await render(hbs`{{learnergroup-list learnerGroups=learnerGroups remove=remove canDelete=true}}`);

    assert.equal(component.groups.length, 1);
    assert.notOk(component.groups[0].actions.canRemove);
  });

  test('can copy group with learners when canCopyWithLearners is enabled', async function (assert) {
    assert.expect(5);
    const group = this.server.create('learner-group');
    const model = await this.owner.lookup('service:store').find('learner-group', group.id);

    this.set('copy', (withLearners, { id }) => {
      assert.ok(withLearners);
      assert.equal(id, model.id);
    });
    this.set('learnerGroups', [model]);
    await render(hbs`{{learnergroup-list learnerGroups=learnerGroups copy=copy canCreate=true canCopyWithLearners=true}}`);

    assert.equal(component.groups.length, 1);
    assert.ok(component.groups[0].actions.canCopy);
    await component.groups[0].actions.copy();
    assert.ok(component.confirmCopy.canCopyWithLearners);
    await component.confirmCopy.confirmWithLearners();
  });

  test('can copy group without learners', async function (assert) {
    assert.expect(5);
    const group = this.server.create('learner-group');
    const model = await this.owner.lookup('service:store').find('learner-group', group.id);

    this.set('copy', (withLearners, { id }) => {
      assert.notOk(withLearners);
      assert.equal(id, model.id);
    });
    this.set('learnerGroups', [model]);
    await render(hbs`{{learnergroup-list learnerGroups=learnerGroups copy=copy canCreate=true}}`);

    assert.equal(component.groups.length, 1);
    assert.ok(component.groups[0].actions.canCopy);
    await component.groups[0].actions.copy();
    assert.ok(component.confirmCopy.canCopyWithoutLearners);
    await component.confirmCopy.confirmWithoutLearners();
  });

  test('can copy group without learners when copyWithLearners is disabled', async function (assert) {
    assert.expect(3);
    const group = this.server.create('learner-group');
    const model = await this.owner.lookup('service:store').find('learner-group', group.id);

    this.set('copy', () => { });
    this.set('learnerGroups', [model]);
    await render(hbs`{{learnergroup-list learnerGroups=learnerGroups copy=copy canCreate=true canCopyWithLearners=false}}`);

    assert.equal(component.groups.length, 1);
    assert.ok(component.groups[0].actions.canCopy);
    await component.groups[0].actions.copy();
    assert.ok(component.confirmCopy.canCopyWithoutLearners);
  });

  test('can not copy group with learners when copyWithLearners is disabled', async function (assert) {
    assert.expect(3);
    const users = this.server.createList('user', 2);
    const group = this.server.create('learner-group', { users });
    const model = await this.owner.lookup('service:store').find('learner-group', group.id);

    this.set('copy', () => { });
    this.set('learnerGroups', [model]);
    await render(hbs`{{learnergroup-list learnerGroups=learnerGroups copy=copy canCreate=true canCopyWithLearners=false}}`);

    assert.equal(component.groups.length, 1);
    assert.ok(component.groups[0].actions.canCopy);
    await component.groups[0].actions.copy();
    assert.notOk(component.confirmCopy.canCopyWithLearners);
  });
});
