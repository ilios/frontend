import Ember from 'ember';

export default Ember.Component.extend({
  cohorts: [],
  programs: [],
  isAvailalbeCohortsShowing: false,
  filteredPrograms: function(){
    var self = this;
    var programProxy = Ember.ObjectProxy.extend({
      hasAvailableCohorts: Ember.computed.notEmpty('availableCohorts'),
      availableCohorts: function(){
        return this.get('cohorts').filter(function(cohort){
          return (
            cohort != null &&
            !self.get('cohorts').contains(cohort)
          );
        }).sortBy('displayTitle');
      }.property('cohorts.@each')
    });
    var programs = this.get('programs').map(function(program){
      var proxy = programProxy.create({
        content: program,
      });
      return proxy;
    }).sortBy('title');

    return programs;

  }.property('cohorts.@each', 'programs.@each'),
  actions: {
    showAvailableCohorts: function(){
      this.set('isAvailalbeCohortsShowing', true);
    },
    add: function(cohort){
      this.sendAction('add', cohort);
      this.set('isAvailalbeCohortsShowing', false);
    }
  }
});
