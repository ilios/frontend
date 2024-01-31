import Component from '@glimmer/component';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import { service } from '@ember/service';
import { task, timeout } from 'ember-concurrency';
import { sortBy } from 'ilios-common/utils/array-helpers';

export default class ReportsSubjectNewSessionTypeComponent extends Component {
  @service store;

  @cached
  get allSessionTypes() {
    return new TrackedAsyncData(this.store.findAll('session-type'));
  }

  get isLoaded() {
    return this.allSessionTypes.isResolved;
  }

  get filteredSessionTypes() {
    if (this.args.school) {
      return this.allSessionTypes.value.filter(
        (st) => st.belongsTo('school').id() === this.args.school.id,
      );
    }

    return this.allSessionTypes.value;
  }

  get sortedSessionTypes() {
    return sortBy(this.filteredSessionTypes, 'title');
  }

  @task
  *setInitialValue() {
    yield timeout(1); //wait a moment so we can render before setting
    const ids = this.sortedSessionTypes.map(({ id }) => id);
    if (ids.includes(this.args.currentId)) {
      return;
    }
    if (!this.sortedSessionTypes.length) {
      this.args.changeId(null);
    } else {
      this.args.changeId(this.sortedSessionTypes[0].id);
    }
  }
}
