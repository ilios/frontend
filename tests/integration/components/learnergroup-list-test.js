import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { component } from 'ilios/tests/pages/components/learnergroup-list';

module('Integration | Component | learner group list', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function (assert) {
    const users = this.server.createList('user', 2);
    const firstGroup = this.server.create('learner-group', { needsAccommodation: true });
    const secondGroup = this.server.create('learner-group', {
      users,
    });
    this.server.create('learner-group', { parent: firstGroup });
    this.server.create('learner-group', { parent: firstGroup, needsAccommodation: true });
    const firstGroupModel = await this.owner
      .lookup('service:store')
      .find('learner-group', firstGroup.id);
    const secondGroupModel = await this.owner
      .lookup('service:store')
      .find('learner-group', secondGroup.id);

    this.set('learnerGroups', [firstGroupModel, secondGroupModel]);
    await render(hbs`<LearnergroupList @learnerGroups={{this.learnerGroups}} />`);

    assert.strictEqual(component.headings[0].text, 'Learner Group Title');
    assert.strictEqual(component.headings[1].text, 'Members');
    assert.strictEqual(component.headings[2].text, 'Subgroups');
    assert.strictEqual(component.headings[3].text, 'Actions');

    assert.strictEqual(component.groups.length, 2);

    assert.strictEqual(component.groups[0].title, 'learner group 0');
    assert.ok(component.groups[0].needsAccommodation);
    assert.strictEqual(component.groups[0].members, '0');
    assert.strictEqual(component.groups[0].subgroups, '2');
    assert.ok(component.groups[0].hasSubgroupsInNeedOfAccommodation);

    assert.strictEqual(component.groups[1].title, 'learner group 1');
    assert.notOk(component.groups[1].needsAccommodation);
    assert.strictEqual(component.groups[1].members, '2');
    assert.strictEqual(component.groups[1].subgroups, '0');
    assert.notOk(component.groups[1].hasSubgroupsInNeedOfAccommodation);
  });

  test('can remove group', async function (assert) {
    assert.expect(4);
    const parent = this.server.create('learner-group');

    this.server.createList('learner-group', 2, { parent });
    const model = await this.owner.lookup('service:store').find('learner-group', parent.id);

    this.set('remove', ({ id }) => {
      assert.strictEqual(id, model.id);
    });
    this.set('learnerGroups', [model]);
    await render(hbs`<LearnergroupList
      @learnerGroups={{this.learnerGroups}}
      @remove={{this.remove}}
      @canDelete={{true}}
    />`);

    assert.strictEqual(component.groups.length, 1);
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
    await render(hbs`<LearnergroupList
      @learnerGroups={{this.learnerGroups}}
      @canDelete={{true}}
    />`);

    assert.strictEqual(component.groups.length, 1);
    assert.notOk(component.groups[0].actions.canRemove);
  });

  test('cannot remove group with users in subgroup', async function (assert) {
    assert.expect(2);
    const users = this.server.createList('user', 2);
    const parent = this.server.create('learner-group');

    this.server.createList('learner-group', 2, { parent, users });
    const model = await this.owner.lookup('service:store').find('learner-group', parent.id);
    this.set('learnerGroups', [model]);
    await render(hbs`<LearnergroupList
      @learnerGroups={{this.learnerGroups}}
      @canDelete={{true}}
    />`);

    assert.strictEqual(component.groups.length, 1);
    assert.notOk(component.groups[0].actions.canRemove);
  });

  test('cannot remove group with courses', async function (assert) {
    assert.expect(6);
    const courses = this.server.createList('course', 4);
    const course1Session = this.server.create('session', { course: courses[0] });
    const course2Session = this.server.create('session', { course: courses[1] });
    const course2Session2 = this.server.create('session', { course: courses[1] });
    const course3Session = this.server.create('session', { course: courses[2] });
    const offering1 = this.server.create('offering', { session: course1Session });
    const offering2 = this.server.create('offering', { session: course2Session });
    const offering3 = this.server.create('offering', { session: course2Session2 });
    const offering4 = this.server.create('offering', { session: course3Session });

    const parent = this.server.create('learner-group', {
      offerings: [offering1, offering2, offering3],
    });

    this.server.create('learner-group', { parent, offerings: [offering4] });
    const model = await this.owner.lookup('service:store').find('learner-group', parent.id);
    this.set('learnerGroups', [model]);
    await render(hbs`<LearnergroupList
      @learnerGroups={{this.learnerGroups}}
      @canDelete={{true}}
    />`);

    assert.strictEqual(component.groups.length, 1);
    assert.ok(component.groups[0].actions.canRemove);
    await component.groups[0].actions.remove();
    assert.strictEqual(
      component.confirmRemoval.confirmation,
      'This group is attached to 3 courses and cannot be deleted. 2013 course 0 2013 course 1 2013 course 2 OK'
    );
    assert.notOk(component.confirmRemoval.canConfirm);
    assert.ok(component.confirmRemoval.canCancel);
    await component.confirmRemoval.cancel();
    assert.strictEqual(component.groups.length, 1);
  });

  test('course academic year shows range if applicable by configuration', async function (assert) {
    this.server.get('application/config', function () {
      return {
        config: {
          academicYearCrossesCalendarYearBoundaries: true,
        },
      };
    });
    const courses = this.server.createList('course', 4);
    const course1Session = this.server.create('session', { course: courses[0] });
    const course2Session = this.server.create('session', { course: courses[1] });
    const course2Session2 = this.server.create('session', { course: courses[1] });
    const course3Session = this.server.create('session', { course: courses[2] });
    const offering1 = this.server.create('offering', { session: course1Session });
    const offering2 = this.server.create('offering', { session: course2Session });
    const offering3 = this.server.create('offering', { session: course2Session2 });
    const offering4 = this.server.create('offering', { session: course3Session });

    const parent = this.server.create('learner-group', {
      offerings: [offering1, offering2, offering3],
    });

    this.server.create('learner-group', { parent, offerings: [offering4] });
    const model = await this.owner.lookup('service:store').find('learner-group', parent.id);
    this.set('learnerGroups', [model]);
    await render(hbs`<LearnergroupList
      @learnerGroups={{this.learnerGroups}}
      @canDelete={{true}}
    />`);

    await component.groups[0].actions.remove();
    assert.strictEqual(
      component.confirmRemoval.confirmation,
      'This group is attached to 3 courses and cannot be deleted. 2013 - 2014 course 0 2013 - 2014 course 1 2013 - 2014 course 2 OK'
    );
  });

  test('can copy group with learners when canCopyWithLearners is enabled', async function (assert) {
    assert.expect(5);
    const group = this.server.create('learner-group');
    const model = await this.owner.lookup('service:store').find('learner-group', group.id);

    this.set('copy', (withLearners, { id }) => {
      assert.ok(withLearners);
      assert.strictEqual(id, model.id);
    });
    this.set('learnerGroups', [model]);
    await render(hbs`<LearnergroupList
      @learnerGroups={{this.learnerGroups}}
      @copy={{this.copy}}
      @canCreate={{true}}
      @canCopyWithLearners={{true}}
    />`);

    assert.strictEqual(component.groups.length, 1);
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
      assert.strictEqual(id, model.id);
    });
    this.set('learnerGroups', [model]);
    await render(hbs`<LearnergroupList
      @learnerGroups={{this.learnerGroups}}
      @copy={{this.copy}}
      @canCreate={{true}}
    />`);

    assert.strictEqual(component.groups.length, 1);
    assert.ok(component.groups[0].actions.canCopy);
    await component.groups[0].actions.copy();
    assert.ok(component.confirmCopy.canCopyWithoutLearners);
    await component.confirmCopy.confirmWithoutLearners();
  });

  test('can copy group without learners when copyWithLearners is disabled', async function (assert) {
    assert.expect(3);
    const group = this.server.create('learner-group');
    const model = await this.owner.lookup('service:store').find('learner-group', group.id);
    this.set('learnerGroups', [model]);
    await render(hbs`<LearnergroupList
      @learnerGroups={{this.learnerGroups}}
      @copy={{(noop)}}
      @canCreate={{true}}
      @canCopyWithLearners={{false}}
    />`);

    assert.strictEqual(component.groups.length, 1);
    assert.ok(component.groups[0].actions.canCopy);
    await component.groups[0].actions.copy();
    assert.ok(component.confirmCopy.canCopyWithoutLearners);
  });

  test('can not copy group with learners when copyWithLearners is disabled', async function (assert) {
    assert.expect(3);
    const users = this.server.createList('user', 2);
    const group = this.server.create('learner-group', { users });
    const model = await this.owner.lookup('service:store').find('learner-group', group.id);

    this.set('learnerGroups', [model]);
    await render(hbs`<LearnergroupList
      @learnerGroups={{this.learnerGroups}}
      @copy={{(noop)}}
      @canCreate={{true}}
      @canCopyWithLearners={{false}}
    />`);

    assert.strictEqual(component.groups.length, 1);
    assert.ok(component.groups[0].actions.canCopy);
    await component.groups[0].actions.copy();
    assert.notOk(component.confirmCopy.canCopyWithLearners);
  });

  test('sorting', async function (assert) {
    const users = this.server.createList('user', 2);
    const group1 = this.server.create('learner-group', { title: 'Group 10' });
    const group2 = this.server.create('learner-group', { title: 'Group 2', users });
    this.server.create('learner-group', { parent: group1 });
    const groupModel1 = await this.owner.lookup('service:store').find('learner-group', group1.id);
    const groupModel2 = await this.owner.lookup('service:store').find('learner-group', group2.id);

    this.set('learnerGroups', [groupModel1, groupModel2]);
    await render(hbs`<LearnergroupList @learnerGroups={{this.learnerGroups}} />`);
    assert.ok(component.isSortedByTitleAscending, 'Default sort order is by title ascending');
    assert.ok(component.isNotSortedByMembers);
    assert.ok(component.isNotSortedBySubgroups);
    assert.strictEqual(component.groups[0].title, 'Group 2');
    assert.strictEqual(component.groups[1].title, 'Group 10');
    await component.sortByTitle();
    assert.ok(component.isSortedByTitleDescending);
    assert.ok(component.isNotSortedByMembers);
    assert.ok(component.isNotSortedBySubgroups);
    assert.strictEqual(component.groups[0].title, 'Group 10');
    assert.strictEqual(component.groups[1].title, 'Group 2');
    await component.sortByMembers();
    assert.ok(component.isSortedByMembersAscending);
    assert.ok(component.isNotSortedByTitle);
    assert.ok(component.isNotSortedBySubgroups);
    assert.strictEqual(component.groups[0].members, '0');
    assert.strictEqual(component.groups[1].members, '2');
    await component.sortByMembers();
    assert.ok(component.isSortedByMembersDescending);
    assert.ok(component.isNotSortedByTitle);
    assert.ok(component.isNotSortedBySubgroups);
    assert.strictEqual(component.groups[0].members, '2');
    assert.strictEqual(component.groups[1].members, '0');
    await component.sortBySubgroups();
    assert.ok(component.isSortedBySubgroupsAscending);
    assert.ok(component.isNotSortedByTitle);
    assert.ok(component.isNotSortedByMembers);
    assert.strictEqual(component.groups[0].subgroups, '0');
    assert.strictEqual(component.groups[1].subgroups, '1');
    await component.sortBySubgroups();
    assert.ok(component.isSortedBySubgroupsDescending);
    assert.ok(component.isNotSortedByTitle);
    assert.ok(component.isNotSortedByMembers);
    assert.strictEqual(component.groups[0].subgroups, '1');
    assert.strictEqual(component.groups[1].subgroups, '0');
  });
});
