import DS from 'ember-data';
import Ember from 'ember';

const { computed, RSVP, isEmpty } =  Ember;
const { alias, gt, gte } = computed;
const { map } = RSVP;
const { Model, attr, belongsTo, hasMany, PromiseArray } = DS;

export default Model.extend({
  title: attr('string'),
  position: attr('number', { defaultValue: 0 }),
  competency: belongsTo('competency', {async: true}),
  courses: hasMany('course', {async: true}),
  //While it is possible at some point that objectives will be allowed to
  //link to multiple courses, for now we just reflect a many to one relationship
  course: alias('courses.firstObject'),
  programYears: hasMany('program-year', {async: true}),
  //While it is possible at some point that objectives will be allowed to
  //link to multiple program years, for now we just reflect a many to one relationship
  programYear: alias('programYears.firstObject'),
  sessions: hasMany('session', {async: true}),
  //While it is possible at some point that objectives will be allowed to
  //link to multiple sessions, for now we just reflect a many to one relationship
  session: alias('sessions.firstObject'),
  parents: hasMany('objective', {
    inverse: 'children',
    async: true
  }),
  children: hasMany('objective', {
    inverse: 'parents',
    async: true
  }),
  meshDescriptors: hasMany('mesh-descriptor', {async: true}),
  ancestor: belongsTo('objective', {
    inverse: 'descendants',
    async: true
  }),
  descendants: hasMany('objective', {
    inverse: 'ancestor',
    async: true
  }),
  hasMultipleParents: gt('parents.length', 1),
  hasParents: gte('parents.length', 1),
  hasMesh: gte('meshDescriptors.length', 1),

  /**
   * All competencies associated with any objectives in the parentage tree, and this objective itself.
   *
   * @property treeCompetencies
   * @type {Ember.computed}
   * @public
   */
  treeCompetencies: computed('competency', 'parents.@each.treeCompetencies', async function() {
    const parents = await this.get('parents');
    const trees = await map(parents.mapBy('treeCompetencies'), treeCompetencies => {
      return treeCompetencies;
    });
    const competencies = trees.reduce((array, set) => {
      array.pushObjects(set);
      return array;
    }, []);

    const competency = await this.get('competency');
    competencies.pushObject(competency);

    return competencies.uniq().filter(item => {
      return !isEmpty(item);
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
    return PromiseArray.create({
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
            if(programYearsToRemove.includes(programYear)){
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
  },
  firstProgram: computed('programYears.[]', async function(){
    const programYears = await this.get('programYears');
    const programYear = programYears.get('firstObject');
    const program = await programYear.get('program');

    return program;
  }),
  firstCohort: computed('programYears.[]', async function(){
    const programYears = await this.get('programYears');
    const programYear = programYears.get('firstObject');
    if (!programYear) {
      return null;
    }

    const cohort = await programYear.get('cohort');

    return cohort;
  }),
});
