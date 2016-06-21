import Ember from 'ember';

const { Component, computed } = Ember;

export default Component.extend({
  showProgress: false,
  totalProgress: null,
  currentProgress: null,
  progress: computed('totalProgress', 'currentProgress', function(){
    const total = this.get('totalProgress') || 1;
    const current = this.get('currentProgress') || 0;

    return Math.floor(current / total * 100);
  })
});
