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
  },
  async canUpdateCourse(course, schoolId) {
    const currentUser = await this.get('currentUser');
    const permissionMatrix = this.get('permissionMatrix');
    if (course.get('locked') || course.get('archived')) {
      return false;
    }
    const isRoot = await currentUser.get('isRoot');
    if (isRoot) {
      return true;
    }

    const rolesInSchool = await currentUser.getRolesInSchool(schoolId);
    if (await permissionMatrix.hasPermission(schoolId, 'CAN_UPDATE_ALL_COURSES', rolesInSchool)) {
      return true;
    }

    const rolesInCourse = await currentUser.getRolesInCourse(course.get('id'));
    return await permissionMatrix.hasPermission(schoolId, 'CAN_UPDATE_THEIR_COURSES', rolesInCourse);
  }
});
