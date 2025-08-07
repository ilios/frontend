import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { waitForResource } from 'ilios-common';

module('Unit | Model | LearnerGroup', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.store = this.owner.lookup('service:store');
  });

  test('it exists', function (assert) {
    const model = this.store.createRecord('learner-group');
    assert.ok(!!model);
  });

  test('list courses', async function (assert) {
    const learnerGroup = this.store.createRecord('learner-group');
    const course1 = this.store.createRecord('course', { title: 'course1' });
    const course2 = this.store.createRecord('course', { title: 'course2' });
    const session1 = this.store.createRecord('session', { course: course1 });
    const session2 = this.store.createRecord('session', { course: course1 });
    const session3 = this.store.createRecord('session', { course: course2 });
    this.store.createRecord('offering', { session: session1, learnerGroups: [learnerGroup] });
    this.store.createRecord('offering', { session: session1, learnerGroups: [learnerGroup] });
    this.store.createRecord('offering', { session: session1, learnerGroups: [learnerGroup] });
    this.store.createRecord('offering', { session: session2, learnerGroups: [learnerGroup] });
    this.store.createRecord('offering', { session: session2, learnerGroups: [learnerGroup] });
    this.store.createRecord('offering', { session: session3, learnerGroups: [learnerGroup] });

    const courses = await waitForResource(learnerGroup, 'courses');
    assert.strictEqual(courses.length, 2);
    assert.strictEqual(courses[0].title, 'course1');
    assert.strictEqual(courses[1].title, 'course2');
  });

  test('list sessions', async function (assert) {
    const learnerGroup = this.store.createRecord('learner-group');
    const session1 = this.store.createRecord('session');
    const session2 = this.store.createRecord('session');
    const session3 = this.store.createRecord('session');
    const session4 = this.store.createRecord('session');

    this.store.createRecord('offering', { session: session1, learnerGroups: [learnerGroup] });
    this.store.createRecord('offering', { session: session1, learnerGroups: [learnerGroup] });
    this.store.createRecord('offering', { session: session1, learnerGroups: [learnerGroup] });
    this.store.createRecord('offering', { session: session2, learnerGroups: [learnerGroup] });
    this.store.createRecord('offering', { session: session2, learnerGroups: [learnerGroup] });
    this.store.createRecord('offering', { session: session3, learnerGroups: [learnerGroup] });

    this.store.createRecord('ilm-session', { session: session3, learnerGroups: [learnerGroup] });
    this.store.createRecord('ilm-session', { session: session4, learnerGroups: [learnerGroup] });

    const sessions = await waitForResource(learnerGroup, 'sessions');
    assert.strictEqual(sessions.length, 4);
    assert.ok(sessions.includes(session1));
    assert.ok(sessions.includes(session2));
    assert.ok(sessions.includes(session3));
    assert.ok(sessions.includes(session4));
  });

  test('check allDescendantUsers on empty group', async function (assert) {
    const learnerGroup = this.store.createRecord('learner-group');
    const allDescendantUsers = await waitForResource(learnerGroup, 'allDescendantUsers');
    assert.strictEqual(allDescendantUsers.length, 0);
  });

  test('check allDescendantUsers on populated group with sub-groups', async function (assert) {
    const learnerGroup = this.store.createRecord('learner-group');

    const user1 = this.store.createRecord('user', { learnerGroups: [learnerGroup] });
    const user2 = this.store.createRecord('user', { learnerGroups: [learnerGroup] });
    const user3 = this.store.createRecord('user', { learnerGroups: [learnerGroup] });
    const user4 = this.store.createRecord('user', { learnerGroups: [learnerGroup] });
    const user5 = this.store.createRecord('user', { learnerGroups: [learnerGroup] });
    this.store.createRecord('learner-group', { users: [user2] });
    const subSubGroup1 = this.store.createRecord('learner-group', {
      users: [user3],
    });
    this.store.createRecord('learner-group', {
      users: [user5],
      children: [subSubGroup1],
    });

    const allDescendantUsers = await waitForResource(learnerGroup, 'allDescendantUsers');
    assert.strictEqual(allDescendantUsers.length, 5);
    assert.ok(allDescendantUsers.includes(user1));
    assert.ok(allDescendantUsers.includes(user2));
    assert.ok(allDescendantUsers.includes(user3));
    assert.ok(allDescendantUsers.includes(user4));
    assert.ok(allDescendantUsers.includes(user5));
  });

  test('check getAllDescendantUsers on empty group', async function (assert) {
    const learnerGroup = this.store.createRecord('learner-group');
    const allDescendantUsers = await learnerGroup.getAllDescendantUsers();
    assert.strictEqual(allDescendantUsers.length, 0);
  });

  test('check getAllDescendantUsers on populated group with sub-groups', async function (assert) {
    const learnerGroup = this.store.createRecord('learner-group');

    const user1 = this.store.createRecord('user', { learnerGroups: [learnerGroup] });
    const user2 = this.store.createRecord('user', { learnerGroups: [learnerGroup] });
    const user3 = this.store.createRecord('user', { learnerGroups: [learnerGroup] });
    const user4 = this.store.createRecord('user', { learnerGroups: [learnerGroup] });
    const user5 = this.store.createRecord('user', { learnerGroups: [learnerGroup] });
    this.store.createRecord('learner-group', { users: [user2] });
    const subSubGroup1 = this.store.createRecord('learner-group', {
      users: [user3],
    });
    this.store.createRecord('learner-group', {
      users: [user5],
      children: [subSubGroup1],
    });

    const allDescendantUsers = await learnerGroup.getAllDescendantUsers();
    assert.strictEqual(allDescendantUsers.length, 5);
    assert.ok(allDescendantUsers.includes(user1));
    assert.ok(allDescendantUsers.includes(user2));
    assert.ok(allDescendantUsers.includes(user3));
    assert.ok(allDescendantUsers.includes(user4));
    assert.ok(allDescendantUsers.includes(user5));
  });

  test('check empty allDescendants', async function (assert) {
    const learnerGroup = this.store.createRecord('learner-group');

    const groups = await waitForResource(learnerGroup, 'allDescendants');
    assert.strictEqual(groups.length, 0);
  });

  test('check allDescendants', async function (assert) {
    const learnerGroup = this.store.createRecord('learner-group');

    const subGroup1 = this.store.createRecord('learner-group', {
      parent: learnerGroup,
    });
    const subGroup2 = this.store.createRecord('learner-group', {
      parent: subGroup1,
    });
    const subGroup3 = this.store.createRecord('learner-group', {
      parent: subGroup2,
    });
    const subGroup4 = this.store.createRecord('learner-group', {
      parent: learnerGroup,
    });

    const groups = await waitForResource(learnerGroup, 'allDescendants');
    assert.strictEqual(groups.length, 4);
    assert.ok(groups.includes(subGroup1));
    assert.ok(groups.includes(subGroup2));
    assert.ok(groups.includes(subGroup3));
    assert.ok(groups.includes(subGroup4));
  });

  test('check getSubgroupNumberingOffset on group with no sub-groups', async function (assert) {
    const groupTitle = 'Lorem Ipsum';
    const learnerGroup = this.store.createRecord('learner-group');
    learnerGroup.set('title', groupTitle);
    const offset = await learnerGroup.getSubgroupNumberingOffset();
    assert.strictEqual(offset, 1, 'no subgroups. offset is 1.');
  });

  test('check getSubgroupNumberingOffset on group with sub-groups', async function (assert) {
    const groupTitle = 'Lorem Ipsum';

    const learnerGroup = this.store.createRecord('learner-group');
    learnerGroup.set('title', groupTitle);
    this.store.createRecord('learner-group', {
      parent: learnerGroup,
      title: groupTitle + ' 1',
    });
    this.store.createRecord('learner-group', {
      parent: learnerGroup,
      title: groupTitle + ' 3',
    });
    const offset = await learnerGroup.getSubgroupNumberingOffset();
    assert.strictEqual(offset, 4, 'highest number is 3. 3 + 1 = 4. offset is 4.');
  });

  test('check getSubgroupNumberingOffset on group with sub-groups and mis-matched sub-group title', async function (assert) {
    const groupTitle = 'Lorem Ipsum';

    const learnerGroup = this.store.createRecord('learner-group');
    learnerGroup.set('title', groupTitle);
    this.store.createRecord('learner-group', {
      parent: learnerGroup,
      title: groupTitle + ' 1',
    });
    this.store.createRecord('learner-group', {
      parent: learnerGroup,
      title: groupTitle + ' 3',
    });
    this.store.createRecord('learner-group', {
      parent: learnerGroup,
      title: 'not the parent title 4',
    });
    const offset = await learnerGroup.getSubgroupNumberingOffset();
    assert.strictEqual(offset, 4, 'subgroup with title-mismatch is ignored, offset is 4 not 5.');
  });

  test('check allinstructors', async function (assert) {
    const learnerGroup = this.store.createRecord('learner-group');

    let allInstructors = await waitForResource(learnerGroup, 'allInstructors');
    assert.strictEqual(allInstructors.length, 0);

    const user1 = this.store.createRecord('user', { instructedLearnerGroups: [learnerGroup] });
    const user2 = this.store.createRecord('user', { instructedLearnerGroups: [learnerGroup] });
    const user3 = this.store.createRecord('user');
    this.store.createRecord('instructor-group', {
      users: [user2],
      learnerGroups: [learnerGroup],
    });
    this.store.createRecord('instructor-group', {
      users: [user3],
      learnerGroups: [learnerGroup],
    });

    allInstructors = await waitForResource(learnerGroup, 'allInstructors');
    assert.strictEqual(allInstructors.length, 3);
    assert.ok(allInstructors.includes(user1));
    assert.ok(allInstructors.includes(user2));
    assert.ok(allInstructors.includes(user3));

    const user4 = this.store.createRecord('user', { instructedLearnerGroups: [learnerGroup] });
    const user5 = this.store.createRecord('user');

    this.store.createRecord('instructor-group', {
      users: [user5],
      learnerGroups: [learnerGroup],
    });

    allInstructors = await waitForResource(learnerGroup, 'allInstructors');
    assert.strictEqual(allInstructors.length, 5);
    assert.ok(allInstructors.includes(user4));
    assert.ok(allInstructors.includes(user5));
  });

  test('check allParents', async function (assert) {
    const subGroup1 = this.store.createRecord('learner-group', { id: '1' });
    const subGroup2 = this.store.createRecord('learner-group', {
      id: '2',
      parent: subGroup1,
    });
    const subGroup3 = this.store.createRecord('learner-group', {
      id: '3',
      parent: subGroup2,
    });

    const allParents = await waitForResource(subGroup3, 'allParents');
    assert.strictEqual(allParents.length, 2);
    assert.strictEqual(allParents[0], subGroup2);
    assert.strictEqual(allParents[1], subGroup1);
  });

  test('check filterTitle on top group', async function (assert) {
    const learnerGroup = this.store.createRecord('learner-group', {
      title: 'top group',
    });
    const subGroup1 = this.store.createRecord('learner-group', {
      parent: learnerGroup,
      title: 'subGroup1',
    });
    const subGroup2 = this.store.createRecord('learner-group', {
      parent: subGroup1,
      title: 'subGroup2',
    });
    this.store.createRecord('learner-group', {
      parent: subGroup2,
      title: 'subGroup3',
    });

    const groups = await waitForResource(learnerGroup, 'allDescendants');
    assert.strictEqual(groups.length, 3);
    const filterTitle = await waitForResource(learnerGroup, 'filterTitle');
    assert.strictEqual(filterTitle, 'subGroup1subGroup2subGroup3top group');
  });

  test('check filterTitle on sub group', async function (assert) {
    const learnerGroup = this.store.createRecord('learner-group', {
      id: '1',
      title: 'top group',
    });
    const subGroup1 = this.store.createRecord('learner-group', {
      id: '2',
      parent: learnerGroup,
      title: 'subGroup1',
    });
    const subGroup2 = this.store.createRecord('learner-group', {
      id: '3',
      parent: subGroup1,
      title: 'subGroup2',
    });
    const subGroup3 = this.store.createRecord('learner-group', {
      id: '4',
      parent: subGroup2,
      title: 'subGroup3',
    });
    const groups = await waitForResource(learnerGroup, 'allDescendants');
    assert.strictEqual(groups.length, 3);
    const filterTitle = await waitForResource(subGroup3, 'filterTitle');
    assert.strictEqual(filterTitle, 'subGroup2subGroup1top groupsubGroup3');
  });

  test('check sortTitle on top group', async function (assert) {
    const learnerGroup = this.store.createRecord('learner-group');

    learnerGroup.set('title', 'top group');
    const groups = await waitForResource(learnerGroup, 'allDescendants');
    assert.strictEqual(groups.length, 0);

    this.store.createRecord('learner-group', {
      parent: learnerGroup,
      title: 'subGroup1',
    });
    const sortTitle = await waitForResource(learnerGroup, 'sortTitle');
    assert.strictEqual(sortTitle, 'topgroup');
  });

  test('check sortTitle on sub group', async function (assert) {
    const learnerGroup = this.store.createRecord('learner-group', {
      id: '1',
      title: 'top group',
    });
    let groups = await waitForResource(learnerGroup, 'allDescendants');
    assert.strictEqual(groups.length, 0);

    const subGroup1 = this.store.createRecord('learner-group', {
      id: '2',
      parent: learnerGroup,
      title: 'subGroup1',
    });
    const subGroup2 = this.store.createRecord('learner-group', {
      id: '3',
      parent: subGroup1,
      title: 'subGroup2',
    });
    const subGroup3 = this.store.createRecord('learner-group', {
      id: '4',
      parent: subGroup2,
      title: 'subGroup3',
    });

    groups = await waitForResource(learnerGroup, 'allDescendants');
    assert.strictEqual(groups.length, 3);

    const sortTitle = await waitForResource(subGroup3, 'sortTitle');
    assert.strictEqual(sortTitle, 'topgroupsubGroup1subGroup2subGroup3');
  });

  test('check removeUserFromGroupAndAllDescendants', async function (assert) {
    const learnerGroup = this.store.createRecord('learner-group');

    const groups = await waitForResource(learnerGroup, 'allParents');
    assert.strictEqual(groups.length, 0);

    const user1 = this.store.createRecord('user');
    const subGroup1 = this.store.createRecord('learner-group', {
      parent: learnerGroup,
      users: [user1],
    });
    const subGroup2 = this.store.createRecord('learner-group', {
      parent: subGroup1,
      users: [user1],
    });
    const subGroup3 = this.store.createRecord('learner-group', {
      parent: subGroup2,
      users: [user1],
    });
    const subGroup4 = this.store.createRecord('learner-group', {
      parent: subGroup1,
    });

    const groupsToRemove = await subGroup1.removeUserFromGroupAndAllDescendants(user1);
    assert.strictEqual(groupsToRemove.length, 4);
    assert.notOk(groupsToRemove.includes(learnerGroup));
    assert.ok(groupsToRemove.includes(subGroup1));
    assert.ok(groupsToRemove.includes(subGroup2));
    assert.ok(groupsToRemove.includes(subGroup3));
    assert.ok(groupsToRemove.includes(subGroup4));
  });

  test('check addUserToGroupAndAllParents', async function (assert) {
    const learnerGroup = this.store.createRecord('learner-group');
    const groups = await waitForResource(learnerGroup, 'allParents');
    assert.strictEqual(groups.length, 0);

    const user1 = this.store.createRecord('user');
    const subGroup1 = this.store.createRecord('learner-group', {
      parent: learnerGroup,
      users: [user1],
    });
    const subGroup2 = this.store.createRecord('learner-group', {
      parent: subGroup1,
    });
    const subGroup3 = this.store.createRecord('learner-group', {
      parent: subGroup2,
    });
    const subGroup4 = this.store.createRecord('learner-group', {
      parent: subGroup1,
    });

    const groupsToAdd = await subGroup3.addUserToGroupAndAllParents(user1);

    assert.strictEqual(groupsToAdd.length, 3);
    assert.ok(groupsToAdd.includes(learnerGroup));
    assert.notOk(groupsToAdd.includes(subGroup1));
    assert.ok(groupsToAdd.includes(subGroup2));
    assert.ok(groupsToAdd.includes(subGroup3));
    assert.notOk(groupsToAdd.includes(subGroup4));
  });

  test('has no learners in group without learners and without subgroups', async function (assert) {
    const learnerGroup = this.store.createRecord('learner-group');
    const hasLearners = await waitForResource(learnerGroup, 'hasLearnersInGroupOrSubgroups');
    assert.notOk(hasLearners);
  });

  test('has learners in group with learners and but without learners in subgroups', async function (assert) {
    const learnerGroup = this.store.createRecord('learner-group');
    this.store.createRecord('user', { learnerGroups: [learnerGroup] });
    const hasLearners = await waitForResource(learnerGroup, 'hasLearnersInGroupOrSubgroups');
    assert.ok(hasLearners);
  });

  test('has no learners with no learners in group nor in subgroups', async function (assert) {
    const learnerGroup = this.store.createRecord('learner-group');
    this.store.createRecord('learner-group', {
      parent: learnerGroup,
    });
    const hasLearners = await waitForResource(learnerGroup, 'hasLearnersInGroupOrSubgroups');
    assert.notOk(hasLearners);
  });

  test('has learners with no learners in group but with learners in subgroups', async function (assert) {
    const learnerGroup = this.store.createRecord('learner-group');
    const learner = this.store.createRecord('user');
    this.store.createRecord('learner-group', {
      users: [learner],
      parent: learnerGroup,
    });

    assert.ok(await waitForResource(learnerGroup, 'hasLearnersInGroupOrSubgroups'));
  });

  test('has learners with learners in group and with learners in subgroups', async function (assert) {
    const learnerGroup = this.store.createRecord('learner-group');
    const learner = this.store.createRecord('user');
    this.store.createRecord('user', { learnerGroups: [learnerGroup] });
    this.store.createRecord('learner-group', {
      users: [learner],
      parent: learnerGroup,
    });

    assert.ok(await waitForResource(learnerGroup, 'hasLearnersInGroupOrSubgroups'));
  });

  test('users only at this level', async function (assert) {
    const learnerGroup = this.store.createRecord('learner-group');
    const user1 = this.store.createRecord('user', { learnerGroups: [learnerGroup] });
    const user2 = this.store.createRecord('user', { learnerGroups: [learnerGroup] });
    const user3 = this.store.createRecord('user', { learnerGroups: [learnerGroup] });
    const user4 = this.store.createRecord('user', { learnerGroups: [learnerGroup] });

    const subgroup = this.store.createRecord('learner-group', {
      parent: learnerGroup,
      users: [user1, user3],
    });
    this.store.createRecord('learner-group', {
      parent: subgroup,
      users: [user4],
    });
    const users = await waitForResource(learnerGroup, 'usersOnlyAtThisLevel');
    assert.strictEqual(users.length, 1);
    assert.ok(users.includes(user2));
  });

  test('count users only at this level', async function (assert) {
    const learnerGroup = this.store.createRecord('learner-group');
    const user1 = this.store.createRecord('user', { learnerGroups: [learnerGroup] });
    const user2 = this.store.createRecord('user', { learnerGroups: [learnerGroup] });
    const user3 = this.store.createRecord('user', { learnerGroups: [learnerGroup] });
    this.store.createRecord('user', { learnerGroups: [learnerGroup] });

    const subgroup = this.store.createRecord('learner-group', {
      parent: learnerGroup,
      users: [user1, user2],
    });
    this.store.createRecord('learner-group', {
      parent: subgroup,
      users: [user3],
    });
    const c = await waitForResource(learnerGroup, 'usersOnlyAtThisLevelCount');
    assert.strictEqual(c, 1);
  });

  test('get users only at this level', async function (assert) {
    const learnerGroup = this.store.createRecord('learner-group');
    const user1 = this.store.createRecord('user', { learnerGroups: [learnerGroup] });
    const user2 = this.store.createRecord('user', { learnerGroups: [learnerGroup] });
    const user3 = this.store.createRecord('user', { learnerGroups: [learnerGroup] });
    const user4 = this.store.createRecord('user', { learnerGroups: [learnerGroup] });

    const subgroup = this.store.createRecord('learner-group', {
      parent: learnerGroup,
      users: [user1, user3],
    });
    this.store.createRecord('learner-group', {
      parent: subgroup,
      users: [user4],
    });

    const users = await learnerGroup.getUsersOnlyAtThisLevel();
    assert.strictEqual(users.length, 1);
    assert.ok(users.includes(user2));
  });

  test('allParentTitles', async function (assert) {
    const learnerGroup = this.store.createRecord('learner-group', { title: 'Foo', id: '1' });
    let titles = await waitForResource(learnerGroup, 'allParentTitles');
    assert.strictEqual(titles.length, 0);

    const subGroup = this.store.createRecord('learner-group', {
      id: '2',
      title: 'Bar',
      parent: learnerGroup,
    });
    const subSubGroup = this.store.createRecord('learner-group', {
      id: '3',
      title: 'Baz',
      parent: subGroup,
    });
    titles = await waitForResource(subSubGroup, 'allParentTitles');
    assert.strictEqual(titles.length, 2);
    assert.strictEqual(titles[0], 'Foo');
    assert.strictEqual(titles[1], 'Bar');
  });

  test('allParentsTitle', async function (assert) {
    const learnerGroup = this.store.createRecord('learner-group', { title: 'Foo', id: '1' });
    let titles = await waitForResource(learnerGroup, 'allParentsTitle');
    assert.strictEqual(titles, '');

    const subGroup = this.store.createRecord('learner-group', {
      id: '2',
      title: 'Bar',
      parent: learnerGroup,
    });
    const subSubGroup = this.store.createRecord('learner-group', {
      id: '3',
      title: 'Baz',
      parent: subGroup,
    });
    titles = await waitForResource(subSubGroup, 'allParentsTitle');
    assert.strictEqual(titles, 'Foo > Bar > ');
  });

  test('sortTitle', async function (assert) {
    const learnerGroup = this.store.createRecord('learner-group', { title: 'Foo', id: '1' });
    let title = await waitForResource(learnerGroup, 'sortTitle');
    assert.strictEqual(title, 'Foo');

    const subGroup = this.store.createRecord('learner-group', {
      id: '2',
      title: 'Bar',
      parent: learnerGroup,
    });
    const subSubGroup = this.store.createRecord('learner-group', {
      id: '3',
      title: 'Baz',
      parent: subGroup,
    });
    title = await waitForResource(subSubGroup, 'sortTitle');
    assert.strictEqual(title, 'FooBarBaz');
  });

  test('topLevelGroup', async function (assert) {
    const learnerGroup = this.store.createRecord('learner-group', { id: '1' });
    let topLevelGroup = await waitForResource(learnerGroup, 'topLevelGroup');
    assert.strictEqual(topLevelGroup, learnerGroup);
    const subGroup = this.store.createRecord('learner-group', {
      id: '2',
      parent: learnerGroup,
    });
    const subSubGroup = this.store.createRecord('learner-group', {
      id: '3',
      parent: subGroup,
    });
    topLevelGroup = await waitForResource(subSubGroup, 'topLevelGroup');
    assert.strictEqual(topLevelGroup, learnerGroup);
  });

  test('isTopLevelGroup', async function (assert) {
    const learnerGroup = this.store.createRecord('learner-group', { id: '1' });
    assert.ok(learnerGroup.isTopLevelGroup);

    const subGroup = this.store.createRecord('learner-group', {
      parent: learnerGroup,
    });
    assert.notOk(subGroup.isTopLevelGroup);
  });

  test('usersCount', async function (assert) {
    const learnerGroup = this.store.createRecord('learner-group');
    assert.strictEqual(learnerGroup.usersCount, 0);
    this.store.createRecord('user', { learnerGroups: [learnerGroup] });
    this.store.createRecord('user', { learnerGroups: [learnerGroup] });

    assert.strictEqual(await waitForResource(learnerGroup, 'usersCount'), 2);
  });

  test('childrenCount', async function (assert) {
    const learnerGroup = this.store.createRecord('learner-group');
    assert.strictEqual(learnerGroup.childrenCount, 0);
    this.store.createRecord('learner-group', { parent: learnerGroup });
    this.store.createRecord('learner-group', { parent: learnerGroup });

    assert.strictEqual(learnerGroup.childrenCount, 2);
  });

  test('hasChildren', async function (assert) {
    const learnerGroup = this.store.createRecord('learner-group');
    assert.notOk(learnerGroup.hasChildren);
    this.store.createRecord('learner-group', { parent: learnerGroup });
    assert.ok(learnerGroup.hasChildren);
  });

  test('has no needs in group without subgroups', async function (assert) {
    const learnerGroup = this.store.createRecord('learner-group');
    const hasNeeds = await waitForResource(learnerGroup, 'hasSubgroupsInNeedOfAccommodation');
    assert.notOk(hasNeeds);
  });

  test('has no needs in group with subgroups without needs', async function (assert) {
    const learnerGroup = this.store.createRecord('learner-group');
    this.store.createRecord('learner-group', {
      parent: learnerGroup,
    });
    this.store.createRecord('learner-group', {
      parent: learnerGroup,
    });

    const hasNeeds = await waitForResource(learnerGroup, 'hasSubgroupsInNeedOfAccommodation');
    assert.notOk(hasNeeds);
  });

  test('has needs in group with subgroups with needs', async function (assert) {
    const learnerGroup = this.store.createRecord('learner-group');
    this.store.createRecord('learner-group', {
      parent: learnerGroup,
    });
    this.store.createRecord('learner-group', {
      parent: learnerGroup,
      needsAccommodation: true,
    });

    const hasNeeds = await waitForResource(learnerGroup, 'hasSubgroupsInNeedOfAccommodation');
    assert.ok(hasNeeds);
  });

  test('has no needs in deeply nested subgroups without needs', async function (assert) {
    const learnerGroup = this.store.createRecord('learner-group');
    const subGroup1 = this.store.createRecord('learner-group', {
      parent: learnerGroup,
    });
    const subGroup2 = this.store.createRecord('learner-group', {
      parent: learnerGroup,
    });

    this.store.createRecord('learner-group', {
      parent: subGroup1,
    });
    this.store.createRecord('learner-group', {
      parent: subGroup1,
    });

    this.store.createRecord('learner-group', {
      parent: subGroup2,
    });
    this.store.createRecord('learner-group', {
      parent: subGroup2,
    });

    const hasNeeds = await waitForResource(learnerGroup, 'hasSubgroupsInNeedOfAccommodation');
    assert.notOk(hasNeeds);
  });

  test('has needs in deeply nested subgroups with needs', async function (assert) {
    const learnerGroup = this.store.createRecord('learner-group');
    const subGroup1 = this.store.createRecord('learner-group', {
      parent: learnerGroup,
    });
    const subGroup2 = this.store.createRecord('learner-group', {
      parent: learnerGroup,
    });

    this.store.createRecord('learner-group', {
      parent: subGroup1,
    });
    this.store.createRecord('learner-group', {
      parent: subGroup1,
    });

    this.store.createRecord('learner-group', {
      parent: subGroup2,
    });
    this.store.createRecord('learner-group', {
      parent: subGroup2,
      needsAccommodation: true,
    });

    const hasNeeds = await waitForResource(learnerGroup, 'hasSubgroupsInNeedOfAccommodation');
    assert.ok(hasNeeds);
  });
});
