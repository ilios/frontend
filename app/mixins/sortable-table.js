import Mixin from '@ember/object/mixin';
import { computed } from '@ember/object';
export default Mixin.create({
  sortBy: '',

  sortedAscending: computed('sortBy', function(){
    const sortBy = this.sortBy;
    return sortBy.search(/desc/) === -1;
  }),
  actions: {
    sortBy(what){
      const sortBy = this.sortBy;
      if(sortBy === what){
        what += ':desc';
      }
      this.setSortBy(what);
    },
  }
});
