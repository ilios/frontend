import Component from '@ember/component';
import ObjectProxy from '@ember/object/proxy';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';

const ProgramProxy = ObjectProxy.extend({
  showRemoveConfirmation: false,

  canDelete: computed(
    'content.{curriculumInventoryReports,programYears}.[]', async function () {
      const program = this.content;
      const permissionChecker = this.permissionChecker;
      const hasCiReports = program.hasMany('curriculumInventoryReports')
        .ids().length > 0;
      const hasProgramYears = program.hasMany('programYears').ids().length > 0;
      const canDelete = await permissionChecker.canDeleteProgram(program);
      return !hasCiReports && !hasProgramYears && canDelete;
    }
  ),
});

export default Component.extend({
  permissionChecker: service(),
  tagName: "",
  programs: null,
  query: null,
  edit() {},
  remove() {},

  proxiedPrograms: computed('programs.[]', function() {
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

    cancelRemove(programProxy) {
      programProxy.set('showRemoveConfirmation', false);
    },

    confirmRemove(programProxy) {
      programProxy.set('showRemoveConfirmation', true);
    }
  }
});
