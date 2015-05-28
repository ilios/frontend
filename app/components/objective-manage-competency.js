import Ember from 'ember';
import DS from 'ember-data';

export default Ember.Component.extend({
  objective: null,
  programYear: Ember.computed.oneWay('objective.programYear'),
  showCompetencyList: Ember.computed.notEmpty('programYear.competencies'),
  classNames: ['objective-manager', 'objective-manage-competency'],
  competencies: function(){
    if(!this.get('programYear')){
      return [];
    }

    return DS.PromiseArray.create({
      promise: this.get('programYear.competencies')
    });
  }.property('programYear.competencies.@each', 'objective.competency'),
  domains: function(){
    var defer = Ember.RSVP.defer();
    var domainContainer = {};
    var domainIds = [];
    var promises = [];
    let competencyProxy = Ember.ObjectProxy.extend({
      selectedCompetency: null,
      selected: Ember.computed('content', 'selectedCompetency', function(){
        return this.get('content.id') === this.get('selectedCompetency.id');
      }),
    });
    this.get('competencies').forEach((competency) =>{
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
              subCompetencies.pushObject(competencyProxy.create({
                content: competency,
                selectedCompetency: this.get('objective.competency')
              }));
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
  }.property('competencies.@each.domain', 'objective.competency'),
  actions: {
    changeCompetency: function(competency){
      this.get('objective').set('competency', competency);
    },
    removeCurrentCompetency: function(){
      this.get('objective').set('competency', null);
    }
  }
});
