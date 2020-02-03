import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { filter } from 'rsvp';
import { isEmpty } from '@ember/utils';
import {restartableTask} from "ember-concurrency-decorators";

export default class LearnergroupTree extends Component {
  @tracked isHidden = true;
  @tracked selectable = false;
  @tracked hasChildren = false;

  @restartableTask
  *load(element, [learnerGroup, selectedGroups, filter]) {
    const exp = new RegExp(filter, 'gi');
    const children = yield learnerGroup.children;
    const hasUnSelectedChildren = yield this.hasUnSelectedChildren(children.toArray(), selectedGroups);
    let filterMatch = true;
    if (filter && filter.length > 0) {
      const filterTitle = yield learnerGroup.filterTitle;
      filterMatch = filterTitle.match(exp) != null;
    }
    const available = hasUnSelectedChildren || isEmpty(selectedGroups) || !selectedGroups.includes(learnerGroup);

    this.isHidden = !filterMatch || !available;
    this.selectable = available;
    this.hasChildren = children.length;
  }

  /**
   * Recursively search a group tree to see if there are any children which have not been selected.
   * @param {Array} children
   * @param {Array} selectedGroups
   * @return {boolean}
  **/
  async hasUnSelectedChildren(children, selectedGroups){
    const unselectedChildren = await filter(children, async (child) => {
      if (isEmpty(selectedGroups) || ! selectedGroups.includes(child)) {
        return true;
      }
      const childChildren = await child.children;
      return this.hasUnSelectedChildren(childChildren.toArray(), selectedGroups);
    });
    return unselectedChildren.length > 0;
  }

  @action
  add(learnerGroup) {
    if (this.selectable) {
      this.args.add(learnerGroup);
    }
  }
}
