import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import sortCohorts from 'frontend/utils/sort-cohorts';

export default class UserProfileCohortsDetailsComponent extends Component {
  @cached
  get sortedSecondaryCohortsData() {
    return new TrackedAsyncData(sortCohorts(this.args.secondaryCohorts));
  }

  get sortedSecondaryCohortsLoaded() {
    return this.sortedSecondaryCohortsData.isResolved;
  }

  get sortedSecondaryCohorts() {
    return this.sortedSecondaryCohortsData.isResolved ? this.sortedSecondaryCohortsData.value : [];
  }
}
