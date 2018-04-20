/* eslint ember/order-in-components: 0 */
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { computed } from '@ember/object';
import ObjectProxy from '@ember/object/proxy';

import config from '../config/environment';
const { IliosFeatures: { enforceRelationshipCapabilityPermissions } } = config;

const ProgramProxy = ObjectProxy.extend({
  showRemoveConfirmation: false,
  canDelete: computed('content.curriculumInventoryReports.[]', 'content.programYears.[]', 'currentUser', async function () {
    const program = this.get('content');
    const permissionChecker = this.get('permissionChecker');
    const hasCiReports = program.hasMany('curriculumInventoryReports').ids().length > 0;
    const hasProgramYears = program.hasMany('programYears').ids().length > 0;
    const canDelete = enforceRelationshipCapabilityPermissions ? await permissionChecker.canDeleteProgram(program) : true;

    return !hasCiReports && !hasProgramYears && canDelete;
  })
});


export default Component.extend({
  permissionChecker: service(),
  programs: null,
  proxiedPrograms: computed('programs.[]', function(){
    const permissionChecker = this.get('permissionChecker');
    const programs = this.get('programs');
    if (!programs) {
      return [];
    }
    return programs.map(program => {
      return ProgramProxy.create({
        content: program,
        permissionChecker
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
