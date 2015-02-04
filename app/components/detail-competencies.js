import Ember from 'ember';

export default Ember.Component.extend({
  competencies: [],
  domains: function(){
    var domainContainer = {};
    var domainIds = [];
    this.get('competencies').forEach(function(competency){
      var domain = competency.get('domain');
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
    });


    var domains = domainIds.map(function(id){
      return domainContainer[id];
    });

    return domains.sortBy('title');
  }.property('competencies.@each.domain')
});
