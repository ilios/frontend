import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';

export default class LearnergroupTree extends Component {
  @service intl;

  get isRoot() {
    return this.args.isRoot ?? true;
  }

  @cached
  get childrenData() {
    return new TrackedAsyncData(this.args.learnerGroup.children);
  }

  get children() {
    return this.childrenData.isResolved ? this.childrenData.value : null;
  }

  get hasChildren() {
    return this.args.learnerGroup.hasMany('children').ids().length > 0;
  }

  get filterMatch() {
    if (this.args.filter && this.args.filter.length > 0) {
      const exp = new RegExp(this.args.filter, 'gi');
      return this.args.learnerGroup.filterTitle.match(exp) != null;
    }

    return true;
  }

  get isHidden() {
    return !this.filterMatch;
  }

  @action
  add(learnerGroup, ev) {
    this.args.add(learnerGroup, !(ev.ctrlKey || ev.shiftKey));
  }

  @action
  remove(learnerGroup, ev) {
    this.args.remove(learnerGroup, !(ev.ctrlKey || ev.shiftKey));
  }

  @action
  sortByTitle(learnerGroupA, learnerGroupB) {
    const locale = this.intl.get('locale');
    return learnerGroupA.title.localeCompare(learnerGroupB.title, locale, {
      numeric: true,
    });
  }
}
