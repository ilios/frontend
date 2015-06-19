import Ember from 'ember';
import Publishable from 'ilios/mixins/publishable';

export default Ember.Component.extend(Publishable, {
  programYear: null,
  publishTarget: Ember.computed.alias('programYear'),
  publishEventCollectionName: 'programYears',
});
