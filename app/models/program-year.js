import Ember from 'ember';
import DS from 'ember-data';

export default DS.Model.extend({
  startYear: DS.attr('string'),
  deleted: DS.attr('boolean'),
  locked: DS.attr('boolean'),
  archived: DS.attr('boolean'),
  publishedAsTbd: DS.attr('boolean'),
  program: DS.belongsTo('program', {async: true}),
  directors: DS.hasMany('user', {async: true}),
  competencies: DS.hasMany('competency', {async: true}),
  disciplines: DS.hasMany('discipline', {async: true}),
  objectives: DS.hasMany('objective', {async: true}),
  stewardingSchools: DS.hasMany('school', {async: true}),
  cohort: DS.belongsTo('cohort', {async: true}),
  publishEvent: DS.belongsTo('publish-event', {async: true}),
  academicYear: function(){
    return this.get('startYear') + ' - ' + (parseInt(this.get('startYear'))+1);
  }.property('startYear'),
  classOfYear: function(){
    return (parseInt(this.get('startYear'))+parseInt(this.get('program.duration')));
  }.property('startYear', 'program.duration'),
  isPublished: Ember.computed.notEmpty('publishEvent.content'),
  isNotPublished: Ember.computed.not('isPublished'),
  isScheduled: Ember.computed.oneWay('publishedAsTbd'),
  status: function(){
    if(this.get('publishedAsTbd')){
      return Ember.I18n.t('general.scheduled');
    }
    if(this.get('isPublished')){
      return Ember.I18n.t('general.published');
    }
    return Ember.I18n.t('general.notPublished');
  }.property('isPublished', 'publishedAsTbd'),
  allPublicationIssuesCollection: Ember.computed.collect('requiredPublicationIssues.length', 'optionalPublicationIssues.length'),
  allPublicationIssuesLength: Ember.computed.sum('allPublicationIssuesCollection'),
  requiredPublicationIssues: function(){
    var self = this;
    var issues = [];
    var requiredSet = [
      'startYear',
      'cohort',
      'program'
    ];
    requiredSet.forEach(function(val){
      if(!self.get(val)){
        issues.push(val);
      }
    });

    return issues;
  }.property(
    'startYear',
    'cohort',
    'program'
  ),
  optionalPublicationIssues: function(){
    var self = this;
    var issues = [];
    var requiredLength = [
      'directors',
      'competencies',
      'disciplines',
      'objectives'
    ];

    requiredLength.forEach(function(val){
      if(self.get(val + '.length') === 0){
        issues.push(val);
      }
    });

    return issues;
  }.property(
    'directors.length',
    'competencies.length',
    'disciplines.length',
    'objectives.length'
  ),
  domains: function(){
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
  }.property('competencies.@each.domain'),
});
