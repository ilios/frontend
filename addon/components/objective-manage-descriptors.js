import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  objective: null,
  objectiveDescriptors: computed('objective', 'objective.meshDescriptors.[]', function(){
    var objective = this.get('objective');
    if(!objective){
      return [];
    }
    return objective.get('meshDescriptors');
  }),
  actions: {
    add(descriptor) {
      var objective = this.get('objective');
      objective.get('meshDescriptors').addObject(descriptor);
    },
    remove(descriptor) {
      var objective = this.get('objective');
      objective.get('meshDescriptors').removeObject(descriptor);
    }
  }
});
