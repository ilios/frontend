import Ember from 'ember';

const { computed } = Ember;

export default Ember.Component.extend({
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
        return sortType === 'numeric'?'sort-numeric-asc':'sort-alpha-asc';
      } else {
        return sortType === 'numeric'?'sort-numeric-desc':'sort-alpha-desc';
      }
    } else {
      return 'sort';
    }
  }),
  textDirection: computed('align', function(){
    return 'text-' + this.get('align');
  }),
  attributeBindings: ['colspan'],
  colspan: 1
});
