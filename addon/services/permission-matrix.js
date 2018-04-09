import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';

export default Service.extend({
  store: service(),
  permissionMatrix: computed(async function(){
    const store = this.get('store');
    const schools = await store.findAll('school');
    const schoolIds = schools.mapBy('id');
    let matrix = {};
    schoolIds.forEach(id => {
      matrix[id] = {
        'CAN_CREATE_COURSES': [
          'SCHOOL_ADMINISTRATOR',
          'SCHOOL_DIRECTOR'
        ]
      };
    });

    return matrix;
  }),
  async hasPermission(schoolId, capability, userRoles) {
    const matrix = await this.get('permissionMatrix');
    if (!matrix.hasOwnProperty(schoolId)) {
      return false;
    }
    const schoolMatrix = matrix[schoolId];
    if (!schoolMatrix.hasOwnProperty(capability)) {
      return false;
    }

    const matchedRoles = schoolMatrix[capability].filter(role => userRoles.includes(role));

    return matchedRoles.length > 0;
  },
});
