import DS from 'ember-data';
import Ember from 'ember';

export default DS.Model.extend({
  title: DS.attr('string'),
  competency: DS.belongsTo('competency', {async: true}),
  courses: DS.hasMany('course', {async: true}),
  sessions: DS.hasMany('session', {async: true}),
  children: DS.hasMany('objective', {
    inverse: 'parents',
    async: true
  }),
  parents: DS.hasMany('objective', {
    inverse: 'children',
    async: true
  }),
  programYears: DS.hasMany('program-year',  {async: true}),
  meshDescriptors: DS.hasMany('mesh-descriptor', {async: true}),
  treeCompetencies: function(){
    var objective = this;
    return new Ember.RSVP.Promise(function(resolve) {
      objective.get('competency').then(function(currentCompetency){
        var competencies = Ember.A();
        if(currentCompetency){
          competencies.pushObject(currentCompetency);
        }

        objective.get('parents').then(function(parents){
          var promises = [];
          parents.forEach(function(parent){
            promises.pushObject(parent.get('treeCompetencies'));
          });
          Ember.RSVP.hash(promises).then(function(hash){
            Object.keys(hash).forEach(function(key) {
              if(hash[key]){
                hash[key].forEach(function(competency){
                  if(competency){
                    competencies.pushObject(competency);
                  }
                });
              }
            });

            resolve(competencies);
          });
        });
      });
    });
  }.property('competency', 'parents.@each.treeCompetencies.@each'),
  shortTitle: function(){
    var title = this.get('title');
    if(title === undefined){
      return '';
    }
    return title.substr(0,200);
  }.property('title'),
  textTitle: function(){
    return this.get('title').replace(/(<([^>]+)>)/ig,"");
  }.property('title')
});
