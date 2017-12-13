import Component from '@ember/component';
import layout from '../templates/components/single-event-learningmaterial-list';

export default Component.extend({
  layout: layout,
  classNames: ['single-event-learningmaterial-list'],
  learningMaterials: null,
});
