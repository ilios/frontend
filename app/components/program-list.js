import Component from '@ember/component';
import { computed } from '@ember/object';
import ObjectProxy from '@ember/object/proxy';

const ProgramProxy = ObjectProxy.extend({
  content: null,
  showRemoveConfirmation: false
});

export default Component.extend({
  programs: [],
  proxiedPrograms: computed('programs.[]', function(){
    const programs = this.get('programs');
    if (!programs) {
      return [];
    }
    return programs.map(program => {
      return ProgramProxy.create({
        content: program,
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
