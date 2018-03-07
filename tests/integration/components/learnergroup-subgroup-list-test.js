import RSVP from 'rsvp';
import EmberObject from '@ember/object';
import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled, click, find, fillIn, findAll, triggerEvent } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

const { resolve } = RSVP;

module('Integration | Component | learnergroup subgroup list', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    let subGroup1 = {
      title: 'first',
      users: [1,2],
      children: [],
      usersCount: 2,
      childrenCount: 0,
    };
    let subGroup2 = {
      title: 'second',
      users: [],
      children: [1,2],
      usersCount: 0,
      childrenCount: 2,
    };
    let parentGroup = {
      children: resolve([subGroup1, subGroup2])
    };

    this.set('parentGroup', parentGroup);

    await render(hbs`{{learnergroup-subgroup-list parentGroup=parentGroup}}`);

    assert.equal(find('th').textContent.trim(), 'Learner Group Title');
    assert.equal(find(findAll('th')[1]).textContent.trim(), 'Members');
    assert.equal(find(findAll('th')[2]).textContent.trim(), 'Subgroups');
    assert.equal(find(findAll('th')[3]).textContent.trim(), 'Actions');

    assert.equal(find('tbody tr:eq(0) td').textContent.trim(), 'first');
    assert.equal(find(findAll('tbody tr:eq(0) td')[1]).textContent.trim(), 2);
    assert.equal(find(findAll('tbody tr:eq(0) td')[2]).textContent.trim(), 0);
    assert.equal(find('tbody tr:eq(1) td').textContent.trim(), 'second');
    assert.equal(find(findAll('tbody tr:eq(1) td')[1]).textContent.trim(), 0);
    assert.equal(find(findAll('tbody tr:eq(1) td')[2]).textContent.trim(), 2);

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

    await render(hbs`{{learnergroup-subgroup-list parentGroup=parentGroup}}`);

    await click('tbody td:eq(3) .remove');
    await click('tbody tr:eq(1) .remove');
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

    await render(hbs`{{learnergroup-subgroup-list parentGroup=parentGroup}}`);

    await click('tbody td:eq(3) .remove');

    assert.ok(find('tbody tr').classList.contains('confirm-removal'));
    assert.equal(find(findAll('tbody tr')[1]).textContent.trim().search(/Are you sure/), 0);

  });

  test('add new group', async function(assert) {
    let cohort = {a: 1};
    let subGroup1 = {
      title: 'first',
      users: [1,2],
      children: []
    };
    let parentGroup = {
      children: resolve([subGroup1]),
      cohort: resolve(cohort)
    };

    let storeMock = Service.extend({
      createRecord(what, {title, cohort:groupCohort, parent:groupParent}){
        assert.equal('learner-group', what);
        assert.equal('new group', title);
        assert.equal(cohort, groupCohort, 'cohort is correct');

        let newGroup = {
          title,
          cohort: groupCohort,
          parent: groupParent
        };

        return EmberObject.create({
          save(){
            return resolve(newGroup);
          }
        });
      }
    });
    this.owner.register('service:store', storeMock);

    this.set('parentGroup', EmberObject.create(parentGroup));

    await render(hbs`{{learnergroup-subgroup-list parentGroup=parentGroup}}`);
    assert.equal(find('tbody tr:eq(0) td').textContent.trim(), 'first');

    await click('.expand-button');

    let newTitle = 'new group';
    return settled().then(async () => {
      await fillIn('input', newTitle);
      await triggerEvent('input', 'input');
      await click('.done');
      return settled().then(() => {
        assert.equal(find('.saved-result').textContent.trim().replace(/[\t\n\s]+/g, ''),
          (newTitle + ' Saved Successfully').replace(/[\t\n\s]+/g, '')
        );
      });
    });

  });

  test('add multiple new groups', async function(assert) {
    assert.expect(7);
    let cohort = {a: 1};
    let subGroup1 = EmberObject.create({
      title: 'group 1',
      users: [1,2],
      children: []
    });
    let parentGroup = EmberObject.create({
      title: 'group',
      children: resolve([subGroup1]),
      cohort: resolve(cohort),
      subgroupNumberingOffset: resolve(2)
    });

    let storeMock = Service.extend({
      createRecord(what, {title, cohort:groupCohort, parent:groupParent}){
        assert.equal('learner-group', what);
        assert.equal('group 2', title);
        assert.equal(cohort, groupCohort);
        assert.equal(groupParent, parentGroup);

        let newGroup = {
          title,
          cohort: groupCohort,
          parent: groupParent
        };

        return EmberObject.create({
          save(){
            parentGroup.set('children', resolve([subGroup1, newGroup]));
            return resolve(newGroup);
          }
        });
      }
    });
    this.owner.register('service:store', storeMock);

    let flashmessagesMock = Service.extend({
      success(message){
        assert.equal(message, 'general.savedSuccessfully');
      }
    });
    this.owner.register('service:flashMessages', flashmessagesMock);

    this.set('parentGroup', parentGroup);

    const groups = 'table tbody tr';
    const firstGroupTitle = `${groups}:eq(0) td:eq(0)`;
    const secondGroupTitle = `${groups}:eq(1) td:eq(0)`;
    const expandButton = '.expand-button';
    const multiSelector = '.click-choice-buttons';
    const multiGroupButton = `${multiSelector} button:eq(1)`;
    const multiGroupCount = 'input';
    const done = '.done';

    await render(hbs`{{learnergroup-subgroup-list parentGroup=parentGroup}}`);
    assert.equal(this.$(firstGroupTitle).text().trim(), 'group 1');
    await click(expandButton);
    await settled();
    this.$(multiGroupButton).click();
    await settled();

    await fillIn(multiGroupCount, 1);
    await await click(done);
    await settled();
    await settled();

    assert.equal(this.$(secondGroupTitle).text().trim(), 'group 2');

  });

  test('truncates multiple group with long name', async function(assert) {
    assert.expect(6);
    let cohort = {a: 1};
    const longTitle = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit ames';
    const expectedGroupTitle = longTitle.substring(0, 58) + ' 1';
    let parentGroup = EmberObject.create({
      title: longTitle,
      children: resolve([]),
      cohort: resolve(cohort),
      subgroupNumberingOffset: resolve(1)
    });

    let storeMock = Service.extend({
      createRecord(what, {title, cohort:groupCohort, parent:groupParent}){
        assert.equal('learner-group', what);
        assert.equal(title, expectedGroupTitle, 'correct truncated title');
        assert.equal(cohort, groupCohort);
        assert.equal(groupParent, parentGroup);

        let newGroup = {
          title,
          cohort: groupCohort,
          parent: groupParent
        };

        return EmberObject.create({
          save(){
            parentGroup.set('children', resolve([newGroup]));
            return resolve(newGroup);
          }
        });
      }
    });
    this.owner.register('service:store', storeMock);

    let flashmessagesMock = Service.extend({
      success(message){
        assert.equal(message, 'general.savedSuccessfully');
      }
    });
    this.owner.register('service:flashMessages', flashmessagesMock);

    this.set('parentGroup', parentGroup);

    const groups = 'table tbody tr';
    const firstGroupTitle = `${groups}:eq(0) td:eq(0)`;
    const expandButton = '.expand-button';
    const multiSelector = '.click-choice-buttons';
    const multiGroupButton = `${multiSelector} button:eq(1)`;
    const multiGroupCount = 'input';
    const done = '.done';

    await render(hbs`{{learnergroup-subgroup-list parentGroup=parentGroup}}`);
    await click(expandButton);
    await settled();
    await this.$(multiGroupButton).click();
    await settled();


    await fillIn(multiGroupCount, 1);
    await await click(done);
    await settled();
    await settled();

    assert.equal(this.$(firstGroupTitle).text().trim(), expectedGroupTitle);

  });
});
