import DS from 'ember-data';
import Ember from 'ember';

export default DS.Model.extend({
  title: DS.attr('string'),
  location: DS.attr('string'),
  instructors: DS.attr('string'),
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
    var group = this;
    return new Ember.RSVP.Promise(function(resolve) {
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
          resolve(courses);
        });
      });
    });
  }.property('offerings.@each'),
  childUsers: Ember.computed.mapBy('children', 'users'),
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
});
