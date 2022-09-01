import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { component } from 'ilios/tests/pages/components/learnergroup-subgroup-list';

module('Integration | Component | learnergroup subgroup list', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  test('it renders', async function (assert) {
    const users = this.server.createList('user', 2);
    const parent = this.server.create('learner-group');
    this.server.create('learner-group', {
      title: 'first',
      users,
      parent,
    });
    const subGroup2 = this.server.create('learner-group', {
      title: 'second',
      parent,
    });
    this.server.createList('learner-group', 2, { parent: subGroup2 });
    const parentGroup = await this.owner.lookup('service:store').find('learner-group', parent.id);

    this.set('parentGroup', parentGroup);
    await render(hbs`<LearnergroupSubgroupList @parentGroup={{this.parentGroup}} />`);

    assert.strictEqual(component.headings[0].text, 'Learner Group Title');
    assert.strictEqual(component.headings[1].text, 'Members');
    assert.strictEqual(component.headings[2].text, 'Subgroups');
    assert.strictEqual(component.headings[3].text, 'Actions');

    assert.strictEqual(component.groups.length, 2);

    assert.strictEqual(component.groups[0].title, 'first');
    assert.strictEqual(component.groups[0].members, '2');
    assert.strictEqual(component.groups[0].subgroups, '0');

    assert.strictEqual(component.groups[1].title, 'second');
    assert.strictEqual(component.groups[1].members, '0');
    assert.strictEqual(component.groups[1].subgroups, '2');
  });

  test('can remove group', async function (assert) {
    const parent = this.server.create('learner-group');
    this.server.create('learner-group', {
      title: 'first',
      parent,
    });
    const parentGroup = await this.owner.lookup('service:store').find('learner-group', parent.id);

    this.set('parentGroup', parentGroup);
    await render(
      hbs`<LearnergroupSubgroupList @canDelete={{true}} @parentGroup={{this.parentGroup}} />`
    );
    assert.strictEqual(this.server.schema.learnerGroups.all().length, 2);
    assert.strictEqual(component.groups.length, 1);
    assert.ok(component.groups[0].actions.canRemove);
    await component.groups[0].actions.remove();
    assert.ok(component.confirmRemoval.confirmation.includes('Are you sure'));
    await component.confirmRemoval.confirm();

    assert.strictEqual(this.server.schema.learnerGroups.all().length, 1);
  });

  test('cannot remove group (has 1+ courses)', async function (assert) {
    const course = this.server.create('course');
    const session = this.server.create('session', { course });
    const offering = this.server.create('offering', { session });

    const parent = this.server.create('learner-group');

    this.server.create('learner-group', { parent, offerings: [offering] });
    const model = await this.owner.lookup('service:store').find('learner-group', parent.id);
    this.set('parentGroup', model);

    await render(
      hbs`<LearnergroupSubgroupList @canDelete={{true}} @parentGroup={{this.parentGroup}} />`
    );
    assert.strictEqual(component.groups.length, 1);
    assert.ok(component.groups[0].actions.canRemove);
    await component.groups[0].actions.remove();
    assert.strictEqual(
      component.confirmRemoval.confirmation,
      'This group is attached to one course and cannot be deleted. 2013 course 0 OK'
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
    const course = this.server.create('course');
    const session = this.server.create('session', { course });
    const offering = this.server.create('offering', { session });
    const parent = this.server.create('learner-group');
    this.server.create('learner-group', { parent, offerings: [offering] });
    const model = await this.owner.lookup('service:store').find('learner-group', parent.id);
    this.set('parentGroup', model);

    await render(
      hbs`<LearnergroupSubgroupList @canDelete={{true}} @parentGroup={{this.parentGroup}} />`
    );

    await component.groups[0].actions.remove();
    assert.strictEqual(
      component.confirmRemoval.confirmation,
      'This group is attached to one course and cannot be deleted. 2013 - 2014 course 0 OK'
    );
  });

  test('add new group', async function (assert) {
    const cohort = this.server.create('cohort');
    const users = this.server.createList('user', 2);
    const parent = this.server.create('learner-group', {
      cohort,
    });
    this.server.create('learner-group', {
      title: 'first',
      parent,
      users,
    });

    const parentGroup = await this.owner.lookup('service:store').find('learner-group', parent.id);
    const newTitle = 'new group';

    this.set('parentGroup', parentGroup);
    await render(
      hbs`<LearnergroupSubgroupList @parentGroup={{this.parentGroup}} @canCreate={{true}} />`
    );

    assert.strictEqual(component.groups.length, 1);
    assert.strictEqual(component.groups[0].title, 'first');
    await component.toggleNewForm();
    await component.newForm.single.title(newTitle);
    await component.newForm.single.save();
    assert.strictEqual(component.savedResult, newTitle + ' Saved Successfully');

    assert.strictEqual(component.groups.length, 2);
    assert.strictEqual(component.groups[1].title, newTitle);
    const newGroup = await this.owner.lookup('service:store').find('learner-group', 3);
    assert.strictEqual(newGroup.belongsTo('cohort').id(), cohort.id);
    assert.strictEqual(newGroup.belongsTo('parent').id(), parent.id);
  });

  test('add multiple new groups', async function (assert) {
    assert.expect(6);
    const cohort = this.server.create('cohort');
    const users = this.server.createList('user', 2);
    const parent = this.server.create('learner-group', {
      title: 'group',
      cohort,
    });
    this.server.create('learner-group', {
      title: 'group 1',
      parent,
      users,
    });

    const parentGroup = await this.owner.lookup('service:store').find('learner-group', parent.id);
    this.set('parentGroup', parentGroup);

    await render(
      hbs`<LearnergroupSubgroupList @parentGroup={{this.parentGroup}} @canCreate={{true}} />`
    );

    assert.strictEqual(component.groups.length, 1);
    assert.strictEqual(component.groups[0].title, 'group 1');
    await component.toggleNewForm();
    await component.newForm.chooseMultipleGroups();
    await component.newForm.multiple.setNumberOfGroups(1);
    await component.newForm.multiple.save();

    assert.strictEqual(component.groups.length, 2);
    assert.strictEqual(component.groups[1].title, 'group 2');

    const newGroup = await this.owner.lookup('service:store').find('learner-group', 3);
    assert.strictEqual(newGroup.belongsTo('cohort').id(), cohort.id);
    assert.strictEqual(newGroup.belongsTo('parent').id(), parent.id);
  });

  test('padding added when creating multiple new groups', async function (assert) {
    const cohort = this.server.create('cohort');
    const parent = this.server.create('learner-group', {
      title: 'group',
      cohort,
    });
    const parentGroup = await this.owner.lookup('service:store').find('learner-group', parent.id);
    this.set('parentGroup', parentGroup);

    await render(
      hbs`<LearnergroupSubgroupList @parentGroup={{this.parentGroup}} @canCreate={{true}} />`
    );

    assert.strictEqual(component.groups.length, 0);
    await component.toggleNewForm();
    await component.newForm.chooseMultipleGroups();
    await component.newForm.multiple.setNumberOfGroups(10);
    await component.newForm.multiple.save();
    assert.strictEqual(component.groups.length, 10);
    assert.strictEqual(component.groups[0].title, 'group 01');
    assert.strictEqual(component.groups[1].title, 'group 02');
    assert.strictEqual(component.groups[2].title, 'group 03');
    assert.strictEqual(component.groups[3].title, 'group 04');
    assert.strictEqual(component.groups[4].title, 'group 05');
    assert.strictEqual(component.groups[5].title, 'group 06');
    assert.strictEqual(component.groups[6].title, 'group 07');
    assert.strictEqual(component.groups[7].title, 'group 08');
    assert.strictEqual(component.groups[8].title, 'group 09');
    assert.strictEqual(component.groups[9].title, 'group 10');
  });

  test('truncates multiple group with long name', async function (assert) {
    assert.expect(6);
    const longTitle = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit ames';
    const expectedGroupTitle = longTitle.substring(0, 58) + ' 1';

    const cohort = this.server.create('cohort');
    const parent = this.server.create('learner-group', {
      title: longTitle,
      cohort,
    });

    const parentGroup = await this.owner.lookup('service:store').find('learner-group', parent.id);
    this.set('parentGroup', parentGroup);

    await render(
      hbs`<LearnergroupSubgroupList @parentGroup={{this.parentGroup}} @canCreate={{true}} />`
    );

    assert.strictEqual(component.groups.length, 0);
    await component.toggleNewForm();
    await component.newForm.chooseMultipleGroups();
    await component.newForm.multiple.setNumberOfGroups(1);
    await component.newForm.multiple.save();

    assert.strictEqual(component.groups.length, 1);
    assert.strictEqual(component.groups[0].title, expectedGroupTitle);

    const newGroup = await this.owner.lookup('service:store').find('learner-group', 2);
    assert.strictEqual(newGroup.belongsTo('cohort').id(), cohort.id);
    assert.strictEqual(newGroup.belongsTo('parent').id(), parent.id);
    assert.strictEqual(newGroup.title, expectedGroupTitle);
  });
});
