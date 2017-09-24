import DS from 'ember-data';
import Ember from 'ember';
import escapeRegExp from '../utils/escape-reg-exp';


const { computed, isEmpty, RSVP } = Ember;
const { mapBy, sum } = computed;
const { Promise, map, all } = RSVP;

export default DS.Model.extend({
  title: DS.attr('string'),
  location: DS.attr('string'),
  cohort: DS.belongsTo('cohort', {async: true}),
  parent: DS.belongsTo('learner-group', {async: true, inverse: 'children'}),
  children: DS.hasMany('learner-group', {async: true, inverse: 'parent'}),
  ilmSessions: DS.hasMany('ilm-session', {async: true}),
  offerings: DS.hasMany('offering', {async: true}),
  instructorGroups: DS.hasMany('instructor-group', {async: true}),
  users: DS.hasMany('user', {
    async: true,
    inverse: 'learnerGroups'
  }),
  instructors: DS.hasMany('user', {
    async: true,
    inverse: 'instructedLearnerGroups'
  }),
  /**
   * A list of all courses associated with this learner group, via offerings/sessions or via ILMs.
   * @property courses
   * @type {Ember.computed}
   * @public
   */
  courses: computed('offerings.[]', 'ilmSessions.[]', function(){
    var defer = Ember.RSVP.defer();
    let promises = [];
    let allCourses = [];
    promises.pushObject(new Ember.RSVP.Promise(resolve => {
      this.get('offerings').then(offerings => {
        if(!offerings.length){
          resolve();
        }
        let promises2 = [];
        offerings.forEach(offering => {
          promises2.pushObject(offering.get('session').then(session =>{
            return session.get('course').then(course => {
              allCourses.pushObject(course);
            });
          }));
        });
        Ember.RSVP.all(promises2).then(()=>{
          resolve();
        });
      });
    }));
    promises.pushObject(new Ember.RSVP.Promise(resolve => {
      this.get('ilmSessions').then(ilmSessions => {
        if(!ilmSessions.length){
          resolve();
        }
        let promises2 = [];
        ilmSessions.forEach(ilmSession => {
          promises2.pushObject(ilmSession.get('session').then(session =>{
            if(!session){
              return;
            }
            return session.get('course').then(course => {
              allCourses.pushObject(course);
            });
          }));
        });
        Ember.RSVP.all(promises2).then(()=>{
          resolve();
        });
      });
    }));

    Ember.RSVP.all(promises).then(()=>{
      defer.resolve(allCourses.uniq());
    });

    return DS.PromiseArray.create({
      promise: defer.promise
    });
  }),
  childUsers: mapBy('children', 'users'),
  childUserLengths: mapBy('childUsers', 'length'),
  childUsersTotal: sum('childUserLengths'),
  childrenUsersCounts: mapBy('children', 'childUsersTotal'),
  childrenUsersTotal: sum('childrenUsersCounts'),
  usersCount: computed('users.length', 'childUsersTotal', 'childrenUsersTotal', function(){
    return this.get('users.length') + this.get('childUsersTotal') + this.get('childrenUsersTotal');
  }),
  availableUsers: computed('users', 'parent.users.[]', 'parent.childUsers.[]', function(){
    var group = this;
    return new Ember.RSVP.Promise(function(resolve) {
      group.get('parent').then(function(parent){
        if(parent == null){
          resolve(false);
        } else {
          parent.get('users').then(function(parentUsers){
            var childUsers = parent.get('childUsers');
            var selectedUsers = Ember.A();
            Ember.RSVP.all(childUsers).then(function(){
              childUsers.forEach(function(userSet){
                userSet.forEach(function(c){
                  selectedUsers.pushObject(c);
                });
              });
              var availableUsers = parentUsers.filter(function(user){
                return !selectedUsers.includes(user);
              });
              resolve(availableUsers);
            });
          });
        }
      });
    });
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
  subgroupNumberingOffset: computed('children.[]', function () {
    const regex = new RegExp('^' + escapeRegExp(this.get('title')) + ' ([0-9]+)$');
    let deferred = Ember.RSVP.defer();
    this.get('children').then(groups => {
      let offset = groups.reduce((previousValue, item) => {
        let rhett = previousValue;
        let matches = regex.exec(item.get('title'));
        if (! isEmpty(matches)) {
          rhett = Math.max(rhett, parseInt(matches[1], 10));
        }
        return rhett;
      }, 0);
      deferred.resolve(++offset);
    });
    return DS.PromiseObject.create({
      promise: deferred.promise
    });
  }),

  allDescendantUsers: computed('users.[]', 'children.@each.users', function(){
    var deferred = Ember.RSVP.defer();
    this.get('users').then(users => {
      this.get('children').then(children => {
        map(children.mapBy('allDescendantUsers'), childUsers => {
          users.addObjects(childUsers);
        }).then(() => {
          deferred.resolve(users.uniq());
        });
      });
    });

    return DS.PromiseArray.create({
      promise: deferred.promise
    });
  }),
  usersOnlyAtThisLevel: computed('users.[]', 'allDescendants.[]', function(){
    return new Promise(resolve => {
      this.get('users').then(users => {
        this.get('allDescendants').then(descendants => {
          let membersAtThisLevel = [];
          let promises = [];
          users.forEach(user => {
            let promise = user.get('learnerGroups').then(userGroups => {
              var subGroups = userGroups.filter(group => descendants.includes(group));
              if(subGroups.length === 0){
                membersAtThisLevel.pushObject(user);
              }
            });
            promises.pushObject(promise);
          });
          Ember.RSVP.all(promises).then(() => {
            resolve(membersAtThisLevel);
          });
        });
      });
    });
  }),
  destroyChildren: function(){
    var group = this;
    return new Ember.RSVP.Promise(function(resolve) {
      var promises = [];
      group.get('children').then(function(children){
        children.forEach(function(child){
          promises.push(child.destroyChildren().then(function(){
            child.destroyRecord();
          }));
        });
        resolve(Ember.RSVP.all(promises));
      });
    });
  },
  allParentsTitle: computed('allParentTitles', function(){
    let title = '';
    this.get('allParentTitles').forEach(str => {
      title += str + ' > ';
    });

    return title;
  }),
  allParentTitles: computed('parent.{title,allParentTitles}', function(){
    let titles = [];
    if(this.get('parent.content')){
      if(this.get('parent.allParentTitles')){
        titles.pushObjects(this.get('parent.allParentTitles'));
      }
      titles.pushObject(this.get('parent.title'));
    }

    return titles;
  }),
  sortTitle: computed('title', 'allParentsTitle', function(){
    var title = this.get('allParentsTitle') + this.get('title');
    return title.replace(/([\s->]+)/ig,"");
  }),
  allDescendants: computed('children.@each.allDescendants', function(){
    var deferred = Ember.RSVP.defer();
    this.get('children').then(function(learnerGroups){
      var groups = [];
      var promises = [];
      learnerGroups.forEach(function(learnerGroup){
        groups.pushObject(learnerGroup);
        var promise = new Ember.RSVP.Promise(function(resolve) {
          learnerGroup.get('allDescendants').then(function(descendants){
            descendants.forEach(function(descendant){
              groups.pushObject(descendant);
            });
            resolve();
          });
        });
        promises.pushObject(promise);
      });
      Ember.RSVP.all(promises).then(function(){
        deferred.resolve(groups);
      });
    });
    return DS.PromiseArray.create({
      promise: deferred.promise
    });
  }),
  filterTitle: computed('allDescendants.[].title', function(){
    return new Promise(resolve => {
      this.get('allDescendants').then(allDescendants => {
        this.get('allParents').then(allParents => {
          all([
            map(allDescendants, learnerGroup => learnerGroup.get('title')),
            map(allParents, learnerGroup => learnerGroup.get('title'))
          ]).then(titles => {
            let flat = titles.reduce((flattened, arr) => {
              return flattened.pushObjects(arr);
            }, []);
            flat.pushObject(this.get('title'));

            resolve(flat.join(''));
          });
        });

      });
    });
  }),
  allParents: computed('parent', 'parent.allParents.[]', async function(){
    const parent = await this.get('parent');
    if (!parent) {
      return [];
    }
    const allParents = await parent.get('allParents');

    return [parent].concat(allParents);
  }),
  topLevelGroup: computed('parent', 'parent.topLevelGroup', function(){
    return new Ember.RSVP.Promise(
      resolve => {
        this.get('parent').then(
          parent => {
            if(!parent){
              resolve(this);
            } else {
              parent.get('topLevelGroup').then(
                topLevelGroup => {
                  resolve(topLevelGroup);
                }
              );
            }
          }
        );
      }
    );
  }),
  isTopLevelGroup: computed('parent', function(){
    return isEmpty(this.belongsTo('parent').id());
  }),
  /**
   * Takes a user out of  a group and then traverses child groups recursivly
   * to remove the user from them as well.  Will only modify groups where the
   * user currently exists.
   * @param User user
   * @return modified LearnerGroup[]
   */
  removeUserFromGroupAndAllDescendants(user){
    let modifiedGroups = [];
    const userId = user.get('id');
    return new Promise(resolve => {
      if (this.hasMany('users').ids().includes(userId)) {
        this.get('users').removeObject(user);
        modifiedGroups.pushObject(this);
      }
      this.get('children').then(children => {
        map(children.toArray(), (group => {
          return group.removeUserFromGroupAndAllDescendants(user);
        })).then(groups => {
          let flat = groups.reduce((flattened, arr) => {
            return flattened.pushObjects(arr);
          }, []);
          modifiedGroups.pushObjects(flat);
          resolve(modifiedGroups.uniq());
        });
      });
    });
  },
  /**
   * Adds a user to a group and then traverses parent groups recursivly
   * to add the user to them as well.  Will only modify groups where the
   * user currently does not exist.
   * @param User user
   * @return modified LearnerGroup[]
   */
  addUserToGroupAndAllParents(user){
    let modifiedGroups = [];
    const userId = user.get('id');
    return new Promise(resolve => {
      if (!this.hasMany('users').ids().includes(userId)) {
        this.get('users').pushObject(user);
        modifiedGroups.pushObject(this);
      }
      this.get('parent').then(parentGroup => {
        if (isEmpty(parentGroup)) {
          resolve(modifiedGroups.uniq());
        } else {
          parentGroup.addUserToGroupAndAllParents(user).then(parentGroups => {
            modifiedGroups.pushObjects(parentGroups);
            resolve(modifiedGroups.uniq());
          });
        }

      });
    });
  },
  allInstructors: computed('instructors.[]', 'instructorGroups.[]', function(){
    return new Promise(resolve => {
      let users = [];
      this.get('instructors').then(instructors => {
        users.pushObjects(instructors.toArray());
        this.get('instructorGroups').then(instructorGroups => {
          RSVP.all(instructorGroups.mapBy('users')).then(arr => {
            arr.forEach(groupInstructors =>{
              users.pushObjects(groupInstructors.toArray());
            });
            resolve(users.uniq());
          });
        });
      });
    });
  }),
  school: computed('cohort.programYear.program.school', function(){
    return new Promise(resolve => {
      this.get('cohort').then(cohort => {
        cohort.get('programYear').then(programYear => {
          programYear.get('program').then(program => {
            program.get('school').then(school => {
              resolve(school);
            });
          });
        });
      });
    });
  }),

  /**
   * Checks if this group or any of its subgroups has any learners.
   * @property hasLearnersInGroupOrSubgroups
   * @type {Ember.computed}
   * @public
   */
  hasLearnersInGroupOrSubgroups: computed('users.[]', 'children.@each.hasLearnersInGroupOrSubgroup', function() {
    return new Promise(resolve => {
      const userIds = this.hasMany('users').ids();
      if (userIds.length) {
        resolve(true);
      }
      this.get('children').then(children => {
        if(! children.get('length')) {
          resolve(false);
          return;
        }

        let promises = children.map(subgroup => {
          return subgroup.get('hasLearnersInGroupOrSubgroups');
        });
        all(promises).then(hasLearnersInSubgroups => {
          resolve(hasLearnersInSubgroups.reduce((acc, val) => {
            return (acc || val);
          }, false));
        });
      });
    });
  }),
});
