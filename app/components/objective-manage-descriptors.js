/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';
import { computed } from '@ember/object';
import layout from '../templates/components/objective-manage-descriptors';

export default Component.extend({
  layout: layout,
  objective: null,
  objectiveDescriptors: computed('objective', 'objective.meshDescriptors.[]', function(){
    var objective = this.objective;
    if(!objective){
      return [];
    }
    return objective.get('meshDescriptors');
  }),
  actions: {
    add(descriptor) {
      var objective = this.objective;
      objective.get('meshDescriptors').addObject(descriptor);
    },
    remove(descriptor) {
      var objective = this.objective;
      objective.get('meshDescriptors').removeObject(descriptor);
    }
  }
});
