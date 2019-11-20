import Component from '@ember/component';
import EmberObject, { computed } from '@ember/object';
import ObjectProxy from '@ember/object/proxy';
import { inject as service } from '@ember/service';
import { isEmpty, isPresent } from '@ember/utils';
import { all, map } from 'rsvp';
import { task } from 'ember-concurrency';

const { filterBy, gt, none, oneWay, sort, uniq } = computed;

const competencyGroup = EmberObject.extend({
  title: '',
  originalObjectives: null,
  objectiveSorting: null,
  uniqueObjectives: uniq('originalObjectives'),
  objectives: sort('uniqueObjectives', 'objectiveSorting'),
  selectedObjectives: filterBy('uniqueObjectives', 'selected', true),
  selected: gt('selectedObjectives.length', 0),
  noTitle: none('title'),
  init(){
    this._super(...arguments);
    this.set('objectiveSorting', ['title']);
  },
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
  title: null,

  id: oneWay('cohort.id'),

  objectivesByCompetency: computed('objectives.[]', async function() {
    const objectives = this.objectives;
    const competencies = await all(objectives.mapBy('competency'));
    const groups = competencies
      .uniq()
      .filter((competency) => !!competency)
      .map((competency) => {
        const ourObjectives = objectives.filter((objective) => {
          return objective.get('competency.id') === competency.id;
        });
        return competencyGroup.create({
          title: competency.title,
          originalObjectives: ourObjectives
        });
      })
      .sortBy('title');

    // finally, add all program objectives that are not linked to a competency
    // in a group and add it to the end of the list.
    // @see https://github.com/ilios/frontend/issues/1905
    const ourObjectives = objectives.filter((objective) => {
      return isEmpty(objective.get('competency.content'));
    });

    if (isPresent(ourObjectives)) {
      groups.pushObject(competencyGroup.create({
        title: null,
        originalObjectives: ourObjectives
      }));
    }

    return groups;
  }),

  allowMultipleParents: computed('cohort.school', async function () {
    const cohort = this.get('cohort');
    const school = await cohort.get('school');
    return await school.getConfigValue('allowMultipleCourseObjectiveParents');
  }),
});

export default Component.extend({
  intl: service(),
  classNames: ['objective-manager', 'course-objective-manager'],
  courseObjective: null,
  selectedCohort: null,
  'data-test-course-objective-manager': true,

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
  currentCohort: computed('selectedCohort', 'cohortProxies.[]', async function() {
    const selectedCohort = this.selectedCohort;

    if (selectedCohort) {
      const cohorts = await this.cohortProxies;
      const matchingGroups = cohorts.filterBy('id', selectedCohort.id);
      return matchingGroups.length > 0 ? matchingGroups.firstObject : null;
    } else {
      return null;
    }
  }),

  didReceiveAttrs(){
    this.get('loadAttr').perform();
  },

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
  },
  loadAttr: task(function * () {
    let cohorts = yield this.get('cohorts');
    let firstCohort = cohorts.get('firstObject');
    if(firstCohort != null){
      this.set('selectedCohort', firstCohort);
    }
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

});
