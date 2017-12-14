import { computed } from '@ember/object';
import RSVP from 'rsvp';
import { isEmpty } from '@ember/utils';
import DS from 'ember-data';
const { alias, gt, gte } = computed;
const { all, map } = RSVP;
const { Model, attr, belongsTo, hasMany } = DS;

export default Model.extend({
  title: attr('string'),
  position: attr('number', { defaultValue: 0 }),
  competency: belongsTo('competency', {async: true}),
  ancestor: belongsTo('objective', {
    inverse: 'descendants',
    async: true
  }),
  courses: hasMany('course', {async: true}),
  programYears: hasMany('program-year', {async: true}),
  sessions: hasMany('session', {async: true}),
  parents: hasMany('objective', {
    inverse: 'children',
    async: true
  }),
  children: hasMany('objective', {
    inverse: 'parents',
    async: true
  }),
  meshDescriptors: hasMany('mesh-descriptor', {async: true}),
  descendants: hasMany('objective', {
    inverse: 'ancestor',
    async: true
  }),
  //While it is possible at some point that objectives will be allowed to
  //link to multiple courses, for now we just reflect a many to one relationship
  course: alias('courses.firstObject'),
  //While it is possible at some point that objectives will be allowed to
  //link to multiple program years, for now we just reflect a many to one relationship
  programYear: alias('programYears.firstObject'),
  //While it is possible at some point that objectives will be allowed to
  //link to multiple sessions, for now we just reflect a many to one relationship
  session: alias('sessions.firstObject'),
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
    const trees = await all(parents.mapBy('treeCompetencies'));

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

  /**
   * A list of top-level objectives of this objective's parentage tree.
   * If this objective has no ancestors, it is included in this list itself.
   * @property topParents
   * @type {Ember.computed}
   * @public
   */
  topParents: computed('parents', 'parents.@each.topParents', async function(){
    const parents = await this.get('parents');
    if (isEmpty(parents)) {
      return [ this ];
    }

    const allTopParents = await all(parents.mapBy('topParents'));

    return allTopParents.reduce((array, set) => {
      array.pushObjects(set);
      return array;
    }, []);
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

  /**
   * Remove any parents with a relationship to the cohort.
   * @method removeParentWithProgramYears
   * @param {Array} programYearsToRemove
   */
  async removeParentWithProgramYears(programYearsToRemove){
    const parents = await this.get('parents');

    await map(parents.toArray(), async parent => {
      const programYears = await parent.get('programYears');
      const programYear = programYears.get('firstObject');
      if(programYearsToRemove.includes(programYear)){
        parents.removeObject(parent);
        parent.get('children').removeObject(this);
      }
    });

    await this.save();
  },
});
