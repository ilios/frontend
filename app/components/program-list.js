import Component from '@ember/component';
import { computed } from '@ember/object';
import ObjectProxy from '@ember/object/proxy';

export default Component.extend({
  programs: [],
  proxiedPrograms: computed('programs.[]', function(){
    const programs = this.get('programs');
    if (!programs) {
      return [];
    }
    return programs.map(program => {
      return ObjectProxy.create({
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
