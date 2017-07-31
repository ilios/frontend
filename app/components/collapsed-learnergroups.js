import Component from '@ember/component';
import RSVP from 'rsvp';
import { task, timeout } from 'ember-concurrency';

const { Promise, map } = RSVP;

export default Component.extend({
  init(){
    this._super(...arguments);
    this.get('loadCohortSummaries').perform();
  },
  didUpdateAttrs(){
    this._super(...arguments);
    this.get('loadCohortSummaries').perform();
  },
  subject: null,
  tagName: 'section',
  classNames: ['collapsed-learnergroups'],
  cohortSummariesLoaded: [],
  loadCohortSummaries: task(function * (){
    const subject = this.get('subject');
    if (subject){
      let learnerGroups = yield subject.get('learnerGroups');
      let cohorts = yield map(learnerGroups.toArray(), (group => group.get('cohort')));
      let summaryBlocks =  cohorts.reduce((set, cohort) => {
        let key = 'cohort' + cohort.get('id');
        if (!Object.keys(set).includes(key)) {
          set[key] = {
            cohort,
            count: 0
          };
        }

        set[key].count++;

        return set;
      }, {});

      return yield map(Object.keys(summaryBlocks), key => {
        let cohort = summaryBlocks[key].cohort;
        let count = summaryBlocks[key].count;
        return new Promise(resolve => {
          cohort.get('programYear').then(programYear => {
            programYear.get('program').then(program => {
              let title = [program.get('title'), cohort.get('title')].join(' ');
              resolve({
                title,
                count
              });
            });
          });
        });
      });
    } else {
      yield timeout(1000);
      this.get('loadCohortSummaries').perform();
    }
  }).restartable(),
});
