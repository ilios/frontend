import Ember from 'ember';
import DS from 'ember-data';

export default Ember.Component.extend({
  objective: null,
  programYear: Ember.computed.oneWay('objective.programYear'),
  showCompetencyList: Ember.computed.notEmpty('programYear.competencies'),
  classNames: ['objective-manage-competency'],
  filteredCompetencies: function(){
    if(!this.get('programYear')){
      return [];
    }
    var defer = Ember.RSVP.defer();
    this.get('programYear.competencies').then(
      availableCompetencies => {
        var promise = this.get('objective.competency');
        if(!promise){
          defer.resolve(availableCompetencies);
        } else {
          promise.then(
            currentCompetency => {
              if(!currentCompetency){
                defer.resolve(availableCompetencies);
              } else {
                var filtered = availableCompetencies.filter(
                  competency => currentCompetency.get('id') !== competency.get('id')
                );
                defer.resolve(filtered);
              }
            }
          );
        }
      }
    );

    return DS.PromiseArray.create({
      promise: defer.promise
    });
  }.property('programYear.competencies.@each', 'objective.competency'),
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
  actions: {
    changeCompetency: function(competency){
      this.get('objective').set('competency', competency);
    },
    removeCurrentCompetency: function(){
      this.get('objective').set('competency', null);
    }
  }
});
