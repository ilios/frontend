import EmberObject from '@ember/object';
import RSVP from 'rsvp';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

const { resolve } = RSVP;

module('Integration | Component | learnergroup summary', function(hooks) {
  setupRenderingTest(hooks);

  test('renders with data', async function(assert) {
    const user1 = EmberObject.create({
      fullName: 'user1'
    });
    const user2 = EmberObject.create({
      fullName: 'user2'
    });
    const user3 = EmberObject.create({
      fullName: 'user3'
    });
    const user4 = EmberObject.create({
      fullName: 'user4'
    });
    const user5 = EmberObject.create({
      fullName: 'user5'
    });
    const user6 = EmberObject.create({
      fullName: 'user6'
    });

    const cohort = EmberObject.create({
      title: 'this cohort',
      users: resolve([user1, user2, user3, user4]),
    });
    let subGroup = EmberObject.create({
      title: 'test sub-group',
      users: resolve([]),
      children: resolve([]),
    });
    let learnerGroup = EmberObject.create({
      title: 'test group',
      location: 'test location',
      children: resolve([subGroup]),
      allInstructors: resolve([user5, user6]),
      users: resolve([user1, user2]),
      allDescendantUsers: resolve([user1, user2]),
      courses: resolve([
        {title: 'test course 1'},
        {title: 'test course 2'},
      ]),
      cohort: resolve(cohort),
    });
    learnerGroup.set('topLevelGroup', resolve(learnerGroup));

    this.set('nothing', parseInt);
    this.set('learnerGroup', learnerGroup);

    await render(hbs`{{learnergroup-summary
      setIsEditing=(action nothing)
      setSortUsersBy=(action nothing)
      setIsBulkAssigning=(action nothing)
      sortUsersBy='firstName'
      learnerGroup=learnerGroup
      isEditing=false
      isBulkAssigning=false
    }}`);

    const defaultLocation = '.learnergroup-overview .defaultlocation span:eq(0)';
    const instructors = '.learnergroup-overview .defaultinstructors span';
    const courses = '.learnergroup-overview .associatedcourses div';

    return settled().then(()=>{
      assert.equal(this.$(defaultLocation).text().trim(), 'test location');
      assert.equal(this.$(instructors).text().trim(), 'user5; user6');
      assert.equal(this.$(courses).text().trim(), 'test course 1; test course 2');
    });
  });

  test('Update location', async function(assert) {
    assert.expect(3);

    const cohort = EmberObject.create({
      title: 'this cohort',
      users: resolve([]),
    });
    let subGroup = EmberObject.create({
      title: 'test sub-group',
      users: resolve([]),
      children: resolve([]),
    });
    let learnerGroup = EmberObject.create({
      title: 'test group',
      location: 'test location',
      children: resolve([subGroup]),
      allInstructors: resolve([]),
      users: resolve([]),
      allDescendantUsers: resolve([]),
      courses: resolve([
        {title: 'test course 1'},
        {title: 'test course 2'},
      ]),
      cohort: resolve(cohort),
      save(){
        assert.equal(this.get('location'), 'new location name');
        return resolve(this);
      },
    });
    learnerGroup.set('topLevelGroup', resolve(learnerGroup));

    this.set('nothing', parseInt);
    this.set('learnerGroup', learnerGroup);

    await render(hbs`{{learnergroup-summary
      setIsEditing=(action nothing)
      setSortUsersBy=(action nothing)
      setIsBulkAssigning=(action nothing)
      learnerGroup=learnerGroup
      isEditing=false
      isBulkAssigning=false
    }}`);

    const defaultLocation = '.learnergroup-overview .defaultlocation span:eq(0)';
    const editLocation = `${defaultLocation} .editable`;
    const input =  `${defaultLocation} input`;
    const save =  `${defaultLocation} .done`;
    return settled().then(()=>{
      assert.equal(this.$(defaultLocation).text().trim(), 'test location');
      this.$(editLocation).click();
      return settled().then(()=> {
        this.$(input).val('new location name').trigger('input');
        this.$(save).click();
        return settled().then(()=> {
          assert.equal(this.$(defaultLocation).text().trim(), 'new location name');
        });
      });
    });
  });
});