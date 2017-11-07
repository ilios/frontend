import DS from 'ember-data';
import Ember from 'ember';
import escapeRegExp from '../utils/escape-reg-exp';

const { attr, belongsTo, hasMany, Model } = DS;
const { computed, isEmpty, isNone, RSVP } = Ember;
const { Promise, map, all } = RSVP;

export default Model.extend({
  title: attr('string'),
  location: attr('string'),
  cohort: belongsTo('cohort', { async: true }),
  parent: belongsTo('learner-group', { async: true, inverse: 'children' }),
  children: hasMany('learner-group', { async: true, inverse: 'parent' }),
  ilmSessions: hasMany('ilm-session', { async: true }),
  offerings: hasMany('offering', { async: true }),
  instructorGroups: hasMany('instructor-group', { async: true }),
  users: hasMany('user', { async: true, inverse: 'learnerGroups' }),
  instructors: hasMany('user', { async: true, inverse: 'instructedLearnerGroups' }),

  /**
   * A list of all courses associated with this learner group, via offerings/sessions or via ILMs.
   * @property courses
   * @type {Ember.computed}
   * @public
   */
  courses: computed('offerings.[]', 'ilmSessions.[]', async function(){
    const offerings = await this.get('offerings').toArray();
    const ilms = await this.get('ilmSessions').toArray();
    const arr = [].pushObjects(offerings).pushObjects(ilms);

    let sessions = await map(arr.mapBy('session'), session => {
      return session;
    });
    sessions = sessions.filter(session => {
      return !isEmpty(session);
    }).uniq();

    const courses = await map(sessions.mapBy('course'), course => {
      return course;
    });

    return courses.uniq();
  }),

  /**
   * Get the offset for numbering generated subgroups.
   *
   * This is best explained by an example:
   * A learner group 'Foo' has three similarly named subgroups 'Foo 1', 'Foo 2', and 'Foo 4'. The highest identified
   * subgroup number is 4, so the offset for generating new subgroups is 5.
   * If no subgroups exist, or none of the subgroup names match the <code>(Parent) (Number)</code> pattern, then the
   * offset will default to 1.
   *
   * @property subgroupNumberingOffset
   * @type {Ember.computed}
   * @public
   */
  subgroupNumberingOffset: computed('children.[]', async function () {
    const regex = new RegExp('^' + escapeRegExp(this.get('title')) + ' ([0-9]+)$');
    const groups = this.get('children');
    let offset = groups.reduce((previousValue, item) => {
      let rhett = previousValue;
      let matches = regex.exec(item.get('title'));
      if (! isEmpty(matches)) {
        rhett = Math.max(rhett, parseInt(matches[1], 10));
      }
      return rhett;
    }, 0);
    return ++offset;
  }),

  /**
   * A list of all users in this group and any of its sub-groups.
   * @property allDescendantUsers
   * @type {Ember.computed}
   * @public
   */
  allDescendantUsers: computed('users.[]', 'children.@each.allDescendantUsers', async function(){
    let users = await this.get('users').toArray();
    let subgroups = await this.get('children').toArray();
    let usersInSubgroups = await all(subgroups.mapBy('allDescendantUsers'));
    let allUsers = (usersInSubgroups.reduce((array, set) => {
      array.pushObjects(set);
      return array;
    }, []));
    allUsers.pushObjects(users);

    return allUsers.uniq();
  }),

  /**
   * A list of users that are assigned to this group, excluding those that are ALSO assigned to any of this group's sub-groups.
   * @property usersOnlyAtThisLevel
   * @type {Ember.computed}
   * @public
   */
  usersOnlyAtThisLevel: computed('users.[]', 'allDescendants.[]', async function(){
    const users = await this.get('users');
    const descendants = await this.get('allDescendants');
    const membersAtThisLevel = await map(users, async user => {
      const userGroups = await user.get('learnerGroups');
      const subGroups = userGroups.toArray().filter(group => descendants.includes(group));
      return isEmpty(subGroups) ? user : null;
    });

    return membersAtThisLevel.filter(user => !isNone(user));
  }),

  allParentsTitle: computed('allParentTitles', async function(){
    let title = '';
    const allParentTitles = await this.get('allParentTitles');
    allParentTitles.forEach(str => {
      title += str + ' > ';
    });
    return title;
  }),

  allParentTitles: computed('isTopLevelGroup', 'parent.{title,allParentTitles}', async function(){
    const titles = [];
    if(!this.get('isTopLevelGroup')){
      const parent = await this.get('patent');
      const allParentTitles = await parent.get('allParentTitles');
      if(!isEmpty(allParentTitles)){
        titles.pushObjects(allParentTitles);
      }
      titles.pushObject(parent.get('title'));
    }
    return titles;
  }),

  sortTitle: computed('title', 'allParentsTitle', function(){
    var title = this.get('allParentsTitle') + this.get('title');
    return title.replace(/([\s->]+)/ig,"");
  }),

  /**
   * A list of all nested sub-groups of this group.
   * @property allDescendants
   * @type {Ember.computed}
   * @public
   */
  allDescendants: computed('children.@each.allDescendants', async function(){
    const descendants = [];
    const children = await this.get('children');
    descendants.pushObjects(children.toArray());
    const childrenDescendants = await map(children.mapBy('allDescendants'), childDescendants => {
      return childDescendants;
    });
    descendants.pushObjects(childrenDescendants.reduce((array, set) => {
      array.pushObjects(set);
      return array;
    }, []));
    return descendants;
  }),


  /**
   * A text string comprised of all learner-group titles in this group's tree.
   * This includes that titles of all of its ancestors, all its descendants and this group's title itself.
   * @property filterTitle
   * @type {Ember.computed}
   * @public
   */
  filterTitle: computed('allDescendants.@each.title', 'allParents.@each.title', 'title', async function(){
    const allDescendants = await this.get('allDescendants');
    const allParents = await this.get('allParents');
    const titles = all([
      map(allDescendants, learnerGroup => learnerGroup.get('title')),
      map(allParents, learnerGroup => learnerGroup.get('title'))
    ]);
    const flat = titles.reduce((flattened, arr) => {
      return flattened.pushObjects(arr);
    }, []);
    flat.pushObject(this.get('title'));
    return flat.join('');
  }),

  allParents: computed('parent', 'parent.allParents.[]', async function(){
    const parent = await this.get('parent');
    if (!parent) {
      return [];
    }
    const allParents = await parent.get('allParents');

    return [parent].concat(allParents);
  }),

  /**
   * The top-level group in this group's parentage tree, or this group itself if it has no parent.
   * @property topLevelGroup
   * @type {Ember.computed}
   * @public
   */
  topLevelGroup: computed('parent.topLevelGroup', async function(){
    const parent = await this.get('parent');
    if (isEmpty(parent)) {
      return this;
    }
    return await parent.get('topLevelGroup');
  }),

  isTopLevelGroup: computed('parent', function(){
    return isEmpty(this.belongsTo('parent').id());
  }),

  allInstructors: computed('instructors.[]', 'instructorGroups.@each.users', async function(){
    const allInstructors = [];
    const instructors = await this.get('instructors');
    allInstructors.pushObjects(instructors.toArray());
    const instructorGroups = await this.get('instructorGroups');
    const listsOfGroupInstructors = await all(instructorGroups.mapBy('users'));
    listsOfGroupInstructors.forEach(groupInstructors => {
      allInstructors.pushObjects(groupInstructors.toArray());
    });
    return users;
  }),

  school: computed('cohort.programYear.program.school', async function(){
    const cohort = await this.get('cohort');
    const programYear = await cohort.get('programYear');
    const program = await programYear.get('program');
    return await program.get('school');
  }),

  /**
   * Checks if this group or any of its subgroups has any learners.
   * @property hasLearnersInGroupOrSubgroups
   * @type {Ember.computed}
   * @public
   */
  hasLearnersInGroupOrSubgroups: computed('users.[]', 'children.@each.hasLearnersInGroupOrSubgroup', async function() {
    const userIds = this.hasMany('users').ids();
    if (userIds.length) {
      return true;
    }

    const children = await this.get('children');
    if(! children.get('length')) {
      return false;
    }

    const hasLearnersInSubgroups = await all(children.map('hasLearnersInGroupOrSubgroups'));
    return hasLearnersInSubgroups.reduce((acc, val) => {
      return (acc || val);
    }, false);
  }),

  async destroyChildren() {
    const children = await this.get('children');
    return await all(children.toArray().forEach(async child => {
      await child.destroyChildren();
      child.destroyRecord();
    }));
  },

  /**
   * Takes a user out of  a group and then traverses child groups recursively
   * to remove the user from them as well.  Will only modify groups where the
   * user currently exists.
   * @param {Object} user The user model.
   * @return {Array} The modified learner groups.
   */
  async removeUserFromGroupAndAllDescendants(user){
    const modifiedGroups = [];
    const userId = user.get('id');
    if (this.hasMany('users').ids().includes(userId)) {
      this.get('users').removeObject(user);
      modifiedGroups.pushObject(this);
    }

    const children = await this.get('children');
    const groups = await map(children.toArray(), async group => {
      return group.removeUserFromGroupAndAllDescendants(user);
    });
    const flat = groups.reduce((flattened, arr) => {
      return flattened.pushObjects(arr);
    }, []);

    modifiedGroups.pushObjects(flat);
    return modifiedGroups.uniq();
  },

  /**
   * Adds a user to a group and then traverses parent groups recursively
   * to add the user to them as well.  Will only modify groups where the
   * user currently does not exist.
   * @param {Object} user The user model.
   * @return {Array} The modified learner groups.
   */
  async addUserToGroupAndAllParents(user){
    const modifiedGroups = [];
    const userId = user.get('id');
    if (!this.hasMany('users').ids().includes(userId)) {
      this.get('users').pushObject(user);
      modifiedGroups.pushObject(this);
    }
    const parentGroup = await this.get('parent');
    if (! isEmpty(parentGroup)) {
      const parentGroups = await parentGroup.addUserToGroupAndAllParents(user);
      modifiedGroups.pushObjects(parentGroups);
    }
    return modifiedGroups.uniq();
  },
});
