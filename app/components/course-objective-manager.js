/* eslint ember/order-in-components: 0 */
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { isEmpty } from '@ember/utils';
import EmberObject, { computed } from '@ember/object';
import ObjectProxy from '@ember/object/proxy';
import RSVP from 'rsvp';
import { task } from 'ember-concurrency';

const { all, map, Promise } = RSVP;
const { filterBy, gt, none, oneWay, sort, uniq } = computed;

const competencyGroup = EmberObject.extend({
  init(){
    this._super(...arguments);
    this.set('objectiveSorting', ['title']);
  },
  title: '',
  originalObjectives: null,
  uniqueObjectives: uniq('originalObjectives'),
  objectiveSorting: null,
  objectives: sort('uniqueObjectives', 'objectiveSorting'),
  selectedObjectives: filterBy('uniqueObjectives', 'selected', true),
  selected: gt('selectedObjectives.length', 0),
  noTitle: none('title')
});

const objectiveProxy = ObjectProxy.extend({
  courseObjective: null,
  selected: computed('content', 'courseObjective.parents.[]', function(){
    return this.get('courseObjective.parents').includes(this.content);
  }),
});

const cohortProxy = EmberObject.extend({
  cohort: null,
  objective: null,
  id: oneWay('cohort.id'),
  title: null,
  objectivesByCompetency: computed('objectives.[]', function(){
    return new Promise(resolve => {
      let objectives = this.objectives;
      let competencies = [];
      let promises = [];
      objectives.forEach(objective => {
        promises.pushObject(objective.get('competency').then(competency => {
          competencies.pushObject(competency);
        }));
      });
      all(promises).then(() => {
        let groups = competencies.uniq().filter(competency => {
          return !!competency;
        }).map(competency => {
          let ourObjectives = objectives.filter(objective => {
            return objective.get('competency').get('id') === competency.get('id');
          });
          return competencyGroup.create({
            title: competency.get('title'),
            originalObjectives: ourObjectives
          });
        });

        groups = groups.sortBy('title');

        // finally, add all program objectives that are not linked to a competency
        // in a group and add it to the end of the list.
        // @see https://github.com/ilios/frontend/issues/1905
        let ourObjectives = objectives.filter(objective => {
          return isEmpty(objective.get('competency').get('content'));
        });
        if (!isEmpty(ourObjectives)) {
          let specialGroup = competencyGroup.create({
            title: null,
            originalObjectives: ourObjectives,
          });
          groups.pushObject(specialGroup);
        }
        resolve(groups);
      });
    });

  }),
  allowMultipleParents: computed('cohort.school', async function () {
    const cohort = this.cohort;
    const school = await cohort.get('school');
    return await school.getConfigValue('allowMultipleCourseObjectiveParents');
  }),
});

export default Component.extend({
  i18n: service(),
  classNames: ['objective-manager', 'course-objective-manager'],
  courseObjective: null,
  selectedCohort: null,
  'data-test-course-objective-manager': true,

  didReceiveAttrs(){
    this.loadAttr.perform();
  },

  loadAttr: task(function * () {
    let cohorts = yield this.cohorts;
    let firstCohort = cohorts.get('firstObject');
    if(firstCohort != null){
      this.set('selectedCohort', firstCohort);
    }
  }),

  /**
   * @property cohorts
   * @type {Ember.computed}
   * @public
   */
  cohorts: computed('courseObjective.courses.[]','courseObjective.courses.@each.cohorts', async function() {
    const courseObjective = this.courseObjective;
    if (! courseObjective) {
      return [];
    }
    const courses = await courseObjective.get('courses');
    const course = courses.get('firstObject');
    const cohorts = await course.get('cohorts');
    const cohortProxies = await map(cohorts.toArray(), async cohort => {
      const objectives = await cohort.get('objectives');
      let objectiveProxies = objectives.map(objective => {
        return objectiveProxy.create({
          content: objective,
          courseObjective,
        });
      });
      const programYear = await cohort.get('programYear');
      const program = await programYear.get('program');
      const programTitle = program.get('title');
      let cohortTitle = cohort.get('title');
      if (isEmpty(cohortTitle)) {
        const i18n = this.i18n;
        const classOfYear = await cohort.get('classOfYear');
        cohortTitle = i18n.t('general.classOf', {year: classOfYear});
      }
      const title = programTitle + ' ' + cohortTitle;

      return cohortProxy.create({
        id: cohort.get('id'),
        cohort: cohort,
        objectives: objectiveProxies,
        title
      });
    });

    return cohortProxies.sortBy('title');
  }),

  /**
   * @property currentCohort
   * @type {Ember.computed}
   * @public
   */
  currentCohort: computed('selectedCohort', 'cohorts.[]', function(){
    return new Promise(resolve => {
      let selectedCohort = this.selectedCohort;
      if (selectedCohort){
        this.cohorts.then(cohorts => {
          let matchingGroups = cohorts.filterBy('id', selectedCohort.get('id'));
          let currentCohort = null;
          if(matchingGroups.length > 0){
            currentCohort = matchingGroups.get('firstObject');
          }
          resolve(currentCohort);
        });
      } else {
        resolve(null);
      }
    });
  }),

  addParent: task(function* (parentProxy) {
    const courseObjective = this.courseObjective;
    const newParent = parentProxy.get('content');

    const programYears = yield newParent.get('programYears');
    const newProgramYear = programYears.get('firstObject');
    const program = yield newProgramYear.get('program');
    const school = yield program.get('school');
    const allowMultipleCourseObjectiveParents = yield school.getConfigValue('allowMultipleCourseObjectiveParents');

    let parents = yield courseObjective.get('parents');
    parents.addObject(newParent);
    let children = yield newParent.get('children');
    children.addObject(courseObjective);

    if (!allowMultipleCourseObjectiveParents) {
      const oldParents = yield newProgramYear.get('objectives');
      //remove any other parents in the same cohort
      oldParents.forEach(oldParent => {
        if(oldParent.get('id') !== newParent.get('id')){
          courseObjective.get('parents').removeObject(oldParent);
          oldParent.get('children').removeObject(courseObjective);
        }
      });
    }
  }),

  actions: {
    setSelectedCohort(cohortId){
      this.cohorts.then(cohorts => {
        let selectedCohort = cohorts.findBy('id', cohortId);
        this.set('selectedCohort', selectedCohort);
      });
    },
    removeParent(parentProxy){
      let removingParent = parentProxy.get('content');
      let courseObjective = this.courseObjective;
      courseObjective.get('parents').removeObject(removingParent);
      removingParent.get('children').removeObject(courseObjective);
    },
  }
});
