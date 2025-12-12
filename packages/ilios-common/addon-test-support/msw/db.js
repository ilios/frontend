import { Collection } from '@msw/data';
import { schema as aamcMethodSchema } from './models/aamc-method.js';
import { schema as aamcPcrsSchema } from './models/aamc-pcrs.js';
import { schema as aamcResourceTypeSchema } from './models/aamc-resource-type.js';
import { schema as academicYearSchema } from './models/academic-year.js';
import { schema as assessmentOptionSchema } from './models/assessment-option.js';
import { schema as authenticationSchema } from './models/authentication.js';
import { schema as cohortSchema } from './models/cohort.js';
import { schema as competencySchema } from './models/competency.js';
import { schema as courseClerkshipTypeSchema } from './models/course-clerkship-type.js';
import { schema as courseLearningMaterialSchema } from './models/course-learning-material.js';
import { schema as courseObjectiveSchema } from './models/course-objective.js';
import { schema as courseSchema } from './models/course.js';
import { schema as curriculumInventoryAcademicLevelSchema } from './models/curriculum-inventory-academic-level.js';
import { schema as curriculumInventoryExportSchema } from './models/curriculum-inventory-export.js';
import { schema as curriculumInventoryInstitutionSchema } from './models/curriculum-inventory-institution.js';
import { schema as curriculumInventoryReportSchema } from './models/curriculum-inventory-report.js';
import { schema as curriculumInventorySequenceBlockSchema } from './models/curriculum-inventory-sequence-block.js';
import { schema as curriculumInventorySequenceSchema } from './models/curriculum-inventory-sequence.js';
import { schema as ilmSessionSchema } from './models/ilm-session.js';
import { schema as ingestionExceptionSchema } from './models/ingestion-exception.js';
import { schema as instructorGroupSchema } from './models/instructor-group.js';
import { schema as learnerGroupSchema } from './models/learner-group.js';
import { schema as learningMaterialStatusSchema } from './models/learning-material-status.js';
import { schema as learningMaterialUserRoleSchema } from './models/learning-material-user-role.js';
import { schema as learningMaterialSchema } from './models/learning-material.js';
import { schema as meshConceptSchema } from './models/mesh-concept.js';
import { schema as meshDescriptorSchema } from './models/mesh-descriptor.js';
import { schema as meshPreviousIndexingSchema } from './models/mesh-previous-indexing.js';
import { schema as meshQualifierSchema } from './models/mesh-qualifier.js';
import { schema as meshTermSchema } from './models/mesh-term.js';
import { schema as meshTreeSchema } from './models/mesh-tree.js';
import { schema as offeringSchema } from './models/offering.js';
import { schema as pendingUserUpdateSchema } from './models/pending-user-update.js';
import { schema as programYearObjectiveSchema } from './models/program-year-objective.js';
import { schema as programYearSchema } from './models/program-year.js';
import { schema as programSchema } from './models/program.js';
import { schema as reportSchema } from './models/report.js';
import { schema as schoolConfigSchema } from './models/school-config.js';
import { schema as schoolSchema } from './models/school.js';
import { schema as schooleventSchema } from './models/schoolevent.js';
import { schema as sessionLearningMaterialSchema } from './models/session-learning-material.js';
import { schema as sessionObjectiveSchema } from './models/session-objective.js';
import { schema as sessionTypeSchema } from './models/session-type.js';
import { schema as sessionSchema } from './models/session.js';
import { schema as termSchema } from './models/term.js';
import { schema as userRoleSchema } from './models/user-role.js';
import { schema as userSessionMaterialStatusSchema } from './models/user-session-material-status.js';
import { schema as userSchema } from './models/user.js';
import { schema as usereventSchema } from './models/userevent.js';
import { schema as vocabularySchema } from './models/vocabulary.js';

// Create all collections
export const aamcMethod = new Collection({ schema: aamcMethodSchema });
export const aamcPcrs = new Collection({ schema: aamcPcrsSchema });
export const aamcResourceType = new Collection({ schema: aamcResourceTypeSchema });
export const academicYear = new Collection({ schema: academicYearSchema });
export const assessmentOption = new Collection({ schema: assessmentOptionSchema });
export const authentication = new Collection({ schema: authenticationSchema });
export const cohort = new Collection({ schema: cohortSchema });
export const competency = new Collection({ schema: competencySchema });
export const courseClerkshipType = new Collection({ schema: courseClerkshipTypeSchema });
export const courseLearningMaterial = new Collection({ schema: courseLearningMaterialSchema });
export const courseObjective = new Collection({ schema: courseObjectiveSchema });
export const course = new Collection({ schema: courseSchema });
export const curriculumInventoryAcademicLevel = new Collection({
  schema: curriculumInventoryAcademicLevelSchema,
});
export const curriculumInventoryExport = new Collection({
  schema: curriculumInventoryExportSchema,
});
export const curriculumInventoryInstitution = new Collection({
  schema: curriculumInventoryInstitutionSchema,
});
export const curriculumInventoryReport = new Collection({
  schema: curriculumInventoryReportSchema,
});
export const curriculumInventorySequenceBlock = new Collection({
  schema: curriculumInventorySequenceBlockSchema,
});
export const curriculumInventorySequence = new Collection({
  schema: curriculumInventorySequenceSchema,
});
export const ilmSession = new Collection({ schema: ilmSessionSchema });
export const ingestionException = new Collection({ schema: ingestionExceptionSchema });
export const instructorGroup = new Collection({ schema: instructorGroupSchema });
export const learnerGroup = new Collection({ schema: learnerGroupSchema });
export const learningMaterialStatus = new Collection({ schema: learningMaterialStatusSchema });
export const learningMaterialUserRole = new Collection({ schema: learningMaterialUserRoleSchema });
export const learningMaterial = new Collection({ schema: learningMaterialSchema });
export const meshConcept = new Collection({ schema: meshConceptSchema });
export const meshDescriptor = new Collection({ schema: meshDescriptorSchema });
export const meshPreviousIndexing = new Collection({ schema: meshPreviousIndexingSchema });
export const meshQualifier = new Collection({ schema: meshQualifierSchema });
export const meshTerm = new Collection({ schema: meshTermSchema });
export const meshTree = new Collection({ schema: meshTreeSchema });
export const offering = new Collection({ schema: offeringSchema });
export const pendingUserUpdate = new Collection({ schema: pendingUserUpdateSchema });
export const programYearObjective = new Collection({ schema: programYearObjectiveSchema });
export const programYear = new Collection({ schema: programYearSchema });
export const program = new Collection({ schema: programSchema });
export const report = new Collection({ schema: reportSchema });
export const schoolConfig = new Collection({ schema: schoolConfigSchema });
export const school = new Collection({ schema: schoolSchema });
export const schoolevent = new Collection({ schema: schooleventSchema });
export const sessionLearningMaterial = new Collection({ schema: sessionLearningMaterialSchema });
export const sessionObjective = new Collection({ schema: sessionObjectiveSchema });
export const sessionType = new Collection({ schema: sessionTypeSchema });
export const session = new Collection({ schema: sessionSchema });
export const term = new Collection({ schema: termSchema });
export const userRole = new Collection({ schema: userRoleSchema });
export const userSessionMaterialStatus = new Collection({
  schema: userSessionMaterialStatusSchema,
});
export const user = new Collection({ schema: userSchema });
export const userevent = new Collection({ schema: usereventSchema });
export const vocabulary = new Collection({ schema: vocabularySchema });

// Export all collections as db object for backwards compatibility
export const db = {
  aamcMethod,
  aamcPcrs,
  aamcResourceType,
  academicYear,
  assessmentOption,
  authentication,
  cohort,
  competency,
  courseClerkshipType,
  courseLearningMaterial,
  courseObjective,
  course,
  curriculumInventoryAcademicLevel,
  curriculumInventoryExport,
  curriculumInventoryInstitution,
  curriculumInventoryReport,
  curriculumInventorySequenceBlock,
  curriculumInventorySequence,
  ilmSession,
  ingestionException,
  instructorGroup,
  learnerGroup,
  learningMaterialStatus,
  learningMaterialUserRole,
  learningMaterial,
  meshConcept,
  meshDescriptor,
  meshPreviousIndexing,
  meshQualifier,
  meshTerm,
  meshTree,
  offering,
  pendingUserUpdate,
  programYearObjective,
  programYear,
  program,
  report,
  schoolConfig,
  school,
  schoolevent,
  sessionLearningMaterial,
  sessionObjective,
  sessionType,
  session,
  term,
  userRole,
  userSessionMaterialStatus,
  user,
  userevent,
  vocabulary,
};
