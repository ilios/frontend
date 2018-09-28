import Component from '@ember/component';
import { map } from 'rsvp';
import { computed } from '@ember/object';
import layout from '../templates/components/collapsed-learnergroups';

export default Component.extend({
  layout,
  subject: null,
  tagName: 'section',
  classNames: ['collapsed-learnergroups'],
  'data-test-collapsed-learnergroups': true,
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

    return await map(Object.keys(summaryBlocks), async key => {
      const cohort = summaryBlocks[key].cohort;
      const count = summaryBlocks[key].count;
      const program = await cohort.get('program');
      const title = [program.title, cohort.title].join(' ');

      return {
        title,
        count
      };
    });
  }),
});
