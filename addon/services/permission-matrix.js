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
        'CAN_UPDATE_SCHOOLS': [
          'SCHOOL_ADMINISTRATOR',
          'SCHOOL_DIRECTOR',
        ],
        'CAN_CREATE_PROGRAMS': [
          'SCHOOL_ADMINISTRATOR',
          'SCHOOL_DIRECTOR',
          'PROGRAM_DIRECTOR',
        ],
        'CAN_UPDATE_ALL_PROGRAMS': [
          'SCHOOL_ADMINISTRATOR',
          'SCHOOL_DIRECTOR',
        ],
        'CAN_UPDATE_THEIR_PROGRAMS': [
          'PROGRAM_DIRECTOR',
        ],
        'CAN_DELETE_ALL_PROGRAMS': [
          'SCHOOL_ADMINISTRATOR',
          'SCHOOL_DIRECTOR',
        ],
        'CAN_DELETE_THEIR_PROGRAMS': [
          'PROGRAM_DIRECTOR',
        ],
        'CAN_CREATE_PROGRAM_YEARS': [
          'SCHOOL_ADMINISTRATOR',
          'SCHOOL_DIRECTOR',
          'PROGRAM_DIRECTOR',
        ],
        'CAN_UPDATE_ALL_PROGRAM_YEARS': [
          'SCHOOL_ADMINISTRATOR',
          'SCHOOL_DIRECTOR',
        ],
        'CAN_UPDATE_THEIR_PROGRAM_YEARS': [
          'PROGRAM_DIRECTOR',
        ],
        'CAN_DELETE_ALL_PROGRAM_YEARS': [
          'SCHOOL_ADMINISTRATOR',
          'SCHOOL_DIRECTOR',
        ],
        'CAN_DELETE_THEIR_PROGRAM_YEARS': [
          'PROGRAM_DIRECTOR',
        ],
        'CAN_UNLOCK_ALL_PROGRAM_YEARS': [
          'SCHOOL_ADMINISTRATOR',
          'SCHOOL_DIRECTOR',
          'PROGRAM_DIRECTOR',
        ],
        'CAN_UNLOCK_THEIR_PROGRAM_YEARS': [
          'PROGRAM_DIRECTOR',
        ],
        'CAN_UNARCHIVE_ALL_PROGRAM_YEARS': [
          'SCHOOL_ADMINISTRATOR',
          'SCHOOL_DIRECTOR',
          'PROGRAM_DIRECTOR',
        ],
        'CAN_UNARCHIVE_THEIR_PROGRAM_YEARS': [
          'PROGRAM_DIRECTOR',
        ],
        'CAN_CREATE_COURSES': [
          'SCHOOL_ADMINISTRATOR',
          'SCHOOL_DIRECTOR',
        ],
        'CAN_UPDATE_ALL_COURSES': [
          'SCHOOL_ADMINISTRATOR',
          'SCHOOL_DIRECTOR',
          'PROGRAM_DIRECTOR',
        ],
        'CAN_UPDATE_THEIR_COURSES': [
          'COURSE_ADMINISTRATOR',
          'COURSE_DIRECTOR',
        ],
        'CAN_DELETE_ALL_COURSES': [
          'SCHOOL_ADMINISTRATOR',
        ],
        'CAN_UNLOCK_ALL_COURSES': [
          'SCHOOL_ADMINISTRATOR',
        ],
        'CAN_UNLOCK_THEIR_COURSES': [
          'COURSE_ADMINISTRATOR',
          'COURSE_DIRECTOR',
        ],
        'CAN_UNARCHIVE_ALL_COURSES': [
          'SCHOOL_ADMINISTRATOR',
        ],
        'CAN_CREATE_SESSIONS': [
          'SCHOOL_ADMINISTRATOR',
          'SCHOOL_DIRECTOR',
          'PROGRAM_DIRECTOR',
          'COURSE_ADMINISTRATOR',
          'COURSE_DIRECTOR',
        ],
        'CAN_UPDATE_ALL_SESSIONS': [
          'SCHOOL_ADMINISTRATOR',
          'SCHOOL_DIRECTOR',
          'PROGRAM_DIRECTOR',
        ],
        'CAN_UPDATE_THEIR_SESSIONS': [
          'SESSION_ADMINISTRATOR',
          'SESSION_INSTRUCTOR',
        ],
        'CAN_DELETE_ALL_SESSIONS': [
          'SCHOOL_ADMINISTRATOR',
          'SCHOOL_DIRECTOR',
        ],
        'CAN_CREATE_COMPETENCIES': [
          'SCHOOL_ADMINISTRATOR',
        ],
        'CAN_UPDATE_COMPETENCIES': [
          'SCHOOL_ADMINISTRATOR',
        ],
        'CAN_DELETE_COMPETENCIES': [
          'SCHOOL_ADMINISTRATOR',
        ],
        'CAN_CREATE_SESSION_TYPES': [
          'SCHOOL_ADMINISTRATOR',
        ],
        'CAN_UPDATE_SESSION_TYPES': [
          'SCHOOL_ADMINISTRATOR',
        ],
        'CAN_DELETE_SESSION_TYPES': [
          'SCHOOL_ADMINISTRATOR',
        ],
        'CAN_CREATE_VOCABULARIES': [
          'SCHOOL_ADMINISTRATOR',
        ],
        'CAN_UPDATE_VOCABULARIES': [
          'SCHOOL_ADMINISTRATOR',
        ],
        'CAN_DELETE_VOCABULARIES': [
          'SCHOOL_ADMINISTRATOR',
        ],
        'CAN_CREATE_TERMS': [
          'SCHOOL_ADMINISTRATOR',
          'SCHOOL_DIRECTOR',
        ],
        'CAN_UPDATE_TERMS': [
          'SCHOOL_ADMINISTRATOR',
          'SCHOOL_DIRECTOR',
        ],
        'CAN_DELETE_TERMS': [
          'SCHOOL_ADMINISTRATOR',
          'SCHOOL_DIRECTOR',
        ],
        'CAN_CREATE_INSTRUCTOR_GROUPS': [
          'SCHOOL_ADMINISTRATOR',
          'SCHOOL_DIRECTOR',
          'PROGRAM_DIRECTOR',
          'COURSE_ADMINISTRATOR',
          'COURSE_DIRECTOR',
        ],
        'CAN_UPDATE_INSTRUCTOR_GROUPS': [
          'SCHOOL_ADMINISTRATOR',
          'SCHOOL_DIRECTOR',
          'PROGRAM_DIRECTOR',
          'COURSE_ADMINISTRATOR',
          'COURSE_DIRECTOR',
        ],
        'CAN_DELETE_INSTRUCTOR_GROUPS': [
          'SCHOOL_ADMINISTRATOR',
        ],
        'CAN_CREATE_LEARNER_GROUPS': [
          'SCHOOL_ADMINISTRATOR',
          'COURSE_ADMINISTRATOR',
          'COURSE_DIRECTOR',
          'SESSION_ADMINISTRATOR',
        ],
        'CAN_UPDATE_LEARNER_GROUPS': [
          'SCHOOL_ADMINISTRATOR',
          'COURSE_ADMINISTRATOR',
          'COURSE_DIRECTOR',
          'SESSION_ADMINISTRATOR',
        ],
        'CAN_DELETE_LEARNER_GROUPS': [
          'SCHOOL_ADMINISTRATOR',
        ],
        'CAN_CREATE_CURRICULUM_INVENTORY_REPORTS': [
          'SCHOOL_ADMINISTRATOR',
          'SCHOOL_DIRECTOR',
        ],
        'CAN_UPDATE_ALL_CURRICULUM_INVENTORY_REPORTS': [
          'SCHOOL_ADMINISTRATOR',
          'SCHOOL_DIRECTOR',
        ],
        'CAN_UPDATE_THEIR_CURRICULUM_INVENTORY_REPORTS': [
          'CURRICULUM_INVENTORY_REPORT_ADMINISTRATOR',
        ],
        'CAN_DELETE_ALL_CURRICULUM_INVENTORY_REPORTS': [
          'SCHOOL_ADMINISTRATOR',
        ],
        'CAN_UPDATE_SCHOOL_CONFIGS': [
          'SCHOOL_ADMINISTRATOR',
          'SCHOOL_DIRECTOR',
        ],
        'CAN_CREATE_CURRICULUM_INVENTORY_INSTITUTIONS': [
          'SCHOOL_ADMINISTRATOR',
        ],
        'CAN_UPDATE_CURRICULUM_INVENTORY_INSTITUTIONS': [
          'SCHOOL_ADMINISTRATOR',
        ],
        'CAN_DELETE_CURRICULUM_INVENTORY_INSTITUTIONS': [
          'SCHOOL_ADMINISTRATOR',
        ],
        'CAN_CREATE_USERS': [
          'SCHOOL_ADMINISTRATOR',
        ],
        'CAN_UPDATE_USERS': [
          'SCHOOL_ADMINISTRATOR',
        ],
        'CAN_DELETE_USERS': [
          'SCHOOL_ADMINISTRATOR',
        ],
        'CAN_CREATE_DEPARTMENTS': [
          'SCHOOL_ADMINISTRATOR',
          'SCHOOL_DIRECTOR',
        ],
        'CAN_UPDATE_DEPARTMENTS': [
          'SCHOOL_ADMINISTRATOR',
          'SCHOOL_DIRECTOR',
        ],
        'CAN_DELETE_DEPARTMENTS': [
          'SCHOOL_ADMINISTRATOR',
          'SCHOOL_DIRECTOR',
        ],
      };
    });

    return matrix;
  }),
  async hasPermission(school, capability, userRoles) {
    const matrix = await this.get('permissionMatrix');
    const schoolId = school.get('id');
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
