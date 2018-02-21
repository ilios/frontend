import Component from '@ember/component';
import { Promise, map } from 'rsvp';
import { computed } from '@ember/object';

export default Component.extend({
  subject: null,
  tagName: 'section',
  classNames: ['collapsed-learnergroups'],
  cohortSummaries: computed('subject.learnerGroups.[]', async function () {
    const subject = this.get('subject');
    if (!subject) {
      return [];
    }
    let learnerGroups = await subject.get('learnerGroups');
    let cohorts = await map(learnerGroups.toArray(), (group => group.get('cohort')));
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

    return await map(Object.keys(summaryBlocks), key => {
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
  }),
});
