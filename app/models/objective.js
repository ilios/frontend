import DS from 'ember-data';
import Ember from 'ember';

export default DS.Model.extend({
  title: DS.attr('string'),
  competency: DS.belongsTo('competency', {async: true}),
  courses: DS.hasMany('course', {async: true}),
  //While it is possible at some point that objectives will be allowed to
  //link to multiple courses, for now we just reflect a many to one relationship
  course: Ember.computed.alias('courses.firstObject'),
  sessions: DS.hasMany('session', {async: true}),
  //While it is possible at some point that objectives will be allowed to
  //link to multiple sessions, for now we just reflect a many to one relationship
  session: Ember.computed.alias('sessions.firstObject'),
  children: DS.hasMany('objective', {
    inverse: 'parents',
    async: true
  }),
  parents: DS.hasMany('objective', {
    inverse: 'children',
    async: true
  }),
  multipleParents: Ember.computed.gt('parents.length', 1),
  programYears: DS.hasMany('program-year',  {async: true}),
  meshDescriptors: DS.hasMany('mesh-descriptor', {async: true}),
  treeCompetencies: function(){
    var defer = Ember.RSVP.defer();
    var self = this;
    this.get('competency').then(function(competency){
      self.get('parents').then(function(parents){
        var promises = parents.getEach('treeCompetencies');
        Ember.RSVP.all(promises).then(function(trees){
          var competencies = trees.reduce(function(array, set){
              return array.pushObjects(set.toArray());
          }, []);
          competencies.pushObject(competency);
          competencies = competencies.uniq().filter(function(item){
            return item != null;
          });
          defer.resolve(competencies);
        });
      });
    });
    return DS.PromiseArray.create({
      promise: defer.promise
    });
  }.property('competency', 'parents.@each.treeCompetencies'),
  shortTitle: function(){
    var title = this.get('title');
    if(title === undefined){
      return '';
    }
    return title.substr(0,200);
  }.property('title'),
  textTitle: function(){
    var title = this.get('title');
    if(title === undefined){
      return '';
    }
    return title.replace(/(<([^>]+)>)/ig,"");
  }.property('title')
});
