import Model, { hasMany, belongsTo, attr } from '@ember-data/model';
import escapeRegExp from 'ilios-common/utils/escape-reg-exp';
import { map } from 'rsvp';
import { use } from 'ember-could-get-used-to-this';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';
import AsyncProcess from 'ilios-common/classes/async-process';
import DeprecatedAsyncCP from 'ilios-common/classes/deprecated-async-cp';
import DeprecatedResolveCP from 'ilios-common/classes/deprecated-resolve-cp';
import ResolveFlatMapBy from 'ilios-common/classes/resolve-flat-map-by';
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

  @belongsTo('cohort', { async: true })
  cohort;

  @belongsTo('learner-group', { async: true, inverse: 'children' })
  parent;

  @hasMany('learner-group', { async: true, inverse: 'parent' })
  children;

  @hasMany('ilm-session', { async: true })
  ilmSessions;

  @hasMany('offering', { async: true })
  offerings;

  @hasMany('instructor-group', { async: true })
  instructorGroups;

  @hasMany('user', { async: true, inverse: 'learnerGroups' })
  users;

  @hasMany('user', {
    async: true,
    inverse: 'instructedLearnerGroups',
  })
  instructors;

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

  @use _offerings = new ResolveAsyncValue(() => [this.offerings]);
  @use _ilmSessions = new ResolveAsyncValue(() => [this.ilmSessions]);

  @use _offeringSessions = new ResolveFlatMapBy(() => [this.offerings, 'session']);
  @use _ilmSessionSessions = new ResolveFlatMapBy(() => [this.ilmSessions, 'session']);

  /**
   * A list of all sessions associated with this learner group, via offerings or via ILMs.
   */
  get sessions() {
    if (!this._offeringSessions || !this._ilmSessionSessions) {
      return [];
    }
    return uniqueValues([...this._offeringSessions, ...this._ilmSessionSessions].filter(Boolean));
  }

  @use _sessionCourses = new ResolveFlatMapBy(() => [this.sessions, 'course']);

  /**
   * A list of all courses associated with this learner group, via offerings/sessions or via ILMs.
   */
  get courses() {
    return uniqueValues(this._sessionCourses ?? []);
  }

  @use subgroupNumberingOffset = new DeprecatedAsyncCP(() => [
    this.getSubgroupNumberingOffset.bind(this),
    'learnerGroup.subgroupNumberingOffset',
    this.children,
    this.title,
  ]);

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

  /**
   * A list of all nested sub-groups of this group.
   */
  @use _allDescendants = new AsyncProcess(() => [
    this.getAllDescendants.bind(this),
    this.children.children,
  ]);
  get allDescendants() {
    return this._allDescendants ?? [];
  }

  async getAllDescendants() {
    const children = (await this.children).slice();
    const childDescendants = await map(children, (child) => {
      return child.getAllDescendants();
    });

    return [...children, ...childDescendants.flat()];
  }

  @use _allDescendantUsers = new ResolveFlatMapBy(() => [this.allDescendants, 'users']);
  @use _users = new ResolveAsyncValue(() => [this.users]);

  /**
   * A list of all users in this group and any of its sub-groups.
   */
  @use allDescendantUsers = new AsyncProcess(() => [
    this.getAllDescendantUsers.bind(this),
    this._allDescendantUsers,
    this._users,
  ]);

  async getAllDescendantUsers() {
    const users = await this.users;
    const descendantUsers = await this._getDescendantUsers();
    return uniqueValues([...users.slice(), ...descendantUsers]);
  }

  async _getDescendantUsers() {
    const allDescendants = await this.getAllDescendants();
    const descendantsUsers = await Promise.all(mapBy(allDescendants, 'users'));
    return descendantsUsers.reduce((all, groups) => {
      return [...all, ...groups.slice()];
    }, []);
  }

  /**
   * A list of users that are assigned to this group, excluding those that are ALSO assigned to any of this group's sub-groups.
   */
  @use usersOnlyAtThisLevel = new AsyncProcess(() => [
    this.getUsersOnlyAtThisLevel.bind(this),
    this.allDescendants,
    this._users,
  ]);

  async getUsersOnlyAtThisLevel() {
    const users = (await this.users).slice();
    const descendantsUsers = await this._getDescendantUsers();

    return users.filter((user) => !descendantsUsers.includes(user));
  }

  @use _parent = new ResolveAsyncValue(() => [this.parent]);

  get allParentTitles() {
    if (this.isTopLevelGroup) {
      return [];
    }
    if (!this._parent || !this._parent.allParentTitles) {
      return undefined;
    }

    return [...this._parent.allParentTitles, this._parent.title];
  }

  get allParentsTitle() {
    return this.allParentTitles?.reduce((acc, curr) => {
      return (acc += curr + ' > ');
    }, '');
  }

  get sortTitle() {
    if (this.isTopLevelGroup) {
      return this.title.replace(/\s/g, '');
    }
    if (!this.allParentTitles) {
      return undefined;
    }
    return [...this.allParentTitles, this.title].join('').replace(/\s/g, '');
  }

  /**
   * A text string comprised of all learner-group titles in this group's tree.
   * This includes that titles of all of its ancestors, all its descendants and this group's title itself.
   */
  get filterTitle() {
    if (!this.allParents || !this.allDescendants) {
      return '';
    }

    return [
      ...mapBy(this.allDescendants, 'title'),
      ...mapBy(this.allParents, 'title'),
      this.title,
    ].join('');
  }

  get allParents() {
    if (this.isTopLevelGroup) {
      return [];
    }
    if (!this._parent?.allParents) {
      return undefined;
    }

    return [this._parent, ...this._parent.allParents];
  }

  /**
   * The top-level group in this group's parentage tree, or this group itself if it has no parent.
   */
  get topLevelGroup() {
    return this.isTopLevelGroup ? this : this._parent?.topLevelGroup;
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

  @use _instructors = new ResolveAsyncValue(() => [this.instructors]);
  @use _instructorGroupUsers = new ResolveFlatMapBy(() => [this.instructorGroups, 'users']);

  get allInstructors() {
    if (!this._instructors || !this._instructorGroupUsers) {
      return [];
    }

    return uniqueValues([...this._instructors.slice(), ...this._instructorGroupUsers]);
  }

  @use _cohort = new ResolveAsyncValue(() => [this.cohort]);
  @use _programYear = new ResolveAsyncValue(() => [this._cohort?.programYear]);
  @use _program = new ResolveAsyncValue(() => [this._programYear?.program]);
  @use school = new DeprecatedResolveCP(() => [this._program?.school, 'learnerGroup.school']);

  @use _descendantUsers = new ResolveFlatMapBy(() => [this.allDescendants, 'users']);

  /**
   * Checks if this group or any of its subgroups has any learners.
   */
  get hasLearnersInGroupOrSubgroups() {
    if (this.hasMany('users').ids().length) {
      return true;
    }

    return this._descendantUsers?.length > 0;
  }

  /**
   * Recursively checks if any of this group's subgroups and their subgroups need accommodation.
   */
  get hasSubgroupsInNeedOfAccommodation() {
    // no subgroups? no needs.
    if (!this.hasMany('children').ids().length) {
      return false;
    }

    const subGroupsInNeedOfAccomodation = this.allDescendants?.filter(
      (group) => group.needsAccommodation
    );

    return subGroupsInNeedOfAccomodation?.length > 0;
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
   * to remove the user from them as well.  Will only modify groups where the
   * user currently exists.
   */
  async removeUserFromGroupAndAllDescendants(user) {
    const modifiedGroups = [];
    const userId = user.id;
    const allDescendants = await this.getAllDescendants();
    [this, ...allDescendants].forEach((group) => {
      if (group.hasMany('users').ids().includes(userId)) {
        group.users = group.users.filter(({ id }) => id !== user.id);
        modifiedGroups.push(group);
      }
    });
    return uniqueValues(modifiedGroups);
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
        users.pushObject(user);
        modifiedGroups.push(groups[i]);
      }
    }
    return uniqueValues(modifiedGroups);
  }
}
