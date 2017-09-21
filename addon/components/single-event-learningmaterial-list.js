import Ember from 'ember';
import layout from '../templates/components/single-event-learningmaterial-list';

const { computed, isEmpty } = Ember;

export default Ember.Component.extend({
  layout: layout,
  classNames: ['single-event-learningmaterial-list'],
  learningMaterials: null,
});
