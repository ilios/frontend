/* global moment */

import Ember from 'ember';
import DS from 'ember-data';

export default Ember.Component.extend({
  offering: null,
  isEditing: false,
  editable: true,
  sortBy: ['lastName', 'firstName'],
  sortedInstructors: Ember.computed.sort('instructors', 'sortBy'),
  startDay: null,
  endDay: null,
  startTime: null,
  endTime: null,
  room: null,
  isMultiDay: false,
  instructors: [],
  instructorGroups: [],
  learnerGroups: [],
  cohorts: Ember.computed.alias('offering.session.course.cohorts'),
  availableInstructorGroups: Ember.computed.alias('offering.session.course.owningSchool.instructorGroups'),
  setup: function(){
    var self = this;
    var offering = this.get('offering');
    if(offering){
      if(!this.get('isDestroyed')){
        this.set('startDay', moment(offering.get('startDate')).format('YYYY-MM-DD'));
        this.set('startTime', moment(offering.get('startDate')).format('HH:mm'));
        this.set('endDay', moment(offering.get('startDate')).format('YYYY-MM-DD'));
        this.set('endTime', moment(offering.get('endDate')).format('HH:mm'));
        this.set('room', offering.get('room'));
        this.set('isMultiDay', offering.get('isMultiDay'));
        offering.get('instructors').then(function(instructors){
          if(!self.get('isDestroyed')){
            self.set('instructors', instructors.toArray());
          }
        });
        offering.get('instructorGroups').then(function(instructorGroups){
          if(!self.get('isDestroyed')){
            self.set('instructorGroups', instructorGroups.toArray());
          }
        });
        offering.get('learnerGroups').then(function(learnerGroups){
          if(!self.get('isDestroyed')){
            self.set('learnerGroups', learnerGroups.toArray());
          }
        });
      }
    }
  }.on('init'),
  allInstructors: function(){
    var self = this;
    var defer = Ember.RSVP.defer();
    var instructorGroups = this.get('instructorGroups');
    var promises = instructorGroups.getEach('users');
    promises.pushObject(self.get('instructors'));
    Ember.RSVP.all(promises).then(function(trees){
      var instructors = trees.reduce(function(array, set){
          return array.pushObjects(set.toArray());
      }, []);
      instructors = instructors.uniq().sortBy('lastName', 'firstName');
      defer.resolve(instructors);
    });
    return DS.PromiseArray.create({
      promise: defer.promise
    });
  }.property('instructors.@each', 'instructorGroups.@each.users.@each'),
  actions: {
    save: function() {
      var self = this;
      var offering = this.get('offering');
      var promises = [];
      promises.pushObject(offering.get('instructors').then(function(currentOfferings){
        var newItems = self.get('instructors');
        currentOfferings.filter(function(item){
          return newItems.contains(item);
        }).invoke(function(item){
          promises.pushObject(item.get('offerings').then(function(offerings){
            offerings.removeObject(offering);
          }));
        });
        currentOfferings.clear();
        currentOfferings.addObjects(newItems);
        newItems.invoke(function(item){
          promises.pushObject(item.get('offerings').then(function(offerings){
            offerings.addObject(offering);
          }));
        });
      }));
      promises.pushObject(offering.get('instructorGroups').then(function(currentOfferings){
        var newItems = self.get('instructorGroups');
        currentOfferings.filter(function(item){
          return newItems.contains(item);
        }).invoke(function(item){
          promises.pushObject(item.get('offerings').then(function(offerings){
            offerings.removeObject(offering);
          }));
        });
        currentOfferings.clear();
        currentOfferings.addObjects(newItems);
        newItems.invoke(function(item){
          promises.pushObject(item.get('offerings').then(function(offerings){
            offerings.addObject(offering);
          }));
        });
      }));
      promises.pushObject(offering.get('learnerGroups').then(function(currentOfferings){
        var newItems = self.get('learnerGroups');
        currentOfferings.filter(function(item){
          return newItems.contains(item);
        }).invoke(function(item){
          promises.pushObject(item.get('offerings').then(function(offerings){
            offerings.removeObject(offering);
          }));
        });
        currentOfferings.clear();
        currentOfferings.addObjects(newItems);
        newItems.invoke(function(item){
          promises.pushObject(item.get('offerings').then(function(offerings){
            offerings.addObject(offering);
          }));
        });
      }));
      var startDate = moment(this.get('startDay') + this.get('startTime'), 'YYYY-MM-DDHH:mm');
      var endDate;
      if(this.get('isMultiDay')){
        endDate = moment(this.get('endDay') + this.get('endTime'), 'YYYY-MM-DDHH:mm');
      } else {
        endDate = moment(this.get('startDay') + this.get('endTime'), 'YYYY-MM-DDHH:mm');
      }
      offering.set('room', this.get('room'));
      offering.set('startDate', startDate.toDate());
      offering.set('endDate', endDate.toDate());
      promises.addObject(offering.save());
      Ember.RSVP.all(promises).then(function(){
        self.sendAction('save', offering);
        self.set('isEditing', false);
      });
    },
    edit: function(){
      this.set('isEditing', true);
    },
    cancel: function(){
      this.setup();
      this.set('isEditing', false);
    },
    addInstructor: function(user){
      this.get('instructors').addObject(user);
    },
    removeInstructor: function(user){
      this.get('instructors').removeObject(user);
    },
    toggleMultiDay: function(){
      this.set('isMultiDay', !this.get('isMultiDay'));
    },
  }
});
