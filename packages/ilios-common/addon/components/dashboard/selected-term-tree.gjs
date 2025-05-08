import Component from '@glimmer/component';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';

export default class DashboardSelectedTermTreeComponent extends Component {
  @cached
  get childrenData() {
    return new TrackedAsyncData(this.args.term.children);
  }

  get children() {
    return this.childrenData.isResolved ? this.childrenData.value : [];
  }

  get level() {
    return this.args.level ?? 0;
  }
}
