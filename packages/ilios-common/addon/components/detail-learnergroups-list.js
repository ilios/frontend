import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { filter, map } from 'rsvp';
import { TrackedAsyncData } from 'ember-async-data';
import { mapBy, uniqueValues } from 'ilios-common/utils/array-helpers';

export default class DetailLearnerGroupsListComponent extends Component {
  @cached
  get treesData() {
    return new TrackedAsyncData(this.loadCohorts());
  }

  get isLoaded() {
    return this.treesData.isResolved;
  }

  get trees() {
    return this.treesData.isResolved ? this.treesData.value : [];
  }

  get learnerGroups() {
    return this.args.learnerGroups ?? [];
  }

  async loadCohorts() {
    if (!this.args.learnerGroups) {
      return [];
    }
    const cohorts = uniqueValues(
      await map(this.args.learnerGroups, async (learnerGroup) => {
        return learnerGroup.cohort;
      }),
    );
    return map(cohorts, async (cohort) => {
      const groups = await filter(this.args.learnerGroups, async (group) => {
        const groupCohort = await group.cohort;
        return groupCohort === cohort;
      });
      const proxies = await Promise.all(
        groups.map(async (group) => {
          const title = await group.getTitleWithParentTitles();
          return { group, title };
        }),
      );
      const sortedProxies = proxies.sort((a, b) => {
        const titleA = a.title.toLowerCase();
        const titleB = b.title.toLowerCase();
        return titleA > titleB ? 1 : titleA < titleB ? -1 : 0;
      });

      return {
        cohort,
        groups: mapBy(sortedProxies, 'group'),
      };
    });
  }
}
