/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';
import { computed } from '@ember/object';
import layout from '../templates/components/sortable-th';

export default Component.extend({
  layout,
  tagName: 'th',
  sortedBy: false,
  sortedAscending: true,
  align: 'left',
  sortType: 'alpha',
  classNameBindings: ['textDirection', ':sortable', ':clickable', 'hideFromSmallScreen'],
  hideFromSmallScreen: false,
  sortIcon: computed('sortedBy', 'sortedAscending', 'sortType', function(){
    const sortedBy = this.get('sortedBy');
    const sortedAscending = this.get('sortedAscending');
    const sortType = this.get('sortType');

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
    return 'text-' + this.get('align');
  }),
  attributeBindings: ['colspan', 'title'],
  colspan: 1,
  title: ''
});
