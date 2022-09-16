import Component from '@glimmer/component';
import { filter, map } from 'rsvp';
import { use } from 'ember-could-get-used-to-this';
import AsyncProcess from 'ilios-common/classes/async-process';

export default class DetailLearnerGroupsListComponent extends Component {
  @use cohortTrees = new AsyncProcess(() => [this.loadCohorts.bind(this)]);

  get learnerGroups() {
    return this.args.learnerGroups ?? [];
  }

  get trees() {
    if (!this.cohortTrees) {
      return [];
    }
    return this.cohortTrees;
  }

  async loadCohorts() {
    if (!this.args.learnerGroups) {
      return [];
    }
    const learnerGroups = this.args.learnerGroups.toArray();
    const cohorts = (
      await map(learnerGroups, async (learnerGroup) => {
        return learnerGroup.cohort;
      })
    ).uniq();
    return map(cohorts, async (cohort) => {
      const groups = await filter(learnerGroups, async (group) => {
        const groupCohort = await group.cohort;
        return groupCohort === cohort;
      });
      const proxies = await Promise.all(
        groups.map(async (group) => {
          const title = await group.getTitleWithParentTitles();
          return { group, title };
        })
      );
      const sortedProxies = proxies.sort((a, b) => {
        const titleA = a.title.toLowerCase();
        const titleB = b.title.toLowerCase();
        return titleA > titleB ? 1 : titleA < titleB ? -1 : 0;
      });

      return {
        cohort,
        groups: sortedProxies.mapBy('group'),
      };
    });
  }
}
