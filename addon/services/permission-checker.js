import Service from '@ember/service';
import { inject as service } from '@ember/service';

export default Service.extend({
  currentUser: service(),
  permissionMatrix: service(),
  async canDoInSchool(schoolId, capability) {
    const currentUser = await this.get('currentUser');
    const isRoot = await currentUser.get('isRoot');
    if (isRoot) {
      return true;
    }
    const permissionMatrix = this.get('permissionMatrix');
    const rolesInSchool = await currentUser.getRolesInSchool(schoolId);

    return permissionMatrix.hasPermission(schoolId, capability, rolesInSchool);
  },
  async canUpdateCourse(course) {
    const currentUser = await this.get('currentUser');
    const permissionMatrix = this.get('permissionMatrix');
    if (course.get('locked') || course.get('archived')) {
      return false;
    }
    const schoolId = course.belongsTo('school').id;

    if (await this.canDoInSchool(schoolId, 'CAN_UPDATE_ALL_COURSES')) {
      return true;
    }

    const rolesInCourse = await currentUser.getRolesInCourse(course.get('id'));
    return await permissionMatrix.hasPermission(schoolId, 'CAN_UPDATE_THEIR_COURSES', rolesInCourse);
  },
  async canDeleteCourse(course) {
    const currentUser = await this.get('currentUser');
    const permissionMatrix = this.get('permissionMatrix');
    if (course.get('locked') || course.get('archived')) {
      return false;
    }

    const schoolId = course.belongsTo('school').id;
    if (await this.canDoInSchool(schoolId, 'CAN_DELETE_ALL_COURSES')) {
      return true;
    }

    const rolesInCourse = await currentUser.getRolesInCourse(course.get('id'));
    return await permissionMatrix.hasPermission(schoolId, 'CAN_DELETE_THEIR_COURSES', rolesInCourse);
  },
  async canCreateCourse(schoolId) {
    return this.canDoInSchool(schoolId, 'CAN_CREATE_COURSES');
  },
  async canUnlockCourse(course) {
    const currentUser = await this.get('currentUser');
    const permissionMatrix = this.get('permissionMatrix');

    const schoolId = course.belongsTo('school').id;
    if (await this.canDoInSchool(schoolId, 'CAN_UNLOCK_ALL_COURSES')) {
      return true;
    }

    const rolesInCourse = await currentUser.getRolesInCourse(course.get('id'));
    return await permissionMatrix.hasPermission(schoolId, 'CAN_UNLOCK_THEIR_COURSES', rolesInCourse);
  },
  async canUpdateSession(session) {
    const currentUser = await this.get('currentUser');
    const permissionMatrix = this.get('permissionMatrix');

    const course = await session.get('course');
    const schoolId = course.belongsTo('school').id;
    if (await this.canDoInSchool(schoolId, 'CAN_UPDATE_ALL_SESSIONS')) {
      return true;
    }

    const rolesInSession = await currentUser.getRolesInSession(session.get('id'));
    if (await permissionMatrix.hasPermission(schoolId, 'CAN_UPDATE_THEIR_SESSIONS', rolesInSession)) {
      return true;
    }

    return this.canUpdateCourse(course);
  },
  async canDeleteSession(session) {
    const currentUser = await this.get('currentUser');
    const permissionMatrix = this.get('permissionMatrix');

    const course = await session.get('course');
    const schoolId = course.belongsTo('school').id;
    if (await this.canDoInSchool(schoolId, 'CAN_DELETE_ALL_SESSIONS')) {
      return true;
    }

    const rolesInSession = await currentUser.getRolesInSession(session.get('id'));
    if (await permissionMatrix.hasPermission(schoolId, 'CAN_DELETE_THEIR_SESSIONS', rolesInSession)) {
      return true;
    }

    return this.canUpdateCourse(course);
  },
  async canCreateSession(session) {
    const course = await session.get('course');
    const schoolId = course.belongsTo('school').id;
    if (await this.canDoInSchool(schoolId, 'CAN_CREATE_SESSIONS')) {
      return true;
    }

    return this.canUpdateCourse(course);
  },
  async canUpdateSessionType(schoolId) {
    return this.canDoInSchool(schoolId, 'CAN_UPDATE_SESSION_TYPES');
  },
  async canDeleteSessionType(schoolId) {
    return this.canDoInSchool(schoolId, 'CAN_DELETE_SESSION_TYPES');
  },
  async canCreateSessionType(schoolId) {
    return this.canDoInSchool(schoolId, 'CAN_CREATE_SESSION_TYPES');
  },
  async canUpdateDepartment(schoolId) {
    return this.canDoInSchool(schoolId, 'CAN_UPDATE_DEPARTMENTS');
  },
  async canDeleteDepartment(schoolId) {
    return this.canDoInSchool(schoolId, 'CAN_DELETE_DEPARTMENTS');
  },
  async canCreateDepartment(schoolId) {
    return this.canDoInSchool(schoolId, 'CAN_CREATE_DEPARTMENTS');
  },
  async canUpdateProgram(program) {
    const currentUser = await this.get('currentUser');
    const permissionMatrix = this.get('permissionMatrix');

    const schoolId = program.belongsTo('school').id;
    if (await this.canDoInSchool(schoolId, 'CAN_UPDATE_ALL_PROGRAMS')) {
      return true;
    }

    const rolesInProgram = await currentUser.getRolesInProgram(program.get('id'));
    return await permissionMatrix.hasPermission(schoolId, 'CAN_UPDATE_THEIR_PROGRAMS', rolesInProgram);
  },
  async canDeleteProgram(program) {
    const currentUser = await this.get('currentUser');
    const permissionMatrix = this.get('permissionMatrix');
    const schoolId = program.belongsTo('school').id;
    if (await this.canDoInSchool(schoolId, 'CAN_DELETE_ALL_PROGRAMS')) {
      return true;
    }

    const rolesInProgram = await currentUser.getRolesInProgram(program.get('id'));
    return await permissionMatrix.hasPermission(schoolId, 'CAN_DELETE_THEIR_PROGRAMS', rolesInProgram);
  },
  async canCreateProgram(schoolId) {
    return this.canDoInSchool(schoolId, 'CAN_CREATE_PROGRAMS');
  },
  async canUpdateProgramYear(programYear) {
    const currentUser = await this.get('currentUser');
    const permissionMatrix = this.get('permissionMatrix');

    const program = await programYear.get('program');
    const schoolId = program.belongsTo('school').id;
    if (await this.canDoInSchool(schoolId, 'CAN_UPDATE_ALL_PROGRAM_YEARS')) {
      return true;
    }
    const rolesInProgramYear = await currentUser.getRolesInProgramYear(programYear.get('id'));
    if (await permissionMatrix.hasPermission(schoolId, 'CAN_UPDATE_THEIR_PROGRAM_YEARS', rolesInProgramYear)) {
      return true;
    }

    return this.canUpdateProgram(program);
  },
  async canDeleteProgramYear(programYear) {
    const currentUser = await this.get('currentUser');
    const permissionMatrix = this.get('permissionMatrix');

    const program = await programYear.get('program');
    const schoolId = program.belongsTo('school').id;
    if (await this.canDoInSchool(schoolId, 'CAN_DELETE_ALL_PROGRAM_YEARS')) {
      return true;
    }
    const rolesInProgramYear = await currentUser.getRolesInProgramYear(programYear.get('id'));
    if (await permissionMatrix.hasPermission(schoolId, 'CAN_DELETE_THEIR_PROGRAM_YEARS', rolesInProgramYear)) {
      return true;
    }

    return this.canUpdateProgram(program);
  },
  async canCreateProgramYear(program) {
    const schoolId = program.belongsTo('school').id;
    if (await this.canDoInSchool(schoolId, 'CAN_CREATE_PROGRAM_YEARS')) {
      return true;
    }
    return this.canUpdateProgram(program);
  },
  async canUnlockProgramYear(programYear) {
    const currentUser = await this.get('currentUser');
    const permissionMatrix = this.get('permissionMatrix');
    const program = await programYear.get('program');
    const schoolId = program.belongsTo('school').id;
    if (await this.canDoInSchool(schoolId, 'CAN_UNLOCK_ALL_PROGRAM_YEARS')) {
      return true;
    }
    const rolesInProgramYear = await currentUser.getRolesInProgramYear(programYear.get('id'));
    if (await permissionMatrix.hasPermission(schoolId, 'CAN_UNLOCK_THEIR_PROGRAM_YEARS', rolesInProgramYear)) {
      return true;
    }

    return this.canUpdateProgram(program);
  },
  async canUpdateSchoolConfig(schoolId) {
    return this.canDoInSchool(schoolId, 'CAN_UPDATE_SCHOOL_CONFIGS');
  },
  async canDeleteSchoolConfig(schoolId) {
    return this.canDoInSchool(schoolId, 'CAN_DELETE_SCHOOL_CONFIGS');
  },
  async canCreateSchoolConfig(schoolId) {
    return this.canDoInSchool(schoolId, 'CAN_CREATE_SCHOOL_CONFIGS');
  },
  async canUpdateSchool(schoolId) {
    return this.canDoInSchool(schoolId, 'CAN_UPDATE_SCHOOLS');
  },
  async canUpdateCompetency(schoolId) {
    return this.canDoInSchool(schoolId, 'CAN_UPDATE_COMPETENCIES');
  },
  async canDeleteCompetency(schoolId) {
    return this.canDoInSchool(schoolId, 'CAN_DELETE_COMPETENCIES');
  },
  async canCreateCompetency(schoolId) {
    return this.canDoInSchool(schoolId, 'CAN_CREATE_COMPETENCIES');
  },
  async canUpdateVocabulary(schoolId) {
    return this.canDoInSchool(schoolId, 'CAN_UPDATE_VOCABULARIES');
  },
  async canDeleteVocabulary(schoolId) {
    return this.canDoInSchool(schoolId, 'CAN_DELETE_VOCABULARIES');
  },
  async canCreateVocabulary(schoolId) {
    return this.canDoInSchool(schoolId, 'CAN_CREATE_VOCABULARIES');
  },
  async canUpdateTerm(schoolId) {
    return this.canDoInSchool(schoolId, 'CAN_UPDATE_TERMS');
  },
  async canDeleteTerm(schoolId) {
    return this.canDoInSchool(schoolId, 'CAN_DELETE_TERMS');
  },
  async canCreateTerm(schoolId) {
    return this.canDoInSchool(schoolId, 'CAN_CREATE_TERMS');
  },
  async canUpdateInstructorGroup(schoolId) {
    return this.canDoInSchool(schoolId, 'CAN_UPDATE_INSTRUCTOR_GROUPS');
  },
  async canDeleteInstructorGroup(schoolId) {
    return this.canDoInSchool(schoolId, 'CAN_DELETE_INSTRUCTOR_GROUPS');
  },
  async canCreateInstructorGroup(schoolId) {
    return this.canDoInSchool(schoolId, 'CAN_CREATE_INSTRUCTOR_GROUPS');
  },
  async canUpdateCurriculumInventoryReport(curriculumInventoryReport) {
    const currentUser = await this.get('currentUser');
    const permissionMatrix = this.get('permissionMatrix');
    const program = await curriculumInventoryReport.get('program');
    const schoolId = program.belongsTo('school').id();
    if (await this.canDoInSchool(schoolId, 'CAN_UPDATE_ALL_CURRICULUM_INVENTORY_REPORTS')) {
      return true;
    }
    const rolesInReport = await currentUser.getRolesInCurriculumInventoryReport(curriculumInventoryReport.get('id'));

    return permissionMatrix.hasPermission(schoolId, 'CAN_UPDATE_THEIR_CURRICULUM_INVENTORY_REPORTS', rolesInReport);
  },
  async canDeleteCurriculumInventoryReport(curriculumInventoryReport) {
    const currentUser = await this.get('currentUser');
    const permissionMatrix = this.get('permissionMatrix');
    const program = await curriculumInventoryReport.get('program');
    const schoolId = program.belongsTo('school').id();
    if (await this.canDoInSchool(schoolId, 'CAN_DELETE_ALL_CURRICULUM_INVENTORY_REPORTS')) {
      return true;
    }

    const rolesInReport = await currentUser.getRolesInCurriculumInventoryReport(curriculumInventoryReport.get('id'));
    return permissionMatrix.hasPermission(schoolId, 'CAN_DELETE_THEIR_CURRICULUM_INVENTORY_REPORTS', rolesInReport);
  },
  async canCreateCurriculumInventoryReport(schoolId) {
    return this.canDoInSchool(schoolId, 'CAN_CREATE_CURRICULUM_INVENTORY_REPORTS');
  },
  async canUpdateLearnerGroup(schoolId) {
    return this.canDoInSchool(schoolId, 'CAN_UPDATE_LEARNER_GROUPS');
  },
  async canDeleteLearnerGroup(schoolId) {
    return this.canDoInSchool(schoolId, 'CAN_DELETE_LEARNER_GROUPS');
  },
  async canCreateLearnerGroup(schoolId) {
    return this.canDoInSchool(schoolId, 'CAN_CREATE_LEARNER_GROUPS');
  },
  async canUpdateUser(schoolId) {
    return this.canDoInSchool(schoolId, 'CAN_UPDATE_USERS');
  },
  async canDeleteUser(schoolId) {
    return this.canDoInSchool(schoolId, 'CAN_DELETE_USERS');
  },
  async canCreateUser(schoolId) {
    return this.canDoInSchool(schoolId, 'CAN_CREATE_USERS');
  },
});
