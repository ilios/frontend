import Model, { hasMany, belongsTo, attr } from '@ember-data/model';
import escapeRegExp from 'ilios-common/utils/escape-reg-exp';
import { map } from 'rsvp';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import { mapBy, uniqueValues } from 'ilios-common/utils/array-helpers';

export default class LearnerGroup extends Model {
  @attr('string')
  title;

  @attr('string')
  location;

  @attr('string')
  url;

  @attr('boolean')
  needsAccommodation;

  @belongsTo('cohort', { async: true, inverse: 'learnerGroups' })
  cohort;

  @belongsTo('learner-group', { async: true, inverse: 'children' })
  parent;

  @cached
  get _parentData() {
    return new TrackedAsyncData(this.parent);
  }

  @hasMany('learner-group', { async: true, inverse: 'parent' })
  children;

  @cached
  get _childrenData() {
    return new TrackedAsyncData(this.children);
  }

  @hasMany('ilm-session', { async: true, inverse: 'learnerGroups' })
  ilmSessions;

  @cached
  get _ilmSessionsData() {
    return new TrackedAsyncData(this.ilmSessions);
  }

  @hasMany('offering', { async: true, inverse: 'learnerGroups' })
  offerings;

  @cached
  get _offeringsData() {
    return new TrackedAsyncData(this.offerings);
  }

  @hasMany('instructor-group', { async: true, inverse: 'learnerGroups' })
  instructorGroups;

  @cached
  get _instructorGroupsData() {
    return new TrackedAsyncData(this.instructorGroups);
  }

  @hasMany('user', { async: true, inverse: 'learnerGroups' })
  users;

  @cached
  get _usersData() {
    return new TrackedAsyncData(this.users);
  }

  @hasMany('user', {
    async: true,
    inverse: 'instructedLearnerGroups',
  })
  instructors;

  @cached
  get _instructorsData() {
    return new TrackedAsyncData(this.instructors);
  }

  @belongsTo('learner-group', {
    inverse: 'descendants',
    async: true,
  })
  ancestor;

  @hasMany('learner-group', {
    inverse: 'ancestor',
    async: true,
  })
  descendants;

  @cached
  get _offeringSessionsData() {
    if (!this._offeringsData.isResolved) {
      return null;
    }

    return new TrackedAsyncData(Promise.all(this._offeringsData.value.map((o) => o.session)));
  }

  @cached
  get _ilmSessionSessionsData() {
    if (!this._ilmSessionsData.isResolved) {
      return null;
    }

    return new TrackedAsyncData(Promise.all(this._ilmSessionsData.value.map((o) => o.session)));
  }

  /**
   * A list of all sessions associated with this learner group, via offerings or via ILMs.
   */
  get sessions() {
    if (
      !this._offeringSessionsData ||
      !this._offeringSessionsData.isResolved ||
      !this._ilmSessionSessionsData ||
      !this._ilmSessionSessionsData.isResolved
    ) {
      return [];
    }

    return uniqueValues(
      [...this._offeringSessionsData.value, ...this._ilmSessionSessionsData.value].filter(Boolean),
    );
  }

  @cached
  get _sessionCourses() {
    return new TrackedAsyncData(Promise.all(this.sessions.map((s) => s.course)));
  }

  /**
   * A list of all courses associated with this learner group, via offerings/sessions or via ILMs.
   */
  get courses() {
    if (!this._sessionCourses.isResolved) {
      return [];
    }
    return uniqueValues(this._sessionCourses.value);
  }

  /**
   * Get the offset for numbering generated subgroups.
   *
   * This is best explained by an example:
   * A learner group 'Foo' has three similarly named subgroups 'Foo 1', 'Foo 2', and 'Foo 4'. The highest identified
   * subgroup number is 4, so the offset for generating new subgroups is 5.
   * If no subgroups exist, or none of the subgroup names match the <code>(Parent) (Number)</code> pattern, then the
   * offset will default to 1.
   */
  async getSubgroupNumberingOffset() {
    const regex = new RegExp('^' + escapeRegExp(this.title) + ' ([0-9]+)$');
    const groups = await this.children;
    let offset = groups.reduce((previousValue, item) => {
      let rhett = previousValue;
      const matches = regex.exec(item.get('title'));
      if (matches) {
        rhett = Math.max(rhett, parseInt(matches[1], 10));
      }
      return rhett;
    }, 0);
    return ++offset;
  }

  @cached
  get _allDescendantsData() {
    if (!this._childrenData.isResolved) {
      return null;
    }

    return new TrackedAsyncData(
      Promise.all(this._childrenData.value.map((c) => c.getAllDescendants())),
    );
  }

  /**
   * A list of all nested sub-groups of this group.
   */
  get allDescendants() {
    if (!this._childrenData.isResolved || !this._allDescendantsData?.isResolved) {
      return [];
    }

    return [...this._childrenData.value, ...this._allDescendantsData.value.flat()];
  }

  async getAllDescendants() {
    const children = await this.children;
    const childDescendants = await map(children, (child) => {
      return child.getAllDescendants();
    });

    return [...children, ...childDescendants.flat()];
  }

  @cached
  get _allDescendantsUsersData() {
    return new TrackedAsyncData(Promise.all(this.allDescendants.map((g) => g.users)));
  }

  /**
   * A list of all users in this group and any of its sub-groups.
   */
  get allDescendantUsers() {
    if (!this._usersData.isResolved || !this._allDescendantsUsersData.isResolved) {
      return null;
    }

    return uniqueValues([...this._usersData.value, ...this._allDescendantsUsersData.value.flat()]);
  }

  async getAllDescendantUsers() {
    const users = await this.users;
    const descendantUsers = await this._getDescendantUsers();
    return uniqueValues([...users, ...descendantUsers]);
  }

  async _getDescendantUsers() {
    const allDescendants = await this.getAllDescendants();
    const descendantsUsers = await Promise.all(mapBy(allDescendants, 'users'));
    return descendantsUsers.reduce((all, groups) => {
      return [...all, ...groups];
    }, []);
  }

  /**
   * A list of users that are assigned to this group, excluding those that are ALSO assigned to any of this group's sub-groups.
   */
  get usersOnlyAtThisLevel() {
    if (!this._usersData.isResolved || !this._allDescendantsUsersData.isResolved) {
      return null;
    }
    const descendantUsers = this._allDescendantsUsersData.value.flat();

    return this._usersData.value.filter((user) => !descendantUsers.includes(user));
  }

  get usersOnlyAtThisLevelCount() {
    return this.usersOnlyAtThisLevel?.length || 0;
  }

  async getUsersOnlyAtThisLevel() {
    const users = await this.users;
    const descendantsUsers = await this._getDescendantUsers();

    return users.filter((user) => !descendantsUsers.includes(user));
  }

  get allParentTitles() {
    if (
      this.isTopLevelGroup ||
      !this._parentData.isResolved ||
      !this._allAncestorsData.isResolved
    ) {
      return [];
    }

    return [...mapBy(this._allAncestorsData.value, 'title'), this._parentData.value.title];
  }

  get allParentsTitle() {
    return this.allParentTitles.reduce((acc, curr) => {
      return (acc += curr + ' > ');
    }, '');
  }

  get sortTitle() {
    if (this.isTopLevelGroup) {
      return this.title.replace(/\s/g, '');
    }

    if (!this._parentData.isResolved || !this._allAncestorsData?.isResolved) {
      return undefined;
    }

    return [
      ...mapBy([...this._allAncestorsData.value.reverse(), this._parentData.value], 'title'),
      this.title,
    ]
      .join('')
      .replace(/\s/g, '');
  }

  /**
   * A text string comprised of all learner-group titles in this group's tree.
   * This includes that titles of all of its ancestors, all its descendants and this group's title itself.
   */
  get filterTitle() {
    if (
      !this._parentData.isResolved ||
      !this._allAncestorsData?.isResolved ||
      !this._childrenData.isResolved ||
      !this._allDescendantsData?.isResolved
    ) {
      return '';
    }

    const up = this.isTopLevelGroup
      ? []
      : [this._parentData.value, ...this._allAncestorsData.value];
    const down = [...this._childrenData.value, ...this._allDescendantsData.value.flat()];

    return [...mapBy(down, 'title'), ...mapBy(up, 'title'), this.title].join('');
  }

  async _getAllParents() {
    const parent = await this.parent;
    if (!parent) {
      return [];
    }
    const grandparents = await parent.getAllParents();

    return [parent, ...grandparents];
  }

  @cached
  get _allAncestorsData() {
    if (!this._parentData.isResolved) {
      return null;
    }

    return new TrackedAsyncData(this._parentData.value?._getAllParents());
  }

  get allParents() {
    if (
      this.isTopLevelGroup ||
      !this._parentData.isResolved ||
      !this._allAncestorsData?.isResolved
    ) {
      return [];
    }

    return [this._parentData.value, ...this._allAncestorsData.value];
  }

  /**
   * The top-level group in this group's parentage tree, or this group itself if it has no parent.
   */
  get topLevelGroup() {
    if (this.isTopLevelGroup) {
      return this;
    }
    if (!this._parentData.isResolved) {
      return null;
    }
    return this._parentData.value.topLevelGroup;
  }

  async getTopLevelGroup() {
    if (this.isTopLevelGroup) {
      return this;
    }

    const parent = await this.parent;
    return parent.getTopLevelGroup();
  }

  get isTopLevelGroup() {
    return !this.belongsTo('parent').id();
  }

  @cached
  get _instructorGroupUsersData() {
    if (!this._instructorGroupsData.isResolved) {
      return null;
    }

    return new TrackedAsyncData(
      Promise.all(this._instructorGroupsData.value.map((ig) => ig.users)),
    );
  }

  get allInstructors() {
    if (!this._instructorsData?.isResolved || !this._instructorGroupUsersData?.isResolved) {
      return [];
    }

    return uniqueValues([
      ...this._instructorsData.value,
      ...this._instructorGroupUsersData.value.flat(),
    ]);
  }

  get _descendantUsers() {
    return new TrackedAsyncData(Promise.all(this.allDescendants.map((lg) => lg.users)));
  }

  /**
   * Checks if this group or any of its subgroups has any learners.
   */
  get hasLearnersInGroupOrSubgroups() {
    if (this.hasMany('users').ids().length) {
      return true;
    }

    if (!this._allDescendantsUsersData?.isResolved) {
      return false;
    }

    return this._allDescendantsUsersData.value.flat().length > 0;
  }

  /**
   * Recursively checks if any of this group's subgroups and their subgroups need accommodation.
   * @return {Boolean}
   */
  get hasSubgroupsInNeedOfAccommodation() {
    return !!this.getSubgroupsInNeedOfAccommodation.length;
  }

  /**
   * Retrieves all subgroups in need of accommodation.
   *
   * @return {Array}
   */
  get getSubgroupsInNeedOfAccommodation() {
    // no subgroups? no needs.
    if (!this.hasMany('children').ids().length) {
      return [];
    }

    return this.allDescendants.filter((group) => group.needsAccommodation);
  }

  /**
   * Returns the number of users in this group
   */
  get usersCount() {
    return this.hasMany('users').ids().length;
  }

  /**
   * Returns the number of children in this group
   */
  get childrenCount() {
    return this.hasMany('children').ids().length;
  }

  /**
   * Takes a user out of  a group and then traverses child groups recursively
   * to remove the user from them as well and returns the entire tree for saving.
   */
  async removeUserFromGroupAndAllDescendants({ id: userId }) {
    const allDescendants = await this.getAllDescendants();
    return await map([this, ...allDescendants], async (group) => {
      if (group.hasMany('users').ids().includes(userId)) {
        group.users = (await group.users).filter(({ id }) => id !== userId);
      }

      return group;
    });
  }

  async getAllParents() {
    const parent = await this.parent;
    if (!parent) {
      return [];
    }
    const allParents = await parent.getAllParents();
    return [...allParents, parent];
  }

  async getAllParentTitles() {
    const parent = await this.parent;
    if (!parent) {
      return [];
    }
    const parents = await parent.getAllParents();
    const titles = mapBy(parents, 'title');
    return [...titles, parent.title];
  }

  async getTitleWithParentTitles() {
    const parentTitles = await this.getAllParentTitles();
    if (!parentTitles.length) {
      return this.title;
    }
    return parentTitles.join(' > ') + ' > ' + this.title;
  }

  @cached
  get titleWithParentTitlesData() {
    return new TrackedAsyncData(this.getTitleWithParentTitles());
  }

  get titleWithParentTitles() {
    return this.titleWithParentTitlesData.isResolved ? this.titleWithParentTitlesData.value : '';
  }

  /**
   * Adds a user to a group and then traverses parent groups recursively
   * to add the user to them as well.  Will only modify groups where the
   * user currently does not exist.
   */
  async addUserToGroupAndAllParents(user) {
    const modifiedGroups = [];
    const userId = user.id;
    const allParents = await this.getAllParents();
    const groups = [this, ...allParents];
    for (let i = 0; i < groups.length; i++) {
      const users = await groups[i].users;
      const ids = mapBy(users, 'id');
      if (!ids.includes(userId)) {
        users.push(user);
        modifiedGroups.push(groups[i]);
      }
    }
    return uniqueValues(modifiedGroups);
  }
}
