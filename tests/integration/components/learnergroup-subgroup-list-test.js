import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';

const { RSVP, Object:EmberObject, Service } = Ember;
const { resolve } = RSVP;

moduleForComponent('learnergroup-subgroup-list', 'Integration | Component | learnergroup subgroup list', {
  integration: true
});

test('it renders', function(assert) {
  let subGroup1 = {
    title: 'first',
    users: [1,2],
    children: [],
  };
  let subGroup2 = {
    title: 'second',
    users: [],
    children: [1,2],
  };
  let parentGroup = {
    children: resolve([subGroup1, subGroup2])
  };

  this.set('parentGroup', parentGroup);

  this.render(hbs`{{learnergroup-subgroup-list parentGroup=parentGroup}}`);

  assert.equal(this.$('th:eq(0)').text().trim(), 'Learner Group Title');
  assert.equal(this.$('th:eq(1)').text().trim(), 'Members');
  assert.equal(this.$('th:eq(2)').text().trim(), 'Subgroups');
  assert.equal(this.$('th:eq(3)').text().trim(), 'Actions');

  assert.equal(this.$('tbody tr:eq(0) td:eq(0)').text().trim(), 'first');
  assert.equal(this.$('tbody tr:eq(0) td:eq(1)').text().trim(), 2);
  assert.equal(this.$('tbody tr:eq(0) td:eq(2)').text().trim(), 0);
  assert.equal(this.$('tbody tr:eq(1) td:eq(0)').text().trim(), 'second');
  assert.equal(this.$('tbody tr:eq(1) td:eq(1)').text().trim(), 0);
  assert.equal(this.$('tbody tr:eq(1) td:eq(2)').text().trim(), 2);

});

test('can remove group', function(assert) {
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

  this.render(hbs`{{learnergroup-subgroup-list parentGroup=parentGroup}}`);

  this.$('tbody td:eq(3) .remove').click();
  this.$('tbody tr:eq(1) .remove').click();
});

test('removal confirmation', function(assert) {
  let subGroup1 = {
    title: 'first',
    users: [1,2],
    children: [],
  };
  let parentGroup = {
    children: resolve([subGroup1])
  };

  this.set('parentGroup', parentGroup);

  this.render(hbs`{{learnergroup-subgroup-list parentGroup=parentGroup}}`);

  this.$('tbody td:eq(3) .remove').click();

  assert.ok(this.$('tbody tr:eq(0)').hasClass('confirm-removal'));
  assert.equal(this.$('tbody tr:eq(1)').text().trim().search(/Are you sure/), 0);

});

test('add new group', function(assert) {
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
  this.register('service:store', storeMock);

  this.set('parentGroup', EmberObject.create(parentGroup));

  this.render(hbs`{{learnergroup-subgroup-list parentGroup=parentGroup}}`);
  assert.equal(this.$('tbody tr:eq(0) td:eq(0)').text().trim(), 'first');

  this.$('.expand-button').click();

  let newTitle = 'new group';
  return wait().then(()=>{
    this.$('input').val(newTitle);
    this.$('input').trigger('change');
    this.$('.done').click();
    return wait().then(() => {
      assert.equal(this.$('.saved-result').text().trim().replace(/[\t\n\s]+/g, ''),
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
  this.register('service:store', storeMock);

  let flashmessagesMock = Ember.Service.extend({
    success(message){
      assert.equal(message, 'general.savedSuccessfully');
    }
  });
  this.register('service:flashMessages', flashmessagesMock);

  this.set('parentGroup', parentGroup);

  const groups = 'table tbody tr';
  const firstGroupTitle = `${groups}:eq(0) td:eq(0)`;
  const secondGroupTitle = `${groups}:eq(1) td:eq(0)`;
  const expandButton = '.expand-button';
  const multiSelector = '.click-choice-buttons';
  const multiGroupButton = `${multiSelector} button:eq(1)`;
  const multiGroupCount = 'input';
  const done = '.done';

  this.render(hbs`{{learnergroup-subgroup-list parentGroup=parentGroup}}`);
  assert.equal(this.$(firstGroupTitle).text().trim(), 'group 1');
  this.$(expandButton).click();
  await wait();
  this.$(multiGroupButton).click();

  this.$(multiGroupCount).val(1).change();
  this.$(done).click();
  await wait();

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
  this.register('service:store', storeMock);

  let flashmessagesMock = Ember.Service.extend({
    success(message){
      assert.equal(message, 'general.savedSuccessfully');
    }
  });
  this.register('service:flashMessages', flashmessagesMock);

  this.set('parentGroup', parentGroup);

  const groups = 'table tbody tr';
  const firstGroupTitle = `${groups}:eq(0) td:eq(0)`;
  const expandButton = '.expand-button';
  const multiSelector = '.click-choice-buttons';
  const multiGroupButton = `${multiSelector} button:eq(1)`;
  const multiGroupCount = 'input';
  const done = '.done';

  this.render(hbs`{{learnergroup-subgroup-list parentGroup=parentGroup}}`);
  this.$(expandButton).click();
  await wait();
  this.$(multiGroupButton).click();


  this.$(multiGroupCount).val(1).change();
  this.$(done).click();
  await wait();

  assert.equal(this.$(firstGroupTitle).text().trim(), expectedGroupTitle);

});
