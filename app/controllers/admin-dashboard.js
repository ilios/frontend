import Ember from 'ember';

const {inject} = Ember;
const {controller} = inject;

export default Ember.Controller.extend({
  applicationController: controller('application'),
  setup: Ember.on('init', function() {
    this.get('applicationController').set('showGlobalSearch', true);
  }),
});
