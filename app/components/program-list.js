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
    edit(programProxy) {
      this.sendAction('edit', programProxy.get('content'));
    },
    remove(programProxy) {
      this.sendAction('remove', programProxy.get('content'));
    },
    cancelRemove(programProxy) {
      programProxy.set('showRemoveConfirmation', false);
    },
    confirmRemove(programProxy) {
      programProxy.set('showRemoveConfirmation', true);
    },
  }
});
