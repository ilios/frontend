import Component from '@glimmer/component';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import { service } from '@ember/service';
import { sortBy } from 'ilios-common/utils/array-helpers';

export default class ReportsSubjectNewSessionTypeComponent extends Component {
  @service store;

  @cached
  get sessionTypesData() {
    return new TrackedAsyncData(this.store.findAll('session-type'));
  }

  get sessionTypes() {
    return this.sessionTypesData.isResolved ? this.sessionTypesData.value : [];
  }

  get filteredSessionTypes() {
    if (this.args.school) {
      return this.sessionTypes.filter((st) => st.belongsTo('school').id() === this.args.school.id);
    }

    return this.sessionTypes;
  }

  get sortedSessionTypes() {
    return sortBy(this.filteredSessionTypes, 'title');
  }

  get bestSelectedSessionType() {
    const ids = this.sessionTypes.map(({ id }) => id);
    if (ids.includes(this.args.currentId)) {
      return this.args.currentId;
    }

    return this.sessionTypes[0].id;
  }
}
