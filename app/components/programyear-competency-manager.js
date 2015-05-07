import Ember from 'ember';
import DS from 'ember-data';

export default Ember.Component.extend({
  filter: '',
  availableCompetencies: [],
  selectedCompetencies: [],
  tagName: 'section',
  classNames: ['detail-block'],
  filteredCompetencies: function(){
    return this.get('availableCompetencies').filter(
      competency => {
        return !this.get('selectedCompetencies').contains(competency);
      }
    );
  }.property('availableCompetencies.@each', 'selectedCompetencies.@each'),
  filteredDomains: function(){
    var defer = Ember.RSVP.defer();
    var domainContainer = {};
    var domainIds = [];
    var promises = [];
    this.get('filteredCompetencies').forEach(function(competency){
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
      }).filter(
        domain => domain.get('subCompetencies').length > 0
      ).sortBy('title');
      defer.resolve(domains);
    });

    return DS.PromiseArray.create({
      promise: defer.promise
    });
  }.property('filteredCompetencies.@each.domain'),
  selectedDomains: function(){
    var defer = Ember.RSVP.defer();
    var domainContainer = {};
    var domainIds = [];
    var promises = [];
    this.get('selectedCompetencies').forEach(function(competency){
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
  }.property('selectedCompetencies.@each.domain'),
  actions: {
    removeCompetency: function(competency){
      this.sendAction('remove', competency);
    },
    removeDomain: function(proxy){
      this.sendAction('remove', proxy.get('content'));
    },
    addCompetency: function(competency){
      this.sendAction('add', competency);
    },
    addDomain: function(proxy){
      this.sendAction('add', proxy.get('content'));
    }
  }
});
