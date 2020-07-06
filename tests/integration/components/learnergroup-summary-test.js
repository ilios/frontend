import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import {
  render,
  click,
  fillIn
} from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Integration | Component | learnergroup summary', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('renders with data', async function (assert) {
    const user1 = this.server.create('user');
    const user2 = this.server.create('user');
    const user3 = this.server.create('user');
    const user4 = this.server.create('user');
    const user5 = this.server.create('user');
    const user6 = this.server.create('user');

    const cohort = this.server.create('cohort', {
      title: 'this cohort',
      users: [user1, user2, user3, user4],
    });
    const subGroup = this.server.create('learner-group', {
      title: 'test sub-group',
    });

    const course = this.server.create('course');
    const session = this.server.create('session', { course });
    const offering = this.server.create('offering', { session });

    const course2 = this.server.create('course');
    const session2 = this.server.create('session', { course: course2 });
    const ilm = this.server.create('ilm-session', { session: session2 });

    const learnerGroup = this.server.create('learner-group', {
      title: 'test group',
      location: 'test location',
      children: [subGroup],
      instructors: [user5, user6],
      users: [user1, user2],
      offerings: [offering],
      ilmSessions: [ilm],
      cohort,
    });
    const learnerGroupModel = await this.owner.lookup('service:store').find('learner-group', learnerGroup.id);

    this.set('learnerGroup', learnerGroupModel);

    await render(hbs`<LearnergroupSummary
      @setIsEditing={{noop}}
      @setSortUsersBy={{noop}}
      @setIsBulkAssigning={{noop}}
      @sortUsersBy="firstName"
      @learnerGroup={{learnerGroup}}
      @isEditing={{false}}
      @isBulkAssigning={{false}}
    />`);

    const defaultLocation = '[data-test-overview] .defaultlocation span:nth-of-type(1)';
    const instructors = '[data-test-overview] .defaultinstructors span';
    const coursesList = '[data-test-overview] .associatedcourses ul';

    assert.dom(defaultLocation).hasText('test location');
    assert.dom(instructors).hasText('4 guy M. Mc4son; 5 guy M. Mc5son');
    assert.dom(coursesList).hasText('course 0 course 1');
  });

  test('Update location', async function(assert) {
    assert.expect(2);

    const cohort = this.server.create('cohort');
    const learnerGroup = this.server.create('learner-group', {
      location: 'test location',
      cohort,
    });
    const learnerGroupModel = await this.owner.lookup('service:store').find('learner-group', learnerGroup.id);
    this.set('learnerGroup', learnerGroupModel);

    await render(hbs`<LearnergroupSummary
      @canUpdate={{true}}
      @setIsEditing={{noop}}
      @setSortUsersBy={{noop}}
      @setIsBulkAssigning={{noop}}
      @learnerGroup={{learnerGroup}}
      @isEditing={{false}}
      @isBulkAssigning={{false}}
    />`);

    const defaultLocation = '[data-test-overview] .defaultlocation span:nth-of-type(1)';
    const editLocation = `${defaultLocation} .editable`;
    const input =  `${defaultLocation} input`;
    const save =  `${defaultLocation} .done`;
    assert.dom(defaultLocation).hasText('test location');
    await click(editLocation);
    await fillIn(input, 'new location name');
    await click(save);
    assert.dom(defaultLocation).hasText('new location name');
  });
});
