/* eslint ember/order-in-components: 0 */
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { isEmpty } from '@ember/utils';
import EmberObject, { computed } from '@ember/object';
import ObjectProxy from '@ember/object/proxy';
import { all, map, Promise as RSVPPromise } from 'rsvp';
import { task } from 'ember-concurrency';
import layout from '../templates/components/course-objective-manager';

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
    return this.get('courseObjective.parents').includes(this.get('content'));
  }),
});

const cohortProxy = EmberObject.extend({
  cohort: null,
  objective: null,
  id: oneWay('cohort.id'),
  title: null,
  objectivesByCompetency: computed('objectives.[]', function(){
    return new RSVPPromise(resolve => {
      let objectives = this.get('objectives');
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
    const cohort = this.get('cohort');
    const school = await cohort.get('school');
    return await school.getConfigValue('allowMultipleCourseObjectiveParents');
  }),
});

export default Component.extend({
  layout,
  intl: service(),
  classNames: ['objective-manager', 'course-objective-manager'],
  courseObjective: null,
  selectedCohort: null,
  'data-test-course-objective-manager': true,

  didReceiveAttrs(){
    this.get('loadAttr').perform();
  },

  loadAttr: task(function * () {
    let cohorts = yield this.get('cohorts');
    let firstCohort = cohorts.get('firstObject');
    if(firstCohort != null){
      this.set('selectedCohort', firstCohort);
    }
  }),

  course: computed('courseObjective.courses.[]', async function () {
    const courseObjective = this.get('courseObjective');
    if (! courseObjective) {
      return [];
    }

    const courses = await courseObjective.get('courses');
    return courses.get('firstObject');
  }),

  cohorts: computed('course.cohorts.[]', async function () {
    const course = await this.get('course');
    return course.get('cohorts');
  }),

  programs: computed('cohorts.programYear.program', async function () {
    const cohorts = await this.get('cohorts');
    return all(cohorts.mapBy('program'));
  }),


  /**
   * @property cohorts
   * @type {Ember.computed}
   * @public
   */
  cohortProxies: computed('cohorts.[]', 'programs.[]', async function() {
    const courseObjective = this.get('courseObjective');
    const cohorts = await this.get('cohorts');
    const cohortProxies = await map(cohorts.toArray(), async cohort => {
      const programYear = await cohort.get('programYear');
      const objectives = await programYear.get('objectives');
      let objectiveProxies = objectives.map(objective => {
        return objectiveProxy.create({
          content: objective,
          courseObjective,
        });
      });
      const program = await programYear.get('program');
      const programTitle = program.get('title');
      let cohortTitle = cohort.get('title');
      if (isEmpty(cohortTitle)) {
        const intl = this.get('intl');
        const classOfYear = await cohort.get('classOfYear');
        cohortTitle = intl.t('general.classOf', {year: classOfYear});
      }
      const title = `${programTitle} ${cohortTitle}`;

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
  currentCohort: computed('selectedCohort', 'cohortProxies.[]', function(){
    return new RSVPPromise(resolve => {
      let selectedCohort = this.get('selectedCohort');
      if (selectedCohort){
        this.get('cohortProxies').then(cohorts => {
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
    const courseObjective = this.get('courseObjective');
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
      this.get('cohorts').then(cohorts => {
        let selectedCohort = cohorts.findBy('id', cohortId);
        this.set('selectedCohort', selectedCohort);
      });
    },
    removeParent(parentProxy){
      let removingParent = parentProxy.get('content');
      let courseObjective = this.get('courseObjective');
      courseObjective.get('parents').removeObject(removingParent);
      removingParent.get('children').removeObject(courseObjective);
    },
  }
});
