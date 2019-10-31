import Component from '@ember/component';
import { computed } from '@ember/object';
import layout from '../templates/components/sortable-heading';

export default Component.extend({
  layout,
  sortedBy: false,
  sortedAscending: true,
  align: 'left',
  sortType: 'alpha',
  classNameBindings: ['textDirection', ':sortable', ':clickable', ':sortable-heading', 'hideFromSmallScreen'],
  tagName: 'span',
  hideFromSmallScreen: false,
  attributeBindings: ['title'],
  title: '',
  sortIcon: computed('sortedBy', 'sortedAscending', 'sortType', function(){
    const sortedBy = this.get('sortedBy');
    const sortedAscending = this.get('sortedAscending');
    const sortType = this.get('sortType');

    if(sortedBy){
      if(sortedAscending){
        return sortType === 'numeric'?'sort-numeric-down':'sort-alpha-down';
      } else {
        return sortType === 'numeric'?'sort-numeric-down-alt':'sort-alpha-down-alt';
      }
    } else {
      return 'sort';
    }
  }),
  textDirection: computed('align', function(){
    return 'text-' + this.get('align');
  }),
});
