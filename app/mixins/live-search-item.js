import Ember from 'ember';

export default Ember.Mixin.create({
  title: '',
  isActive: true,
  targetObject: null,
  sortTerm: '',
  isALiveSearchItem: true
});
