import { z } from 'zod';

export const schema = z.looseObject({
  id: z.number(),
  firstName: z.string().nullish(),
  lastName: z.string().nullish(),
  middleName: z.string().nullish(),
  displayName: z.string().nullish(),
  pronouns: z.string().nullish(),
  phone: z.string().nullish(),
  email: z.string().nullish(),
  preferredEmail: z.string().nullish(),
  addedViaIlios: z.boolean().nullish(),
  enabled: z.boolean().nullish(),
  campusId: z.string().nullish(),
  otherId: z.string().nullish(),
  examined: z.boolean().nullish(),
  userSyncIgnore: z.boolean().nullish(),
  icsFeedKey: z.string().nullish(),
  root: z.boolean().nullish(),
});

export const relationships = [
  {
    field: 'reports',
    type: 'manyOf',
    target: 'report',
  },
  {
    field: 'school',
    type: 'oneOf',
    target: 'school',
  },
  {
    field: 'authentication',
    type: 'oneOf',
    target: 'authentication',
  },
  {
    field: 'directedCourses',
    type: 'manyOf',
    target: 'course',
    role: 'courseDirector',
  },
  {
    field: 'administeredCourses',
    type: 'manyOf',
    target: 'course',
    role: 'courseAdministrator',
  },
  {
    field: 'studentAdvisedCourses',
    type: 'manyOf',
    target: 'course',
    role: 'courseStudentAdvisor',
  },
  {
    field: 'studentAdvisedSessions',
    type: 'manyOf',
    target: 'session',
    role: 'sessionStudentAdvisor',
  },
  {
    field: 'learnerGroups',
    type: 'manyOf',
    target: 'learnerGroup',
    role: 'learnerGroupUsers',
  },
  {
    field: 'instructedLearnerGroups',
    type: 'manyOf',
    target: 'learnerGroup',
    role: 'learnerGroupInstructors',
  },
  {
    field: 'instructorGroups',
    type: 'manyOf',
    target: 'instructorGroup',
  },
  {
    field: 'instructorIlmSessions',
    type: 'manyOf',
    target: 'ilmSession',
    role: 'ilmInstructors',
  },
  {
    field: 'learnerIlmSessions',
    type: 'manyOf',
    target: 'ilmSession',
    role: 'ilmInstructors',
  },
  {
    field: 'offerings',
    type: 'manyOf',
    target: 'offering',
    role: 'offeringLearner',
  },
  {
    field: 'instructedOfferings',
    type: 'manyOf',
    target: 'offering',
    role: 'offeringInstructor',
  },
  {
    field: 'programYears',
    type: 'manyOf',
    target: 'programYear',
  },
  {
    field: 'roles',
    type: 'manyOf',
    target: 'userRole',
  },
  {
    field: 'directedSchools',
    type: 'manyOf',
    target: 'school',
    role: 'schoolDirector',
  },
  {
    field: 'administeredSchools',
    type: 'manyOf',
    target: 'school',
    role: 'schoolAdministrator',
  },
  {
    field: 'administeredSessions',
    type: 'manyOf',
    target: 'session',
    role: 'sessionAdministrator',
  },
  {
    field: 'directedPrograms',
    type: 'manyOf',
    target: 'program',
  },
  {
    field: 'cohorts',
    type: 'manyOf',
    target: 'cohort',
    role: 'userCohorts',
  },
  {
    field: 'primaryCohort',
    type: 'oneOf',
    target: 'cohort',
    role: 'primaryCohort',
  },
  {
    field: 'pendingUserUpdates',
    type: 'manyOf',
    target: 'pendingUserUpdate',
  },
  {
    field: 'administeredCurriculumInventoryReports',
    type: 'manyOf',
    target: 'curriculumInventoryReport',
  },
  {
    field: 'sessionMaterialStatuses',
    type: 'manyOf',
    target: 'userSessionMaterialStatus',
  },
];
