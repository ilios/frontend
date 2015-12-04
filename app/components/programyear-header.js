import Ember from 'ember';
import Publishable from 'ilios/mixins/publishable';

const { Component, computed } = Ember;
const { alias } = computed;

export default Component.extend(Publishable, {
  programYear: null,
  publishTarget: alias('programYear'),
  publishEventCollectionName: 'programYears',
});
