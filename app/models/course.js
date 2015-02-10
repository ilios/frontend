import DS from 'ember-data';
import Ember from 'ember';

var Course = DS.Model.extend({
    title: DS.attr('string'),
    startDate: DS.attr('date'),
    endDate: DS.attr('date'),
    level: DS.attr('number'),
    year: DS.attr('number'),
    externalId: DS.attr('string'),
    deleted: DS.attr('boolean'),
    locked: DS.attr('boolean'),
    archived: DS.attr('boolean'),
    publishedAsTbd: DS.attr('boolean'),
    sessions: DS.hasMany('session', {async: true}),
    owningSchool: DS.belongsTo('school', {async: true}),
    isPublished: false,
    isNotPublished: Ember.computed.not('isPublished'),
    status: function(){
      if(this.get('publishEvent') != null){
        return Ember.I18n.t('general.published');
      } else {
        return Ember.I18n.t('general.notPublished');
      }
    }.property('publishEvent'),
    publishEvent: DS.belongsTo('publish-event', {async: true}),
    directors: DS.hasMany('user', {async: true}),
    cohorts: DS.hasMany('cohort', {async: true}),
    disciplines: DS.hasMany('discipline', {async: true}),
    objectives: DS.hasMany('objective', {async: true}),
    meshDescriptors: DS.hasMany('mesh-descriptor', {async: true}),
    learningMaterials: DS.hasMany('course-learning-material', {async: true}),
    academicYear: function(){
      return this.get('year') + ' - ' + (parseInt(this.get('year')) + 1);
    }.property('year'),
    competencies: [],
    watchObjectives: function(){
      var self = this;
      this.get('objectives').then(function(objectives){
        if(objectives.length){
          var promises = {};
          objectives.forEach(function(objective){
            promises[objective.get('id')] = objective.get('treeCompetencies');
          });
          Ember.RSVP.hash(promises).then(function(hash){
            var competencies = Ember.A();
            Object.keys(hash).forEach(function(key) {
              hash[key].forEach(function(competency){
                if(competency){
                  competencies.pushObject(competency);
                }
              });
            });
            self.set('competencies', competencies.uniq());
          });
        }
      });
    }.observes('objectives.@each').on('init'),
});

export default Course;
