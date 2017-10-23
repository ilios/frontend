import Component from '@ember/component';
import { computed } from '@ember/object';
import ObjectProxy from '@ember/object/proxy';

const ProgramProxy = ObjectProxy.extend({
  showRemoveConfirmation: false,
  isDeletable: computed('content.curriculumInventoryReports.[]', 'content.programYears.[]', function(){
    return (this.get('content').hasMany('curriculumInventoryReports').ids().length === 0)
      && (this.get('content').hasMany('programYears').ids().length === 0);
  })
});


export default Component.extend({
  programs: null,
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
