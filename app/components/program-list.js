import Ember from 'ember';

const { Component, computed } = Ember;

export default Component.extend({
  programs: [],
  proxiedPrograms: computed('programs.[]', function(){
    return this.get('programs').map(function(program){
      return Ember.ObjectProxy.create({
        content: program,
        showRemoveConfirmation: false
      });
    });
  }),
  actions: {
    edit: function(programProxy){
      this.sendAction('edit', programProxy.get('content'));
    },
    remove: function(programProxy){
      this.sendAction('remove', programProxy.get('content'));
    },
    cancelRemove: function(programProxy){
      programProxy.set('showRemoveConfirmation', false);
    },
    confirmRemove: function(programProxy){
      programProxy.set('showRemoveConfirmation', true);
    },
  }
});
