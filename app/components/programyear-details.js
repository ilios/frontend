import Ember from 'ember';

const { Component } = Ember;

export default Component.extend({

  program: null,
  programYear: null,
  pyObjectiveDetails: false,

  actions: {
    togglePyObjectiveDetails(){
      this.sendAction('togglePyObjectiveDetails');
    }
  }
});
