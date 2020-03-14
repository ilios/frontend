import Component from '@ember/component';
import { action, computed } from '@ember/object';

export default Component.extend({
  objective: null,
  objectiveDescriptors: computed('objective', 'objective.meshDescriptors.[]', function(){
    var objective = this.get('objective');
    if(!objective){
      return [];
    }
    return objective.get('meshDescriptors');
  }),

  @action
  add(descriptor) {
    var objective = this.get('objective');
    objective.get('meshDescriptors').addObject(descriptor);
  },

  @action
  remove(descriptor) {
    var objective = this.get('objective');
    objective.get('meshDescriptors').removeObject(descriptor);
  }

});
