import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'div',
  classNameBindings: ['isFullSize', ':waveloader'],
  isFullSize: false
});
