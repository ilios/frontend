import Component from '@ember/component';
import { computed } from '@ember/object';
import { filter } from 'rsvp';
import { task } from 'ember-concurrency';
import { isEmpty } from '@ember/utils';
import layout from '../templates/components/learnergroup-tree';

const { gt } = computed;

export default Component.extend({
  layout,
  learnerGroup: null,
  selectedGroups: null,
  filter: '',
  tagName: 'li',
  classNameBindings: ['hasChildren:strong:em', 'selectable::disabled'],
  isVisible: false,
  selectable: false,
  'data-test-learnergroup-tree': true,
  hasChildren: gt('learnerGroup.children.length', 0),
  didReceiveAttrs(){
    this._super(...arguments);
    this.get('updateIsVisible').perform();
  },
  /**
   * Recursivly search a group tree to see if there are any children
   * which have not been selected
  **/
  async hasUnSelectedChildren(children){
    const selectedGroups = this.selectedGroups;
    const unselectedChildren = await filter(children.toArray(), async (child) => {
      if (isEmpty(selectedGroups) || !selectedGroups.includes(child)) {
        return true;
      }

      const childChildren = await child.get('children');
      return await this.hasUnSelectedChildren(childChildren);
    });
    return unselectedChildren.length > 0;
  },
  /**
   * Controls visibility of the learner group element
   * If a filter has been applied use that first
   * If there are any unselected children then display
   * If the group is not already picked then display
  **/
  updateIsVisible: task(function * () {
    const selectedGroups = this.get('selectedGroups');
    const learnerGroup = this.get('learnerGroup');
    const filterString = this.get('filter');
    const exp = new RegExp(filterString, 'gi');

    let children = yield learnerGroup.get('children');
    let hasUnSelectedChildren = yield this.hasUnSelectedChildren(children);
    let filterMatch = true;
    if (filterString.length > 0) {
      let filterTitle = yield learnerGroup.get('filterTitle');
      filterMatch = filterTitle.match(exp) != null;
    }
    let available = hasUnSelectedChildren || isEmpty(selectedGroups) || !selectedGroups.includes(learnerGroup);

    this.set('isVisible', filterMatch && available);
    this.set('selectable', available);
  }).restartable(),
});
