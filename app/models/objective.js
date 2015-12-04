import DS from 'ember-data';
import Ember from 'ember';

const { computed, RSVP, isEmpty } =  Ember;
const { alias, gt, gte } = computed;

export default DS.Model.extend({
  title: DS.attr('string'),
  competency: DS.belongsTo('competency', {async: true}),
  courses: DS.hasMany('course', {async: true}),
  //While it is possible at some point that objectives will be allowed to
  //link to multiple courses, for now we just reflect a many to one relationship
  course: alias('courses.firstObject'),
  programYears: DS.hasMany('program-year',  {async: true}),
  //While it is possible at some point that objectives will be allowed to
  //link to multiple program years, for now we just reflect a many to one relationship
  programYear: alias('programYears.firstObject'),
  sessions: DS.hasMany('session', {async: true}),
  //While it is possible at some point that objectives will be allowed to
  //link to multiple sessions, for now we just reflect a many to one relationship
  session: alias('sessions.firstObject'),
  parents: DS.hasMany('objective', {
    inverse: 'children',
    async: true
  }),
  children: DS.hasMany('objective', {
    inverse: 'parents',
    async: true
  }),
  meshDescriptors: DS.hasMany('mesh-descriptor', {async: true}),
  hasMultipleParents: gt('parents.length', 1),
  hasParents: gte('parents.length', 1),
  treeCompetencies: computed('competency', 'parents.@each.treeCompetencies.[]', function(){
    var defer = RSVP.defer();
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
  }),
  topParents: computed('parents.[]', function(){
    var defer = RSVP.defer();
    this.get('parents').then(parents => {
      if(isEmpty(parents)){
        defer.resolve([this]);
      }
      let allTopParents = [];
      let promises = [];
      parents.forEach( objective => {
        promises.pushObject(objective.get('topParents').then(topParents => {
          allTopParents.pushObjects(topParents.toArray());
        }));
      });

      RSVP.all(promises).then(()=>{
        defer.resolve(allTopParents);
      });
    });
    return DS.PromiseArray.create({
      promise: defer.promise
    });
  }),
  shortTitle: computed('title', function(){
    var title = this.get('title');
    if(title === undefined){
      return '';
    }
    return title.substr(0,200);
  }),
  textTitle: computed('title', function(){
    var title = this.get('title');
    if(title === undefined){
      return '';
    }
    return title.replace(/(<([^>]+)>)/ig,"");
  }),
  //Remove any parents with a relationship to the cohort
  removeParentWithProgramYears(programYearsToRemove){
    return new RSVP.Promise(resolve => {
      this.get('parents').then(parents => {
        let promises = [];
        parents.forEach(parent => {
          promises.pushObject(parent.get('programYears').then(programYears => {
            let programYear = programYears.get('firstObject');
            if(programYearsToRemove.contains(programYear)){
              parents.removeObject(parent);
              parent.get('children').removeObject(this);
            }
          }));
        });
        RSVP.all(promises).then(() => {
          this.save().then(() => {
            resolve();
          });
        });
      });
    });
  }
});
