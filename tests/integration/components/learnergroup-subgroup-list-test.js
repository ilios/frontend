import { resolve } from 'rsvp';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, find, fillIn, findAll, triggerEvent } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { run } from '@ember/runloop';

module('Integration | Component | learnergroup subgroup list', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function (assert) {
    const users = this.server.createList('user', 2);
    const parent = this.server.create('learner-group');
    this.server.create('learner-group', {
      title: 'first',
      users,
      parent
    });
    const subGroup2 = this.server.create('learner-group', {
      title: 'second',
      parent
    });
    this.server.createList('learner-group', 2, { parent: subGroup2 });
    const parentGroup = await run(() => this.owner.lookup('service:store').find('learner-group', parent.id));

    this.set('parentGroup', parentGroup);

    await render(hbs`{{learnergroup-subgroup-list parentGroup=parentGroup}}`);

    assert.equal(find('th').textContent.trim(), 'Learner Group Title');
    assert.equal(find(findAll('th')[1]).textContent.trim(), 'Members');
    assert.equal(find(findAll('th')[2]).textContent.trim(), 'Subgroups');
    assert.equal(find(findAll('th')[3]).textContent.trim(), 'Actions');

    assert.equal(find('tbody tr:nth-of-type(1) td').textContent.trim(), 'first');
    assert.equal(find(findAll('tbody tr:nth-of-type(1) td')[1]).textContent.trim(), 2);
    assert.equal(find(findAll('tbody tr:nth-of-type(1) td')[2]).textContent.trim(), 0);
    assert.equal(find('tbody tr:nth-of-type(2) td').textContent.trim(), 'second');
    assert.equal(find(findAll('tbody tr:nth-of-type(2) td')[1]).textContent.trim(), 0);
    assert.equal(find(findAll('tbody tr:nth-of-type(2) td')[2]).textContent.trim(), 2);

  });

  test('can remove group', async function(assert) {
    let subGroup1 = {
      title: 'first',
      users: [1,2],
      children: [],
      destroyRecord(){
        assert.ok(true);
      }
    };
    let parentGroup = {
      children: resolve([subGroup1])
    };

    this.set('parentGroup', parentGroup);

    await render(hbs`{{learnergroup-subgroup-list parentGroup=parentGroup canDelete=true}}`);

    await click('tbody td:nth-of-type(4) .remove');
    await click('tbody tr:nth-of-type(2) .remove');
  });

  test('removal confirmation', async function(assert) {
    let subGroup1 = {
      title: 'first',
      users: [1,2],
      children: [],
    };
    let parentGroup = {
      children: resolve([subGroup1])
    };

    this.set('parentGroup', parentGroup);

    await render(hbs`{{learnergroup-subgroup-list parentGroup=parentGroup canDelete=true}}`);

    await click('tbody td:nth-of-type(4) .remove');

    assert.ok(find('tbody tr').classList.contains('confirm-removal'));
    assert.equal(find(findAll('tbody tr')[1]).textContent.trim().search(/Are you sure/), 0);

  });

  test('add new group', async function (assert) {
    const cohort = this.server.create('cohort');
    const users = this.server.createList('user', 2);
    const parent = this.server.create('learner-group', {
      cohort
    });
    this.server.create('learner-group', {
      title: 'first',
      parent,
      users
    });

    const parentGroup = await run(() => this.owner.lookup('service:store').find('learner-group', parent.id));

    this.set('parentGroup', parentGroup);
    await render(hbs`{{learnergroup-subgroup-list parentGroup=parentGroup canCreate=true}}`);

    assert.equal(find('tbody tr:nth-of-type(1) td').textContent.trim(), 'first');

    await click('.expand-button');

    let newTitle = 'new group';
    await fillIn('input', newTitle);
    await triggerEvent('input', 'input');
    await click('.done');
    assert.equal(find('.saved-result').textContent.trim().replace(/[\t\n\s]+/g, ''),
      (newTitle + ' Saved Successfully').replace(/[\t\n\s]+/g, '')
    );
    const newGroup = await run(() => this.owner.lookup('service:store').find('learner-group', 3));
    assert.equal(newGroup.belongsTo('cohort').id(), cohort.id);
    assert.equal(newGroup.belongsTo('parent').id(), parent.id);
  });

  test('add multiple new groups', async function(assert) {
    assert.expect(4);
    const cohort = this.server.create('cohort');
    const users = this.server.createList('user', 2);
    const parent = this.server.create('learner-group', {
      title: 'group',
      cohort
    });
    this.server.create('learner-group', {
      title: 'group 1',
      parent,
      users
    });

    const parentGroup = await run(() => this.owner.lookup('service:store').find('learner-group', parent.id));
    this.set('parentGroup', parentGroup);

    const groups = 'table tbody tr';
    const firstGroupTitle = `${groups}:nth-of-type(1) td:nth-of-type(1)`;
    const secondGroupTitle = `${groups}:nth-of-type(2) td:nth-of-type(1)`;
    const expandButton = '.expand-button';
    const multiSelector = '.click-choice-buttons';
    const multiGroupButton = `${multiSelector} button:nth-of-type(2)`;
    const multiGroupCount = 'input';
    const done = '.done';

    await render(hbs`{{learnergroup-subgroup-list parentGroup=parentGroup canCreate=true}}`);
    assert.equal(find(firstGroupTitle).textContent.trim(), 'group 1');
    await click(expandButton);
    await click(multiGroupButton);

    await fillIn(multiGroupCount, 1);
    await click(done);

    assert.equal(find(secondGroupTitle).textContent.trim(), 'group 2');
    const newGroup = await run(() => this.owner.lookup('service:store').find('learner-group', 3));
    assert.equal(newGroup.belongsTo('cohort').id(), cohort.id);
    assert.equal(newGroup.belongsTo('parent').id(), parent.id);

  });

  test('truncates multiple group with long name', async function(assert) {
    assert.expect(4);
    const longTitle = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit ames';
    const expectedGroupTitle = longTitle.substring(0, 58) + ' 1';

    const cohort = this.server.create('cohort');
    const parent = this.server.create('learner-group', {
      title: longTitle,
      cohort
    });

    const parentGroup = await run(() => this.owner.lookup('service:store').find('learner-group', parent.id));
    this.set('parentGroup', parentGroup);

    const groups = 'table tbody tr';
    const firstGroupTitle = `${groups}:nth-of-type(1) td:nth-of-type(1)`;
    const expandButton = '.expand-button';
    const multiSelector = '.click-choice-buttons';
    const multiGroupButton = `${multiSelector} button:nth-of-type(2)`;
    const multiGroupCount = 'input';
    const done = '.done';

    await render(hbs`{{learnergroup-subgroup-list parentGroup=parentGroup canCreate=true}}`);
    await click(expandButton);
    await click(multiGroupButton);
    await fillIn(multiGroupCount, 1);
    await click(done);

    assert.equal(find(firstGroupTitle).textContent.trim(), expectedGroupTitle);
    const newGroup = await run(() => this.owner.lookup('service:store').find('learner-group', 2));
    assert.equal(newGroup.belongsTo('cohort').id(), cohort.id);
    assert.equal(newGroup.belongsTo('parent').id(), parent.id);
    assert.equal(newGroup.title, expectedGroupTitle);
  });
});
