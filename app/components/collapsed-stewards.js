/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';
import RSVP from 'rsvp';
import { isEmpty, isPresent } from '@ember/utils';
import { computed } from '@ember/object';
const { map } = RSVP;

export default Component.extend({
  tagName: 'section',
  classNames: ['collapsed-stewards'],
  programYear: null,
  schoolData: computed('programYear.stewards.[]', async function(){
    const programYear = this.get('programYear');
    if (isEmpty(programYear)) {
      return [];
    }

    const stewards = await programYear.get('stewards');
    const stewardObjects = await map(stewards.toArray(), async steward => {
      const school = await steward.get('school');
      const department = await steward.get('department');
      const departmentId = isPresent(department)?department.get('id'):0;
      return {
        schoolId: school.get('id'),
        schoolTitle: school.get('title'),
        departmentId
      };
    });
    const schools = stewardObjects.uniqBy('schoolId');
    const schoolData = schools.map(obj => {
      const departments = stewardObjects.filterBy('schoolId', obj.schoolId);
      delete obj.departmentId;
      obj.departmentCount = departments.length;

      return obj;
    });

    return schoolData;
  }),
});
