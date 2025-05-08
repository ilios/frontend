import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { filterBy } from 'ilios-common/utils/array-helpers';
import { TrackedAsyncData } from 'ember-async-data';

export default class SchoolSessionTypesCollapseComponent extends Component {
  @cached
  get sessionTypesData() {
    return new TrackedAsyncData(this.args.school.sessionTypes);
  }

  get isLoaded() {
    return this.sessionTypesData.isResolved;
  }

  get sessionTypes() {
    return this.sessionTypesData.isResolved ? this.sessionTypesData.value : [];
  }

  get instructionalMethods() {
    return filterBy(this.sessionTypesData.value, 'assessment', false);
  }

  get assessmentMethods() {
    return filterBy(this.sessionTypesData.value, 'assessment');
  }
}
