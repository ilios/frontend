import Component from '@glimmer/component';
import { action } from '@ember/object';
import { filter } from 'rsvp';
import { inject as service } from '@ember/service';
import { use } from 'ember-could-get-used-to-this';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';
import AsyncProcess from 'ilios-common/classes/async-process';

export default class LearnergroupTree extends Component {
  @service intl;

  get isRoot() {
    return this.args.isRoot ?? true;
  }

  @use children = new ResolveAsyncValue(() => [this.args.learnerGroup.children]);

  @use hasUnSelectedChildren = new AsyncProcess(() => [
    this.getHasUnSelectedChildren.bind(this),
    this.children,
    this.args.selectedGroups,
  ]);

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

  /**
   * Recursively search a group tree to see if there are any children which have not been selected.
   **/
  async getHasUnSelectedChildren(children, selectedGroups) {
    const arr = children?.toArray() ?? [];
    const unselectedChildren = await filter(arr, async (child) => {
      if (!selectedGroups.includes(child)) {
        return true;
      }
      const childChildren = await child.children;
      return this.getHasUnSelectedChildren(childChildren.toArray(), selectedGroups);
    });
    return unselectedChildren.length > 0;
  }

  @action
  add(learnerGroup, ev) {
    this.args.add(learnerGroup, ev.ctrlKey);
    if (ev.ctrlKey) {
      ev.preventDefault();
    }
  }

  @action
  remove(learnerGroup, ev) {
    this.args.remove(learnerGroup, ev.ctrlKey);
    if (ev.ctrlKey) {
      ev.preventDefault();
    }
  }

  @action
  sortByTitle(learnerGroupA, learnerGroupB) {
    const locale = this.intl.get('locale');
    return learnerGroupA.title.localeCompare(learnerGroupB.title, locale, {
      numeric: true,
    });
  }
}
