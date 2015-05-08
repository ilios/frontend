import DS from 'ember-data';
import Ember from 'ember';

export default DS.Model.extend({
  title: DS.attr('string'),
  location: DS.attr('string'),
  cohort: DS.belongsTo('cohort', {async: true}),
  ilmSessions: DS.hasMany('ilm-session', {async: true}),
  instructorUsers: DS.hasMany('user', {
      async: true,
      inverse: 'instructorUserGroups'
    }
  ),
  parent: DS.belongsTo('learner-group', {async: true, inverse: 'children'}),
  children: DS.hasMany('learner-group', {async: true, inverse: 'parent'}),
  users: DS.hasMany('user', {
      async: true,
      inverse: 'learnerGroups'
    }
  ),
  instructorGroups: DS.hasMany('instructor-group', {async: true}),
  offerings: DS.hasMany('offering', {async: true}),
  courses: function(){
    var defer = Ember.RSVP.defer();
    var group = this;
    group.get('offerings').then(function(offerings){
      var promises = offerings.map(function(offering){
        return offering.get('session').then(function(session){
          return session.get('course');
        });
      });
      Ember.RSVP.hash(promises).then(function(hash){
        var courses = Ember.A();
        Object.keys(hash).forEach(function(key) {
          var course = hash[key];
          if(!courses.contains(course)){
            courses.pushObject(course);
          }
        });
        defer.resolve(courses);
      });
    });
    return DS.PromiseArray.create({
      promise: defer.promise
    });
  }.property('offerings.@each'),
  childUsers: Ember.computed.mapBy('children', 'users'),
  childUserLengths: Ember.computed.mapBy('childUsers', 'length'),
  childUsersTotal: Ember.computed.sum('childUserLengths'),
  childrenUsersCounts: Ember.computed.mapBy('children', 'childUsersTotal'),
  childrenUsersTotal: Ember.computed.sum('childrenUsersCounts'),
  usersCount: function(){
    return this.get('users.length') + this.get('childUsersTotal') + this.get('childrenUsersTotal');
  }.property('users.length', 'childUsersTotal', 'childrenUsersTotal'),
  availableUsers: function(){
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
                return !selectedUsers.contains(user);
              });
              resolve(availableUsers);
            });
          });
        }
      });
    });
  }.property('users', 'parent.users.@each', 'parent.childUsers.@each'),
  allDescendantUsers: function(){
    var deferred = Ember.RSVP.defer();
    this.get('users').then(users => {
      this.get('children').then(children => {
        Ember.RSVP.map(children.mapBy('allDescendantUsers'), childUsers => {
          users.addObjects(childUsers);
        }).then(() => {
          deferred.resolve(users.uniq());
        });
      });
    });

    return DS.PromiseArray.create({
      promise: deferred.promise
    });
  }.property('users.@each', 'children.@each.users.@each'),
  usersOnlyAtThisLevel: function(){
    var deferred = Ember.RSVP.defer();
    this.get('users').then(users => {
      this.get('allDescendants').then(descendants => {
        var membersAtThisLevel = [];
        var promises = [];
        users.forEach(user => {
          let promise = user.get('learnerGroups').then(userGroups => {
            var subGroups = userGroups.filter(group => descendants.contains(group));
            if(subGroups.length === 0){
              membersAtThisLevel.pushObject(user);
            }
          });
          promises.pushObject(promise);
        });
        Ember.RSVP.all(promises).then(() => {
          deferred.resolve(membersAtThisLevel.sortBy('fullName'));
        });

      });

    });
    return DS.PromiseArray.create({
      promise: deferred.promise
    });
  }.property('users.@each', 'allDescendants.@each'),
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
  allParentsTitle: function(){
    var title = '';
    if(this.get('parent.content')){
      if(this.get('parent.allParentsTitle')){
        title += this.get('parent.allParentsTitle');
      }
      title += this.get('parent.title') + ' -> ';
    }

    return title;
  }.property('parent.{title,allParentsTitle}'),
  sortTitle: function(){
    var title = this.get('allParentsTitle') + this.get('title');
    return title.replace(/([\s->]+)/ig,"");
  }.property('title', 'allParentsTitle'),
  allDescendants: function(){
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
  }.property('children.@each.allDescendants.@each'),
  allParents: function(){
    var deferred = Ember.RSVP.defer();
    this.get('parent').then(parent => {
      var parents = [];
      if(!parent){
        deferred.resolve(parents);
      } else {
        parents.pushObject(parent);
        parent.get('allParents').then(allParents => {
          parents.pushObjects(allParents);
          deferred.resolve(parents);
        });
      }

    });
    return DS.PromiseArray.create({
      promise: deferred.promise
    });
  }.property('parent', 'parent.allParents.@each'),
  topLevelGroup: function(){
    let promise = new Ember.RSVP.Promise(
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
    return DS.PromiseObject.create({
      promise: promise
    });
  }.property('parent', 'parent.topLevelGroup'),
});
