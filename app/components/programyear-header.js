import Ember from 'ember';
import Publishable from 'ilios/mixins/publishable';

const { Component, computed } = Ember;
const { alias, not } = computed;

export default Component.extend(Publishable, {
  programYear: null,
  classNames: ['programyear-header'],
  publishTarget: alias('programYear'),
  editable: not('programYear.locked'),
});
