import Ember from 'ember';
import { task } from 'ember-concurrency';

const { Component, computed, isEmpty, Object, ObjectProxy, RSVP } = Ember;
const { all, Promise } = RSVP;
const { filterBy, gt, none, oneWay, sort, uniq } = computed;

const competencyGroup = Object.extend({
  title: '',
  originalObjectives: [],
  uniqueObjectives: uniq('originalObjectives'),
  objectiveSorting: ['title'],
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

const cohortProxy = Object.extend({
  cohort: null,
  objective: null,
  id: oneWay('cohort.id'),
  title: null,
  objectivesByCompetency: computed('objectives.[]', function(){
    return new Promise(resolve => {
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

  })
});

export default Component.extend({
  classNames: ['objective-manager', 'course-objective-manager'],
  courseObjective: null,
  selectedCohort: null,

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

  /**
   * @property cohorts
   * @type {Ember.computed}
   * @public
   */
  cohorts: computed('courseObjective.courses.[]','courseObjective.courses.@each.cohorts', function() {
    return new Promise(resolve => {
      let courseObjective = this.get('courseObjective');
      if (! courseObjective) {
        resolve([]);
      } else {
        let groups = [];
        courseObjective.get('courses').then(courses => {
          let course = courses.get('firstObject');
          course.get('cohorts').then(cohorts => {
            let promises = cohorts.map(cohort => {
              return new Promise(resolve => {
                cohort.get('objectives').then(objectives => {
                  let objectiveProxies = objectives.map(objective => {
                    return objectiveProxy.create({
                      content: objective,
                      courseObjective,
                    });
                  });
                  cohort.get('programYear.program').then(program => {
                    let programTitle = program.get('title');
                    cohort.get('displayTitle').then(cohortTitle => {
                      let title = '';
                      if(programTitle && cohortTitle) {
                        title = programTitle + ' ' + cohortTitle;
                      }
                      let group = cohortProxy.create({
                        id: cohort.get('id'),
                        cohort: cohort,
                        objectives: objectiveProxies,
                        title
                      });
                      resolve(groups.pushObject(group));
                    });
                  });
                });
              });
            });
            all(promises).then(() => {
              resolve(groups.sortBy('title'));
            });
          });
        });
      }
    });
  }),

  /**
   * @property currentCohort
   * @type {Ember.computed}
   * @public
   */
  currentCohort: computed('selectedCohort', 'cohorts.[]', function(){
    return new Promise(resolve => {
      let selectedCohort = this.get('selectedCohort');
      if (selectedCohort){
        this.get('cohorts').then(cohorts => {
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

  actions: {
    setSelectedCohort(cohortId){
      this.get('cohorts').then(cohorts => {
        let selectedCohort = cohorts.findBy('id', cohortId);
        this.set('selectedCohort', selectedCohort);
      });
    },
    addParent(parentProxy){
      let courseObjective = this.get('courseObjective');
      let newParent = parentProxy.get('content');

      //remove any other parents in the same cohort
      newParent.get('programYears').then(programYears => {
        let newProgramYear = programYears.get('firstObject');
        newProgramYear.get('objectives').then(oldParents => {
          oldParents.forEach(oldParent => {
            if(oldParent.get('id') !== newParent.get('id')){
              courseObjective.get('parents').removeObject(oldParent);
              oldParent.get('children').removeObject(courseObjective);
            }
          });
          courseObjective.get('parents').addObject(newParent);
          newParent.get('children').addObject(courseObjective);
        });
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
