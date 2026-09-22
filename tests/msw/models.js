import {
  schema as aamcMethod,
  relationships as aamcMethodRelationships,
} from './models/aamc-method.js';
import { schema as aamcPcrs, relationships as aamcPcrsRelationships } from './models/aamc-pcrs.js';
import {
  schema as aamcResourceType,
  relationships as aamcResourceTypeRelationships,
} from './models/aamc-resource-type.js';
import {
  schema as academicYear,
  relationships as academicYearRelationships,
} from './models/academic-year.js';
import {
  schema as assessmentOption,
  relationships as assessmentOptionRelationships,
} from './models/assessment-option.js';
import {
  schema as authentication,
  relationships as authenticationRelationships,
} from './models/authentication.js';
import { schema as cohort, relationships as cohortRelationships } from './models/cohort.js';
import {
  schema as competency,
  relationships as competencyRelationships,
} from './models/competency.js';
import {
  schema as courseClerkshipType,
  relationships as courseClerkshipTypeRelationships,
} from './models/course-clerkship-type.js';
import {
  schema as courseLearningMaterial,
  relationships as courseLearningMaterialRelationships,
} from './models/course-learning-material.js';
import {
  schema as courseObjective,
  relationships as courseObjectiveRelationships,
} from './models/course-objective.js';
import { schema as course, relationships as courseRelationships } from './models/course.js';
import {
  schema as curriculumInventoryAcademicLevel,
  relationships as curriculumInventoryAcademicLevelRelationships,
} from './models/curriculum-inventory-academic-level.js';
import {
  schema as curriculumInventoryExport,
  relationships as curriculumInventoryExportRelationships,
} from './models/curriculum-inventory-export.js';
import {
  schema as curriculumInventoryInstitution,
  relationships as curriculumInventoryInstitutionRelationships,
} from './models/curriculum-inventory-institution.js';
import {
  schema as curriculumInventoryReport,
  relationships as curriculumInventoryReportRelationships,
} from './models/curriculum-inventory-report.js';
import {
  schema as curriculumInventorySequenceBlock,
  relationships as curriculumInventorySequenceBlockRelationships,
} from './models/curriculum-inventory-sequence-block.js';
import {
  schema as curriculumInventorySequence,
  relationships as curriculumInventorySequenceRelationships,
} from './models/curriculum-inventory-sequence.js';
import {
  schema as ilmSession,
  relationships as ilmSessionRelationships,
} from './models/ilm-session.js';
import {
  schema as ingestionException,
  relationships as ingestionExceptionRelationships,
} from './models/ingestion-exception.js';
import {
  schema as instructorGroup,
  relationships as instructorGroupRelationships,
} from './models/instructor-group.js';
import {
  schema as learnerGroup,
  relationships as learnerGroupRelationships,
} from './models/learner-group.js';
import {
  schema as learningMaterialStatus,
  relationships as learningMaterialStatusRelationships,
} from './models/learning-material-status.js';
import {
  schema as learningMaterialUserRole,
  relationships as learningMaterialUserRoleRelationships,
} from './models/learning-material-user-role.js';
import {
  schema as learningMaterial,
  relationships as learningMaterialRelationships,
} from './models/learning-material.js';
import {
  schema as meshConcept,
  relationships as meshConceptRelationships,
} from './models/mesh-concept.js';
import {
  schema as meshDescriptor,
  relationships as meshDescriptorRelationships,
} from './models/mesh-descriptor.js';
import {
  schema as meshPreviousIndexing,
  relationships as meshPreviousIndexingRelationships,
} from './models/mesh-previous-indexing.js';
import {
  schema as meshQualifier,
  relationships as meshQualifierRelationships,
} from './models/mesh-qualifier.js';
import { schema as meshTerm, relationships as meshTermRelationships } from './models/mesh-term.js';
import { schema as meshTree, relationships as meshTreeRelationships } from './models/mesh-tree.js';
import { schema as offering, relationships as offeringRelationships } from './models/offering.js';
import {
  schema as pendingUserUpdate,
  relationships as pendingUserUpdateRelationships,
} from './models/pending-user-update.js';
import {
  schema as programYearObjective,
  relationships as programYearObjectiveRelationships,
} from './models/program-year-objective.js';
import {
  schema as programYear,
  relationships as programYearRelationships,
} from './models/program-year.js';
import { schema as program, relationships as programRelationships } from './models/program.js';
import { schema as report, relationships as reportRelationships } from './models/report.js';
import {
  schema as schoolConfig,
  relationships as schoolConfigRelationships,
} from './models/school-config.js';
import { schema as school, relationships as schoolRelationships } from './models/school.js';
import {
  schema as schoolevent,
  relationships as schooleventRelationships,
} from './models/schoolevent.js';
import {
  schema as sessionLearningMaterial,
  relationships as sessionLearningMaterialRelationships,
} from './models/session-learning-material.js';
import {
  schema as sessionObjective,
  relationships as sessionObjectiveRelationships,
} from './models/session-objective.js';
import {
  schema as sessionType,
  relationships as sessionTypeRelationships,
} from './models/session-type.js';
import { schema as session, relationships as sessionRelationships } from './models/session.js';
import { schema as term, relationships as termRelationships } from './models/term.js';
import { schema as userRole, relationships as userRoleRelationships } from './models/user-role.js';
import {
  schema as userSessionMaterialStatus,
  relationships as userSessionMaterialStatusRelationships,
} from './models/user-session-material-status.js';
import { schema as user, relationships as userRelationships } from './models/user.js';
import {
  schema as userevent,
  relationships as usereventRelationships,
} from './models/userevent.js';
import {
  schema as vocabulary,
  relationships as vocabularyRelationships,
} from './models/vocabulary.js';

const schemas = {
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

const relationships = {
  aamcMethod: aamcMethodRelationships,
  aamcPcrs: aamcPcrsRelationships,
  aamcResourceType: aamcResourceTypeRelationships,
  academicYear: academicYearRelationships,
  assessmentOption: assessmentOptionRelationships,
  authentication: authenticationRelationships,
  cohort: cohortRelationships,
  competency: competencyRelationships,
  courseClerkshipType: courseClerkshipTypeRelationships,
  courseLearningMaterial: courseLearningMaterialRelationships,
  courseObjective: courseObjectiveRelationships,
  course: courseRelationships,
  curriculumInventoryAcademicLevel: curriculumInventoryAcademicLevelRelationships,
  curriculumInventoryExport: curriculumInventoryExportRelationships,
  curriculumInventoryInstitution: curriculumInventoryInstitutionRelationships,
  curriculumInventoryReport: curriculumInventoryReportRelationships,
  curriculumInventorySequenceBlock: curriculumInventorySequenceBlockRelationships,
  curriculumInventorySequence: curriculumInventorySequenceRelationships,
  ilmSession: ilmSessionRelationships,
  ingestionException: ingestionExceptionRelationships,
  instructorGroup: instructorGroupRelationships,
  learnerGroup: learnerGroupRelationships,
  learningMaterialStatus: learningMaterialStatusRelationships,
  learningMaterialUserRole: learningMaterialUserRoleRelationships,
  learningMaterial: learningMaterialRelationships,
  meshConcept: meshConceptRelationships,
  meshDescriptor: meshDescriptorRelationships,
  meshPreviousIndexing: meshPreviousIndexingRelationships,
  meshQualifier: meshQualifierRelationships,
  meshTerm: meshTermRelationships,
  meshTree: meshTreeRelationships,
  offering: offeringRelationships,
  pendingUserUpdate: pendingUserUpdateRelationships,
  programYearObjective: programYearObjectiveRelationships,
  programYear: programYearRelationships,
  program: programRelationships,
  report: reportRelationships,
  schoolConfig: schoolConfigRelationships,
  school: schoolRelationships,
  schoolevent: schooleventRelationships,
  sessionLearningMaterial: sessionLearningMaterialRelationships,
  sessionObjective: sessionObjectiveRelationships,
  sessionType: sessionTypeRelationships,
  session: sessionRelationships,
  term: termRelationships,
  userRole: userRoleRelationships,
  userSessionMaterialStatus: userSessionMaterialStatusRelationships,
  user: userRelationships,
  userevent: usereventRelationships,
  vocabulary: vocabularyRelationships,
};

export { schemas, relationships };
