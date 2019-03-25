import Mixin from '@ember/object/mixin';
import { computed } from '@ember/object';

export default Mixin.create({
  sortBy: '',

  sortedAscending: computed('sortBy', function(){
    const sortBy = this.get('sortBy');
    return sortBy.search(/desc/) === -1;
  }),

  actions: {
    sortBy(prop) {
      const sortBy = this.get('sortBy');
      if (sortBy === prop) {
        prop += ':desc';
      }
      this.get('setSortBy')(prop);
    }
  }
});
