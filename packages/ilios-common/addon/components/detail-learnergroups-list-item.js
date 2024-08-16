import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { action } from '@ember/object';
import { TrackedAsyncData } from 'ember-async-data';

export default class DetailLearnergroupsListItemComponent extends Component {
  @cached
  get allParentTitlesData() {
    return new TrackedAsyncData(this.args.group.getAllParentTitles());
  }

  get allParentTitles() {
    return this.allParentTitlesData.isResolved ? this.allParentTitlesData.value : [];
  }

  @action
  remove(learnerGroup, ev) {
    this.args.remove(learnerGroup, !(ev.ctrlKey || ev.shiftKey));
  }
}
