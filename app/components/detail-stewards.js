import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { isEmpty, isPresent } from '@ember/utils';
import { all, map } from 'rsvp';
import { task, timeout } from 'ember-concurrency';

export default Component.extend({
  store: service(),

  classNameBindings: [':detail-stewards', ':stewards-manager', 'showCollapsible:collapsible'],

  bufferStewards: null,
  editable: true,
  isManaging: false,
  programYear: null,

  showCollapsible: computed('isManaging', 'programYear.stewards.[]', function () {
    const isManaging = this.isManaging;
    const programYear = this.programYear;
    const stewardIds = programYear.hasMany('stewards').ids();
    return !isManaging && stewardIds.get('length');
  }),

  stewardsBySchool: computed('programYear.stewards.[]', async function() {
    const programYear = this.programYear;
    if (isEmpty(programYear)) {
      return [];
    }

    const stewards = await programYear.get('stewards');
    const stewardObjects = await map(stewards.toArray(), async steward => {
      const school = await steward.get('school');
      const schoolId = isPresent(school)?school.get('id'):0;
      const schoolTitle = isPresent(school)?school.get('title'):null;
      const department = await steward.get('department');
      const departmentId = isPresent(department)?department.get('id'):0;
      const departmentTitle = isPresent(department)?department.get('title'):null;
      return {
        schoolId,
        schoolTitle,
        departmentId,
        departmentTitle,
      };
    });
    const schools = stewardObjects.uniqBy('schoolId');
    const schoolData = schools.map(obj => {
      const departments = stewardObjects.filterBy('schoolId', obj.schoolId);
      const rhett = {
        schoolId: obj.schoolId,
        schoolTitle: obj.schoolTitle,
        departments
      };

      return rhett;
    });

    return schoolData;
  }),

  actions: {
    collapse() {
      const programYear = this.programYear;
      const stewardIds = programYear.hasMany('stewards').ids();
      if (stewardIds.get('length')) {
        this.collapse();
      }
    },

    cancel() {
      this.setProperties({ bufferStewards: [], isManaging: false });
    },

    addStewardToBuffer(steward) {
      //copy the array to didReceiveAttrs gets called on detail-steward-manager
      let bufferStewards = this.bufferStewards.toArray();
      bufferStewards.pushObject(steward);
      this.set('bufferStewards', bufferStewards);
    },

    removeStewardFromBuffer(steward) {
      //copy the array to didReceiveAttrs gets called on detail-steward-manager
      let bufferStewards = this.bufferStewards.toArray();
      bufferStewards.removeObject(steward);
      this.set('bufferStewards', bufferStewards);
    }
  },

  save: task(function* () {
    yield timeout(10);
    const programYear = this.programYear;
    const bufferStewards = this.bufferStewards;
    let stewards = yield programYear.get('stewards');
    let stewardsToRemove = stewards.filter(steward => !bufferStewards.includes(steward));
    let stewardsToAdd = bufferStewards.filter(steward => !stewards.includes(steward));
    stewardsToAdd.setEach('programYear', programYear);
    yield all(stewardsToAdd.invoke('save'));
    yield all(stewardsToRemove.invoke('destroyRecord'));
    this.setProperties({ bufferStewards: [], isManaging: false });
  }),

  manage: task(function* () {
    yield timeout(10);
    this.expand();
    const stewards = yield this.get('programYear.stewards');
    this.set('bufferStewards', stewards.toArray());
    this.set('isManaging', true);
  })
});
