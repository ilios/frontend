/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  sortedBy: false,
  sortedAscending: true,
  align: 'left',
  sortType: 'alpha',
  classNameBindings: ['textDirection', ':sortable', ':clickable', ':sortable-heading', 'hideFromSmallScreen'],
  tagName: 'span',
  hideFromSmallScreen: false,
  sortIcon: computed('sortedBy', 'sortedAscending', 'sortType', function(){
    const sortedBy = this.sortedBy;
    const sortedAscending = this.sortedAscending;
    const sortType = this.sortType;

    if(sortedBy){
      if(sortedAscending){
        return sortType === 'numeric'?'sort-numeric-up':'sort-alpha-up';
      } else {
        return sortType === 'numeric'?'sort-numeric-down':'sort-alpha-down';
      }
    } else {
      return 'sort';
    }
  }),
  textDirection: computed('align', function(){
    return 'text-' + this.align;
  }),
  attributeBindings: ['title'],
  title: ''
});
