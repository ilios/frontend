/* global moment */
import Ember from 'ember';
import DS from 'ember-data';

export default DS.Model.extend({
  title: DS.attr('string'),
  programYear: DS.belongsTo('program-year', {async: true}),
  courses: DS.hasMany('course', {async: true}),
  learnerGroups: DS.hasMany('learner-group', {async: true}),
  displayTitle: '',
  competencies: function(){
    var self = this;
    return new Ember.RSVP.Promise(function(resolve) {
      self.get('programYear').then(function(programYear){
        if(programYear){
          programYear.get('competencies').then(function(competencies){
            resolve(competencies);
          });
        }
      });
    });
  }.property('programYear.competencies.@each'),
  objectives: function(){
    var self = this;
    return new Ember.RSVP.Promise(function(resolve) {
      self.get('programYear').then(function(programYear){
        if(programYear){
          programYear.get('objectives').then(function(objectives){
            resolve(objectives);
          });
        }
      });
    });
  }.property('programYear.objectives.@each'),
  topLevelLearnerGroups: function(){
    return this.get('learnerGroups').then(function(groups){
      var parentHash = {};
      var groupHash = {};
      groups.forEach(function(group){
        groupHash[group.get('id')] = group;
        parentHash[group.get('id')] = group.get('parent');
      });
      return Ember.RSVP.hash(parentHash).then(function(hash){
        var topLevelGroups = Ember.A();
        for (var key in hash) {
          var parent = hash[key];
          if(parent == null){
            topLevelGroups.pushObject(groupHash[key]);
          }
        }
        return topLevelGroups;
      });
    });
  }.property('learnerGroups.@each'),
  displayTitleObserver: function(){
    var self = this;
    if(this.get('title.length') > 0){
      this.set('displayTitle', this.get('title'));
    } else {
      this.get('programYear').then(function(programYear){
        //I dont' know why this is necessary, but sometimes tests fail if we assume that programYear is set here
        var classOfYear = programYear?programYear.get('classOfYear'):null;
        var title = Ember.I18n.t('general.classOf', {year: classOfYear});
        self.set('displayTitle', title);
      });
    }
  }.observes('title', 'programYear.classOfYear'),
  currentLevel: function(){
    var startYear = this.get('programYear.startYear');
    if(startYear){
      return Math.abs(moment().year(startYear).diff(moment(), 'years'));
    }
    return '';
  }.property('programYear.startYear')
});
