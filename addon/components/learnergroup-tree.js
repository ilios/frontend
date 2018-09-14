/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';
import { computed } from '@ember/object';
import RSVP from 'rsvp';
import { task } from 'ember-concurrency';
import { isEmpty } from '@ember/utils';
import layout from '../templates/components/learnergroup-tree';

const { gt } = computed;
const { Promise, filter } = RSVP;

export default Component.extend({
  layout,
  learnerGroup: null,
  selectedGroups: null,
  filter: '',
  tagName: 'li',
  didReceiveAttrs(){
    this._super(...arguments);
    this.get('updateIsVisible').perform();
  },
  classNameBindings: ['hasChildren:strong:em', 'selectable::disabled'],
  isVisible: false,
  hasChildren: gt('learnerGroup.children.length', 0),
  selectable: false,
  'data-test-learnergroup-tree': true,
  /**
   * Recursivly search a group tree to see if there are any children
   * which have not been selected
  **/
  hasUnSelectedChildren(children){
    const selectedGroups = this.get('selectedGroups');
    return new Promise(resolve => {
      filter(children.toArray(), (child => {
        if (isEmpty(selectedGroups) || !selectedGroups.includes(child)) {
          return true;
        }
        return child.get('children').then(childChildren => {
          return this.hasUnSelectedChildren(childChildren);
        });
      })).then(unselectedChildren => {
        resolve(unselectedChildren.length > 0);
      });
    });
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
