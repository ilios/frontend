import Ember from 'ember';
import DS from 'ember-data';
import PublishableModel from 'ilios/mixins/publishable-model';
import CategorizableModel from 'ilios/mixins/categorizable-model';

const { computed } = Ember;

export default DS.Model.extend(PublishableModel, CategorizableModel, {
  startYear: DS.attr('string'),
  locked: DS.attr('boolean'),
  archived: DS.attr('boolean'),
  program: DS.belongsTo('program', {async: true}),
  cohort: DS.belongsTo('cohort', {async: true}),
  directors: DS.hasMany('user', {async: true}),
  competencies: DS.hasMany('competency', {async: true}),
  topics: DS.hasMany('topic', {async: true}),
  objectives: DS.hasMany('objective', {async: true}),
  stewards: DS.hasMany('program-year-steward', {async: true}),
  academicYear: computed('startYear', function(){
    return this.get('startYear') + ' - ' + (parseInt(this.get('startYear'))+1);
  }),
  classOfYear: computed('startYear', 'program.duration', function(){
    return (parseInt(this.get('startYear'))+parseInt(this.get('program.duration')));
  }),
  requiredPublicationIssues: computed('startYear', 'cohort', 'program', function(){
    return this.getRequiredPublicationIssues();
  }),
  optionalPublicationIssues: computed(
    'directors.length',
    'competencies.length',
    'topics.length',
    'objectives.length',
    function(){
      return this.getOptionalPublicationIssues();
    }
  ),
  requiredPublicationSetFields: ['startYear', 'cohort', 'program'],
  optionalPublicationLengthFields: ['directors', 'competencies', 'topics', 'objectives'],
  domains: computed('competencies.@each.domain', function(){
    var defer = Ember.RSVP.defer();
    var domainContainer = {};
    var domainIds = [];
    var promises = [];
    this.get('competencies').forEach(function(competency){
      promises.pushObject(competency.get('domain').then(
        domain => {
          if(!domainContainer.hasOwnProperty(domain.get('id'))){
            domainIds.pushObject(domain.get('id'));
            domainContainer[domain.get('id')] = Ember.ObjectProxy.create({
              content: domain,
              subCompetencies: []
            });
          }
          if(competency.get('id') !== domain.get('id')){
            var subCompetencies = domainContainer[domain.get('id')].get('subCompetencies');
            if(!subCompetencies.contains(competency)){
              subCompetencies.pushObject(competency);
              subCompetencies.sortBy('title');
            }
          }
        }
      ));
    });
    Ember.RSVP.all(promises).then(function(){
      var domains = domainIds.map(function(id){
        return domainContainer[id];
      }).sortBy('title');
      defer.resolve(domains);
    });

    return DS.PromiseArray.create({
      promise: defer.promise
    });
  }),
});
