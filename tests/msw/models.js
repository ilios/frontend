import {
  relationships as aamcMethodRelationships,
  schema as aamcMethod,
} from './models/aamc-method.js';
import { relationships as aamcPcrsRelationships,schema as aamcPcrs } from './models/aamc-pcrs.js';
import {
  relationships as aamcResourceTypeRelationships,
  schema as aamcResourceType,
} from './models/aamc-resource-type.js';
import {
  relationships as academicYearRelationships,
  schema as academicYear,
} from './models/academic-year.js';
import {
  relationships as assessmentOptionRelationships,
  schema as assessmentOption,
} from './models/assessment-option.js';
import {
  relationships as authenticationRelationships,
  schema as authentication,
} from './models/authentication.js';
import { relationships as cohortRelationships,schema as cohort } from './models/cohort.js';
import {
  relationships as competencyRelationships,
  schema as competency,
} from './models/competency.js';
import { relationships as courseRelationships,schema as course } from './models/course.js';
import {
  relationships as courseClerkshipTypeRelationships,
  schema as courseClerkshipType,
} from './models/course-clerkship-type.js';
import {
  relationships as courseLearningMaterialRelationships,
  schema as courseLearningMaterial,
} from './models/course-learning-material.js';
import {
  relationships as courseObjectiveRelationships,
  schema as courseObjective,
} from './models/course-objective.js';
import {
  relationships as curriculumInventoryAcademicLevelRelationships,
  schema as curriculumInventoryAcademicLevel,
} from './models/curriculum-inventory-academic-level.js';
import {
  relationships as curriculumInventoryExportRelationships,
  schema as curriculumInventoryExport,
} from './models/curriculum-inventory-export.js';
import {
  relationships as curriculumInventoryInstitutionRelationships,
  schema as curriculumInventoryInstitution,
} from './models/curriculum-inventory-institution.js';
import {
  relationships as curriculumInventoryReportRelationships,
  schema as curriculumInventoryReport,
} from './models/curriculum-inventory-report.js';
import {
  relationships as curriculumInventorySequenceRelationships,
  schema as curriculumInventorySequence,
} from './models/curriculum-inventory-sequence.js';
import {
  relationships as curriculumInventorySequenceBlockRelationships,
  schema as curriculumInventorySequenceBlock,
} from './models/curriculum-inventory-sequence-block.js';
import {
  relationships as ilmSessionRelationships,
  schema as ilmSession,
} from './models/ilm-session.js';
import {
  relationships as ingestionExceptionRelationships,
  schema as ingestionException,
} from './models/ingestion-exception.js';
import {
  relationships as instructorGroupRelationships,
  schema as instructorGroup,
} from './models/instructor-group.js';
import {
  relationships as learnerGroupRelationships,
  schema as learnerGroup,
} from './models/learner-group.js';
import {
  relationships as learningMaterialRelationships,
  schema as learningMaterial,
} from './models/learning-material.js';
import {
  relationships as learningMaterialStatusRelationships,
  schema as learningMaterialStatus,
} from './models/learning-material-status.js';
import {
  relationships as learningMaterialUserRoleRelationships,
  schema as learningMaterialUserRole,
} from './models/learning-material-user-role.js';
import {
  relationships as meshConceptRelationships,
  schema as meshConcept,
} from './models/mesh-concept.js';
import {
  relationships as meshDescriptorRelationships,
  schema as meshDescriptor,
} from './models/mesh-descriptor.js';
import {
  relationships as meshPreviousIndexingRelationships,
  schema as meshPreviousIndexing,
} from './models/mesh-previous-indexing.js';
import {
  relationships as meshQualifierRelationships,
  schema as meshQualifier,
} from './models/mesh-qualifier.js';
import { relationships as meshTermRelationships,schema as meshTerm } from './models/mesh-term.js';
import { relationships as meshTreeRelationships,schema as meshTree } from './models/mesh-tree.js';
import { relationships as offeringRelationships,schema as offering } from './models/offering.js';
import {
  relationships as pendingUserUpdateRelationships,
  schema as pendingUserUpdate,
} from './models/pending-user-update.js';
import { relationships as programRelationships,schema as program } from './models/program.js';
import {
  relationships as programYearRelationships,
  schema as programYear,
} from './models/program-year.js';
import {
  relationships as programYearObjectiveRelationships,
  schema as programYearObjective,
} from './models/program-year-objective.js';
import { relationships as reportRelationships,schema as report } from './models/report.js';
import { relationships as schoolRelationships,schema as school } from './models/school.js';
import {
  relationships as schoolConfigRelationships,
  schema as schoolConfig,
} from './models/school-config.js';
import {
  relationships as schooleventRelationships,
  schema as schoolevent,
} from './models/schoolevent.js';
import { relationships as sessionRelationships,schema as session } from './models/session.js';
import {
  relationships as sessionLearningMaterialRelationships,
  schema as sessionLearningMaterial,
} from './models/session-learning-material.js';
import {
  relationships as sessionObjectiveRelationships,
  schema as sessionObjective,
} from './models/session-objective.js';
import {
  relationships as sessionTypeRelationships,
  schema as sessionType,
} from './models/session-type.js';
import { relationships as termRelationships,schema as term } from './models/term.js';
import { relationships as userRelationships,schema as user } from './models/user.js';
import { relationships as userRoleRelationships,schema as userRole } from './models/user-role.js';
import {
  relationships as userSessionMaterialStatusRelationships,
  schema as userSessionMaterialStatus,
} from './models/user-session-material-status.js';
import {
  relationships as usereventRelationships,
  schema as userevent,
} from './models/userevent.js';
import {
  relationships as vocabularyRelationships,
  schema as vocabulary,
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

export { relationships,schemas };
