/* eslint ember/order-in-components: 0 */
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { computed } from '@ember/object';
import ObjectProxy from '@ember/object/proxy';

const ProgramProxy = ObjectProxy.extend({
  showRemoveConfirmation: false,
  canDelete: computed('content.curriculumInventoryReports.[]', 'content.programYears.[]', async function () {
    const program = this.content;
    const permissionChecker = this.permissionChecker;
    const hasCiReports = program.hasMany('curriculumInventoryReports').ids().length > 0;
    const hasProgramYears = program.hasMany('programYears').ids().length > 0;
    const canDelete = await permissionChecker.canDeleteProgram(program);

    return !hasCiReports && !hasProgramYears && canDelete;
  }),
  canActivate: computed(
    'content.isScheduled',
    'content.isPublished',
    async function() {
      const program = this.content;
      const permissionChecker = this.permissionChecker;
      const canBeUpdated = await permissionChecker.canUpdateProgram(program);
      const isNotFullyPublished = (program.get('isScheduled') || ! program.get('isPublished'));
      return (isNotFullyPublished && canBeUpdated);
    })
});


export default Component.extend({
  permissionChecker: service(),
  programs: null,
  proxiedPrograms: computed('programs.[]', function(){
    const permissionChecker = this.permissionChecker;
    const programs = this.programs;
    if (!programs) {
      return [];
    }
    return programs.map(program => {
      return ProgramProxy.create({
        content: program,
        permissionChecker,
      });
    });
  }),
  actions: {
    edit(programProxy) {
      this.edit(programProxy.get('content'));
    },
    remove(programProxy) {
      this.remove(programProxy.get('content'));
    },
    activate(programProxy) {
      this.activate(programProxy.get('content'));
    },
    cancelRemove(programProxy) {
      programProxy.set('showRemoveConfirmation', false);
    },
    confirmRemove(programProxy) {
      programProxy.set('showRemoveConfirmation', true);
    },
  }
});
