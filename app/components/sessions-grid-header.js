import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  classNames: ['sessions-grid-header'],
  sortedAscending: computed('sortBy', function(){
    const sortBy = this.get('sortBy');
    return sortBy.search(/desc/) === -1;
  }),
  actions: {
    setSortBy(what){
      const sortBy = this.get('sortBy');
      if(sortBy === what){
        what += ':desc';
      }
      this.setSortBy(what);
    },
  }
});
