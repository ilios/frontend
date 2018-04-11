import Service from '@ember/service';
import { inject as service } from '@ember/service';

export default Service.extend({
  currentUser: service(),
  permissionMatrix: service(),
  async canCreateCourse(schoolId) {
    const currentUser = await this.get('currentUser');
    const isRoot = await currentUser.get('isRoot');
    if (isRoot) {
      return true;
    }
    const permissionMatrix = this.get('permissionMatrix');
    const rolesInSchool = await currentUser.getRolesInSchool(schoolId);

    return permissionMatrix.hasPermission(schoolId, 'CAN_CREATE_COURSES', rolesInSchool);
  }
});
