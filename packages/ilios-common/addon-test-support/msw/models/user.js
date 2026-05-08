import { z } from 'zod';

export const schema = z
  .object({
    id: z.string(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    middleName: z.string().optional(),
    displayName: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
    preferredEmail: z.string().optional(),
    addedViaIlios: z.boolean().optional(),
    enabled: z.boolean().optional(),
    campusId: z.string().optional(),
    otherId: z.string().optional(),
    examined: z.boolean().optional(),
    userSyncIgnore: z.boolean().optional(),
    icsFeedKey: z.string().optional(),
    root: z.boolean().optional(),
  })
  .passthrough();

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
  },
  {
    field: 'instructedLearnerGroups',
    type: 'manyOf',
    target: 'learnerGroup',
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
  },
  {
    field: 'learnerIlmSessions',
    type: 'manyOf',
    target: 'ilmSession',
  },
  {
    field: 'offerings',
    type: 'manyOf',
    target: 'offering',
  },
  {
    field: 'instructedOfferings',
    type: 'manyOf',
    target: 'offering',
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
  },
  {
    field: 'primaryCohort',
    type: 'oneOf',
    target: 'cohort',
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
